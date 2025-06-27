import React, { useState } from 'react';
import axios from 'axios';
import styles from './Upload.module.css';

function Upload({ token }) {
  const [photos, setPhotos] = useState([]);
  const [folder, setFolder] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(prev => [...prev, ...files]);
    e.target.value = null;
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (photos.length === 0 || !folder) {
      setMessage('Vui lòng chọn ảnh và nhập tên folder');
      return;
    }
    const formData = new FormData();
    photos.forEach(photo => {
      formData.append('photos', photo);
    });
    formData.append('folder', folder);
    try {
      await axios.post('http://localhost:5000/api/upload', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Upload thành công!');
      setPhotos([]);
      setFolder('');
    } catch (err) {
      setMessage('Upload thất bại');
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <div className={styles.uploadTitle}>Upload Ảnh</div>
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
          <input
            className={styles.inputText}
            placeholder="Tên folder"
            value={folder}
            onChange={e => setFolder(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        <button className={styles.uploadButton} type="submit">Upload</button>
      </form>
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
      {message && <div className={styles.uploadMessage}>{message}</div>}
    </div>
  );
}

export default Upload; 