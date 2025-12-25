import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { Link } from 'react-router-dom';

const StudentLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.login(formData);
      if (response.data.user.role !== 'student') {
        setError('Access denied. Student credentials required.');
        return;
      }
      localStorage.setItem('token', response.data.token);
      onLogin(response.data.user);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="form-container">
        <h2>Student Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn">Login as Student</button>
          {error && <div className="error">{error}</div>}
        </form>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/register" style={{ color: '#1e3c72' }}>New user? Register here</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Link to="/" style={{ color: '#1e3c72' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;