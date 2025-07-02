import React, { useState } from 'react';
import axios from 'axios';
import styles from './Upload.module.css';

function Upload({ token }) {
  const [tab, setTab] = useState('phone'); // 'phone' hoặc 'product'
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [products, setProducts] = useState([]); // [{id, name}]
  const [selectedProducts, setSelectedProducts] = useState([]); // array of product_id
  const [productCode, setProductCode] = useState(''); // cho tab mã sản phẩm
  const [photos, setPhotos] = useState([]);
  const [phoneMessage, setPhoneMessage] = useState('');
  const [showPhoneMessage, setShowPhoneMessage] = useState(false);
  const [productMessage, setProductMessage] = useState('');
  const [showProductMessage, setShowProductMessage] = useState(false);
  const [loading, setLoading] = useState(false);

  // Tra cứu orders theo phone
  const handleSearchOrders = async () => {
    setOrders([]);
    setSelectedOrder(null);
    setOrderDetails([]);
    setProducts([]);
    setSelectedProducts([]);
    if (!phone) return;
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/orders', { params: { phone }, withCredentials: true });
      setOrders(res.data);
      if (res.data.length === 0) setPhoneMessage('Không tìm thấy đơn hàng nào!');
      else setPhoneMessage('');
    } catch (err) {
      setPhoneMessage('Lỗi tra cứu đơn hàng');
    }
    setLoading(false);
  };

  // Tra cứu order_details theo order_id
  const handleSelectOrder = async (orderId) => {
    setSelectedOrder(orderId);
    setOrderDetails([]);
    setProducts([]);
    setSelectedProducts([]);
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/order_details', { params: { order_id: orderId }, withCredentials: true });
      setOrderDetails(res.data);
      // Lấy thông tin product cho từng order_detail
      const productPromises = res.data.map(od => axios.get(`http://localhost:5000/api/products/${od.product_id}`, { withCredentials: true }));
      const productResults = await Promise.all(productPromises);
      setProducts(productResults.map(r => r.data));
      setPhoneMessage('');
    } catch (err) {
      setPhoneMessage('Lỗi tra cứu sản phẩm');
    }
    setLoading(false);
  };

  // Chọn product (nhiều)
  const handleToggleProduct = (productId) => {
    setSelectedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
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

  // Xóa tất cả ảnh
  const handleRemoveAllPhotos = () => {
    setPhotos([]);
  };

  // Upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tab === 'phone') {
      setShowPhoneMessage(false);
      setPhoneMessage('');
      if (photos.length === 0 || selectedProducts.length === 0 || !selectedOrder) {
        setPhoneMessage('Vui lòng chọn đơn hàng, sản phẩm và ảnh');
        setShowPhoneMessage(true);
        return;
      }
      const formData = new FormData();
      photos.forEach(photo => {
        formData.append('photos', photo);
      });
      selectedProducts.forEach(pid => formData.append('products', pid));
      formData.append('order_id', selectedOrder);
      try {
        await axios.post('http://localhost:5000/api/upload', formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setPhoneMessage('Upload thành công!');
        setShowPhoneMessage(true);
        // Reset toàn bộ state về ban đầu
        setPhone('');
        setOrders([]);
        setSelectedOrder(null);
        setOrderDetails([]);
        setProducts([]);
        setSelectedProducts([]);
        setPhotos([]);
        // Có thể reset cả các message khác nếu muốn
      } catch (err) {
        setPhoneMessage('Upload thất bại');
        setShowPhoneMessage(true);
      }
      return;
    } else {
      setShowProductMessage(false);
      setProductMessage('');
      if (photos.length === 0 || !productCode) {
        setProductMessage('Vui lòng nhập mã sản phẩm và chọn ảnh');
        setShowProductMessage(true);
        return;
      }
      // Kiểm tra mã sản phẩm có tồn tại không
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${productCode}`, { withCredentials: true });
        if (!res.data || !res.data.id) {
          setProductMessage('Không có sản phẩm');
          setShowProductMessage(true);
          return;
        }
      } catch (err) {
        setProductMessage('Không có sản phẩm');
        setShowProductMessage(true);
        return;
      }
      const formData = new FormData();
      photos.forEach(photo => {
        formData.append('photos', photo);
      });
      formData.append('product', productCode);
      try {
        await axios.post('http://localhost:5000/api/upload', formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setProductMessage('Upload thành công!');
        setShowProductMessage(true);
        setPhotos([]);
        setProductCode('');
      } catch (err) {
        setProductMessage('Upload thất bại');
        setShowProductMessage(true);
      }
    }
  };

  // Ẩn thông báo khi thao tác lại trên input hoặc chọn lại
  const handlePhoneInputChange = (e) => {
    setPhone(e.target.value);
    setShowPhoneMessage(false);
  };
  const handleProductCodeChange = (e) => {
    setProductCode(e.target.value);
    setShowProductMessage(false);
  };
  const handleSearchOrdersWrapper = () => {
    setShowPhoneMessage(false);
    handleSearchOrders();
  };
  const handleSelectOrderWrapper = (orderId) => {
    setShowPhoneMessage(false);
    handleSelectOrder(orderId);
  };

  return (
    <div className={styles.uploadContainer}>
      <div className={styles.uploadTitle}>Upload Ảnh</div>
      {/* Tabs */}
      <div className={styles.tabBar}>
        <button
          type="button"
          className={tab === 'phone' ? `${styles.tabBtn} ${styles.selectedTab}` : styles.tabBtn}
          onClick={() => setTab('phone')}
        >
          Theo SĐT
        </button>
        <button
          type="button"
          className={tab === 'product' ? `${styles.tabBtn} ${styles.selectedTab}` : styles.tabBtn}
          onClick={() => setTab('product')}
        >
          Theo mã sản phẩm
        </button>
      </div>
      {/* Tab theo SĐT */}
      {tab === 'phone' && (
        <>
          <div className={styles.uploadRow}>
            <input
              className={`${styles.inputText} ${styles.uploadInput}`}
              placeholder="Nhập số điện thoại khách hàng"
              value={phone}
              onChange={handlePhoneInputChange}
            />
            <button className={styles.uploadBtn} type="button" onClick={handleSearchOrdersWrapper} disabled={loading}>
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
                    className={selectedOrder === order.id ? `${styles.selectedBtn} ${styles.uploadBtn}` : styles.uploadBtn}
                    onClick={() => handleSelectOrderWrapper(order.id)}
                  >
                    {order.id}
                  </button>
                ))}
              </div>
            </div>
          )}
          {products.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 6, fontWeight: 500 }}>Chọn sản phẩm (có thể chọn nhiều):</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {products.map(product => (
                  <label key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f0f4fa', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleToggleProduct(product.id)}
                      style={{ accentColor: '#1976d2' }}
                    />
                    <span>{product.id} </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {/* Tab theo mã sản phẩm */}
      {tab === 'product' && (
        <div className={styles.uploadRow}>
          <input
            className={`${styles.inputText} ${styles.uploadInput}`}
            placeholder="Nhập mã sản phẩm"
            value={productCode}
            onChange={handleProductCodeChange}
          />
        </div>
      )}
      {/* Form upload ảnh (chung) */}
      {((tab === 'phone' && selectedProducts.length > 0) || (tab === 'product' && productCode)) && (
        <form className={styles.uploadForm} onSubmit={handleSubmit}>
          <div className={styles.uploadRow}>
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              id="file-upload"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className={styles.chooseFileLabel}>
              Chọn ảnh
            </label>
            {/* Nút xóa tất cả ảnh */}
            {photos.length > 0 && (
              <button
                type="button"
                onClick={handleRemoveAllPhotos}
                className={styles.removeAllBtn}
              >
                Xóa tất cả ảnh
              </button>
            )}
          </div>
          {photos.length > 0 && (
            <ul className={styles.photoList}>
              {photos.map((photo, idx) => (
                <li key={idx} className={styles.photoItem}>
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={photo.name}
                    className={styles.photoThumb}
                  />
                  <button type="button" onClick={() => handleRemovePhoto(idx)} className={styles.removePhotoBtn}>X</button>
                </li>
              ))}
            </ul>
          )}
          <button className={styles.uploadBtn} type="submit">Upload</button>
        </form>
      )}
      {/* Thông báo lỗi/thành công riêng cho từng tab */}
      {tab === 'phone' && showPhoneMessage && phoneMessage && (
        phoneMessage.includes('thành công') ? (
          <div className={styles.uploadSuccess}>{phoneMessage}</div>
        ) : (
          <div className={styles.uploadMessage}>{phoneMessage}</div>
        )
      )}
      {tab === 'product' && showProductMessage && productMessage && (
        productMessage.includes('thành công') ? (
          <div className={styles.uploadSuccess}>{productMessage}</div>
        ) : (
          <div className={styles.uploadMessage}>{productMessage}</div>
        )
      )}
    </div>
  );
}

export default Upload; 