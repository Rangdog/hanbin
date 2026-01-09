-- Migration: Update Order Status
-- Description: Mở rộng order status để hỗ trợ paid, shipping, cancelled

USE supply_chain_finance;

-- Cập nhật ENUM cho status trong orders table
-- MySQL không hỗ trợ ALTER ENUM trực tiếp, cần tạo lại cột
ALTER TABLE orders 
MODIFY COLUMN status ENUM('pending', 'paid', 'shipping', 'completed', 'cancelled', 'approved', 'rejected') NOT NULL DEFAULT 'pending';

-- Giữ lại các giá trị cũ (approved, rejected) để tương thích với dữ liệu cũ
