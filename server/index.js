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
  const { folder } = req.body;
  if (!folder) return res.status(400).json({ message: 'Thiếu tên folder' });
  const userId = req.user.id;
  // Tạo folder nếu chưa có
  let folderId;
  const folderResult = await pool.query('SELECT id FROM folders WHERE name = $1', [folder]);
  if (folderResult.rows.length === 0) {
    const insertFolder = await pool.query('INSERT INTO folders (name) VALUES ($1) RETURNING id', [folder]);
    folderId = insertFolder.rows[0].id;
  } else {
    folderId = folderResult.rows[0].id;
  }
  // Di chuyển và lưu từng file
  for (const file of req.files) {
    const oldPath = path.join('uploads', 'tmp', file.filename);
    const newDir = path.join('uploads', folder);
    const newPath = path.join(newDir, file.filename);
    await fsPromises.mkdir(newDir, { recursive: true });
    await fsPromises.rename(oldPath, newPath);
    await pool.query('INSERT INTO photos (filename, folder_id, uploaded_by) VALUES ($1, $2, $3)', [file.filename, folderId, userId]);
  }
  res.json({ message: 'Upload thành công!' });
});

// Lấy danh sách folder và ảnh
app.get('/api/folders', authenticateToken, async (req, res) => {
  const folders = await pool.query('SELECT * FROM folders ORDER BY created_at DESC');
  res.json(folders.rows);
});
app.get('/api/photos/:folder', authenticateToken, async (req, res) => {
  const { folder } = req.params;
  const folderResult = await pool.query('SELECT id FROM folders WHERE name = $1', [folder]);
  if (folderResult.rows.length === 0) return res.json([]);
  const folderId = folderResult.rows[0].id;
  const photos = await pool.query('SELECT * FROM photos WHERE folder_id = $1 ORDER BY uploaded_at DESC', [folderId]);
  res.json(photos.rows);
});

// Trả file ảnh
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
}); 