# Database Files

Thư mục này chứa các file liên quan đến MySQL database cho **backend API server**.

## Lưu Ý Quan Trọng

**Ứng dụng frontend hiện tại KHÔNG cần MySQL**. Frontend sử dụng LocalStorage để lưu trữ dữ liệu trong browser.

Các file này chỉ được sử dụng khi bạn muốn:
- Xây dựng backend API server riêng
- Kết nối frontend với backend API thay vì LocalStorage
- Deploy production system với database

## Các File

### `schema.sql`
Định nghĩa cấu trúc database:
- Bảng `users`: Thông tin người dùng và công ty
- Bảng `orders`: Quản lý đơn hàng
- Bảng `risk_metrics`: Chỉ số đánh giá rủi ro

### `seed.sql`
Dữ liệu mẫu để khởi tạo database:
- 1 user mẫu
- 5 đơn hàng mẫu
- Risk metrics mẫu

### `init.js`
Script Node.js để tự động:
- Tạo database
- Chạy schema.sql
- Chạy seed.sql

## Cách Sử Dụng

### Nếu Bạn Muốn Build Backend API Server

1. **Cài đặt MySQL Server** trên máy của bạn

2. **Cấu hình** file `.env` trong thư mục gốc:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=supply_chain_finance
   ```

3. **Chạy script khởi tạo**:
   ```bash
   npm run db:init
   ```

4. **Xây dựng backend API server** của bạn (Express, Fastify, NestJS, etc.) để:
   - Kết nối với MySQL database
   - Tạo REST API endpoints
   - Xử lý authentication
   - Cập nhật frontend để gọi API thay vì dùng LocalStorage

## Kiến Trúc Đề Xuất

```
Frontend (React)
    ↓ HTTP Requests
Backend API Server (Express/Fastify)
    ↓ SQL Queries
MySQL Database
```

Xem file [DATABASE_SETUP.md](../DATABASE_SETUP.md) trong thư mục gốc để biết thêm chi tiết.
