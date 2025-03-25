import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, getMediaUrl } from '../config/api';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isExpanded, setIsExpanded] = useState(false);
  const [settings, setSettings] = useState({
    telegramLink: 'https://t.me/yourname',
    whatsappLink: 'https://wa.me/79999999999'
  });

  // Загрузка настроек сайта
  useEffect(() => {
    fetchSettings();
    
    // Слушаем событие обновления настроек
    window.addEventListener('settingsUpdated', fetchSettings);
    
    // Очистка при размонтировании компонента
    return () => {
      window.removeEventListener('settingsUpdated', fetchSettings);
    };
  }, []);

  // Загрузка настроек с сервера
  const fetchSettings = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/site-settings'));
      setSettings(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке настроек:', error);
    }
  };

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

  const closeFooter = () => {
    setIsExpanded(false);
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
        {isExpanded && (
          <div className="mobile-close-button" onClick={closeFooter}>
            <span className="close-text">Свернуть</span>
            <span className="close-icon">▲</span>
          </div>
        )}
        <div className="footer-container">
          <div className="footer-section">
            <h3>О сервисе</h3>
            <ul>
              <li><Link to="/about" itemProp="relatedLink">О нас</Link></li>
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
            <div className="social-links">
              <a href={settings.telegramLink || "https://t.me/yourname"} target="_blank" rel="noopener noreferrer" className="social-link telegram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM17.568 8.16C17.388 10.056 16.608 14.664 16.212 16.788C16.044 17.688 15.708 17.988 15.396 18.024C14.7 18.084 14.172 17.568 13.5 17.124C12.444 16.428 11.844 15.996 10.824 15.324C9.636 14.544 10.404 14.112 11.088 13.416C11.268 13.236 14.34 10.44 14.4 10.188C14.412 10.152 14.412 10.044 14.34 9.972C14.268 9.9 14.172 9.924 14.088 9.936C13.98 9.948 12.24 11.088 8.868 13.344C8.4 13.668 7.968 13.824 7.584 13.812C7.152 13.8 6.336 13.584 5.724 13.392C4.968 13.164 4.368 13.044 4.416 12.624C4.44 12.408 4.74 12.192 5.316 11.976C8.916 10.356 11.292 9.276 12.456 8.736C15.792 7.152 16.476 6.924 16.932 6.924C17.028 6.924 17.256 6.948 17.4 7.068C17.52 7.164 17.556 7.296 17.568 7.392C17.556 7.464 17.58 7.776 17.568 8.16Z" fill="currentColor"/>
                </svg>
                <span className="messenger-icon">Telegram</span>
              </a>
              <a href={settings.whatsappLink || "https://wa.me/79999999999"} target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM16.08 16.44C15.792 17.04 14.904 17.52 14.232 17.688C13.776 17.808 13.164 17.904 10.812 16.92C7.932 15.744 6.048 12.816 5.916 12.648C5.784 12.48 4.632 10.992 4.632 9.456C4.632 7.92 5.424 7.164 5.772 6.804C6.06 6.504 6.54 6.36 6.996 6.36C6.996 6.36 7.38 6.36 7.62 6.372C7.86 6.384 8.196 6.264 8.532 7.08C8.868 7.92 9.708 10.08 9.78 10.224C9.852 10.368 9.9 10.536 9.792 10.728C9.684 10.92 9.636 11.04 9.492 11.208C9.348 11.376 9.192 11.58 9.06 11.712C8.916 11.856 8.772 12.012 8.94 12.3C9.108 12.588 9.708 13.524 10.548 14.28C11.628 15.24 12.54 15.528 12.828 15.672C13.116 15.816 13.284 15.792 13.452 15.6C13.62 15.408 14.196 14.736 14.388 14.448C14.58 14.16 14.772 14.208 15.036 14.304C15.3 14.4 17.448 15.456 17.736 15.6C18.024 15.744 18.216 15.816 18.288 15.936C18.36 16.056 18.36 16.596 16.08 16.44Z" fill="currentColor"/>
                </svg>
                <span className="messenger-icon">WhatsApp</span>
              </a>
            </div>
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