import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navigation">
      <div className={`nav-content ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="nav-left">
          <Link to="/" className="nav-brand" onClick={closeMobileMenu}>
            Сайт знакомств
          </Link>
          <Link to="/profiles" className="nav-link" onClick={closeMobileMenu}>
            Анкеты
          </Link>
        </div>

        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          <span className="hamburger-icon">☰</span>
        </button>

        <div className={`nav-right ${isMobileMenuOpen ? 'show' : ''} ${isAuthenticated && user?.role === 'admin' ? 'admin-menu' : ''}`}>
          {isAuthenticated && user?.role === 'admin' ? (
            <>
              <Link to="/admin/profiles" className="nav-link" onClick={closeMobileMenu}>
                Управление анкетами
              </Link>
              <Link to="/admin/settings" className="nav-link" onClick={closeMobileMenu}>
                Настройки
              </Link>
              <button onClick={handleLogout} className="nav-button">
                Выход
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-button" onClick={closeMobileMenu}>
              Вход для рекламодателей
            </Link>
          )}
        </div>
      </div>
      {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={closeMobileMenu} />}
    </nav>
  );
};

export default Navigation; 