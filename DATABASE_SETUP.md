# Hướng Dẫn Cài Đặt Backend với MySQL

**LƯU Ý**: Ứng dụng frontend hiện tại sử dụng **LocalStorage** để lưu dữ liệu trong browser và hoạt động độc lập. File này chỉ dành cho việc thiết lập **backend API server** nếu bạn muốn build production system với MySQL database.

## Giải Thích

- **Frontend (Hiện tại)**: Sử dụng LocalStorage, không cần database, chạy ngay được
- **Backend (Tùy chọn)**: Nếu bạn muốn build backend API server với MySQL, làm theo hướng dẫn dưới đây

---

# Hướng Dẫn Thiết Lập Backend API Server với MySQL

Tài liệu này hướng dẫn cách thiết lập và khởi tạo database MySQL cho backend API server.

## Yêu Cầu

- MySQL Server 5.7 trở lên (hoặc MySQL 8.0+)
- Node.js đã được cài đặt
- Quyền truy cập vào MySQL server với quyền tạo database

## Bước 1: Cài Đặt MySQL Server

### Windows
1. Tải xuống MySQL Installer từ: https://dev.mysql.com/downloads/installer/
2. Chạy installer và làm theo hướng dẫn
3. Ghi nhớ mật khẩu root bạn đã thiết lập

### macOS
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

## Bước 2: Cấu Hình Kết Nối

1. Mở file `.env` trong thư mục gốc của project
2. Cập nhật thông tin kết nối MySQL:

```env
# MySQL Configuration (for init script)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat_khau_cua_ban
DB_NAME=supply_chain_finance

# MySQL Configuration (for frontend - with VITE_ prefix)
VITE_DB_HOST=localhost
VITE_DB_PORT=3306
VITE_DB_USER=root
VITE_DB_PASSWORD=mat_khau_cua_ban
VITE_DB_NAME=supply_chain_finance
```

**Lưu ý quan trọng:**
- Thay `mat_khau_cua_ban` bằng mật khẩu MySQL của bạn
- Nếu MySQL chạy trên máy chủ khác, thay `localhost` bằng địa chỉ IP của máy chủ
- Nếu MySQL sử dụng cổng khác, thay `3306` bằng cổng tương ứng

## Bước 3: Khởi Tạo Database và Seed Dữ Liệu

### Cách 1: Sử dụng npm script (Khuyến nghị)

```bash
npm run db:init
```

Script này sẽ tự động:
- Tạo database `supply_chain_finance`
- Tạo các bảng: `users`, `orders`, `risk_metrics`
- Thêm dữ liệu mẫu vào database

### Cách 2: Chạy thủ công qua MySQL CLI

1. Đăng nhập vào MySQL:
```bash
mysql -u root -p
```

2. Chạy file schema.sql:
```bash
source database/schema.sql
```

3. Chạy file seed.sql:
```bash
source database/seed.sql
```

4. Thoát khỏi MySQL:
```bash
exit
```

### Cách 3: Sử dụng MySQL Workbench

1. Mở MySQL Workbench
2. Kết nối đến MySQL server của bạn
3. File → Open SQL Script → Chọn `database/schema.sql`
4. Click biểu tượng sét (⚡) để chạy script
5. Lặp lại với file `database/seed.sql`

## Bước 4: Kiểm Tra Database

Sau khi khởi tạo thành công, bạn có thể kiểm tra:

```bash
mysql -u root -p
```

```sql
USE supply_chain_finance;

-- Kiểm tra các bảng đã được tạo
SHOW TABLES;

-- Xem dữ liệu mẫu
SELECT * FROM users;
SELECT * FROM orders;
SELECT * FROM risk_metrics;
```

## Cấu Trúc Database

### Bảng `users`
Lưu trữ thông tin người dùng/công ty:
- `id`: Mã định danh duy nhất
- `company_name`: Tên công ty
- `industry`: Ngành nghề
- `email`: Email liên hệ
- `credit_limit`: Hạn mức tín dụng
- `available_credit`: Tín dụng khả dụng
- `spending_capacity`: Năng lực chi tiêu

### Bảng `orders`
Lưu trữ thông tin đơn hàng:
- `id`: Mã đơn hàng
- `user_id`: Mã người dùng
- `buyer`: Tên người mua
- `amount`: Số tiền
- `interest_rate`: Lãi suất
- `payment_terms`: Điều khoản thanh toán (số ngày)
- `status`: Trạng thái (pending/approved/rejected/completed)
- `invoice_number`: Số hóa đơn
- `due_date`: Ngày đến hạn
- `created_at`: Ngày tạo

### Bảng `risk_metrics`
Lưu trữ các chỉ số rủi ro:
- `id`: Mã định danh
- `user_id`: Mã người dùng
- `credit_score`: Điểm tín dụng
- `payment_history`: Lịch sử thanh toán
- `industry_risk`: Rủi ro ngành
- `market_conditions`: Điều kiện thị trường

## Dữ Liệu Mẫu

Script seed.sql sẽ tạo:
- 1 user mẫu: Tech Innovations Ltd
- 5 đơn hàng mẫu với các trạng thái khác nhau
- 1 bộ chỉ số rủi ro mẫu

## Chạy Lại Script Seed

Nếu bạn muốn reset database về dữ liệu mẫu ban đầu:

```bash
npm run db:init
```

**Cảnh báo:** Lệnh này sẽ xóa toàn bộ dữ liệu hiện tại trong database và tạo lại dữ liệu mẫu.

## Khắc Phục Sự Cố

### Lỗi "Access denied for user"
- Kiểm tra lại username và password trong file `.env`
- Đảm bảo user có quyền truy cập MySQL

### Lỗi "Can't connect to MySQL server"
- Kiểm tra MySQL server đã chạy chưa:
  - Windows: Kiểm tra Services
  - macOS: `brew services list`
  - Linux: `sudo systemctl status mysql`
- Kiểm tra host và port trong file `.env`

### Lỗi "Database exists"
- Database đã tồn tại, script sẽ sử dụng database hiện có
- Nếu muốn tạo mới hoàn toàn, xóa database cũ trước:
  ```sql
  DROP DATABASE IF EXISTS supply_chain_finance;
  ```

### Lỗi khi chạy npm run db:init
- Đảm bảo đã cài đặt dependencies:
  ```bash
  npm install
  ```
- Kiểm tra file `database/init.js` tồn tại

## Chạy Ứng Dụng

Sau khi database đã được thiết lập:

```bash
npm run dev
```

Ứng dụng sẽ tự động kết nối đến MySQL database và sử dụng dữ liệu từ đó.

## Bảo Mật

**Quan trọng:**
- KHÔNG commit file `.env` lên Git
- KHÔNG chia sẻ thông tin database với người khác
- Sử dụng mật khẩu mạnh cho MySQL
- Trên production, sử dụng user MySQL riêng với quyền hạn chế, không dùng root

## Liên Hệ

Nếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ team phát triển.
