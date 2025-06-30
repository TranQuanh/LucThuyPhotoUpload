import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Login from './components/Login/Login';
import Upload from './components/Upload/Upload';
import Gallery from './components/Gallery/Gallery';
import Sidebar from './components/Sidebar/Sidebar';
import FolderDetail from './components/FolderDetail/FolderDetail';
import axios from 'axios';

function App() {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Kiểm tra đăng nhập thực sự từ backend khi load lại app
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await axios.get('http://localhost:5000/api/me', { withCredentials: true });
        setRole(res.data.role);
        localStorage.setItem('role', res.data.role);
      } catch {
        setRole(null);
        localStorage.removeItem('role');
      }
    }
    checkAuth();
  }, []);

  const handleLogin = (role) => {
    setRole(role);
    localStorage.setItem('role', role);
  };
  const handleLogout = async () => {
    await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
    setRole(null);
    localStorage.removeItem('role');
  };



  return (
    <Router>
      <div style={{ display: 'flex' }}>
        {role && (
          <Sidebar
            role={role}
            onLogout={handleLogout}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        )}
        {role && sidebarCollapsed && (
          <button
            className="sidebar-open-btn"
            onClick={() => setSidebarCollapsed(false)}
            style={{
              position: 'fixed',
              top: 28,
              left: 0,
              zIndex: 200,
              background: '#fff',
              border: '1.5px solid #e3e8ef',
              borderRadius: '0 18px 18px 0',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
              cursor: 'pointer',
              padding: 0
            }}
            aria-label="Mở sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 5L13 10L7 15" stroke="#1976d2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        <div style={{ flex: 1, padding: 20 }}>
          <Routes>
            <Route
              path="/login"
              element={
                role
                  ? <Navigate to="/gallery" />
                  : <Login onLogin={handleLogin} />
              }
            />
            <Route
              path="/upload"
              element={
                role === 'marketing'
                  ? <Upload />
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="/gallery"
              element={
                role
                  ? <Gallery />
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="/gallery/:productId"
              element={
                role
                  ? <FolderDetail />
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="*"
              element={
                role
                  ? <Navigate to="/gallery" />
                  : <Navigate to="/login" />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 