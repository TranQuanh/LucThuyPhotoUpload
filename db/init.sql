-- Tạo database và user
CREATE DATABASE uploadphoto;
CREATE USER jeremie WITH ENCRYPTED PASSWORD '20112001';
GRANT ALL PRIVILEGES ON DATABASE uploadphoto TO jeremie;

-- Kết nối vào database uploadphoto trước khi chạy các lệnh sau
\c uploadphoto;

-- Tạo bảng users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('marketing', 'sale'))
);

-- Tạo bảng folders
CREATE TABLE IF NOT EXISTS folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng photos
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 