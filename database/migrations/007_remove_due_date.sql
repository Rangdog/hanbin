-- Migration: Remove due_date column
-- Description: Xóa cột due_date khỏi bảng orders vì chỉ sử dụng BNPL

USE supply_chain_finance;

SET @dbname = DATABASE();
SET @tablename = 'orders';
SET @columnname = 'due_date';

-- Xóa cột due_date nếu tồn tại
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (table_name = @tablename) AND (table_schema = @dbname) AND (column_name = @columnname)
  ) > 0,
  CONCAT('ALTER TABLE ', @tablename, ' DROP COLUMN ', @columnname),
  'SELECT 1'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
