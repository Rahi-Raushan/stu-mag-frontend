import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          Rungta International Skills University
        </div>
        <ul className="nav-menu">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><a href="#about" className="nav-link">About</a></li>
          <li><a href="#courses" className="nav-link">Courses</a></li>
          <li><a href="#contact" className="nav-link">Contact Us</a></li>
        </ul>
        <div className="login-buttons">
          <Link to="/admin-login" className="btn-login">Admin Login</Link>
          <Link to="/student-login" className="btn-login">Student Login</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;