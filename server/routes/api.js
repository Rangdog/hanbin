import express from 'express';
import db from '../db.js';
import crypto from 'crypto';
import { calculateRiskScore, calculateInterestRate, calculateMonthlyPayment, canApproveOrder } from '../utils/riskCalculator.js';

const router = express.Router();

// Helper để tạo UUID
function generateUUID() {
  return crypto.randomUUID();
}

// Middleware đơn giản để lấy userId (trong production nên dùng JWT)
function getUserId(req) {
  // Tạm thời lấy từ header hoặc query
  return req.headers['x-user-id'] || req.query.userId;
}

/**
 * POST /api/orders/calculate-risk
 * Tính toán risk assessment cho BNPL
 */
router.post('/orders/calculate-risk', async (req, res) => {
  try {
    const { customerIncome, orderAmount, installmentPeriod } = req.body;

    if (!customerIncome || !orderAmount || !installmentPeriod) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    if (installmentPeriod < 3) {
      return res.status(400).json({ error: 'Kỳ hạn phải từ 3 tháng trở lên' });
    }

    const riskAssessment = calculateRiskScore(customerIncome, orderAmount, installmentPeriod);
    res.json(riskAssessment);
  } catch (error) {
    console.error('Calculate risk error:', error);
    res.status(500).json({ error: 'Lỗi server khi tính toán rủi ro' });
  }
});

/**
 * GET /api/orders
 * Lấy danh sách orders của user
 */
