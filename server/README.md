# Backend API Server

Backend API server cho ứng dụng Supply Chain Finance, sử dụng Express.js và MySQL.

## Cấu Trúc

```
server/
├── index.js          # Entry point của server
├── db.js            # MySQL connection pool
├── email.js         # Email service (nodemailer)
├── routes/
│   ├── auth.js      # Authentication routes
│   └── api.js       # API routes (orders, user, risk-metrics)
└── README.md        # File này
```

## Cài Đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` với cấu hình:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=supply_chain_finance
PORT=3001
FRONTEND_URL=http://localhost:5173

# Email (tùy chọn)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

3. Khởi tạo database:
```bash
npm run db:init
```

## Chạy Server

```bash
npm run dev:server
```

Server sẽ chạy tại `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Yêu cầu reset password
- `POST /api/auth/reset-password` - Reset password với token
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### User
- `GET /api/user` - Lấy thông tin user
- `PUT /api/user` - Cập nhật user

### Orders
- `GET /api/orders` - Lấy danh sách orders
- `POST /api/orders` - Tạo order mới
- `PUT /api/orders/:id` - Cập nhật order
- `DELETE /api/orders/:id` - Xóa order

### Risk Metrics
- `GET /api/risk-metrics` - Lấy risk metrics

## Authentication

Hiện tại server sử dụng header `X-User-Id` để xác định user. Trong production, nên sử dụng JWT token.

## Email

Để gửi email khôi phục mật khẩu, cần cấu hình SMTP trong `.env`. Nếu chưa cấu hình, server sẽ trả về token trong response để demo.
