-- Seeder: Admin User
-- Description: Tạo tài khoản admin mặc định

USE supply_chain_finance;

-- Admin user
-- Email: admin@haibin21.com
-- Password: admin123
-- Hash được tạo bằng bcrypt với cost=10
INSERT INTO users (id, company_name, industry, email, password_hash, email_verified, role, is_locked, credit_limit, available_credit, spending_capacity) VALUES
('admin-001', 'Haibin21 Admin', 'System', 'admin@haibin21.com', '$2b$10$N9qo8uLOickgx2ZMRZo5ieJ7b6Kp..u8aORdzdrDam6DCeU0Yv1ui', 1, 'admin', 0, 0, 0, 0)
ON DUPLICATE KEY UPDATE 
  role = 'admin',
  email_verified = 1,
  is_locked = 0;
