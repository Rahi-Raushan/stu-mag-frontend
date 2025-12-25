import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Rungta International Skills University</h1>
        <p>Excellence in Education, Innovation in Learning, Leadership in Tomorrow</p>
        <div className="hero-buttons">
          <Link to="/admin-login" className="btn-hero">Admin Login</Link>
          <Link to="/student-login" className="btn-hero">Student Login</Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;