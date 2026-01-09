-- Seeder: Sample BNPL Orders
-- Description: Thêm một số orders mẫu sử dụng tính năng BNPL để demo

USE supply_chain_finance;

-- Chỉ insert nếu chưa có (để tránh duplicate)
-- Orders với BNPL (Buy Now Pay Later)
-- Lưu ý: Các giá trị này được tính toán dựa trên risk calculator logic

-- Order với risk thấp (DTI < 20%)
-- User có thu nhập 240,000,000 VND/tháng, mua 28,800,000 VND, trả góp 6 tháng
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, created_at,
                    customer_income, installment_period, monthly_payment, total_amount_with_interest, risk_score, risk_level, approved_by_admin)
SELECT 'ord-bnpl-001', 'user-001', 'Tech Store Online', 28800000, 2.8, 180, 'approved', 'INV-BNPL-001', DATE_SUB(NOW(), INTERVAL 5 DAY),
       240000000, 6, 4920000, 29520000, 25, 'low', 1
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ord-bnpl-001');

-- Order với risk trung bình (DTI 20-30%)
-- User có thu nhập 120,000,000 VND/tháng, mua 36,000,000 VND, trả góp 12 tháng
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, created_at,
                    customer_income, installment_period, monthly_payment, total_amount_with_interest, risk_score, risk_level, approved_by_admin)
SELECT 'ord-bnpl-002', 'user-002', 'Electronics Hub', 36000000, 3.8, 360, 'approved', 'INV-BNPL-002', DATE_SUB(NOW(), INTERVAL 3 DAY),
       120000000, 12, 3120000, 37440000, 55, 'medium', 1
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ord-bnpl-002');

-- Order với risk cao (DTI 30-40%) - cần admin duyệt
-- User có thu nhập 72,000,000 VND/tháng, mua 28,800,000 VND, trả góp 6 tháng
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, created_at,
                    customer_income, installment_period, monthly_payment, total_amount_with_interest, risk_score, risk_level, approved_by_admin)
SELECT 'ord-bnpl-003', 'user-003', 'Mobile World', 28800000, 5.0, 180, 'pending', 'INV-BNPL-003', DATE_SUB(NOW(), INTERVAL 1 DAY),
       72000000, 6, 5040000, 30240000, 72, 'high', 0
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ord-bnpl-003');

-- Order với risk thấp - mua iPhone 15 Pro Max
-- User có thu nhập 192,000,000 VND/tháng, mua 28,776,000 VND, trả góp 12 tháng
INSERT INTO orders (id, user_id, buyer, amount, interest_rate, payment_terms, status, invoice_number, created_at,
                    customer_income, installment_period, monthly_payment, total_amount_with_interest, risk_score, risk_level, approved_by_admin)
SELECT 'ord-bnpl-004', 'user-001', 'Apple Store', 28776000, 3.2, 360, 'approved', 'INV-BNPL-004', DATE_SUB(NOW(), INTERVAL 7 DAY),
       192000000, 12, 2484000, 29808000, 30, 'low', 1
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ord-bnpl-004');
