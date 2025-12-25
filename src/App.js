import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/Login';
import StudentLogin from './pages/StudentLogin';
import Register from './pages/Register';
import SimpleAdminDashboard from './pages/SimpleAdminDashboard';
import SimpleStudentDashboard from './pages/SimpleStudentDashboard';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import './index.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // If user is logged in, show appropriate dashboard
  if (user) {
    return (
      <Router>
        {user.role === 'admin' ? (
          <SimpleAdminDashboard user={user} onLogout={handleLogout} />
        ) : (
          <SimpleStudentDashboard user={user} onLogout={handleLogout} />
        )}
      </Router>
    );
  }

  // If not logged in, show public routes
  return (
    <Router>
      <div>
        <Routes>
          <Route 
            path="/" 
            element={
              <>
                <Navbar />
                <Home />
                <Footer />
              </>
            } 
          />
          <Route 
            path="/admin-login" 
            element={<AdminLogin onLogin={handleLogin} />} 
          />
          <Route 
            path="/student-login" 
            element={<StudentLogin onLogin={handleLogin} />} 
          />
          <Route 
            path="/register" 
            element={<Register onLogin={handleLogin} />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;