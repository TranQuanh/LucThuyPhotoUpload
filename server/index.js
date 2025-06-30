import express from 'express';
import cors from 'cors';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import fsPromises from 'fs/promises';
import archiver from 'archiver';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = pg;
const app = express();
const PORT = 5000;
const JWT_SECRET = 'quanhdz123';

app.use(cors({
  origin: true, // chấp nhận mọi origin
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const pool = new Pool({
  user: 'jeremie',
  host: 'localhost',
  database: 'uploadphoto',
  password: '20112001',
  port: 5432,
});

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join('uploads', 'tmp');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Middleware kiểm tra JWT và role
function authenticateToken(req, res, next) {
  // Lấy token từ cookie
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) return res.sendStatus(403);
    next();
  };
}

// Đăng nhập
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (!user) return res.status(400).json({ message: 'Sai tài khoản hoặc mật khẩu' });
  let valid = false;
  valid = password === user.password;
  if (!valid) return res.status(400).json({ message: 'Sai tài khoản hoặc mật khẩu' });
  const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
  // Set cookie httpOnly
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
  console.log(user.username, user.role);
  res.json({ username: user.username, role: user.role });
});

// Upload ảnh (chỉ marketing)
app.post('/api/upload', authenticateToken, authorizeRole('marketing'), upload.array('photos', 10), async (req, res) => {
  const { product } = req.body;
  if (!product) return res.status(400).json({ message: 'Thiếu tên product' });
  const userId = req.user.id;
  let productId = product;
  const productResult = await pool.query('SELECT id FROM products WHERE id = $1', [product]);
  if (productResult.rows.length === 0) {
    return res.status(400).json({ message: 'Product không tồn tại' });
  }
  for (const file of req.files) {
    const oldPath = path.join('uploads', 'tmp', file.filename);
    const newDir = path.join('uploads', productId);
    const newPath = path.join(newDir, file.filename);
    await fsPromises.mkdir(newDir, { recursive: true });
    await fsPromises.rename(oldPath, newPath);
    const id = uuidv4();
    await pool.query('INSERT INTO photos (id, filename, product_id, uploaded_by) VALUES ($1, $2, $3, $4)', [id, file.filename, productId, userId]);
  }
  res.json({ message: 'Upload thành công!' });
});

// Lấy danh sách product và ảnh
app.get('/api/products', authenticateToken, async (req, res) => {
  const products = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
  res.json(products.rows);
});
app.get('/api/photos/:productId', authenticateToken, async (req, res) => {
  const { productId } = req.params;
  // Kiểm tra sản phẩm tồn tại
  const productResult = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
  if (productResult.rows.length === 0) return res.json([]);
  const photos = await pool.query('SELECT * FROM photos WHERE product_id = $1 ORDER BY uploaded_at DESC', [productId]);
  res.json(photos.rows);
});

// API kiểm tra đăng nhập, trả về role nếu hợp lệ
app.get('/api/me', authenticateToken, async (req, res) => {
  res.json({ role: req.user.role });
});

// API logout: xóa cookie token
app.post('/api/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Đã logout' });
});

// Đổi tên product
app.post('/api/product/rename', authenticateToken, authorizeRole('marketing'), async (req, res) => {
  const { oldName, newName } = req.body;
  if (!oldName || !newName) return res.status(400).json({ message: 'Thiếu tên product' });
  // Đổi tên trong DB
  await pool.query('UPDATE products SET name = $1 WHERE name = $2', [newName, oldName]);
  // Đổi tên thư mục vật lý
  const oldPath = path.join('uploads', oldName);
  const newPath = path.join('uploads', newName);
  if (fs.existsSync(oldPath)) fs.renameSync(oldPath, newPath);
  res.json({ message: 'Đổi tên thành công!' });
});

// Xóa product
app.delete('/api/product/:name', authenticateToken, authorizeRole('marketing'), async (req, res) => {
  const { name } = req.params;
  if (!name) return res.status(400).json({ message: 'Thiếu tên product' });
  // Xóa trong DB (cascade ảnh)
  await pool.query('DELETE FROM products WHERE name = $1', [name]);
  // Xóa thư mục vật lý
  const productPath = path.join('uploads', name);
  if (fs.existsSync(productPath)) fs.rmSync(productPath, { recursive: true, force: true });
  res.json({ message: 'Xóa product thành công!' });
});

// Xóa ảnh
app.delete('/api/photo/:id', authenticateToken, authorizeRole('marketing'), async (req, res) => {
  const { id } = req.params;
  // Lấy thông tin ảnh từ DB
  const photoResult = await pool.query('SELECT * FROM photos WHERE id = $1', [id]);
  if (photoResult.rows.length === 0) return res.status(404).json({ message: 'Ảnh không tồn tại' });
  const photo = photoResult.rows[0];
  // Lấy tên product
  const productResult = await pool.query('SELECT name FROM products WHERE id = $1', [photo.product_id]);
  if (productResult.rows.length === 0) {
    // Không tìm thấy product, chỉ xóa DB
    await pool.query('DELETE FROM photos WHERE id = $1', [id]);
    return res.json({ message: 'Đã xóa ảnh (không tìm thấy thư mục vật lý)' });
  }
  const productName = productResult.rows[0].name;
  if (productName) {
    // Xóa file vật lý nếu có productName
    const filePath = path.join('uploads', productName, photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  // Xóa DB
  await pool.query('DELETE FROM photos WHERE id = $1', [id]);
  res.json({ message: 'Đã xóa ảnh' });
});

// Tải product (zip)
app.get('/api/product/:name/download', authenticateToken, async (req, res) => {
  const { name } = req.params;
  if (!name) return res.status(400).json({ message: 'Thiếu tên product' });
  const productPath = path.join('uploads', name);
  if (!fs.existsSync(productPath)) return res.status(404).json({ message: 'Product không tồn tại' });
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${name}.zip"`);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.directory(productPath, false);
  archive.finalize();
  archive.pipe(res);
});

// Trả file ảnh
const uploadsPath = path.join(process.cwd(), 'uploads');
console.log('Serving static from:', uploadsPath);

app.use('/uploads', (req, res, next) => {
  console.log('Static file request:', path.join(uploadsPath, req.path));
  next();
}, express.static(uploadsPath));

// Lấy danh sách order theo phone
app.get('/api/orders', authenticateToken, async (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ message: 'Thiếu số điện thoại' });
  const orders = await pool.query('SELECT * FROM orders WHERE phonenumber = $1 ORDER BY created_at DESC', [phone]);
  res.json(orders.rows);
});

// Lấy danh sách order_details theo order_id
app.get('/api/order_details', authenticateToken, async (req, res) => {
  const { order_id } = req.query;
  if (!order_id) return res.status(400).json({ message: 'Thiếu order_id' });
  const details = await pool.query('SELECT * FROM order_details WHERE order_id = $1', [order_id]);
  res.json(details.rows);
});

// Lấy thông tin product theo id
app.get('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  if (product.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  res.json(product.rows[0]);
});

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
}); 