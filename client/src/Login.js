import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', { username, password }, { withCredentials: true });
      onLogin(res.data.role);
      navigate('/gallery');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Tên đăng nhập" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Đăng nhập</button>
      </form>
      {error && <div style={{color:'red'}}>{error}</div>}
    </div>
  );
}

export default Login; 