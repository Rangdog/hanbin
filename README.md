# Haibin21 - Supply Chain Finance Platform

Hệ thống quản lý tài chính chuỗi cung ứng hiện đại được xây dựng với React, TypeScript, Express.js và MySQL.

## ✨ Tính Năng

- 🔐 **Đăng nhập / Đăng ký** - Xác thực người dùng với MySQL
- ✉️ **Xác nhận email** - Bắt buộc xác nhận email sau khi đăng ký để kích hoạt tài khoản
- 🔑 **Quên mật khẩu** - Khôi phục mật khẩu qua email
- 📋 **Quản lý đơn hàng** - Tạo, xem, cập nhật và xóa đơn hàng
- 👤 **Quản lý hồ sơ** - Cập nhật thông tin công ty và người dùng
- 📊 **Đánh giá rủi ro** - Theo dõi các chỉ số rủi ro tín dụng
- 💳 **Theo dõi hạn mức tín dụng** - Quản lý credit limit và spending capacity

## 📋 Yêu Cầu Hệ Thống

Trước khi bắt đầu, bạn cần cài đặt các công cụ sau:

### Bắt Buộc

1. **Node.js** (phiên bản 14 trở lên)
   - Tải về tại: https://nodejs.org/
   - Kiểm tra phiên bản: `node --version`
   - Kiểm tra npm: `npm --version`

2. **MySQL Server** (phiên bản 5.7 trở lên hoặc MySQL 8.0+)
   - **Windows**: Tải MySQL Installer từ https://dev.mysql.com/downloads/installer/
   - **macOS**: 
     ```bash
     brew install mysql
     brew services start mysql
     ```
   - **Linux (Ubuntu/Debian)**:
     ```bash
     sudo apt update
     sudo apt install mysql-server
     sudo systemctl start mysql
     ```

### Tùy Chọn (Để gửi email khôi phục mật khẩu)

3. **Tài khoản Email SMTP** (Gmail, Outlook, hoặc SMTP server khác)
   - Với Gmail: Cần tạo "App Password" tại https://myaccount.google.com/apppasswords

## 🚀 Hướng Dẫn Cài Đặt và Chạy Ứng Dụng

### Bước 1: Clone Repository

```bash
git clone <repository-url>
cd hanbin
```

### Bước 2: Cài Đặt Dependencies

```bash
npm install
```

Lệnh này sẽ cài đặt tất cả các package cần thiết:
- Frontend: React, TypeScript, Vite
- Backend: Express.js, MySQL2, bcrypt, nodemailer
- Dev tools: TypeScript, Vite plugins

### Bước 3: Cấu Hình MySQL

1. **Đảm bảo MySQL đang chạy:**
   - **Windows**: Kiểm tra trong Services (services.msc)
   - **macOS**: `brew services list`
   - **Linux**: `sudo systemctl status mysql`

2. **Tạo file `.env` trong thư mục gốc:**

Copy file `.env.example` thành `.env`:
```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

Sau đó mở file `.env` và điền thông tin của bạn:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=supply_chain_finance

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173

# Email Configuration (Tùy chọn - để gửi email khôi phục mật khẩu)
# Nếu chưa cấu hình, hệ thống vẫn hoạt động nhưng sẽ trả về token trong response
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Frontend API URL
VITE_API_URL=http://localhost:3001/api
```

**Lưu ý quan trọng:**
- Thay `your_mysql_password_here` bằng mật khẩu MySQL của bạn
- Nếu MySQL chạy trên máy khác, thay `localhost` bằng IP của máy đó
- Nếu MySQL dùng cổng khác, thay `3306` bằng cổng tương ứng
- Với Gmail: Dùng "App Password" thay vì mật khẩu thường (xem hướng dẫn bên dưới)

### Bước 4: Khởi Tạo Database

Chạy script để tạo database và seed dữ liệu mẫu:

```bash
npm run db:init
```

