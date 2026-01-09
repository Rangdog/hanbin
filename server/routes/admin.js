import express from 'express';
import db from '../db.js';
import crypto from 'crypto';

const router = express.Router();

// Helper để tạo UUID
function generateUUID() {
  return crypto.randomUUID();
}

// Middleware để lấy userId
function getUserId(req) {
  return req.headers['x-user-id'] || req.query.userId;
}

// Middleware để kiểm tra admin
async function requireAdmin(req, res, next) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const [users] = await db.execute('SELECT role FROM users WHERE id = ?', [userId]);
    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới có quyền truy cập' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
}

/**
 * GET /api/admin/dashboard/stats
 * Lấy thống kê tổng quan
 */
router.get('/dashboard/stats', requireAdmin, async (req, res) => {
  try {
    // Tổng số khách hàng
    const [customers] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['user']
    );
    const totalCustomers = customers[0].count;

    // Tổng số order
    const [orders] = await db.execute('SELECT COUNT(*) as count FROM orders');
    const totalOrders = orders[0].count;

    // Tổng doanh thu (từ orders completed)
    const [revenue] = await db.execute(
      `SELECT COALESCE(SUM(amount), 0) as total FROM orders WHERE status IN ('completed', 'paid', 'shipping')`
    );
    const totalRevenue = parseFloat(revenue[0].total);

    // Doanh thu theo ngày (30 ngày gần nhất)
    const [revenueByDay] = await db.execute(
      `SELECT DATE(created_at) as date, COALESCE(SUM(amount), 0) as revenue
       FROM orders
       WHERE status IN ('completed', 'paid', 'shipping')
       AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );

    // Doanh thu theo tháng (12 tháng gần nhất)
    const [revenueByMonth] = await db.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COALESCE(SUM(amount), 0) as revenue
       FROM orders
       WHERE status IN ('completed', 'paid', 'shipping')
       AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month DESC`
    );

    // VIP Customers (top 10 khách hàng có tổng tiền đã chi cao nhất)
    const [vipCustomers] = await db.execute(
      `SELECT 
        u.id as userId,
        u.company_name as companyName,
        COALESCE(SUM(o.amount), 0) as totalSpent,
        COUNT(o.id) as orderCount,
        MAX(o.created_at) as lastOrderDate
       FROM users u
       LEFT JOIN orders o ON u.id = o.user_id AND o.status IN ('completed', 'paid', 'shipping')
       WHERE u.role = 'user'
       GROUP BY u.id, u.company_name
       ORDER BY totalSpent DESC
       LIMIT 10`
    );

    res.json({
      totalCustomers: parseInt(totalCustomers),
      totalOrders: parseInt(totalOrders),
      totalRevenue,
      revenueByDay: revenueByDay.map(r => ({
        date: r.date.toISOString().split('T')[0],
        revenue: parseFloat(r.revenue),
      })),
      revenueByMonth: revenueByMonth.map(r => ({
        month: r.month,
        revenue: parseFloat(r.revenue),
      })),
      vipCustomers: vipCustomers.map(c => ({
        userId: c.userId,
        companyName: c.companyName,
        totalSpent: parseFloat(c.totalSpent),
        orderCount: parseInt(c.orderCount),
        lastOrderDate: c.lastOrderDate ? c.lastOrderDate.toISOString().split('T')[0] : null,
      })),
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy thống kê' });
  }
});

/**
 * GET /api/admin/orders
 * Lấy danh sách tất cả orders (admin) - có thể filter theo status, ngày, khách hàng
 */
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const { status, startDate, endDate, customerId } = req.query;
    let query = `
      SELECT o.id, o.user_id as userId, u.company_name as customerName, u.email as customerEmail,
             o.buyer, o.amount, o.interest_rate as interestRate,
             o.payment_terms as paymentTerms, o.status, o.invoice_number as invoiceNumber,
             o.created_at as createdAt,
             o.customer_income as customerIncome, o.installment_period as installmentPeriod,
             o.monthly_payment as monthlyPayment, o.total_amount_with_interest as totalAmountWithInterest,
             o.risk_score as riskScore, o.risk_level as riskLevel
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    if (startDate) {
      query += ' AND o.created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND o.created_at <= ?';
      params.push(endDate + ' 23:59:59');
    }
    if (customerId) {
      query += ' AND o.user_id = ?';
      params.push(customerId);
    }

    query += ' ORDER BY o.created_at DESC';

    const [orders] = await db.execute(query, params);

    // Lấy order_items cho mỗi order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const [items] = await db.execute(
        `SELECT oi.id, oi.product_id as productId, p.name as productName, p.brand as productBrand,
                p.image_url as productImageUrl, oi.quantity, oi.unit_price as unitPrice, oi.subtotal
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      return {
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
        items: items.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          subtotal: parseFloat(item.subtotal),
          product: item.productName ? {
            name: item.productName,
            brand: item.productBrand,
            imageUrl: item.productImageUrl,
          } : undefined,
        })),
      };
    }));

    // Tính tổng doanh thu
    const [revenue] = await db.execute(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM orders
       WHERE status IN ('completed', 'paid', 'shipping')`
    );
    const totalRevenue = parseFloat(revenue[0].total);

    res.json({
      orders: ordersWithItems,
      totalRevenue,
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách orders' });
  }
});

/**
 * GET /api/admin/orders/:id
 * Lấy chi tiết order (admin)
 */
router.get('/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [orders] = await db.execute(
      `SELECT o.id, o.user_id as userId, u.company_name as customerName, u.email as customerEmail,
              o.buyer, o.amount, o.interest_rate as interestRate,
              o.payment_terms as paymentTerms, o.status, o.invoice_number as invoiceNumber,
              o.due_date as dueDate, o.created_at as createdAt,
              o.customer_income as customerIncome, o.installment_period as installmentPeriod,
              o.monthly_payment as monthlyPayment, o.total_amount_with_interest as totalAmountWithInterest,
              o.risk_score as riskScore, o.risk_level as riskLevel
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order không tồn tại' });
    }

    const order = orders[0];

    // Lấy order_items
    const [items] = await db.execute(
      `SELECT oi.id, oi.product_id as productId, p.name as productName, p.brand as productBrand,
              p.image_url as productImageUrl, oi.quantity, oi.unit_price as unitPrice, oi.subtotal
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    res.json({
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
      items: items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        subtotal: parseFloat(item.subtotal),
        product: item.productName ? {
          name: item.productName,
          brand: item.productBrand,
          imageUrl: item.productImageUrl,
        } : undefined,
      })),
    });
  } catch (error) {
    console.error('Get admin order detail error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy chi tiết order' });
  }
});

/**
 * PUT /api/admin/orders/:id
 * Cập nhật order (admin) - có thể thay đổi status
 */
router.put('/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [orders] = await db.execute('SELECT id FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order không tồn tại' });
    }

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

    // Lấy lại order đã cập nhật
    const [updatedOrders] = await db.execute(
      `SELECT o.id, o.user_id as userId, u.company_name as customerName, o.buyer, o.amount, o.interest_rate as interestRate,
              o.payment_terms as paymentTerms, o.status, o.invoice_number as invoiceNumber,
              o.created_at as createdAt
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
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
    console.error('Update admin order error:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật order' });
  }
});

