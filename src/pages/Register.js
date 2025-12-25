import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    city: '',
    contactNumber: '',
    fatherName: '',
    erpNo: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.register({
        ...formData,
        age: parseInt(formData.age)
      });
      localStorage.setItem('token', response.data.token);
      onLogin(response.data.user);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="form-container">
        <h2>Student Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label>Age:</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              required
              min="16"
              max="100"
            />
          </div>
          <div className="form-group">
            <label>City:</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Contact Number:</label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Father Name:</label>
            <input
              type="text"
              value={formData.fatherName}
              onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>ERP Number:</label>
            <input
              type="text"
              value={formData.erpNo}
              onChange={(e) => setFormData({ ...formData, erpNo: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          {error && <div className="error">{error}</div>}
        </form>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/student-login" style={{ color: '#1e3c72' }}>Already have an account? Login here</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Link to="/" style={{ color: '#1e3c72' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;