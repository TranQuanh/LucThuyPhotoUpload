import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Gallery.module.css';
import { useNavigate } from 'react-router-dom';

function Gallery() {
  const [products, setProducts] = useState([]);
  const [previews, setPreviews] = useState({}); // {productId: [url1, url2, ...]}
  const [menuOpen, setMenuOpen] = useState(null); // id product đang mở menu
  const [renameId, setRenameId] = useState(null); // id product đang đổi tên
  const [renameValue, setRenameValue] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // từ khóa tìm kiếm sản phẩm
  const [orderIdSearch, setOrderIdSearch] = useState('');
  const [orderProductIds, setOrderProductIds] = useState(null); // null: chưa tìm, []: không có, [id,...]: có
  const [orderSearchMsg, setOrderSearchMsg] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const groupOptions = [
    'Sàn SPC',
    'Tấm ốp trần/tường',
    'Phụ kiện cửa',
    'Phụ kiện tấm ốp',
    'Phụ kiện sàn',
    'Cửa Composite',
  ];
  const navigate = useNavigate();

  // Lấy preview ảnh cho từng sản phẩm
  const fetchPreviews = async (productsList) => {
    const previewObj = {};
    for (const product of productsList) {
      try {
        const res = await axios.get(`http://localhost:5000/api/photos/${product.id}`, { withCredentials: true });
        console.log('Photos for', product.id, res.data);
        const photoObjs = res.data;
        const urls = photoObjs.map(photo => {
          const url = `http://localhost:5000/uploads/${product.id}/${photo.filename}`;
          console.log('Preview URL:', url);
          return url;
        });
        previewObj[product.id] = urls;
      } catch (err) {
        console.error('Error fetching photos for', product.id, err);
        previewObj[product.id] = [];
      }
    }
    setPreviews(previewObj);
    console.log('All previews:', previewObj);
  };

  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:5000/api/products', {
      withCredentials: true
    });
    setProducts(res.data);
    await fetchPreviews(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductClick = (product) => {
    navigate(`/gallery/${product.id}`);
  };

  // Menu actions
  const handleMenuOpen = (id) => setMenuOpen(id);
  const handleMenuClose = () => setMenuOpen(null);

  const handleRename = (id, oldName) => {
    setRenameId(id);
    setRenameValue(oldName);
    setMenuOpen(null);
  };
  const handleRenameSubmit = async (id, oldName) => {
    if (!renameValue.trim() || renameValue === oldName) {
      setRenameId(null);
      return;
    }
    await axios.post('http://localhost:5000/api/product/rename', { oldName, newName: renameValue }, { withCredentials: true });
    setRenameId(null);
    await fetchProducts();
  };
  const handleDelete = async (name) => {
    if (window.confirm('Bạn có chắc muốn xóa product này?')) {
      await axios.delete(`http://localhost:5000/api/product/${name}`, { withCredentials: true });
      await fetchProducts();
    }
    setMenuOpen(null);
  };
  const handleDownload = (name) => {
    window.open(`http://localhost:5000/api/product/${name}/download`, '_blank');
    setMenuOpen(null);
  };

  // Tìm kiếm folder theo mã hợp đồng
  React.useEffect(() => {
    const search = async () => {
      if (!orderIdSearch) {
        setOrderProductIds(null);
        setOrderSearchMsg('');
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/api/order_details`, { params: { order_id: orderIdSearch }, withCredentials: true });
        const productIds = res.data.map(od => od.product_id);
        if (productIds.length === 0) {
          setOrderProductIds([]);
          setOrderSearchMsg('Không có sản phẩm nào cho hợp đồng này');
        } else {
          setOrderProductIds(productIds);
          setOrderSearchMsg('');
        }
      } catch (err) {
        setOrderProductIds([]);
        setOrderSearchMsg('Không tìm thấy hợp đồng hoặc lỗi kết nối');
      }
    };
    search();
  }, [orderIdSearch]);

  // Lọc sản phẩm theo từ khóa, group_name và theo hợp đồng (nếu có)
  const filteredProducts = products.filter(product => {
    const name = product.name ? product.name.toLowerCase() : '';
    const id = product.id ? product.id.toString().toLowerCase() : '';
    const matchSearch = name.includes(searchTerm.toLowerCase()) || id.includes(searchTerm.toLowerCase());
    const matchGroup = groupFilter ? (product.group_name === groupFilter) : true;
    if (orderProductIds === null) return matchSearch && matchGroup;
    return orderProductIds.includes(product.id) && matchSearch && matchGroup;
  });

  return (
    <div className={styles.galleryContainer}>
      <h2>Sản phẩm ảnh</h2>
      {/* Tìm kiếm theo mã hợp đồng */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo mã hợp đồng"
          value={orderIdSearch}
          onChange={e => setOrderIdSearch(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', width: 220 }}
        />
        {orderProductIds !== null && (
          <button onClick={() => { setOrderProductIds(null); setOrderIdSearch(''); setOrderSearchMsg(''); }} style={{ padding: '7px 12px', borderRadius: 6, background: '#eee', color: '#1976d2', border: 'none', fontWeight: 500, cursor: 'pointer' }}>
            Xóa lọc
          </button>
        )}
      </div>
      {orderSearchMsg && <div className={styles.uploadMessage}>{orderSearchMsg}</div>}
      {/* Tìm kiếm sản phẩm như cũ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0' }}>
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', width: 250 }}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={{ padding: '7px 12px', borderRadius: 6, background: '#eee', color: '#1976d2', border: 'none', fontWeight: 500, cursor: 'pointer' }}>
            Xóa lọc
          </button>
        )}
      </div>
      {/* Lọc theo group_name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <select
          value={groupFilter}
          onChange={e => setGroupFilter(e.target.value)}
          style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
        >
          <option value="">-- Lọc theo loại sản phẩm --</option>
          {groupOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {groupFilter && (
          <button onClick={() => setGroupFilter('')} style={{ padding: '7px 12px', borderRadius: 6, background: '#eee', color: '#1976d2', border: 'none', fontWeight: 500, cursor: 'pointer' }}>
            Xóa lọc
          </button>
        )}
      </div>
      <div className={styles.folderGrid}>
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className={styles.folderCard}
            onClick={() => renameId !== product.id && handleProductClick(product)}
          >
            <div className={styles.folderLeft}>
              <div className={styles.folderIcon}>📦</div>
              <div className={styles.folderInfo}>
                {renameId === product.id ? (
                  <form onSubmit={e => { e.preventDefault(); handleRenameSubmit(product.id, product.name); }}>
                    <input
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      autoFocus
                      onBlur={() => setRenameId(null)}
                      style={{ width: 100, fontSize: 15, borderRadius: 4, border: '1px solid #ccc', padding: '2px 6px' }}
                    />
                  </form>
                ) : (
                  <>
                    <div className={styles.folderName}>{product.id}</div>
                    <div className={styles.folderSubtitle}>{product.group_name || 'Sản phẩm'}</div>
                    {/* Preview ảnh nhỏ */}
                    {previews[product.id] && previews[product.id].length > 0 && (
                      <div className={styles.previewRow}>
                        {previews[product.id].slice(0, 6).map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt="preview"
                            className={styles.previewImg}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <button
              className={styles.menuButton}
              onClick={e => { e.stopPropagation(); handleMenuOpen(product.id); }}
            >
              ⋮
            </button>
            {menuOpen === product.id && (
              <div className={styles.menuPopup} onMouseLeave={handleMenuClose}>
                <button className={styles.menuItem} onClick={() => handleDownload(product.name)}>Tải xuống</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery; 