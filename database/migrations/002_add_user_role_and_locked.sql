-- Migration: Add User Role and Locked Status
-- Description: Thêm role (admin/user) và is_locked cho users table

USE supply_chain_finance;

-- Thêm cột role và is_locked vào users table (MySQL không hỗ trợ IF NOT EXISTS cho ALTER TABLE)
-- Kiểm tra và thêm cột role
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'role';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' ENUM(\'admin\', \'user\') NOT NULL DEFAULT \'user\' AFTER email_verified')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Kiểm tra và thêm cột is_locked
SET @columnname = 'is_locked';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TINYINT(1) NOT NULL DEFAULT 0 AFTER role')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Thêm index cho role và is_locked (nếu chưa có)
CREATE INDEX idx_role ON users(role);
CREATE INDEX idx_is_locked ON users(is_locked);
