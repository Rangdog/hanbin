-- Seeder: Products (Điện thoại)
-- Description: Seed dữ liệu sản phẩm điện thoại mẫu

USE supply_chain_finance;

-- Xóa dữ liệu cũ (nếu có)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE products;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert products (Điện thoại)
INSERT INTO products (id, name, brand, image_url, price, description, stock_quantity, status) VALUES
-- Apple
('prod-001', 'iPhone 15 Pro Max', 'Apple', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', 1199.00, 'iPhone 15 Pro Max 256GB - Titanium, Camera 48MP, Chip A17 Pro', 50, 'active'),
('prod-002', 'iPhone 15 Pro', 'Apple', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', 999.00, 'iPhone 15 Pro 256GB - Titanium, Camera 48MP, Chip A17 Pro', 75, 'active'),
('prod-003', 'iPhone 15', 'Apple', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', 799.00, 'iPhone 15 128GB - Dynamic Island, Camera 48MP, Chip A16 Bionic', 100, 'active'),
('prod-004', 'iPhone 14 Pro', 'Apple', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', 899.00, 'iPhone 14 Pro 256GB - Camera 48MP, Chip A16 Bionic', 60, 'active'),
('prod-005', 'iPhone 13', 'Apple', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', 599.00, 'iPhone 13 128GB - Camera 12MP, Chip A15 Bionic', 80, 'active'),

-- Samsung
('prod-006', 'Samsung Galaxy S24 Ultra', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 1199.00, 'Galaxy S24 Ultra 256GB - S Pen, Camera 200MP, Snapdragon 8 Gen 3', 45, 'active'),
('prod-007', 'Samsung Galaxy S24+', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 899.00, 'Galaxy S24+ 256GB - Camera 50MP, Snapdragon 8 Gen 3', 70, 'active'),
('prod-008', 'Samsung Galaxy S24', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 799.00, 'Galaxy S24 128GB - Camera 50MP, Snapdragon 8 Gen 3', 90, 'active'),
('prod-009', 'Samsung Galaxy Z Fold 5', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 1799.00, 'Galaxy Z Fold 5 256GB - Màn hình gập, S Pen', 25, 'active'),
('prod-010', 'Samsung Galaxy A54', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 449.00, 'Galaxy A54 128GB - Camera 50MP, 5G', 120, 'active'),

-- Xiaomi
('prod-011', 'Xiaomi 14 Pro', 'Xiaomi', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400', 899.00, 'Xiaomi 14 Pro 256GB - Camera Leica, Snapdragon 8 Gen 3', 55, 'active'),
('prod-012', 'Xiaomi 14', 'Xiaomi', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400', 699.00, 'Xiaomi 14 256GB - Camera Leica, Snapdragon 8 Gen 3', 85, 'active'),
('prod-013', 'Xiaomi 13T Pro', 'Xiaomi', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400', 599.00, 'Xiaomi 13T Pro 256GB - Camera Leica, MediaTek Dimensity 9200+', 65, 'active'),
('prod-014', 'Xiaomi Redmi Note 13 Pro', 'Xiaomi', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400', 349.00, 'Redmi Note 13 Pro 128GB - Camera 200MP, Snapdragon 7s Gen 2', 150, 'active'),
('prod-015', 'Xiaomi POCO X6 Pro', 'Xiaomi', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400', 399.00, 'POCO X6 Pro 256GB - MediaTek Dimensity 8300 Ultra', 100, 'active'),

-- Google Pixel
('prod-016', 'Google Pixel 8 Pro', 'Google', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400', 999.00, 'Pixel 8 Pro 256GB - Camera 50MP, Tensor G3, AI features', 40, 'active'),
('prod-017', 'Google Pixel 8', 'Google', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400', 699.00, 'Pixel 8 128GB - Camera 50MP, Tensor G3', 60, 'active'),
('prod-018', 'Google Pixel 7a', 'Google', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400', 499.00, 'Pixel 7a 128GB - Camera 64MP, Tensor G2', 80, 'active'),

-- OnePlus
('prod-019', 'OnePlus 12', 'OnePlus', 'https://images.unsplash.com/photo-1601972602237-8c79241f8eb0?w=400', 799.00, 'OnePlus 12 256GB - Snapdragon 8 Gen 3, Camera 50MP', 50, 'active'),
('prod-020', 'OnePlus 11', 'OnePlus', 'https://images.unsplash.com/photo-1601972602237-8c79241f8eb0?w=400', 699.00, 'OnePlus 11 256GB - Snapdragon 8 Gen 2, Camera 50MP', 70, 'active'),

-- Inactive products (để test)
('prod-021', 'iPhone 12 (Discontinued)', 'Apple', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', 499.00, 'iPhone 12 128GB - Đã ngừng sản xuất', 0, 'inactive'),
('prod-022', 'Samsung Galaxy S21 (Old)', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 399.00, 'Galaxy S21 128GB - Sản phẩm cũ', 5, 'inactive');