/**
 * GET /api/admin/customers
 * Lấy danh sách khách hàng
 */
router.get('/customers', requireAdmin, async (req, res) => {
  try {
    const { search, isLocked } = req.query;
    let query = `
      SELECT id, company_name as companyName, industry, email, 
             credit_limit as creditLimit, available_credit as availableCredit,
             spending_capacity as spendingCapacity, is_locked as isLocked,
             created_at as createdAt
      FROM users
      WHERE role = 'user'
    `;
    const params = [];

    if (search) {
      query += ' AND (company_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (isLocked !== undefined) {
      query += ' AND is_locked = ?';
      params.push(isLocked === 'true' ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC';

    const [customers] = await db.execute(query, params);

    // Lấy số order và tổng tiền đã chi cho mỗi customer
    const customersWithStats = await Promise.all(customers.map(async (customer) => {
      const [orderStats] = await db.execute(
        `SELECT COUNT(*) as orderCount, COALESCE(SUM(amount), 0) as totalSpent
         FROM orders
         WHERE user_id = ? AND status IN ('completed', 'paid', 'shipping')`,
        [customer.id]
      );

      return {
        ...customer,
        creditLimit: parseFloat(customer.creditLimit),
        availableCredit: parseFloat(customer.availableCredit),
        spendingCapacity: parseFloat(customer.spendingCapacity),
        orderCount: parseInt(orderStats[0].orderCount),
        totalSpent: parseFloat(orderStats[0].totalSpent),
        isLocked: customer.isLocked === 1,
      };
    }));

    res.json(customersWithStats);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách khách hàng' });
  }
});

/**
 * GET /api/admin/customers/:id/orders
 * Lấy lịch sử order của khách hàng
 */
router.get('/customers/:id/orders', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [orders] = await db.execute(
      `SELECT id, buyer, amount, interest_rate as interestRate,
              payment_terms as paymentTerms, status, invoice_number as invoiceNumber,
              due_date as dueDate, created_at as createdAt
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [id]
    );

    res.json(orders.map(order => ({
      ...order,
      amount: parseFloat(order.amount),
      interestRate: parseFloat(order.interestRate),
      paymentTerms: parseInt(order.paymentTerms),
    })));
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

/**
 * PUT /api/admin/customers/:id/lock
 * Khóa/mở khóa khách hàng
 */
router.put('/customers/:id/lock', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isLocked } = req.body;

    if (typeof isLocked !== 'boolean') {
      return res.status(400).json({ error: 'isLocked phải là boolean' });
    }

    // Kiểm tra user tồn tại và không phải admin
    const [users] = await db.execute('SELECT role FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Khách hàng không tồn tại' });
    }
    if (users[0].role === 'admin') {
      return res.status(403).json({ error: 'Không thể khóa tài khoản admin' });
    }

    await db.execute('UPDATE users SET is_locked = ? WHERE id = ?', [isLocked ? 1 : 0, id]);

    res.json({ success: true, message: isLocked ? 'Đã khóa khách hàng' : 'Đã mở khóa khách hàng' });
  } catch (error) {
    console.error('Lock customer error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
