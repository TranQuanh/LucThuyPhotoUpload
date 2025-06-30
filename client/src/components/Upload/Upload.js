import React, { useState } from 'react';
import axios from 'axios';
import styles from './Upload.module.css';

function Upload({ token }) {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [products, setProducts] = useState([]); // [{id, name}]
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Tra cứu orders theo phone
  const handleSearchOrders = async () => {
    setOrders([]);
    setSelectedOrder(null);
    setOrderDetails([]);
    setProducts([]);
    setSelectedProduct(null);
    if (!phone) return;
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/orders', { params: { phone }, withCredentials: true });
      setOrders(res.data);
      if (res.data.length === 0) setMessage('Không tìm thấy đơn hàng nào!');
      else setMessage('');
    } catch (err) {
      setMessage('Lỗi tra cứu đơn hàng');
    }
    setLoading(false);
  };

  // Tra cứu order_details theo order_id
  const handleSelectOrder = async (orderId) => {
    setSelectedOrder(orderId);
    setOrderDetails([]);
    setProducts([]);
    setSelectedProduct(null);
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/order_details', { params: { order_id: orderId }, withCredentials: true });
      setOrderDetails(res.data);
      // Lấy thông tin product cho từng order_detail
      const productPromises = res.data.map(od => axios.get(`http://localhost:5000/api/products/${od.product_id}`, { withCredentials: true }));
      const productResults = await Promise.all(productPromises);
      setProducts(productResults.map(r => r.data));
      setMessage('');
    } catch (err) {
      setMessage('Lỗi tra cứu sản phẩm');
    }
    setLoading(false);
  };

  // Chọn product
  const handleSelectProduct = (productId) => {
    setSelectedProduct(productId);
  };

  // Ảnh
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(prev => [...prev, ...files]);
    e.target.value = null;
  };
  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (photos.length === 0 || !selectedProduct) {
      setMessage('Vui lòng chọn sản phẩm và ảnh');
      return;
    }
    const formData = new FormData();
    photos.forEach(photo => {
      formData.append('photos', photo);
    });
    formData.append('product', selectedProduct); // gửi product_id
    try {
      await axios.post('http://localhost:5000/api/upload', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Upload thành công!');
      setPhotos([]);
      setSelectedProduct(null);
    } catch (err) {
      setMessage('Upload thất bại');
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <div className={styles.uploadTitle}>Upload Ảnh</div>
      <div style={{ marginBottom: 16 }}>
        <input
          className={styles.inputText}
          placeholder="Nhập số điện thoại khách hàng"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={{ width: 220, marginRight: 8 }}
        />
        <button className={styles.uploadButton} type="button" onClick={handleSearchOrders} disabled={loading}>
          Tra cứu đơn hàng
        </button>
      </div>
      {orders.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 6, fontWeight: 500 }}>Chọn mã đơn hàng:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {orders.map(order => (
              <button
                key={order.id}
                type="button"
                className={selectedOrder === order.id ? styles.selectedBtn : styles.uploadButton}
                style={{ minWidth: 90 }}
                onClick={() => handleSelectOrder(order.id)}
              >
                {order.id}
              </button>
            ))}
          </div>
        </div>
      )}
      {products.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 6, fontWeight: 500 }}>Chọn sản phẩm:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {products.map(product => (
              <button
                key={product.id}
                type="button"
                className={selectedProduct === product.id ? styles.selectedBtn : styles.uploadButton}
                style={{ minWidth: 90 }}
                onClick={() => handleSelectProduct(product.id)}
              >
                {product.name || product.id}
              </button>
            ))}
          </div>
        </div>
      )}
      {selectedProduct && (
        <form className={styles.uploadForm} onSubmit={handleSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              id="file-upload"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              style={{
                cursor: 'pointer',
                padding: '6px 16px',
                background: '#1976d2',
                color: '#fff',
                borderRadius: 6,
                display: 'inline-block',
                fontSize: 15,
                fontWeight: 500,
                minWidth: 0,
                width: 'auto',
                boxShadow: '0 1px 4px rgba(25,118,210,0.08)'
              }}
            >
              Chọn ảnh
            </label>
          </div>
          {photos.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: 10, width: '100%' }}>
              {photos.map((photo, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ flex: 1, fontSize: 15 }}>{photo.name}</span>
                  <button type="button" onClick={() => handleRemovePhoto(idx)} style={{ marginLeft: 8, background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>X</button>
                </li>
              ))}
            </ul>
          )}
          <button className={styles.uploadButton} type="submit">Upload</button>
        </form>
      )}
      {message && <div className={styles.uploadMessage}>{message}</div>}
    </div>
  );
}

export default Upload; 