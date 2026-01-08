import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import db from '../db.js';
import { sendPasswordResetEmail, sendVerificationEmail, isEmailConfigured } from '../email.js';

const router = express.Router();

// Helper để tạo UUID
function generateUUID() {
  return crypto.randomUUID();
}

// Helper để tạo token ngẫu nhiên
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * POST /api/auth/register
 * Đăng ký tài khoản mới
 */
router.post('/register', async (req, res) => {
  try {
    const { companyName, industry, email, password } = req.body;

    // Validation
    if (!companyName || !industry || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // Kiểm tra email đã tồn tại chưa
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Tạo user mới (email_verified = 0)
    const userId = generateUUID();
    await db.execute(
      `INSERT INTO users (id, company_name, industry, email, password_hash, email_verified, credit_limit, available_credit, spending_capacity)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      [userId, companyName, industry, email.toLowerCase(), passwordHash, 500000, 500000, 500000]
    );

    // Tạo risk metrics mặc định
    await db.execute(
      `INSERT INTO risk_metrics (user_id, credit_score, payment_history, industry_risk, market_conditions)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, 75, 80, 60, 70]
    );

    // Tạo verification token
    const verificationToken = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 giờ

    // Lưu token vào database
    await db.execute(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [userId, verificationToken, expiresAt]
    );

    // Gửi email xác nhận
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    if (isEmailConfigured()) {
      try {
        await sendVerificationEmail(email.toLowerCase(), verificationToken, verifyUrl);
        return res.status(201).json({
          success: true,
          message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.',
          requiresVerification: true,
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Nếu không gửi được email, vẫn trả về token để demo
        return res.status(201).json({
          success: true,
          message: 'Đăng ký thành công! Email chưa được cấu hình. Token xác nhận:',
          requiresVerification: true,
          token: verificationToken,
          verifyUrl,
        });
      }
    } else {
      // Nếu chưa cấu hình email, trả về token để demo
      return res.status(201).json({
        success: true,
        message: 'Đăng ký thành công! Email chưa được cấu hình. Token xác nhận:',
        requiresVerification: true,
        token: verificationToken,
        verifyUrl,
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Lỗi server khi đăng ký' });
  }
});

/**
 * POST /api/auth/login
 * Đăng nhập
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });
    }

    // Tìm user
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Email không tồn tại' });
    }

    const user = users[0];

    // Kiểm tra email đã được xác nhận chưa
    if (!user.email_verified) {
      return res.status(403).json({ 
        error: 'Email chưa được xác nhận. Vui lòng kiểm tra email và xác nhận tài khoản trước khi đăng nhập.',
        requiresVerification: true 
      });
    }

    // Kiểm tra password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Mật khẩu không đúng' });
    }

    // Tạo session token
    const sessionToken = generateToken();

    res.json({
      success: true,
      user: {
        id: user.id,
        companyName: user.company_name,
        industry: user.industry,
        email: user.email,
        creditLimit: parseFloat(user.credit_limit),
        availableCredit: parseFloat(user.available_credit),
        spendingCapacity: parseFloat(user.spending_capacity),
      },
      token: sessionToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Lỗi server khi đăng nhập' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Yêu cầu khôi phục mật khẩu
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, resetUrl } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Vui lòng nhập email' });
    }

    // Tìm user
    const [users] = await db.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    // Luôn trả về success để không tiết lộ email có tồn tại hay không
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'Nếu email tồn tại, chúng tôi đã gửi link khôi phục mật khẩu',
      });
    }

    const user = users[0];

    // Tạo token
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 phút

    // Lưu token vào database
    await db.execute(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [user.id, token, expiresAt]
    );

    // Gửi email
    const frontendUrl = resetUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    if (isEmailConfigured()) {
      try {
        await sendPasswordResetEmail(user.email, token, resetLink);
        return res.json({
          success: true,
          message: 'Đã gửi email khôi phục mật khẩu',
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Nếu không gửi được email, vẫn trả về token để demo
        return res.json({
          success: true,
          message: 'Không thể gửi email. Token khôi phục:',
          token, // Trả về token để demo (không nên làm trong production)
          resetLink,
        });
      }
    } else {
      // Nếu chưa cấu hình email, trả về token để demo
      return res.json({
        success: true,
        message: 'Email chưa được cấu hình. Token khôi phục:',
        token,
        resetLink,
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Lỗi server khi xử lý yêu cầu khôi phục mật khẩu' });
  }
});

/**
 * POST /api/auth/reset-password
 * Đặt lại mật khẩu với token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Vui lòng nhập token và mật khẩu mới' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // Tìm token
    const [tokens] = await db.execute(
      `SELECT * FROM password_reset_tokens
       WHERE token = ? AND used = 0 AND expires_at > NOW()`,
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    const tokenRecord = tokens[0];

    // Hash password mới
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Cập nhật password
    await db.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, tokenRecord.user_id]
    );

    // Đánh dấu token đã dùng
    await db.execute(
      'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
      [tokenRecord.id]
    );

    // Lấy thông tin user để trả về
    const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [tokenRecord.user_id]);
    const user = users[0];

    // Tạo session token
    const sessionToken = generateToken();

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công',
      user: {
        id: user.id,
        companyName: user.company_name,
        industry: user.industry,
        email: user.email,
        creditLimit: parseFloat(user.credit_limit),
        availableCredit: parseFloat(user.available_credit),
        spendingCapacity: parseFloat(user.spending_capacity),
      },
      token: sessionToken,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Lỗi server khi đặt lại mật khẩu' });
  }
});

/**
 * POST /api/auth/verify-email
 * Xác nhận email với token
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Vui lòng nhập token xác nhận' });
    }

    // Tìm token
    const [tokens] = await db.execute(
      `SELECT * FROM email_verification_tokens
       WHERE token = ? AND used = 0 AND expires_at > NOW()`,
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    const tokenRecord = tokens[0];

    // Cập nhật email_verified = 1
    await db.execute(
      'UPDATE users SET email_verified = 1 WHERE id = ?',
      [tokenRecord.user_id]
    );

    // Đánh dấu token đã dùng
    await db.execute(
      'UPDATE email_verification_tokens SET used = 1 WHERE id = ?',
      [tokenRecord.id]
    );

    // Lấy thông tin user để trả về
    const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [tokenRecord.user_id]);
    const user = users[0];

    // Tạo session token để tự động đăng nhập
    const sessionToken = generateToken();

    res.json({
      success: true,
      message: 'Email đã được xác nhận thành công!',
      user: {
        id: user.id,
        companyName: user.company_name,
        industry: user.industry,
        email: user.email,
        creditLimit: parseFloat(user.credit_limit),
        availableCredit: parseFloat(user.available_credit),
        spendingCapacity: parseFloat(user.spending_capacity),
      },
      token: sessionToken,
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Lỗi server khi xác nhận email' });
  }
});

/**
 * GET /api/auth/me
 * Lấy thông tin user hiện tại (cần middleware auth)
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    // TODO: Verify token và lấy user_id từ token
    // Hiện tại đơn giản hóa bằng cách lấy từ query hoặc body
    const userId = req.query.userId || req.body.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      companyName: user.company_name,
      industry: user.industry,
      email: user.email,
      creditLimit: parseFloat(user.credit_limit),
      availableCredit: parseFloat(user.available_credit),
      spendingCapacity: parseFloat(user.spending_capacity),
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
