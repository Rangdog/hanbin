# Hướng Dẫn Cài Đặt Backend với MySQL

Ứng dụng hiện tại đã được tích hợp với **Backend API Server** sử dụng **MySQL database** và hỗ trợ **gửi email khôi phục mật khẩu**.

## Tổng Quan

- **Frontend**: React + Vite, gọi API đến backend server
- **Backend**: Express.js API server với MySQL database
- **Database**: MySQL với các bảng users, orders, risk_metrics, password_reset_tokens
- **Email**: Nodemailer để gửi email khôi phục mật khẩu

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

## Bước 2: Cài Đặt Dependencies

Cài đặt các package cần thiết:

```bash
npm install
```

Các package sẽ được cài đặt bao gồm:
- `express`: Web framework cho backend API
- `mysql2`: MySQL client cho Node.js
- `bcrypt`: Hash mật khẩu
- `nodemailer`: Gửi email
- `cors`: CORS middleware
- `dotenv`: Quản lý biến môi trường

## Bước 3: Cấu Hình Kết Nối

1. Tạo file `.env` trong thư mục gốc của project (copy từ `.env.example` nếu có)
2. Cập nhật thông tin kết nối MySQL và email:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat_khau_cua_ban
DB_NAME=supply_chain_finance

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173

# Email Configuration (SMTP) - Tùy chọn
# Để gửi email khôi phục mật khẩu, bạn cần cấu hình SMTP
# Ví dụ với Gmail:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Frontend API URL (cho Vite)
VITE_API_URL=http://localhost:3001/api
```

**Lưu ý quan trọng:**
- Thay `mat_khau_cua_ban` bằng mật khẩu MySQL của bạn
- Nếu MySQL chạy trên máy chủ khác, thay `localhost` bằng địa chỉ IP của máy chủ
- Nếu MySQL sử dụng cổng khác, thay `3306` bằng cổng tương ứng
- **Email (SMTP)**: Nếu chưa cấu hình email, hệ thống vẫn hoạt động nhưng sẽ trả về token trong response thay vì gửi email. Để gửi email thật:
  - Với Gmail: Tạo "App Password" tại https://myaccount.google.com/apppasswords
  - Với các SMTP khác: Cập nhật `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` tương ứng

## Bước 4: Khởi Tạo Database và Seed Dữ Liệu

### Cách 1: Sử dụng npm script (Khuyến nghị)

```bash
npm run db:init
```

Script này sẽ tự động:
- Tạo database `supply_chain_finance`
- Tạo các bảng: `users`, `orders`, `risk_metrics`, `password_reset_tokens`
- Thêm dữ liệu mẫu vào database (bao gồm 1 user demo có sẵn mật khẩu để đăng nhập)

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

## Bước 5: Khởi Động Backend Server

Sau khi database đã được thiết lập, khởi động backend API server:

```bash
npm run dev:server
```

Server sẽ chạy tại `http://localhost:3001` (hoặc port bạn đã cấu hình trong `.env`).

Bạn sẽ thấy thông báo:
```
🚀 Server đang chạy tại http://localhost:3001
📧 Email configured: Yes/No
```

## Bước 6: Khởi Động Frontend

Mở terminal mới và chạy frontend:

```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173` và tự động kết nối đến backend API.

**Hoặc chạy cả hai cùng lúc:**

```bash
npm run dev:all
```

Lệnh này sẽ chạy cả frontend và backend server cùng lúc.

## Bước 7: Kiểm Tra Database

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
- `password_hash`: Mật khẩu đã được hash (dùng cho đăng nhập)
- `credit_limit`: Hạn mức tín dụng
- `available_credit`: Tín dụng khả dụng
- `spending_capacity`: Năng lực chi tiêu

> Khi xây API đăng nhập/đăng ký, bạn nên:
> - Hash mật khẩu người dùng bằng thư viện như `bcrypt` trước khi lưu vào `password_hash`
> - Không bao giờ lưu mật khẩu dạng plain text trong database

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
- `created_at`: Ngày tạo

### Bảng `risk_metrics`
Lưu trữ các chỉ số rủi ro:
- `id`: Mã định danh
- `user_id`: Mã người dùng
- `credit_score`: Điểm tín dụng
- `payment_history`: Lịch sử thanh toán
- `industry_risk`: Rủi ro ngành
- `market_conditions`: Điều kiện thị trường

### Bảng `password_reset_tokens`
Lưu trữ token khôi phục mật khẩu:
- `id`: Mã định danh
- `user_id`: Mã người dùng (liên kết với bảng `users`)
- `token`: Mã token (ngẫu nhiên, đủ dài, dùng 1 lần)
- `expires_at`: Thời điểm token hết hạn (ví dụ sau 15–30 phút)
- `used`: Đánh dấu token đã được sử dụng hay chưa
- `created_at`: Thời điểm tạo token

Khi triển khai chức năng **quên mật khẩu/khôi phục mật khẩu**, backend sẽ:
- Tạo 1 bản ghi mới trong bảng `password_reset_tokens` với `user_id`, `token`, `expires_at`
- Gửi link chứa `token` cho user (qua email hoặc kênh phù hợp)
- Khi user mở link và nhập mật khẩu mới, backend:
  - Kiểm tra token còn hạn và chưa dùng
  - Cập nhật `password_hash` cho user
  - Đánh dấu bản ghi token đó là `used = 1`

## Dữ Liệu Mẫu

Script seed.sql sẽ tạo:
- 1 user mẫu: Tech Innovations Ltd
  - Email: `contact@techinnovations.com`
  - Mật khẩu demo: `password123` (đã được hash bằng bcrypt và lưu ở cột `password_hash`)
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

## API Endpoints

Backend server cung cấp các API endpoints sau:

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Yêu cầu khôi phục mật khẩu (gửi email)
- `POST /api/auth/reset-password` - Đặt lại mật khẩu với token
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### User
- `GET /api/user` - Lấy thông tin user
- `PUT /api/user` - Cập nhật thông tin user

### Orders
- `GET /api/orders` - Lấy danh sách orders
- `POST /api/orders` - Tạo order mới
- `PUT /api/orders/:id` - Cập nhật order
- `DELETE /api/orders/:id` - Xóa order

### Risk Metrics
- `GET /api/risk-metrics` - Lấy risk metrics của user

## Chạy Ứng Dụng

Sau khi database và backend server đã được thiết lập:

1. **Khởi động backend server:**
```bash
npm run dev:server
```

2. **Khởi động frontend (terminal khác):**
```bash
npm run dev
```

3. **Hoặc chạy cả hai cùng lúc:**
```bash
npm run dev:all
```

Ứng dụng sẽ tự động kết nối đến MySQL database qua backend API server.

## Bảo Mật

**Quan trọng:**
- KHÔNG commit file `.env` lên Git
- KHÔNG chia sẻ thông tin database với người khác
- Sử dụng mật khẩu mạnh cho MySQL
- Trên production, sử dụng user MySQL riêng với quyền hạn chế, không dùng root

## Liên Hệ

Nếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ team phát triển.
