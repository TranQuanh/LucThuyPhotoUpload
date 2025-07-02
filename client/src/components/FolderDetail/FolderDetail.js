import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../Gallery/Gallery.module.css';
import { useParams, useNavigate } from 'react-router-dom';

function FolderDetail(props) {
  // Lấy productId từ props hoặc từ URL
  const params = useParams();
  const productId = props.productId || params.productId;
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null); // id ảnh đang mở menu
  const [preview, setPreview] = useState(null); // ảnh đang xem lớn
  const [searchTerm, setSearchTerm] = useState(''); // từ khóa tìm kiếm

  useEffect(() => {
    if (productId) {
      axios.get(`http://localhost:5000/api/photos/${productId}`, { withCredentials: true })
        .then(res => setPhotos(res.data));
    }
  }, [productId]);

  const handleMenuOpen = (id) => setMenuOpen(id);
  const handleMenuClose = () => setMenuOpen(null);

  const handleDelete = async (photo) => {
    if (window.confirm('Bạn có chắc muốn xóa ảnh này?')) {
      await axios.delete(`http://localhost:5000/api/photo/${photo.id}`, { withCredentials: true });
      setPhotos(photos.filter(p => p.id !== photo.id));
    }
    setMenuOpen(null);
  };
  const handleDownload = async (photo) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/uploads/${productId}/${photo.filename}`,
        { responseType: 'blob', withCredentials: true }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', photo.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Tải ảnh thất bại!');
    }
    setMenuOpen(null);
  };

  // Overlay xem ảnh lớn
  const handlePreview = (photo) => setPreview(photo);
  const closePreview = (e) => {
    if (e.target === e.currentTarget) setPreview(null);
  };

  // Lọc ảnh theo từ khóa
  const filteredPhotos = photos.filter(photo =>
    photo.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by order_id, group ảnh không có order_id xuống cuối
  const groupedPhotos = filteredPhotos.reduce((acc, photo) => {
    let key = photo.order_id;
    if (!key || key === 'null' || key === 'undefined' || key === '') key = '__NO_ORDER__';
    if (!acc[key]) acc[key] = [];
    acc[key].push(photo);
    return acc;
  }, {});
  // Sắp xếp: các group order_id thật lên trước, group '__NO_ORDER__' xuống cuối
  const groupOrder = Object.keys(groupedPhotos).filter(k => k !== '__NO_ORDER__').sort();
  if (groupedPhotos['__NO_ORDER__']) groupOrder.push('__NO_ORDER__');

  return (
    <div>
      <button className={styles.backButton} onClick={() => navigate(-1)}>← Quay lại</button>
      <h3 className={styles.folderTitle}>Ảnh trong sản phẩm: {productId}</h3>
      <input
        type="text"
        placeholder="Tìm kiếm ảnh theo tên..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ margin: '10px 0', padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', width: 250 }}
      />
      {/* Group by order_id, group không có mã đơn xuống cuối */}
      {groupOrder.length === 0 && <div>Không có ảnh nào.</div>}
      {groupOrder.map(orderId => (
        <div key={orderId} style={{ marginBottom: 32 }}>
          <div style={{ fontWeight: 600, fontSize: 17, color: '#1976d2', margin: '18px 0 10px 0' }}>
            {orderId === '__NO_ORDER__' ? 'Khác (Không có mã đơn)' : `Mã đơn hàng: ${orderId}`}
          </div>
          <div className={styles.photoGrid}>
            {groupedPhotos[orderId].map(photo => (
              <div className={styles.photoItem} key={photo.id}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={`http://localhost:5000/uploads/${productId}/${photo.filename}`}
                    alt=""
                    onClick={() => handlePreview(photo)}
                    style={{ cursor: 'pointer' }}
                  />
                  <button className={styles.menuButton} style={{ position: 'absolute', top: 6, right: 6 }} onClick={e => { e.stopPropagation(); handleMenuOpen(photo.id); }}>⋮</button>
                  {menuOpen === photo.id && (
                    <div className={styles.menuPopup} onMouseLeave={handleMenuClose}>
                      <button className={styles.menuItem} onClick={() => handleDelete(photo)}>Xóa</button>
                      <button className={styles.menuItem} onClick={() => handleDownload(photo)}>Tải xuống</button>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'center', marginTop: 6, fontSize: 15 }}>{photo.filename}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {preview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={closePreview}
        >
          <img
            src={`http://localhost:5000/uploads/${productId}/${preview.filename}`}
            alt=""
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 10, boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}
          />
        </div>
      )}
    </div>
  );
}

export default FolderDetail; 