# Haibin21 - Supply Chain Finance Platform

Hệ thống quản lý tài chính chuỗi cung ứng hiện đại được xây dựng với React, TypeScript, Express.js và MySQL.

## ✨ Tính Năng

### Người Dùng
- 🔐 **Đăng nhập / Đăng ký** - Xác thực người dùng với MySQL
- ✉️ **Xác nhận email** - Bắt buộc xác nhận email sau khi đăng ký để kích hoạt tài khoản
- 🔑 **Quên mật khẩu** - Khôi phục mật khẩu qua email
- 🔒 **Đổi mật khẩu** - Đổi mật khẩu với validation mật khẩu cũ
- 📋 **Quản lý đơn hàng** - Tạo, xem, cập nhật và xóa đơn hàng
- 📱 **Chọn sản phẩm điện thoại** - Tạo order với sản phẩm điện thoại (iPhone, Samsung, Xiaomi, etc.)
- 💳 **Buy Now Pay Later (BNPL)** - Trả góp với đánh giá rủi ro tự động, chọn kỳ hạn 3-24 tháng, tính số tiền trả mỗi tháng
- 👤 **Quản lý hồ sơ** - Cập nhật thông tin công ty và người dùng
- 📊 **Đánh giá rủi ro** - Theo dõi các chỉ số rủi ro tín dụng
- 💳 **Theo dõi hạn mức tín dụng** - Quản lý credit limit và spending capacity

### Admin
- 📊 **Dashboard Tổng Quan** - Thống kê tổng số khách hàng, orders, doanh thu theo ngày/tháng
- 👥 **Quản lý Khách Hàng** - Xem danh sách, lịch sử order, khóa/mở khóa tài khoản
- 📦 **Quản lý Sản Phẩm** - CRUD sản phẩm điện thoại, upload hình ảnh, quản lý tồn kho
- 📋 **Quản lý Order** - Xem tất cả orders, lọc theo trạng thái, ngày, khách hàng
- ⭐ **Khách Hàng VIP** - Tự động xác định và hiển thị top khách hàng theo tổng tiền đã chi

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

#### Option 1: Khởi tạo đầy đủ (khuyến nghị)
```bash
npm run db:init
npm run db:migrate
npm run db:seed
```

Hoặc chạy tất cả cùng lúc:
```bash
npm run db:reset
```

#### Option 2: Chạy từng bước

1. **Tạo database và schema cơ bản:**
```bash
npm run db:init
```

2. **Chạy migrations (thêm products, order_items, admin features, BNPL):**
```bash
npm run db:migrate
```

3. **Chạy seeders (thêm products, admin user):**
```bash
npm run db:seed
```

**Scripts sẽ:**
- ✅ Tạo database `supply_chain_finance`
- ✅ Tạo các bảng: `users`, `orders`, `risk_metrics`, `password_reset_tokens`, `email_verification_tokens`, `products`, `order_items`, `audit_logs`
- ✅ Thêm role và is_locked cho users
- ✅ Thêm BNPL fields cho orders (customer_income, installment_period, monthly_payment, etc.)
- ✅ Insert dữ liệu mẫu:
  - 8 users (khách hàng) + 1 admin user
  - 22 sản phẩm điện thoại (Apple, Samsung, Xiaomi, Google, OnePlus)
  - 44 orders mẫu
  - 8 risk metrics

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

Sau khi khởi tạo database, bạn có thể đăng nhập với các tài khoản demo:

### Tài khoản User (Người dùng thường):
- **Email**: `contact@techinnovations.com`
- **Mật khẩu**: `password123`

### Tài khoản Admin:
- **Email**: `admin@supplychain.com`
- **Mật khẩu**: `admin123`

Hoặc bạn có thể đăng ký tài khoản mới từ giao diện (sẽ là user thường).

### ⚠️ Lưu ý về Xác nhận Email

**Sau khi đăng ký:**
1. Hệ thống sẽ gửi email xác nhận (nếu đã cấu hình SMTP)
2. Bạn cần xác nhận email trước khi có thể đăng nhập
3. Nếu chưa cấu hình email, token sẽ được hiển thị trên màn hình để bạn có thể test
4. Token xác nhận có thời hạn 24 giờ