Script này sẽ:
- ✅ Tạo database `supply_chain_finance`
- ✅ Tạo các bảng: `users`, `orders`, `risk_metrics`, `password_reset_tokens`
- ✅ Thêm dữ liệu mẫu (1 user demo với email: `contact@techinnovations.com`, password: `password123`)

**Nếu gặp lỗi:**
- Kiểm tra MySQL đang chạy
- Kiểm tra thông tin trong file `.env` đúng chưa
- Đảm bảo user MySQL có quyền tạo database

### Bước 5: Khởi Động Ứng Dụng

Có 2 cách để chạy ứng dụng:

#### Cách 1: Chạy cả Frontend và Backend cùng lúc (Khuyến nghị)

```bash
npm run dev:all
```

Lệnh này sẽ chạy:
- Backend API server tại `http://localhost:3001`
- Frontend tại `http://localhost:5173`

#### Cách 2: Chạy riêng từng phần

**Terminal 1 - Backend Server:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Bước 6: Truy Cập Ứng Dụng

Mở trình duyệt và truy cập:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔐 Đăng Nhập Lần Đầu

Sau khi khởi tạo database, bạn có thể đăng nhập với tài khoản demo:

- **Email**: `contact@techinnovations.com`
- **Mật khẩu**: `password123`

Hoặc bạn có thể đăng ký tài khoản mới từ giao diện.

### ⚠️ Lưu ý về Xác nhận Email

**Sau khi đăng ký:**
1. Hệ thống sẽ gửi email xác nhận (nếu đã cấu hình SMTP)
2. Bạn cần xác nhận email trước khi có thể đăng nhập
3. Nếu chưa cấu hình email, token sẽ được hiển thị trên màn hình để bạn có thể test
4. Token xác nhận có thời hạn 24 giờ

**Tài khoản demo** đã được xác nhận email sẵn nên có thể đăng nhập ngay.

## 📧 Cấu Hình Email (Tùy Chọn)

Để gửi email xác nhận đăng ký và khôi phục mật khẩu thật, bạn cần cấu hình SMTP trong file `.env`.

### Với Gmail:

1. Bật 2-Step Verification cho tài khoản Google của bạn
2. Tạo App Password:
   - Truy cập: https://myaccount.google.com/apppasswords
   - Chọn "Mail" và "Other (Custom name)"
   - Nhập tên (ví dụ: "Supply Chain Finance")
   - Copy password được tạo
3. Cập nhật `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_16_char_app_password
   ```

### Với SMTP khác:

Cập nhật `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` trong `.env` theo cấu hình của nhà cung cấp email của bạn.

**Lưu ý:** 
- Nếu chưa cấu hình email, hệ thống vẫn hoạt động bình thường
- Token xác nhận email và token khôi phục mật khẩu sẽ được hiển thị trên màn hình để bạn có thể test
- Trong môi trường production, bạn nên cấu hình SMTP để gửi email thật

## 🛠️ Scripts Có Sẵn

- `npm run dev` - Chạy frontend development server
- `npm run dev:server` - Chạy backend API server
- `npm run dev:all` - Chạy cả frontend và backend cùng lúc
- `npm run build` - Build production cho frontend
- `npm run preview` - Preview production build
- `npm run db:init` - Khởi tạo database và seed dữ liệu
- `npm run test` - Chạy test để kiểm tra database và API (cần MySQL và backend server đang chạy)

## 📁 Cấu Trúc Project

