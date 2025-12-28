import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link 
            to="/" 
            style={{ textDecoration: 'none', color: 'inherit' }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setIsMobileMenuOpen(false);
            }}
          >
            Rungta International Skills University
          </Link>
        </div>
        
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          ☰
        </button>
        
        <ul className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <li><Link to="/" className="nav-link" onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsMobileMenuOpen(false);
          }}>Home</Link></li>
          <li><a href="#about" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>About</a></li>
          <li><a href="#courses" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Courses</a></li>
          <li><a href="#contact" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</a></li>
        </ul>
        
        <div className="login-buttons">
        </div>
      </div>
    </nav>
  );
};

export default Navbar;