**Tài khoản demo** đã được xác nhận email sẵn nên có thể đăng nhập ngay.

## 📖 Hướng Dẫn Sử Dụng

### 👤 Hướng Dẫn cho User (Người Dùng)

#### 1. Đăng Ký và Xác Nhận Email

1. **Đăng ký tài khoản mới:**
   - Truy cập trang đăng ký
   - Điền thông tin: Tên công ty, Ngành nghề, Email, Mật khẩu
   - Nhấn "Đăng ký"

2. **Xác nhận email:**
   - Sau khi đăng ký, hệ thống sẽ gửi email xác nhận (hoặc hiển thị token trên màn hình nếu chưa cấu hình SMTP)
   - Nhập token xác nhận vào form "Xác nhận email"
   - Token có thời hạn 24 giờ
   - Sau khi xác nhận, bạn có thể đăng nhập

#### 2. Đăng Nhập

- Nhập email và mật khẩu đã đăng ký
- Chỉ tài khoản đã xác nhận email mới có thể đăng nhập
- Nếu quên mật khẩu, sử dụng chức năng "Quên mật khẩu"

#### 3. Quản Lý Hồ Sơ (User Profile)

- **Xem thông tin:** Hiển thị thông tin công ty, email, hạn mức tín dụng
- **Cập nhật thông tin:** Nhấn "Chỉnh sửa" để cập nhật tên công ty, ngành nghề
- **Đổi mật khẩu:**
  - Nhập mật khẩu cũ
  - Nhập mật khẩu mới (tối thiểu 6 ký tự)
  - Xác nhận mật khẩu mới
  - Sau khi đổi mật khẩu, bạn sẽ bị đăng xuất và cần đăng nhập lại

#### 4. Tạo Đơn Hàng (Create Order)

1. **Chọn sản phẩm:**
   - Xem danh sách sản phẩm điện thoại có sẵn
   - Mỗi sản phẩm hiển thị: Tên, hãng, giá, RAM/ROM, màn hình, camera, pin, tồn kho
   - Nhấn "Thêm" để thêm sản phẩm vào giỏ hàng
   - Có thể thêm nhiều sản phẩm với số lượng khác nhau

2. **Điền thông tin đơn hàng:**
   - **Buyer:** Tên người mua
   - **Invoice Number:** Số hóa đơn
   - **Due Date:** Ngày đến hạn thanh toán
   - **Interest Rate:** Lãi suất (%)
   - **Payment Terms:** Số ngày thanh toán

3. **Sử dụng Buy Now Pay Later (BNPL) - Tùy chọn:**
   - Tích vào checkbox "Sử dụng Buy Now Pay Later"
   - **Thu nhập hàng tháng:** Nhập thu nhập của bạn (USD/tháng)
   - **Kỳ hạn trả góp:** Chọn từ 3, 6, 9, 12, 18, hoặc 24 tháng
   - Hệ thống sẽ tự động:
     - Tính toán Debt-to-Income Ratio (DTI)
     - Đánh giá rủi ro (Risk Level: low, medium, high, very_high)
     - Tính lãi suất điều chỉnh dựa trên rủi ro
     - Tính số tiền trả mỗi tháng
     - Tính tổng tiền phải trả (bao gồm lãi)
   - Nếu Risk Level là "very_high", đơn hàng sẽ bị từ chối tự động
   - Nếu Risk Level là "high", đơn hàng sẽ ở trạng thái "pending" chờ admin duyệt
   - Nếu Risk Level là "low" hoặc "medium", đơn hàng sẽ được tự động "approved"

4. **Xem đánh giá rủi ro:**
   - Hệ thống hiển thị real-time:
     - Risk Score (0-100)
     - Risk Level với màu sắc (xanh = thấp, vàng = trung bình, cam = cao, đỏ = rất cao)
     - DTI Ratio (%)
     - Số tiền trả mỗi tháng
     - Tổng tiền phải trả
     - Lãi suất điều chỉnh

