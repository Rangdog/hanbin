import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Tạo transporter cho email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Gửi email khôi phục mật khẩu
 * @param {string} to - Email người nhận
 * @param {string} token - Token khôi phục
 * @param {string} resetUrl - URL để reset password (frontend URL + token)
 */
export async function sendPasswordResetEmail(to, token, resetUrl) {
  const mailOptions = {
    from: `"Supply Chain Finance" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Khôi phục mật khẩu - Supply Chain Finance',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Khôi phục mật khẩu</h2>
        <p>Xin chào,</p>
        <p>Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản của bạn.</p>
        <p>Vui lòng click vào link bên dưới để đặt lại mật khẩu:</p>
        <p style="margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Đặt lại mật khẩu
          </a>
        </p>
        <p>Hoặc copy và dán link sau vào trình duyệt:</p>
        <p style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all;">
          ${resetUrl}
        </p>
        <p><strong>Token của bạn:</strong> <code style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${token}</code></p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Link này sẽ hết hạn sau 30 phút.<br>
          Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.
        </p>
      </div>
    `,
    text: `
      Khôi phục mật khẩu
      
      Bạn đã yêu cầu khôi phục mật khẩu. Vui lòng truy cập link sau:
      ${resetUrl}
      
      Token: ${token}
      
      Link này sẽ hết hạn sau 30 phút.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Không thể gửi email. Vui lòng kiểm tra cấu hình SMTP.');
  }
}

/**
 * Kiểm tra cấu hình email có hợp lệ không
 */
export function isEmailConfigured() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}
