USE supply_chain_finance;

-- Clear existing data (for re-seeding)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE risk_metrics;
TRUNCATE TABLE orders;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert sample user
INSERT INTO users (id, company_name, industry, email, credit_limit, available_credit, spending_capacity) VALUES
('user-001', 'Tech Innovations Ltd', 'Technology', 'contact@techinnovations.com', 500000.00, 350000.00, 425000.00);

-- Insert sample orders
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, due_date, created_at) VALUES
('ord-001', 'user-001', 'Global Electronics Inc', 125000.00, 3.5, 60, 'approved', 'INV-2024-001', '2024-03-15', '2024-01-15'),
('ord-002', 'user-001', 'Smart Devices Corp', 75000.00, 2.8, 45, 'completed', 'INV-2024-002', '2024-03-01', '2024-01-20'),
('ord-003', 'user-001', 'Future Tech Systems', 200000.00, 4.2, 90, 'pending', 'INV-2024-003', '2024-04-20', '2024-02-01'),
('ord-004', 'user-001', 'Digital Solutions Ltd', 50000.00, 2.5, 30, 'approved', 'INV-2024-004', '2024-02-28', '2024-02-05'),
('ord-005', 'user-001', 'Innovation Partners', 95000.00, 3.2, 60, 'pending', 'INV-2024-005', '2024-03-30', '2024-02-10');

-- Insert risk metrics
INSERT INTO risk_metrics (user_id, credit_score, payment_history, industry_risk, market_conditions) VALUES
('user-001', 85, 92, 65, 78);
