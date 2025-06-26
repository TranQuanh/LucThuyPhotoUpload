import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar({ role, onLogout }) {
  const location = useLocation();
  return (
    <div style={{ width: 200, background: '#f0f0f0', minHeight: '100vh', padding: 20 }}>
      <h3>Menu</h3>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {role === 'marketing' && (
          <Link to="/upload" style={{ fontWeight: location.pathname === '/upload' ? 'bold' : 'normal' }}>Upload</Link>
        )}
        <Link to="/gallery" style={{ fontWeight: location.pathname === '/gallery' ? 'bold' : 'normal' }}>Gallery</Link>
        <button onClick={onLogout} style={{ marginTop: 30 }}>Đăng xuất</button>
      </nav>
    </div>
  );
}

export default Sidebar; 