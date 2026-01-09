-- Migration: Add Buy Now Pay Later (BNPL) Fields
-- Description: Thêm các trường cho tính năng trả góp: thu nhập, kỳ hạn, số tiền trả mỗi tháng, risk assessment

USE supply_chain_finance;

-- Thêm các cột vào orders table (sử dụng prepared statements vì MySQL không hỗ trợ IF NOT EXISTS cho ALTER TABLE)
SET @dbname = DATABASE();
SET @tablename = 'orders';

-- Thêm cột customer_income
SET @columnname = 'customer_income';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (table_name = @tablename) AND (table_schema = @dbname) AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(15, 2) DEFAULT NULL COMMENT ''Thu nhập của khách hàng''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Thêm cột installment_period
SET @columnname = 'installment_period';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (table_name = @tablename) AND (table_schema = @dbname) AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT DEFAULT NULL COMMENT ''Kỳ hạn trả góp (số tháng)''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Thêm cột monthly_payment
SET @columnname = 'monthly_payment';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (table_name = @tablename) AND (table_schema = @dbname) AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(15, 2) DEFAULT NULL COMMENT ''Số tiền trả mỗi tháng''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Thêm cột total_amount_with_interest
SET @columnname = 'total_amount_with_interest';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (table_name = @tablename) AND (table_schema = @dbname) AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(15, 2) DEFAULT NULL COMMENT ''Tổng tiền phải trả (bao gồm lãi)''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Thêm cột risk_score
SET @columnname = 'risk_score';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (table_name = @tablename) AND (table_schema = @dbname) AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT DEFAULT NULL COMMENT ''Điểm đánh giá rủi ro (0-100)''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Thêm cột risk_level
SET @columnname = 'risk_level';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (table_name = @tablename) AND (table_schema = @dbname) AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' ENUM(''low'', ''medium'', ''high'', ''very_high'') DEFAULT NULL COMMENT ''Mức độ rủi ro''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Thêm cột approved_by_admin
SET @columnname = 'approved_by_admin';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (table_name = @tablename) AND (table_schema = @dbname) AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TINYINT(1) DEFAULT 0 COMMENT ''Đã được admin duyệt chưa''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Thêm index cho các trường mới (kiểm tra trước khi tạo)
SET @dbname = DATABASE();
SET @tablename = 'orders';

-- Index cho risk_level
SELECT COUNT(*) INTO @exist FROM INFORMATION_SCHEMA.STATISTICS 
WHERE table_schema = @dbname AND table_name = @tablename AND index_name = 'idx_risk_level';
SET @sql = IF(@exist = 0, 'CREATE INDEX idx_risk_level ON orders(risk_level)', 'SELECT ''Index idx_risk_level already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index cho installment_period
SELECT COUNT(*) INTO @exist FROM INFORMATION_SCHEMA.STATISTICS 
WHERE table_schema = @dbname AND table_name = @tablename AND index_name = 'idx_installment_period';
SET @sql = IF(@exist = 0, 'CREATE INDEX idx_installment_period ON orders(installment_period)', 'SELECT ''Index idx_installment_period already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index cho approved_by_admin
SELECT COUNT(*) INTO @exist FROM INFORMATION_SCHEMA.STATISTICS 
WHERE table_schema = @dbname AND table_name = @tablename AND index_name = 'idx_approved_by_admin';
SET @sql = IF(@exist = 0, 'CREATE INDEX idx_approved_by_admin ON orders(approved_by_admin)', 'SELECT ''Index idx_approved_by_admin already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
