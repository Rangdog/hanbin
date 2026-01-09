-- Seeder: Products (Điện thoại)
-- Description: Seed dữ liệu sản phẩm điện thoại mẫu với hình ảnh và thông tin đầy đủ

USE supply_chain_finance;

-- Xóa dữ liệu cũ (nếu có)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE products;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert products (Điện thoại) với thông tin đầy đủ - Giá tính bằng VND (1 USD = 24,000 VND)
INSERT INTO products (id, name, brand, image_url, price, description, stock_quantity, status, ram, storage, screen_size, screen_resolution, battery, camera_main, processor, color, operating_system) VALUES
-- Apple
('prod-001', 'iPhone 15 Pro Max', 'Apple', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop', 28776000, 'iPhone 15 Pro Max 256GB - Flagship với chip A17 Pro mạnh mẽ, camera 48MP ProRAW, màn hình Super Retina XDR 6.7 inch', 50, 'active', 8, 256, 6.70, '2796x1290', 4441, 48, 'A17 Pro', 'Natural Titanium', 'iOS 17'),
('prod-002', 'iPhone 15 Pro', 'Apple', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop', 23976000, 'iPhone 15 Pro 256GB - Chip A17 Pro, camera 48MP, màn hình 6.1 inch, khung Titanium', 75, 'active', 8, 256, 6.10, '2556x1179', 3274, 48, 'A17 Pro', 'Blue Titanium', 'iOS 17'),
('prod-003', 'iPhone 15', 'Apple', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop', 19176000, 'iPhone 15 128GB - Dynamic Island, camera 48MP, chip A16 Bionic, màn hình 6.1 inch', 100, 'active', 6, 128, 6.10, '2556x1179', 3349, 48, 'A16 Bionic', 'Pink', 'iOS 17'),
('prod-004', 'iPhone 14 Pro', 'Apple', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop', 21576000, 'iPhone 14 Pro 256GB - Dynamic Island, camera 48MP Pro, chip A16 Bionic, màn hình Super Retina XDR', 60, 'active', 6, 256, 6.10, '2556x1179', 3200, 48, 'A16 Bionic', 'Deep Purple', 'iOS 16'),
('prod-005', 'iPhone 13', 'Apple', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop', 14376000, 'iPhone 13 128GB - Camera kép 12MP, chip A15 Bionic, màn hình Super Retina XDR 6.1 inch', 80, 'active', 4, 128, 6.10, '2532x1170', 3240, 12, 'A15 Bionic', 'Midnight', 'iOS 15'),

-- Samsung
('prod-006', 'Samsung Galaxy S24 Ultra', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop', 28776000, 'Galaxy S24 Ultra 256GB - S Pen tích hợp, camera 200MP, Snapdragon 8 Gen 3, màn hình Dynamic AMOLED 2X 6.8 inch', 45, 'active', 12, 256, 6.80, '3088x1440', 5000, 200, 'Snapdragon 8 Gen 3', 'Titanium Black', 'Android 14'),
('prod-007', 'Samsung Galaxy S24+', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop', 21576000, 'Galaxy S24+ 256GB - Camera 50MP, Snapdragon 8 Gen 3, màn hình Dynamic AMOLED 2X 6.7 inch', 70, 'active', 12, 256, 6.70, '2340x1080', 4900, 50, 'Snapdragon 8 Gen 3', 'Marble Gray', 'Android 14'),
('prod-008', 'Samsung Galaxy S24', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop', 19176000, 'Galaxy S24 128GB - Camera 50MP, Snapdragon 8 Gen 3, màn hình Dynamic AMOLED 2X 6.2 inch', 90, 'active', 8, 128, 6.20, '2340x1080', 4000, 50, 'Snapdragon 8 Gen 3', 'Onyx Black', 'Android 14'),
('prod-009', 'Samsung Galaxy Z Fold 5', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop', 43176000, 'Galaxy Z Fold 5 256GB - Màn hình gập 7.6 inch, S Pen, Snapdragon 8 Gen 2, camera 50MP', 25, 'active', 12, 256, 7.60, '2176x1812', 4400, 50, 'Snapdragon 8 Gen 2', 'Phantom Black', 'Android 13'),
('prod-010', 'Samsung Galaxy A54', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop', 10776000, 'Galaxy A54 128GB - Camera 50MP, 5G, màn hình Super AMOLED 6.4 inch, pin 5000mAh', 120, 'active', 8, 128, 6.40, '2340x1080', 5000, 50, 'Exynos 1380', 'Awesome Violet', 'Android 13'),

-- Xiaomi
('prod-011', 'Xiaomi 14 Pro', 'Xiaomi', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=800&fit=crop', 21576000, 'Xiaomi 14 Pro 256GB - Camera Leica 50MP, Snapdragon 8 Gen 3, màn hình AMOLED 6.73 inch, sạc nhanh 120W', 55, 'active', 12, 256, 6.73, '3200x1440', 4880, 50, 'Snapdragon 8 Gen 3', 'Black', 'MIUI 15'),
('prod-012', 'Xiaomi 14', 'Xiaomi', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=800&fit=crop', 16776000, 'Xiaomi 14 256GB - Camera Leica 50MP, Snapdragon 8 Gen 3, màn hình AMOLED 6.36 inch', 85, 'active', 12, 256, 6.36, '2670x1200', 4610, 50, 'Snapdragon 8 Gen 3', 'White', 'MIUI 15'),
('prod-013', 'Xiaomi 13T Pro', 'Xiaomi', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=800&fit=crop', 14376000, 'Xiaomi 13T Pro 256GB - Camera Leica 50MP, MediaTek Dimensity 9200+, màn hình AMOLED 6.67 inch', 65, 'active', 12, 256, 6.67, '2712x1220', 5000, 50, 'MediaTek Dimensity 9200+', 'Blue', 'MIUI 14'),
('prod-014', 'Xiaomi Redmi Note 13 Pro', 'Xiaomi', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=800&fit=crop', 8376000, 'Redmi Note 13 Pro 128GB - Camera 200MP, Snapdragon 7s Gen 2, màn hình AMOLED 6.67 inch', 150, 'active', 8, 128, 6.67, '2400x1080', 5100, 200, 'Snapdragon 7s Gen 2', 'Purple', 'MIUI 14'),
('prod-015', 'Xiaomi POCO X6 Pro', 'Xiaomi', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=800&fit=crop', 9576000, 'POCO X6 Pro 256GB - MediaTek Dimensity 8300 Ultra, màn hình AMOLED 6.67 inch, sạc nhanh 67W', 100, 'active', 12, 256, 6.67, '2712x1220', 5000, 64, 'MediaTek Dimensity 8300 Ultra', 'Yellow', 'MIUI 14'),

-- Google Pixel
('prod-016', 'Google Pixel 8 Pro', 'Google', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop', 23976000, 'Pixel 8 Pro 256GB - Camera 50MP với AI, Tensor G3, màn hình LTPO OLED 6.7 inch, Magic Editor', 40, 'active', 12, 256, 6.70, '2992x1344', 5050, 50, 'Tensor G3', 'Obsidian', 'Android 14'),
('prod-017', 'Google Pixel 8', 'Google', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop', 16776000, 'Pixel 8 128GB - Camera 50MP, Tensor G3, màn hình OLED 6.2 inch, AI features', 60, 'active', 8, 128, 6.20, '2400x1080', 4575, 50, 'Tensor G3', 'Hazel', 'Android 14'),
('prod-018', 'Google Pixel 7a', 'Google', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop', 11976000, 'Pixel 7a 128GB - Camera 64MP, Tensor G2, màn hình OLED 6.1 inch, giá tốt', 80, 'active', 8, 128, 6.10, '2400x1080', 4385, 64, 'Tensor G2', 'Sea', 'Android 13'),

-- OnePlus
('prod-019', 'OnePlus 12', 'OnePlus', 'https://images.unsplash.com/photo-1601972602237-8c79241f8eb0?w=800&h=800&fit=crop', 19176000, 'OnePlus 12 256GB - Snapdragon 8 Gen 3, camera 50MP Hasselblad, màn hình LTPO OLED 6.82 inch', 50, 'active', 12, 256, 6.82, '3168x1440', 5400, 50, 'Snapdragon 8 Gen 3', 'Silky Black', 'OxygenOS 14'),
('prod-020', 'OnePlus 11', 'OnePlus', 'https://images.unsplash.com/photo-1601972602237-8c79241f8eb0?w=800&h=800&fit=crop', 16776000, 'OnePlus 11 256GB - Snapdragon 8 Gen 2, camera 50MP Hasselblad, màn hình LTPO OLED 6.7 inch', 70, 'active', 12, 256, 6.70, '3216x1440', 5000, 50, 'Snapdragon 8 Gen 2', 'Titan Black', 'OxygenOS 13'),

-- Inactive products (để test)
('prod-021', 'iPhone 12 (Discontinued)', 'Apple', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop', 11976000, 'iPhone 12 128GB - Đã ngừng sản xuất, camera 12MP, chip A14 Bionic', 0, 'inactive', 4, 128, 6.10, '2532x1170', 2815, 12, 'A14 Bionic', 'Black', 'iOS 14'),
('prod-022', 'Samsung Galaxy S21 (Old)', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop', 9576000, 'Galaxy S21 128GB - Sản phẩm cũ, camera 64MP, Snapdragon 888', 5, 'inactive', 8, 128, 6.20, '2400x1080', 4000, 64, 'Snapdragon 888', 'Phantom Gray', 'Android 11');
