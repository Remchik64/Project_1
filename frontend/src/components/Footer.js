import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isExpanded, setIsExpanded] = useState(false);

  // Управление классом body при раскрытии/скрытии футера
  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add('footer-expanded');
    } else {
      document.body.classList.remove('footer-expanded');
    }

    // Очистка при размонтировании компонента
    return () => {
      document.body.classList.remove('footer-expanded');
    };
  }, [isExpanded]);

  const toggleFooter = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <footer className={`footer ${isExpanded ? 'expanded' : 'collapsed'}`} itemScope itemType="https://schema.org/WPFooter">
      <div className="footer-toggle" onClick={toggleFooter}>
        <span className="footer-toggle-text">
          {isExpanded ? 'Свернуть информацию' : 'Показать больше информации'}
        </span>
        <span className={`footer-toggle-arrow ${isExpanded ? 'up' : 'down'}`}>
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>
      
      <div className="footer-content">
        <div className="footer-container">
          <div className="footer-section">
            <h3>О сервисе</h3>
            <ul>
              <li><Link to="/about" itemProp="relatedLink">О нас</Link></li>
              <li><Link to="/contact" itemProp="relatedLink">Контакты</Link></li>
              <li><Link to="/terms" itemProp="relatedLink">Условия использования</Link></li>
              <li><Link to="/privacy" itemProp="relatedLink">Политика конфиденциальности</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Навигация</h3>
            <ul>
              <li><Link to="/" itemProp="relatedLink">Главная</Link></li>
              <li><Link to="/profiles" itemProp="relatedLink">Анкеты</Link></li>
              <li><Link to="/search" itemProp="relatedLink">Поиск</Link></li>
              <li><Link to="/sitemap" itemProp="relatedLink">Карта сайта</Link></li>
            </ul>
          </div>
          
          <div className="footer-section" itemScope itemType="https://schema.org/Organization">
            <meta itemProp="name" content="Сервис знакомств" />
            <h3>Контакты</h3>
            <p>Email: <a href="mailto:support@example.com" itemProp="email">support@example.com</a></p>
            <p>Телефон: <a href="tel:+79999999999" itemProp="telephone">+7 (999) 999-99-99</a></p>
            <p itemProp="openingHours" content="Mo-Fr 09:00-18:00">Часы работы: 09:00 - 18:00</p>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p itemProp="copyrightNotice">&copy; {currentYear} Сервис знакомств. Все права защищены.</p>
        <p>
          <Link to="/sitemap" itemProp="relatedLink">Карта сайта</Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer; 