```
hanbin/
├── server/                 # Backend API server
│   ├── index.js           # Entry point
│   ├── db.js              # MySQL connection
│   ├── email.js           # Email service
│   └── routes/            # API routes
│       ├── auth.js        # Authentication routes
│       └── api.js         # Other API routes
├── pages/                 # Frontend pages
│   ├── Auth.tsx           # Login/Register/Forgot password
│   ├── OrderManagement.tsx
│   ├── CreateOrder.tsx
│   └── UserProfile.tsx
├── components/            # React components
├── services/              # API services
│   └── backend.ts         # API client
├── database/              # Database scripts
│   ├── schema.sql         # Database schema
│   ├── seed.sql           # Seed data
│   └── init.js            # Init script
├── .env                   # Environment variables (tạo mới)
└── package.json           # Dependencies
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới (cần xác nhận email)
- `POST /api/auth/verify-email` - Xác nhận email với token
- `POST /api/auth/login` - Đăng nhập (yêu cầu email đã được xác nhận)
- `POST /api/auth/forgot-password` - Yêu cầu khôi phục mật khẩu
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

## 🔧 Khắc Phục Sự Cố

### Lỗi "Cannot connect to MySQL"

1. Kiểm tra MySQL đang chạy:
   - Windows: `services.msc` → tìm MySQL
   - macOS/Linux: `brew services list` hoặc `sudo systemctl status mysql`

2. Kiểm tra thông tin trong `.env`:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` đúng chưa

3. Test kết nối MySQL:
   ```bash
   mysql -u root -p
   ```

### Lỗi "Port already in use"

Nếu port 3001 hoặc 5173 đã được sử dụng:
- Thay đổi `PORT` trong `.env` (cho backend)
- Hoặc kill process đang dùng port:
  - Windows: `netstat -ano | findstr :3001` → `taskkill /PID <PID> /F`
  - macOS/Linux: `lsof -ti:3001 | xargs kill`

### Lỗi "Database does not exist"

Chạy lại script khởi tạo:
```bash
npm run db:init
```

### Lỗi khi cài đặt dependencies

Xóa và cài lại:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Email không gửi được

1. Kiểm tra cấu hình SMTP trong `.env`
2. Với Gmail: Đảm bảo đã tạo App Password, không dùng mật khẩu thường
3. Kiểm tra log trong console của backend server
4. Nếu chưa cấu hình email, hệ thống vẫn hoạt động và trả về token trong response

### Lỗi "Email chưa được xác nhận" khi đăng nhập

- Sau khi đăng ký, bạn cần xác nhận email trước khi có thể đăng nhập
- Kiểm tra email (hoặc token demo trên màn hình) và nhập token vào form "Xác nhận email"
- Token có thời hạn 24 giờ
- Nếu token hết hạn, bạn có thể đăng ký lại hoặc liên hệ admin để kích hoạt tài khoản

## 🧪 Chạy Test

Để kiểm tra hệ thống hoạt động đúng:

1. **Cấu hình MySQL** trong file `.env`
2. **Khởi tạo database**:
   ```bash
   npm run db:init
   ```
3. **Chạy backend server** (terminal 1):
   ```bash
   npm run dev:server
   ```
4. **Chạy test** (terminal 2):
   ```bash
   npm run test
   ```

Test sẽ kiểm tra:
- ✅ Kết nối database
- ✅ Các bảng đã được tạo (bao gồm `email_verification_tokens`)
- ✅ Seed data (users, orders, risk metrics)
- ✅ API endpoints (register, login, verify-email, forgot-password, etc.)

Xem chi tiết trong [TEST_REPORT.md](./TEST_REPORT.md)

## 📚 Tài Liệu Thêm

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Hướng dẫn chi tiết về database
- [TEST_REPORT.md](./TEST_REPORT.md) - Báo cáo kiểm tra hệ thống
- [server/README.md](./server/README.md) - Tài liệu backend API

## 🔒 Bảo Mật

**Quan trọng:**
- ⚠️ KHÔNG commit file `.env` lên Git
- ⚠️ Sử dụng mật khẩu mạnh cho MySQL
- ⚠️ Trên production, không dùng user `root` MySQL, tạo user riêng với quyền hạn chế
- ⚠️ Bảo vệ API endpoints với authentication middleware (JWT) trong production

## 📝 License

Private project

## 👥 Liên Hệ

Nếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ team phát triển.
