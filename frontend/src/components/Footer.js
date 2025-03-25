import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
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

  // Переключение футера
  const toggleFooter = () => {
    setIsExpanded(!isExpanded);
  };

  // Навигация по ссылкам
  const handleLinkClick = (e, to) => {
    e.preventDefault();
    navigate(to);
    setIsExpanded(false);
  };

  return (
    <footer className={`footer ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="footer-toggle" onClick={toggleFooter}>
        <span className="footer-toggle-text">
          {isExpanded ? 'Свернуть информацию' : 'Показать больше информации'}
        </span>
        <span className="footer-toggle-arrow">
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>
      
      <div className="footer-content">
        {isExpanded && (
          <button className="close-button" onClick={() => setIsExpanded(false)}>
            Закрыть
          </button>
        )}
        
        <div className="footer-container">
          <div className="footer-section">
            <h3>О сервисе</h3>
            <ul>
              <li><a href="#" onClick={(e) => handleLinkClick(e, '/about')}>О нас</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, '/terms')}>Условия использования</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, '/privacy')}>Политика конфиденциальности</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Навигация</h3>
            <ul>
              <li><a href="#" onClick={(e) => handleLinkClick(e, '/')}>Главная</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, '/profiles')}>Анкеты</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, '/search')}>Поиск</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, '/sitemap')}>Карта сайта</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Контакты</h3>
            <div className="social-links">
              <a href={settings.telegramLink} target="_blank" rel="noopener noreferrer" className="social-link telegram">
                Telegram
              </a>
              <a href={settings.whatsappLink} target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <button className="close-button" onClick={() => setIsExpanded(false)}>
            Закрыть
          </button>
        )}
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} Сервис знакомств. Все права защищены.</p>
        <p>
          <a href="#" onClick={(e) => handleLinkClick(e, '/sitemap')}>Карта сайта</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer; 