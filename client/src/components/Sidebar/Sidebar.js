import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ role, onLogout, collapsed, setCollapsed }) {
  const location = useLocation();

  return (
    <div className={`sidebar${collapsed ? ' collapsed' : ''}`}> 
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
      >
        {collapsed ? (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 5L13 10L7 15" stroke="#1976d2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 5L7 10L13 15" stroke="#1976d2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      <h3 className="sidebar-title">Menu</h3>
      <nav className="sidebar-nav">
        {role === 'marketing' && (
          <Link to="/upload" className={`sidebar-link${location.pathname === '/upload' ? ' active' : ''}`}>Upload</Link>
        )}
        <Link to="/gallery" className={`sidebar-link${location.pathname === '/gallery' ? ' active' : ''}`}>Gallery</Link>
        <button className="sidebar-logout" onClick={onLogout}>Đăng xuất</button>
      </nav>
    </div>
  );
}

export default Sidebar; 