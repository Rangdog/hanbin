USE supply_chain_finance;

-- Clear existing data (for re-seeding)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE email_verification_tokens;
TRUNCATE TABLE password_reset_tokens;
TRUNCATE TABLE risk_metrics;
TRUNCATE TABLE orders;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert multiple sample users
-- Tất cả users đều có mật khẩu: password123
-- Hash được tạo bằng bcrypt với cost=10
-- email_verified = 1 để có thể đăng nhập ngay (users mẫu)
INSERT INTO users (id, company_name, industry, email, password_hash, email_verified, credit_limit, available_credit, spending_capacity) VALUES
('user-001', 'Tech Innovations Ltd', 'Technology', 'contact@techinnovations.com', '$2b$10$N9qo8uLOickgx2ZMRZo5ieJ7b6Kp..u8aORdzdrDam6DCeU0Yv1ui', 1, 500000.00, 350000.00, 425000.00),
('user-002', 'Global Manufacturing Co', 'Manufacturing', 'info@globalmfg.com', '$2b$10$N9qo8uLOickgx2ZMRZo5ieJ7b6Kp..u8aORdzdrDam6DCeU0Yv1ui', 1, 750000.00, 600000.00, 675000.00),
('user-003', 'Retail Solutions Inc', 'Retail', 'hello@retailsolutions.com', '$2b$10$N9qo8uLOickgx2ZMRZo5ieJ7b6Kp..u8aORdzdrDam6DCeU0Yv1ui', 1, 300000.00, 250000.00, 275000.00),
('user-004', 'Food & Beverage Group', 'Food & Beverage', 'contact@fngroup.com', '$2b$10$N9qo8uLOickgx2ZMRZo5ieJ7b6Kp..u8aORdzdrDam6DCeU0Yv1ui', 1, 400000.00, 320000.00, 360000.00),
('user-005', 'Healthcare Systems', 'Healthcare', 'info@healthcaresys.com', '$2b$10$N9qo8uLOickgx2ZMRZo5ieJ7b6Kp..u8aORdzdrDam6DCeU0Yv1ui', 1, 1000000.00, 850000.00, 925000.00),
('user-006', 'Energy Solutions Ltd', 'Energy', 'sales@energysolutions.com', '$2b$10$N9qo8uLOickgx2ZMRZo5ieJ7b6Kp..u8aORdzdrDam6DCeU0Yv1ui', 1, 800000.00, 650000.00, 725000.00),
('user-007', 'Logistics Pro', 'Logistics', 'contact@logisticspro.com', '$2b$10$N9qo8uLOickgx2ZMRZo5ieJ7b6Kp..u8aORdzdrDam6DCeU0Yv1ui', 1, 600000.00, 480000.00, 540000.00),
('user-008', 'Construction Masters', 'Construction', 'info@constructionmasters.com', '$2b$10$N9qo8uLOickgx2ZMRZo5ieJ7b6Kp..u8aORdzdrDam6DCeU0Yv1ui', 1, 900000.00, 720000.00, 810000.00);

-- Insert sample orders for user-001 (Tech Innovations Ltd)
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, created_at) VALUES
('ord-001', 'user-001', 'Global Electronics Inc', 125000.00, 3.5, 60, 'approved', 'INV-2024-001', '2024-01-15'),
('ord-002', 'user-001', 'Smart Devices Corp', 75000.00, 2.8, 45, 'completed', 'INV-2024-002', '2024-01-20'),
('ord-003', 'user-001', 'Future Tech Systems', 200000.00, 4.2, 90, 'pending', 'INV-2024-003', '2024-02-01'),
('ord-004', 'user-001', 'Digital Solutions Ltd', 50000.00, 2.5, 30, 'approved', 'INV-2024-004', '2024-02-05'),
('ord-005', 'user-001', 'Innovation Partners', 95000.00, 3.2, 60, 'pending', 'INV-2024-005', '2024-02-10'),
('ord-006', 'user-001', 'Tech Ventures LLC', 180000.00, 3.8, 75, 'approved', 'INV-2024-006', '2024-02-15'),
('ord-007', 'user-001', 'Cloud Computing Inc', 110000.00, 3.0, 45, 'completed', 'INV-2024-007', '2024-02-20'),
('ord-008', 'user-001', 'AI Solutions Group', 165000.00, 4.0, 90, 'pending', 'INV-2024-008', '2024-02-25'),
('ord-009', 'user-001', 'Data Analytics Co', 85000.00, 2.9, 60, 'approved', 'INV-2024-009', '2024-03-01'),
('ord-010', 'user-001', 'Software Development Ltd', 140000.00, 3.6, 75, 'completed', 'INV-2024-010', '2024-03-05');

-- Insert sample orders for user-002 (Global Manufacturing Co)
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, created_at) VALUES
('ord-011', 'user-002', 'Industrial Equipment Inc', 250000.00, 3.2, 60, 'approved', 'INV-2024-011', '2024-02-15'),
('ord-012', 'user-002', 'Manufacturing Solutions', 180000.00, 2.9, 45, 'completed', 'INV-2024-012', '2024-02-20'),
('ord-013', 'user-002', 'Production Systems Ltd', 320000.00, 3.5, 90, 'pending', 'INV-2024-013', '2024-03-01'),
('ord-014', 'user-002', 'Factory Automation Co', 195000.00, 3.1, 60, 'approved', 'INV-2024-014', '2024-03-05'),
('ord-015', 'user-002', 'Quality Control Systems', 145000.00, 2.8, 45, 'completed', 'INV-2024-015', '2024-03-10'),
('ord-016', 'user-002', 'Supply Chain Partners', 275000.00, 3.4, 75, 'approved', 'INV-2024-016', '2024-03-15'),
('ord-017', 'user-002', 'Raw Materials Corp', 220000.00, 3.0, 60, 'pending', 'INV-2024-017', '2024-03-20');