router.get('/orders', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const [orders] = await db.execute(
      `SELECT id, user_id as userId, buyer, amount, interest_rate as interestRate,
              payment_terms as paymentTerms, status, invoice_number as invoiceNumber,
              created_at as createdAt,
              customer_income as customerIncome, installment_period as installmentPeriod,
              monthly_payment as monthlyPayment, total_amount_with_interest as totalAmountWithInterest,
              risk_score as riskScore, risk_level as riskLevel, approved_by_admin as approvedByAdmin
       FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    res.json(orders.map(order => ({
      ...order,
      amount: parseFloat(order.amount),
      interestRate: parseFloat(order.interestRate),
      paymentTerms: parseInt(order.paymentTerms),
      customerIncome: order.customerIncome ? parseFloat(order.customerIncome) : undefined,
      installmentPeriod: order.installmentPeriod ? parseInt(order.installmentPeriod) : undefined,
      monthlyPayment: order.monthlyPayment ? parseFloat(order.monthlyPayment) : undefined,
      totalAmountWithInterest: order.totalAmountWithInterest ? parseFloat(order.totalAmountWithInterest) : undefined,
      riskScore: order.riskScore ? parseInt(order.riskScore) : undefined,
      riskLevel: order.riskLevel || undefined,
      approvedByAdmin: order.approvedByAdmin === 1,
    })));
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách orders' });
  }
});

/**
 * POST /api/orders
 * Tạo order mới
 */
router.post('/orders', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    // Kiểm tra user có bị khóa không
    const [userCheck] = await db.execute('SELECT is_locked FROM users WHERE id = ?', [userId]);
    if (userCheck.length === 0) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }
    if (userCheck[0].is_locked) {
      return res.status(403).json({ error: 'Tài khoản của bạn đã bị khóa' });
    }

    const { buyer, amount, invoiceNumber, status, items, customerIncome, installmentPeriod } = req.body;

    // Validation: Nếu có items thì tính amount từ items, nếu không thì dùng amount trực tiếp
    let finalAmount = amount;
    if (items && Array.isArray(items) && items.length > 0) {
      // Tính tổng từ items
      finalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }

    if (!buyer || !finalAmount || !invoiceNumber) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    // BNPL Validation (Bắt buộc)
    if (!customerIncome || customerIncome <= 0) {
      return res.status(400).json({ error: 'Vui lòng nhập thu nhập hàng tháng (VND)' });
    }
    if (!installmentPeriod || installmentPeriod < 3) {
      return res.status(400).json({ error: 'Kỳ hạn trả góp phải từ 3 tháng trở lên' });
    }

    // Tính toán risk assessment và payment (BNPL bắt buộc)
    const riskAssessment = calculateRiskScore(customerIncome, finalAmount, installmentPeriod);
    const finalInterestRate = calculateInterestRate(riskAssessment.riskLevel, installmentPeriod);
    const principal = finalAmount;
    const monthlyPayment = calculateMonthlyPayment(principal, finalInterestRate, installmentPeriod);
    const totalAmountWithInterest = monthlyPayment * installmentPeriod;

    const orderId = generateUUID();
    const createdAt = new Date().toISOString().split('T')[0];

    // Bắt đầu transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Xác định status dựa trên risk assessment
      let orderStatus = status || 'pending';
      if (canApproveOrder(riskAssessment.riskScore, riskAssessment.riskLevel)) {
        // Tự động approve nếu risk thấp/trung bình
        orderStatus = 'approved';
      } else if (riskAssessment.riskLevel === 'very_high') {
        // Từ chối nếu risk rất cao
        orderStatus = 'rejected';
      }

      // Tạo order với BNPL fields (bắt buộc)
      await connection.execute(
        `INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, created_at,
                            customer_income, installment_period, monthly_payment, total_amount_with_interest, risk_score, risk_level, approved_by_admin)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId, userId, buyer, finalAmount, finalInterestRate, installmentPeriod * 30, orderStatus, invoiceNumber, createdAt,
          customerIncome, installmentPeriod, monthlyPayment, totalAmountWithInterest,
          riskAssessment.riskScore, riskAssessment.riskLevel, orderStatus === 'approved' ? 1 : 0
        ]
      );

      // Tạo order_items nếu có
      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          if (!item.productId || !item.quantity || !item.unitPrice) {
            throw new Error('Thiếu thông tin sản phẩm trong order items');
          }

          // Kiểm tra sản phẩm tồn tại và còn hàng
          const [products] = await connection.execute(
            'SELECT id, stock_quantity, status FROM products WHERE id = ?',
            [item.productId]
          );
          if (products.length === 0) {
            throw new Error(`Sản phẩm ${item.productId} không tồn tại`);
          }
          if (products[0].status !== 'active') {
            throw new Error(`Sản phẩm ${item.productId} không còn bán`);
          }
          if (products[0].stock_quantity < item.quantity) {
            throw new Error(`Sản phẩm ${item.productId} không đủ hàng (còn ${products[0].stock_quantity})`);
          }

          const itemId = generateUUID();
          const subtotal = item.quantity * item.unitPrice;
          await connection.execute(
            `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [itemId, orderId, item.productId, item.quantity, item.unitPrice, subtotal]
          );

          // Cập nhật stock
          await connection.execute(
            'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
            [item.quantity, item.productId]
          );
        }
      }

      await connection.commit();

      // Lấy order với items (sử dụng connection trước khi release)
      const [orders] = await connection.execute(
        `SELECT o.id, o.user_id as userId, o.buyer, o.amount, o.interest_rate as interestRate,
                o.payment_terms as paymentTerms, o.status, o.invoice_number as invoiceNumber,
                o.due_date as dueDate, o.created_at as createdAt,
                o.customer_income as customerIncome, o.installment_period as installmentPeriod,
                o.monthly_payment as monthlyPayment, o.total_amount_with_interest as totalAmountWithInterest,
                o.risk_score as riskScore, o.risk_level as riskLevel, o.approved_by_admin as approvedByAdmin
         FROM orders o WHERE o.id = ?`,
        [orderId]
      );
      const order = orders[0];

      // Lấy items
      const [orderItems] = await connection.execute(
        `SELECT oi.id, oi.order_id as orderId, oi.product_id as productId, oi.quantity, 
                oi.unit_price as unitPrice, oi.subtotal,
                p.name, p.brand, p.image_url as imageUrl
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [orderId]
      );

      connection.release();

      res.status(201).json({
        ...order,
        amount: parseFloat(order.amount),
        interestRate: parseFloat(order.interestRate),
        paymentTerms: parseInt(order.paymentTerms),
        customerIncome: order.customerIncome ? parseFloat(order.customerIncome) : undefined,
        installmentPeriod: order.installmentPeriod ? parseInt(order.installmentPeriod) : undefined,
        monthlyPayment: order.monthlyPayment ? parseFloat(order.monthlyPayment) : undefined,
        totalAmountWithInterest: order.totalAmountWithInterest ? parseFloat(order.totalAmountWithInterest) : undefined,
        riskScore: order.riskScore ? parseInt(order.riskScore) : undefined,
        riskLevel: order.riskLevel || undefined,
        approvedByAdmin: order.approvedByAdmin === 1,
        riskAssessment: riskAssessment || undefined,
        items: orderItems.map(item => ({
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          subtotal: parseFloat(item.subtotal),
          product: item.name ? {
            name: item.name,
            brand: item.brand,
            imageUrl: item.imageUrl,
          } : undefined,
        })),
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message || 'Lỗi server khi tạo order' });
  }
});

