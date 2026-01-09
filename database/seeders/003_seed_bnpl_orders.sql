-- Seeder: Sample BNPL Orders
-- Description: Thêm một số orders mẫu sử dụng tính năng BNPL để demo

USE supply_chain_finance;

-- Chỉ insert nếu chưa có (để tránh duplicate)
-- Orders với BNPL (Buy Now Pay Later)
-- Lưu ý: Các giá trị này được tính toán dựa trên risk calculator logic

-- Order với risk thấp (DTI < 20%)
-- User có thu nhập $10,000/tháng, mua $1,200, trả góp 6 tháng
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, due_date, created_at,
                    customer_income, installment_period, monthly_payment, total_amount_with_interest, risk_score, risk_level, approved_by_admin)
SELECT 'ord-bnpl-001', 'user-001', 'Tech Store Online', 1200.00, 2.8, 180, 'approved', 'INV-BNPL-001', DATE_ADD(NOW(), INTERVAL 6 MONTH), DATE_SUB(NOW(), INTERVAL 5 DAY),
       10000.00, 6, 205.00, 1230.00, 25, 'low', 1
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ord-bnpl-001');

-- Order với risk trung bình (DTI 20-30%)
-- User có thu nhập $5,000/tháng, mua $1,500, trả góp 12 tháng
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, due_date, created_at,
                    customer_income, installment_period, monthly_payment, total_amount_with_interest, risk_score, risk_level, approved_by_admin)
SELECT 'ord-bnpl-002', 'user-002', 'Electronics Hub', 1500.00, 3.8, 360, 'approved', 'INV-BNPL-002', DATE_ADD(NOW(), INTERVAL 12 MONTH), DATE_SUB(NOW(), INTERVAL 3 DAY),
       5000.00, 12, 130.00, 1560.00, 55, 'medium', 1
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ord-bnpl-002');

-- Order với risk cao (DTI 30-40%) - cần admin duyệt
-- User có thu nhập $3,000/tháng, mua $1,200, trả góp 6 tháng
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, due_date, created_at,
                    customer_income, installment_period, monthly_payment, total_amount_with_interest, risk_score, risk_level, approved_by_admin)
SELECT 'ord-bnpl-003', 'user-003', 'Mobile World', 1200.00, 5.0, 180, 'pending', 'INV-BNPL-003', DATE_ADD(NOW(), INTERVAL 6 MONTH), DATE_SUB(NOW(), INTERVAL 1 DAY),
       3000.00, 6, 210.00, 1260.00, 72, 'high', 0
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ord-bnpl-003');

-- Order với risk thấp - mua iPhone 15 Pro Max
-- User có thu nhập $8,000/tháng, mua $1,199, trả góp 12 tháng
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, due_date, created_at,
                    customer_income, installment_period, monthly_payment, total_amount_with_interest, risk_score, risk_level, approved_by_admin)
SELECT 'ord-bnpl-004', 'user-001', 'Apple Store', 1199.00, 3.2, 360, 'approved', 'INV-BNPL-004', DATE_ADD(NOW(), INTERVAL 12 MONTH), DATE_SUB(NOW(), INTERVAL 7 DAY),
       8000.00, 12, 103.50, 1242.00, 30, 'low', 1
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ord-bnpl-004');