5. **Gửi đơn hàng:**
   - Nhấn "Tạo Order"
   - Hệ thống sẽ kiểm tra tồn kho và tạo đơn hàng
   - Nếu sử dụng BNPL, đơn hàng sẽ được tự động duyệt hoặc chờ admin duyệt tùy theo risk level

#### 5. Quản Lý Đơn Hàng (Order Management)

- **Xem danh sách đơn hàng:**
  - Hiển thị tất cả đơn hàng của bạn
  - Lọc theo trạng thái: All, Pending, Approved, Rejected, Completed
  - Mỗi đơn hàng hiển thị:
    - Invoice Number
    - Buyer
    - Số tiền
    - Trạng thái (màu sắc)
    - Ngày tạo
    - Danh sách sản phẩm (nếu có)
    - Thông tin BNPL (nếu có): kỳ hạn, số tiền trả mỗi tháng, risk level

- **Cập nhật đơn hàng:**
  - Nhấn "Edit" để cập nhật thông tin đơn hàng
  - Có thể thay đổi: Buyer, Amount, Interest Rate, Payment Terms, Status, Invoice Number, Due Date

- **Xóa đơn hàng:**
  - Nhấn "Delete" và xác nhận
  - Chỉ có thể xóa đơn hàng của chính mình

#### 6. Xem Đánh Giá Rủi Ro (Risk Metrics)

- Trong trang User Profile, xem các chỉ số:
  - Credit Score (điểm tín dụng)
  - Payment History (lịch sử thanh toán)
  - Industry Risk (rủi ro ngành)
  - Market Conditions (điều kiện thị trường)
- Dữ liệu được hiển thị dưới dạng biểu đồ trực quan

#### 7. Quên Mật Khẩu

1. Nhấn "Quên mật khẩu?" trên trang đăng nhập
2. Nhập email đã đăng ký
3. Hệ thống sẽ gửi email chứa token reset (hoặc hiển thị token trên màn hình)
4. Nhập token và mật khẩu mới
5. Token có thời hạn 1 giờ

---

### 👨‍💼 Hướng Dẫn cho Admin

#### Đăng Nhập Admin

- **Email:** `admin@supplychain.com`
- **Mật khẩu:** `admin123`
- Sau khi đăng nhập, bạn sẽ thấy menu "Admin Dashboard" trong sidebar

#### 1. Dashboard Tổng Quan (Overview)

**Thống kê tổng quan:**
- **Tổng số khách hàng:** Số lượng user (không bao gồm admin)
- **Tổng số đơn hàng:** Tổng số orders trong hệ thống
- **Tổng doanh thu:** Tổng tiền từ các orders có trạng thái completed/paid/shipping

**Doanh thu theo ngày:**
- Biểu đồ doanh thu 30 ngày gần nhất
- Hiển thị doanh thu theo từng ngày

**Doanh thu theo tháng:**
- Biểu đồ doanh thu 12 tháng gần nhất
- Hiển thị doanh thu theo từng tháng

**Khách hàng VIP:**
- Top 10 khách hàng có tổng tiền đã chi cao nhất
- Hiển thị: Tên công ty, số lượng orders, tổng tiền đã chi, lần mua gần nhất

#### 2. Quản Lý Đơn Hàng (Orders)

**Xem danh sách đơn hàng:**
- Hiển thị tất cả đơn hàng trong hệ thống
- Mỗi đơn hàng hiển thị:
  - Invoice Number
  - Thông tin khách hàng (tên công ty, email)
  - Số tiền
  - Trạng thái
  - Danh sách sản phẩm
  - Thông tin BNPL (nếu có)

**Lọc đơn hàng:**
- **Theo trạng thái:** Pending, Approved, Paid, Shipping, Completed, Cancelled, Rejected
- **Theo khách hàng:** Chọn từ dropdown danh sách khách hàng
- **Theo ngày:** Chọn từ ngày - đến ngày

**Xem chi tiết đơn hàng:**
- Nhấn nút "Chi tiết" trên mỗi đơn hàng
- Modal hiển thị:
  - Thông tin đầy đủ về đơn hàng
  - Danh sách sản phẩm với hình ảnh
  - Thông tin BNPL (kỳ hạn, số tiền trả mỗi tháng, risk level)
  - Có thể thay đổi trạng thái đơn hàng trực tiếp trong modal

