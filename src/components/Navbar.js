import React from 'react';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <h1>Student Management System</h1>
      <div>
        <span>Welcome, {user.name} ({user.role})</span>
        <button onClick={onLogout} style={{ marginLeft: '1rem' }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;