/**
 * PUT /api/orders/:id
 * Cập nhật order
 */
router.put('/orders/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const { id } = req.params;
    const updates = req.body;

    // Kiểm tra order thuộc về user
    const [orders] = await db.execute('SELECT id FROM orders WHERE id = ? AND user_id = ?', [id, userId]);
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order không tồn tại' });
    }

    // Build update query
    const allowedFields = ['buyer', 'amount', 'interest_rate', 'payment_terms', 'status', 'invoice_number', 'due_date'];
    const updateFields = [];
    const updateValues = [];

    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key === 'interestRate' ? 'interest_rate' :
                    key === 'paymentTerms' ? 'payment_terms' :
                    key === 'invoiceNumber' ? 'invoice_number' :
                    key === 'dueDate' ? 'due_date' : key;
      if (allowedFields.includes(dbKey) && value !== undefined) {
        updateFields.push(`${dbKey} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Không có trường nào để cập nhật' });
    }

    updateValues.push(id);
    await db.execute(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Lấy order đã cập nhật
    const [updatedOrders] = await db.execute(
      `SELECT id, user_id as userId, buyer, amount, interest_rate as interestRate,
              payment_terms as paymentTerms, status, invoice_number as invoiceNumber,
              due_date as dueDate, created_at as createdAt
       FROM orders WHERE id = ?`,
      [id]
    );

    const order = updatedOrders[0];
    res.json({
      ...order,
      amount: parseFloat(order.amount),
      interestRate: parseFloat(order.interestRate),
      paymentTerms: parseInt(order.paymentTerms),
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật order' });
  }
});

/**
 * DELETE /api/orders/:id
 * Xóa order
 */
router.delete('/orders/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const { id } = req.params;

    // Kiểm tra order thuộc về user
    const [orders] = await db.execute('SELECT id FROM orders WHERE id = ? AND user_id = ?', [id, userId]);
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order không tồn tại' });
    }

    await db.execute('DELETE FROM orders WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Lỗi server khi xóa order' });
  }
});

/**
 * GET /api/user
 * Lấy thông tin user
 */
router.get('/user', async (req, res) => {
  try {
    const userId = getUserId(req);
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
      role: user.role || 'user',
      isLocked: user.is_locked || false,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

/**
 * PUT /api/user
 * Cập nhật thông tin user
 */
router.put('/user', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const { companyName, industry, email } = req.body;
    const updates = {};
    if (companyName !== undefined) updates.company_name = companyName;
    if (industry !== undefined) updates.industry = industry;
    if (email !== undefined) updates.email = email.toLowerCase();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Không có trường nào để cập nhật' });
    }

    const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const updateValues = [...Object.values(updates), userId];

    await db.execute(`UPDATE users SET ${updateFields} WHERE id = ?`, updateValues);

    // Lấy user đã cập nhật
    const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    const user = users[0];

    res.json({
      id: user.id,
      companyName: user.company_name,
      industry: user.industry,
      email: user.email,
      creditLimit: parseFloat(user.credit_limit),
      availableCredit: parseFloat(user.available_credit),
      spendingCapacity: parseFloat(user.spending_capacity),
      role: user.role || 'user',
      isLocked: user.is_locked || false,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật user' });
  }
});

/**
 * GET /api/risk-metrics
 * Lấy risk metrics của user
 */
router.get('/risk-metrics', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const [metrics] = await db.execute(
      `SELECT credit_score as creditScore, payment_history as paymentHistory,
              industry_risk as industryRisk, market_conditions as marketConditions
       FROM risk_metrics WHERE user_id = ? ORDER BY calculated_at DESC LIMIT 1`,
      [userId]
    );

    if (metrics.length === 0) {
      // Trả về giá trị mặc định nếu chưa có
      return res.json({
        creditScore: 75,
        paymentHistory: 80,
        industryRisk: 60,
        marketConditions: 70,
      });
    }

    res.json({
      creditScore: parseInt(metrics[0].creditScore),
      paymentHistory: parseInt(metrics[0].paymentHistory),
      industryRisk: parseInt(metrics[0].industryRisk),
      marketConditions: parseInt(metrics[0].marketConditions),
    });
  } catch (error) {
    console.error('Get risk metrics error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy risk metrics' });
  }
});

export default router;
