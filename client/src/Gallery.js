import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Gallery({ token }) {
  const [folders, setFolders] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/folders', {
      withCredentials: true
    }).then(res => setFolders(res.data));
  }, []);

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder.name);
    axios.get(`http://localhost:5000/api/photos/${folder.name}`, {
      withCredentials: true
    }).then(res => setPhotos(res.data));
  };

  return (
    <div>
      <h2>Thư mục ảnh</h2>
      <div style={{display:'flex', gap:10}}>
        {folders.map(folder => (
          <button key={folder.id} onClick={() => handleFolderClick(folder)}>{folder.name}</button>
        ))}
      </div>
      {selectedFolder && (
        <div>
          <h3>Ảnh trong folder: {selectedFolder}</h3>
          <div style={{display:'flex', flexWrap:'wrap', gap:10}}>
            {photos.map(photo => (
              <img key={photo.id} src={`http://localhost:5000/uploads/${selectedFolder}/${photo.filename}`} alt="" width={150} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery; 