-- Insert sample orders for user-003 (Retail Solutions Inc)
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, created_at) VALUES
('ord-018', 'user-003', 'Supermarket Chain', 85000.00, 2.5, 30, 'approved', 'INV-2024-018', '2024-02-25'),
('ord-019', 'user-003', 'Department Store Group', 120000.00, 2.8, 45, 'completed', 'INV-2024-019', '2024-03-01'),
('ord-020', 'user-003', 'Online Retail Platform', 95000.00, 2.6, 30, 'approved', 'INV-2024-020', '2024-03-05'),
('ord-021', 'user-003', 'Fashion Retail Co', 78000.00, 2.7, 45, 'pending', 'INV-2024-021', '2024-03-10'),
('ord-022', 'user-003', 'Electronics Retailer', 110000.00, 2.9, 60, 'approved', 'INV-2024-022', '2024-03-15');

-- Insert sample orders for user-004 (Food & Beverage Group)
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, created_at) VALUES
('ord-023', 'user-004', 'Restaurant Chain', 65000.00, 2.4, 30, 'approved', 'INV-2024-023', '2024-03-01'),
('ord-024', 'user-004', 'Beverage Distributor', 88000.00, 2.6, 45, 'completed', 'INV-2024-024', '2024-03-05'),
('ord-025', 'user-004', 'Food Service Provider', 105000.00, 2.8, 60, 'approved', 'INV-2024-025', '2024-03-10'),
('ord-026', 'user-004', 'Grocery Store Network', 72000.00, 2.5, 30, 'pending', 'INV-2024-026', '2024-03-15');

-- Insert sample orders for user-005 (Healthcare Systems)
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, created_at) VALUES
('ord-027', 'user-005', 'Hospital Network', 350000.00, 2.5, 90, 'approved', 'INV-2024-027', '2024-02-20'),
('ord-028', 'user-005', 'Medical Equipment Supplier', 280000.00, 2.7, 75, 'completed', 'INV-2024-028', '2024-02-25'),
('ord-029', 'user-005', 'Pharmaceutical Company', 420000.00, 2.6, 90, 'approved', 'INV-2024-029', '2024-03-01'),
('ord-030', 'user-005', 'Healthcare Clinic Chain', 195000.00, 2.8, 60, 'pending', 'INV-2024-030', '2024-03-05'),
('ord-031', 'user-005', 'Medical Research Institute', 310000.00, 2.9, 90, 'approved', 'INV-2024-031', '2024-03-10');

-- Insert sample orders for user-006 (Energy Solutions Ltd)
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, created_at) VALUES
('ord-032', 'user-006', 'Power Plant Operator', 450000.00, 3.2, 90, 'approved', 'INV-2024-032', '2024-03-01'),
('ord-033', 'user-006', 'Renewable Energy Corp', 380000.00, 3.0, 75, 'pending', 'INV-2024-033', '2024-03-05'),
('ord-034', 'user-006', 'Energy Distribution Co', 320000.00, 2.9, 60, 'approved', 'INV-2024-034', '2024-03-10'),
('ord-035', 'user-006', 'Solar Panel Manufacturer', 275000.00, 3.1, 90, 'completed', 'INV-2024-035', '2024-03-15');

-- Insert sample orders for user-007 (Logistics Pro)
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, created_at) VALUES
('ord-036', 'user-007', 'Shipping Company', 165000.00, 2.8, 60, 'approved', 'INV-2024-036', '2024-03-05'),
('ord-037', 'user-007', 'Freight Forwarder', 195000.00, 3.0, 75, 'completed', 'INV-2024-037', '2024-03-10'),
('ord-038', 'user-007', 'Warehouse Operator', 145000.00, 2.7, 45, 'approved', 'INV-2024-038', '2024-03-15'),
('ord-039', 'user-007', 'Transportation Network', 180000.00, 2.9, 60, 'pending', 'INV-2024-039', '2024-03-20');

-- Insert sample orders for user-008 (Construction Masters)
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, created_at) VALUES
('ord-040', 'user-008', 'Real Estate Developer', 550000.00, 3.5, 90, 'approved', 'INV-2024-040', '2024-03-01'),
('ord-041', 'user-008', 'Infrastructure Builder', 480000.00, 3.3, 90, 'pending', 'INV-2024-041', '2024-03-05'),
('ord-042', 'user-008', 'Construction Materials Co', 320000.00, 3.1, 75, 'approved', 'INV-2024-042', '2024-03-10'),
('ord-043', 'user-008', 'Building Contractor', 275000.00, 3.2, 60, 'completed', 'INV-2024-043', '2024-03-15'),
('ord-044', 'user-008', 'Engineering Firm', 380000.00, 3.4, 90, 'approved', 'INV-2024-044', '2024-03-20');

-- Insert risk metrics for all users
INSERT INTO risk_metrics (user_id, credit_score, payment_history, industry_risk, market_conditions) VALUES
('user-001', 85, 92, 65, 78),
('user-002', 88, 95, 70, 82),
('user-003', 75, 85, 60, 72),
('user-004', 78, 88, 55, 70),
('user-005', 92, 98, 50, 85),
('user-006', 86, 90, 68, 80),
('user-007', 80, 87, 62, 75),
('user-008', 90, 94, 72, 88);