**Tổng doanh thu:**
- Hiển thị tổng doanh thu từ tất cả orders completed/paid/shipping ở đầu trang

#### 3. Quản Lý Sản Phẩm (Products)

**Xem danh sách sản phẩm:**
- Hiển thị tất cả sản phẩm điện thoại
- Mỗi sản phẩm hiển thị:
  - Hình ảnh
  - Tên, hãng
  - Giá
  - RAM/ROM
  - Màn hình (kích thước, độ phân giải)
  - Camera
  - Pin
  - Tồn kho
  - Trạng thái (active/inactive)

**Lọc sản phẩm:**
- **Theo hãng:** Apple, Samsung, Xiaomi, Google, OnePlus
- **Theo trạng thái:** Active, Inactive

**Thêm sản phẩm mới:**
1. Nhấn nút "+ Thêm sản phẩm"
2. Điền thông tin:
   - **Thông tin cơ bản:** Tên, Hãng, Giá, Mô tả, Số lượng tồn kho, Trạng thái
   - **Hình ảnh:** URL hình ảnh (có thể dùng Unsplash hoặc URL khác)
   - **Thông tin kỹ thuật:**
     - RAM (GB)
     - Bộ nhớ trong (GB)
     - Kích thước màn hình (inch)
     - Độ phân giải màn hình (ví dụ: 2400x1080)
     - Dung lượng pin (mAh)
     - Camera chính (MP)
     - Chip xử lý (ví dụ: A17 Pro, Snapdragon 8 Gen 3)
     - Màu sắc
     - Hệ điều hành (ví dụ: iOS 17, Android 14)
3. Nhấn "Lưu"

**Sửa sản phẩm:**
1. Nhấn nút "Sửa" trên sản phẩm
2. Cập nhật thông tin cần thiết
3. Nhấn "Lưu"

**Xóa sản phẩm:**
1. Nhấn nút "Xóa" trên sản phẩm
2. Xác nhận xóa
3. **Lưu ý:** Sản phẩm đã có trong orders sẽ không thể xóa (soft delete - chuyển sang inactive)

**Bật/Tắt bán sản phẩm:**
- Nhấn nút ⏸ (Tắt bán) hoặc ▶ (Bật bán) để chuyển trạng thái active/inactive
- Sản phẩm inactive sẽ không hiển thị trong danh sách khi user tạo order

#### 4. Quản Lý Khách Hàng (Customers)

**Xem danh sách khách hàng:**
- Hiển thị tất cả user (không bao gồm admin)
- Mỗi khách hàng hiển thị:
  - Tên công ty
  - Email
  - Ngành nghề
  - Số lượng orders
  - Tổng tiền đã chi
  - Trạng thái khóa (locked/unlocked)

**Tìm kiếm khách hàng:**
- Nhập tên công ty hoặc email vào ô tìm kiếm

**Khóa/Mở khóa khách hàng:**
- Nhấn nút "Khóa" để khóa tài khoản
- Nhấn nút "Mở khóa" để mở khóa tài khoản
- **Lưu ý:** Khách hàng bị khóa sẽ:
  - Không thể đăng nhập
  - Không thể tạo đơn hàng mới

**Xem lịch sử đơn hàng của khách hàng:**
- (Có thể mở rộng: Nhấn vào khách hàng để xem chi tiết lịch sử orders)

#### 5. Duyệt Đơn Hàng BNPL

Khi có đơn hàng sử dụng BNPL với Risk Level "high":
1. Vào "Quản Lý Order"
2. Tìm đơn hàng có trạng thái "pending" và có thông tin BNPL
3. Nhấn "Chi tiết" để xem:
   - Thông tin khách hàng
   - Thu nhập khách hàng
   - Kỳ hạn trả góp
   - Risk Score và Risk Level
   - Số tiền trả mỗi tháng
   - Tổng tiền phải trả
