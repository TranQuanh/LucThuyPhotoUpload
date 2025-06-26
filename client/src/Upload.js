import React, { useState } from 'react';
import axios from 'axios';

function Upload({ token }) {
  const [photo, setPhoto] = useState(null);
  const [folder, setFolder] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo || !folder) {
      setMessage('Vui lòng chọn ảnh và nhập tên folder');
      return;
    }
    const formData = new FormData();
    for (let i = 0; i < photo.length; i++) {
      formData.append('photos', photo[i]);
    }
    formData.append('folder', folder);
    try {
      await axios.post('http://localhost:5000/api/upload', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Upload thành công!');
    } catch (err) {
      setMessage('Upload thất bại');
    }
  };

  return (
    <div>
      <h2>Upload Ảnh</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" multiple onChange={e => setPhoto(e.target.files)} />
        <input placeholder="Tên folder" value={folder} onChange={e => setFolder(e.target.value)} />
        <button type="submit">Upload</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
}

export default Upload; 