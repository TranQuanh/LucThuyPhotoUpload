import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Gallery.module.css';
import FolderDetail from '../FolderDetail/FolderDetail';

function Gallery() {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null); // id folder đang mở menu
  const [renameId, setRenameId] = useState(null); // id folder đang đổi tên
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = () => {
    axios.get('http://localhost:5000/api/folders', {
      withCredentials: true
    }).then(res => setFolders(res.data));
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder.name);
  };

  const handleBack = () => {
    setSelectedFolder(null);
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
    await axios.post('http://localhost:5000/api/folder/rename', { oldName, newName: renameValue }, { withCredentials: true });
    setRenameId(null);
    fetchFolders();
  };
  const handleDelete = async (name) => {
    if (window.confirm('Bạn có chắc muốn xóa folder này?')) {
      await axios.delete(`http://localhost:5000/api/folder/${name}`, { withCredentials: true });
      fetchFolders();
    }
    setMenuOpen(null);
  };
  const handleDownload = (name) => {
    window.open(`http://localhost:5000/api/folder/${name}/download`, '_blank');
    setMenuOpen(null);
  };

  return (
    <div className={styles.galleryContainer}>
      <h2>Thư mục ảnh</h2>
      {!selectedFolder ? (
        <div className={styles.folderGrid}>
          {folders.map(folder => (
            <div
              key={folder.id}
              className={styles.folderCard}
              onClick={() => renameId !== folder.id && handleFolderClick(folder)}
            >
              <div className={styles.folderLeft}>
                <div className={styles.folderIcon}>📁</div>
                <div className={styles.folderInfo}>
                  {renameId === folder.id ? (
                    <form onSubmit={e => { e.preventDefault(); handleRenameSubmit(folder.id, folder.name); }}>
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
                      <div className={styles.folderName}>{folder.name}</div>
                      <div className={styles.folderSubtitle}>Trên Drive của tôi</div>
                    </>
                  )}
                </div>
              </div>
              <button
                className={styles.menuButton}
                onClick={e => { e.stopPropagation(); handleMenuOpen(folder.id); }}
              >
                ⋮
              </button>
              {menuOpen === folder.id && (
                <div className={styles.menuPopup} onMouseLeave={handleMenuClose}>
                  <button className={styles.menuItem} onClick={() => handleRename(folder.id, folder.name)}>Đổi tên</button>
                  <button className={styles.menuItem} onClick={() => handleDelete(folder.name)}>Xóa</button>
                  <button className={styles.menuItem} onClick={() => handleDownload(folder.name)}>Tải xuống</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <FolderDetail folderName={selectedFolder} onBack={handleBack} />
      )}
    </div>
  );
}

export default Gallery; 