import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Upload from './Upload';
import Gallery from './Gallery';
import Sidebar from './Sidebar';

function App() {
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleLogin = (role) => {
    setRole(role);
    localStorage.setItem('role', role);
  };
  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem('role');
  };

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        {role && <Sidebar role={role} onLogout={handleLogout} />}
        <div style={{ flex: 1, padding: 20 }}>
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/upload" element={role === 'marketing' ? <Upload /> : <Navigate to="/login" />} />
            <Route path="/gallery" element={role ? <Gallery /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to={role ? '/gallery' : '/login'} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 