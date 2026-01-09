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
 * GET /api/products
 * Lấy danh sách sản phẩm (có thể filter theo brand, status)
 */
router.get('/', async (req, res) => {
  try {
    const { brand, status, search } = req.query;
    let query = `
      SELECT id, name, brand, image_url as imageUrl, price, description, 
             stock_quantity as stockQuantity, status, created_at as createdAt, updated_at as updatedAt,
             ram, storage, screen_size as screenSize, screen_resolution as screenResolution,
             battery, camera_main as cameraMain, processor, color, operating_system as operatingSystem
      FROM products WHERE 1=1
    `;
    const params = [];

    if (brand) {
      query += ' AND brand = ?';
      params.push(brand);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const [products] = await db.execute(query, params);
    res.json(products.map(p => ({
      ...p,
      price: parseFloat(p.price),
      stockQuantity: parseInt(p.stockQuantity),
      ram: p.ram ? parseInt(p.ram) : undefined,
      storage: p.storage ? parseInt(p.storage) : undefined,
      screenSize: p.screenSize ? parseFloat(p.screenSize) : undefined,
      battery: p.battery ? parseInt(p.battery) : undefined,
      cameraMain: p.cameraMain ? parseInt(p.cameraMain) : undefined,
    })));
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách sản phẩm' });
  }
});

/**
 * GET /api/products/:id
 * Lấy chi tiết sản phẩm
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [products] = await db.execute(
      `SELECT id, name, brand, image_url as imageUrl, price, description, 
              stock_quantity as stockQuantity, status, created_at as createdAt, updated_at as updatedAt
       FROM products WHERE id = ?`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }

    const product = products[0];
    res.json({
      ...product,
      price: parseFloat(product.price),
      stockQuantity: parseInt(product.stockQuantity),
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

/**
 * POST /api/products
 * Tạo sản phẩm mới (chỉ admin)
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, brand, imageUrl, price, description, stockQuantity, status, ram, storage, screenSize, screenResolution, battery, cameraMain, processor, color, operatingSystem } = req.body;

    if (!name || !brand || !price || stockQuantity === undefined) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    const productId = generateUUID();
    await db.execute(
      `INSERT INTO products (id, name, brand, image_url, price, description, stock_quantity, status,
                            ram, storage, screen_size, screen_resolution, battery, camera_main, processor, color, operating_system)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [productId, name, brand, imageUrl || '', price, description || '', stockQuantity || 0, status || 'active',
       req.body.ram || null, req.body.storage || null, req.body.screenSize || null, req.body.screenResolution || null, 
       req.body.battery || null, req.body.cameraMain || null, req.body.processor || null, req.body.color || null, req.body.operatingSystem || null]
    );

    const [products] = await db.execute(
      `SELECT id, name, brand, image_url as imageUrl, price, description, 
              stock_quantity as stockQuantity, status, created_at as createdAt, updated_at as updatedAt,
              ram, storage, screen_size as screenSize, screen_resolution as screenResolution,
              battery, camera_main as cameraMain, processor, color, operating_system as operatingSystem
       FROM products WHERE id = ?`,
      [productId]
    );

    const product = products[0];
    res.status(201).json({
      ...product,
      price: parseFloat(product.price),
      stockQuantity: parseInt(product.stockQuantity),
      ram: product.ram ? parseInt(product.ram) : undefined,
      storage: product.storage ? parseInt(product.storage) : undefined,
      screenSize: product.screenSize ? parseFloat(product.screenSize) : undefined,
      battery: product.battery ? parseInt(product.battery) : undefined,
      cameraMain: product.cameraMain ? parseInt(product.cameraMain) : undefined,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Lỗi server khi tạo sản phẩm' });
  }
});

/**
 * PUT /api/products/:id
 * Cập nhật sản phẩm (chỉ admin)
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, imageUrl, price, description, stockQuantity, status, ram, storage, screenSize, screenResolution, battery, cameraMain, processor, color, operatingSystem } = req.body;

    // Kiểm tra sản phẩm tồn tại
    const [existing] = await db.execute('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }

    // Build update query
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (brand !== undefined) updates.brand = brand;
    if (imageUrl !== undefined) updates.image_url = imageUrl;
    if (price !== undefined) updates.price = price;
    if (description !== undefined) updates.description = description;
    if (stockQuantity !== undefined) updates.stock_quantity = stockQuantity;
    if (status !== undefined) updates.status = status;
    if (ram !== undefined) updates.ram = ram;
    if (storage !== undefined) updates.storage = storage;
    if (screenSize !== undefined) updates.screen_size = screenSize;
    if (screenResolution !== undefined) updates.screen_resolution = screenResolution;
    if (battery !== undefined) updates.battery = battery;
    if (cameraMain !== undefined) updates.camera_main = cameraMain;
    if (processor !== undefined) updates.processor = processor;
    if (color !== undefined) updates.color = color;
    if (operatingSystem !== undefined) updates.operating_system = operatingSystem;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Không có trường nào để cập nhật' });
    }

    const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const updateValues = [...Object.values(updates), id];

    await db.execute(`UPDATE products SET ${updateFields} WHERE id = ?`, updateValues);

    // Lấy sản phẩm đã cập nhật
    const [products] = await db.execute(
      `SELECT id, name, brand, image_url as imageUrl, price, description, 
              stock_quantity as stockQuantity, status, created_at as createdAt, updated_at as updatedAt,
              ram, storage, screen_size as screenSize, screen_resolution as screenResolution,
              battery, camera_main as cameraMain, processor, color, operating_system as operatingSystem
       FROM products WHERE id = ?`,
      [id]
    );

    const product = products[0];
    res.json({
      ...product,
      price: parseFloat(product.price),
      stockQuantity: parseInt(product.stockQuantity),
      ram: product.ram ? parseInt(product.ram) : undefined,
      storage: product.storage ? parseInt(product.storage) : undefined,
      screenSize: product.screenSize ? parseFloat(product.screenSize) : undefined,
      battery: product.battery ? parseInt(product.battery) : undefined,
      cameraMain: product.cameraMain ? parseInt(product.cameraMain) : undefined,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật sản phẩm' });
  }
});

/**
 * DELETE /api/products/:id
 * Xóa sản phẩm (chỉ admin, soft delete bằng cách set status = inactive)
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra sản phẩm có trong order_items không
    const [orderItems] = await db.execute('SELECT id FROM order_items WHERE product_id = ? LIMIT 1', [id]);
    if (orderItems.length > 0) {
      // Soft delete: set status = inactive
      await db.execute('UPDATE products SET status = ? WHERE id = ?', ['inactive', id]);
      res.json({ success: true, message: 'Sản phẩm đã được vô hiệu hóa (có trong đơn hàng)' });
    } else {
      // Hard delete nếu chưa có trong order
      await db.execute('DELETE FROM products WHERE id = ?', [id]);
      res.json({ success: true, message: 'Sản phẩm đã được xóa' });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Lỗi server khi xóa sản phẩm' });
  }
});

export default router;
