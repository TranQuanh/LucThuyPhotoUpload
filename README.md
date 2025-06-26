# Upload Photo App

## 1. Khởi tạo database PostgreSQL

- Chạy script trong `db/init.sql` để tạo database, user, và các bảng:

```bash
psql -U postgres -f db/init.sql
```

- Thêm user mẫu (tùy chọn):
```sql
-- Đăng nhập vào database uploadphoto
\c uploadphoto;
-- Thêm user marketing
INSERT INTO users (username, password, role) VALUES ('marketing1', 'admin', 'marketing');
-- Thêm user sale
INSERT INTO users (username, password, role) VALUES ('sale1', 'admin', 'sale');
-- (Mật khẩu mẫu: 123456)
```

## 2. Cài đặt backend
```bash
cd server
npm install
npm start
```

## 3. Cài đặt frontend
```bash
cd client
npm install
npm start
```

## 4. Truy cập
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 5. Tài khoản mẫu
- marketing1 / 123456 (role: marketing)
- sale1 / 123456 (role: sale) # LucThuyPhotoUpload
# LucThuyPhotoUpload
