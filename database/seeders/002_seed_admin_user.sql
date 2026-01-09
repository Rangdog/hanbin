-- Seeder: Admin User
-- Description: Tạo tài khoản admin mặc định
--
USE supply_chain_finance;

-- Admin user
-- Email: admin@supplychain.com
-- Password: admin123
-- Hash được tạo bằng bcrypt với cost=10 cho mật khẩu "admin123"
INSERT INTO users (id, company_name, industry, email, password_hash, email_verified, role, is_locked, credit_limit, available_credit, spending_capacity) VALUES
('admin-001', 'Haibin21 Admin', 'System', 'admin@supplychain.com', '$2b$10$vI96hAtSOQKgVXbPNnU0P.ym1mGp5s9MQzgA60u/Aw.fz4842Fg2O', 1, 'admin', 0, 0, 0, 0)
ON DUPLICATE KEY UPDATE 
  role = 'admin',
  email_verified = 1,
  is_locked = 0,
  password_hash = '$2b$10$vI96hAtSOQKgVXbPNnU0P.ym1mGp5s9MQzgA60u/Aw.fz4842Fg2O',
  email = 'admin@supplychain.com';
