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