4. Quyết định:
   - **Duyệt:** Chuyển trạng thái sang "approved"
   - **Từ chối:** Chuyển trạng thái sang "rejected"
   - **Yêu cầu thêm thông tin:** Giữ trạng thái "pending" và liên hệ khách hàng

---

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
- `npm run db:init` - Khởi tạo database và seed dữ liệu cơ bản
- `npm run db:migrate` - Chạy migrations (thêm products, BNPL, admin features)
- `npm run db:seed` - Chạy seeders (thêm products, admin user)
- `npm run db:reset` - Reset toàn bộ database (init + migrate + seed)
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
- `GET /api/orders` - Lấy danh sách orders (user: chỉ orders của mình, admin: tất cả)
- `POST /api/orders` - Tạo order mới (có thể kèm items và BNPL)
- `POST /api/orders/calculate-risk` - Tính toán risk assessment cho BNPL
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

## 📁 Cấu Trúc Thư Mục

```
hanbin/
├── server/                    # Backend API
│   ├── index.js              # Entry point
│   ├── db.js                 # MySQL connection pool
│   ├── email.js              # Email service
│   └── routes/
│       ├── auth.js           # Authentication routes
│       ├── api.js            # API routes (orders, user, risk-metrics)
│       ├── products.js       # Products CRUD (admin only)
│       └── admin.js          # Admin routes (dashboard, customers)
├── pages/                     # Frontend pages
│   ├── Auth.tsx              # Login/Register/Verify/Forgot/Reset
│   ├── OrderManagement.tsx   # Quản lý orders
│   ├── CreateOrder.tsx       # Tạo order (có thể chọn sản phẩm)
│   ├── UserProfile.tsx      # Profile + Đổi mật khẩu
│   └── AdminDashboard.tsx    # Admin dashboard
├── components/
│   ├── Sidebar.tsx           # Navigation sidebar
│   ├── RiskCharts.tsx        # Risk metrics charts
│   └── SpendingCapacity.tsx  # Spending capacity display
├── services/
│   └── backend.ts            # API client
├── database/
│   ├── schema.sql            # Database schema cơ bản
│   ├── seed.sql              # Seed data cơ bản
│   ├── migrations/           # Database migrations
│   │   ├── 001_add_products_and_order_items.sql
│   │   ├── 002_add_user_role_and_locked.sql
│   │   ├── 003_update_order_status.sql
│   │   ├── 004_add_audit_log.sql
│   │   ├── 005_add_bnpl_fields.sql
│   │   └── 006_add_phone_specs.sql
│   ├── seeders/              # Database seeders
│   │   ├── 001_seed_products.sql
│   │   └── 002_seed_admin_user.sql
│   ├── init.js               # Init script
│   ├── run-migrations.js     # Migration runner
│   └── run-seeders.js        # Seeder runner
├── server/
│   └── utils/
│       └── riskCalculator.js # Risk calculator cho BNPL
└── types.ts                   # TypeScript types
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/verify-email` - Xác nhận email
- `POST /api/auth/forgot-password` - Yêu cầu reset password
- `POST /api/auth/reset-password` - Reset password với token
- `POST /api/auth/change-password` - Đổi mật khẩu (cần đăng nhập)
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Products
- `GET /api/products` - Lấy danh sách sản phẩm (có thể filter)
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (admin only)
- `PUT /api/products/:id` - Cập nhật sản phẩm (admin only)
- `DELETE /api/products/:id` - Xóa sản phẩm (admin only)

### Orders
- `GET /api/orders` - Lấy danh sách orders (user: chỉ orders của mình, admin: tất cả)
- `POST /api/orders` - Tạo order mới (có thể kèm items và BNPL)
- `POST /api/orders/calculate-risk` - Tính toán risk assessment cho BNPL
- `PUT /api/orders/:id` - Cập nhật order
- `DELETE /api/orders/:id` - Xóa order

### Admin
- `GET /api/admin/dashboard/stats` - Thống kê tổng quan
- `GET /api/admin/customers` - Danh sách khách hàng
- `GET /api/admin/customers/:id/orders` - Lịch sử order của khách hàng
- `PUT /api/admin/customers/:id/lock` - Khóa/mở khóa khách hàng

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
