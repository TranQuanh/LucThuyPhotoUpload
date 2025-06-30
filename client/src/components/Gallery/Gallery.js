import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Gallery.module.css';
import { useNavigate } from 'react-router-dom';

function Gallery() {
  const [products, setProducts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null); // id product đang mở menu
  const [renameId, setRenameId] = useState(null); // id product đang đổi tên
  const [renameValue, setRenameValue] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // từ khóa tìm kiếm sản phẩm
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get('http://localhost:5000/api/products', {
      withCredentials: true
    }).then(res => {
      setProducts(res.data);
      console.log('Products data:', res.data);
    });
  };

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
    fetchProducts();
  };
  const handleDelete = async (name) => {
    if (window.confirm('Bạn có chắc muốn xóa product này?')) {
      await axios.delete(`http://localhost:5000/api/product/${name}`, { withCredentials: true });
      fetchProducts();
    }
    setMenuOpen(null);
  };
  const handleDownload = (name) => {
    window.open(`http://localhost:5000/api/product/${name}/download`, '_blank');
    setMenuOpen(null);
  };

  // Lọc sản phẩm theo từ khóa
  const filteredProducts = products.filter(product => {
    const name = product.name ? product.name.toLowerCase() : '';
    const id = product.id ? product.id.toString().toLowerCase() : '';
    return name.includes(searchTerm.toLowerCase()) || id.includes(searchTerm.toLowerCase());
  });

  return (
    <div className={styles.galleryContainer}>
      <h2>Sản phẩm ảnh</h2>
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ margin: '10px 0', padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', width: 250 }}
      />
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
                    <div className={styles.folderSubtitle}>Sản phẩm</div>
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
                <button className={styles.menuItem} onClick={() => handleRename(product.id, product.name)}>Đổi tên</button>
                <button className={styles.menuItem} onClick={() => handleDelete(product.name)}>Xóa</button>
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