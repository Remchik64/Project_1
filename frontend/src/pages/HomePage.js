import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, getMediaUrl } from '../config/api';
import './HomePage.css';

const HomePage = () => {
  const [settings, setSettings] = useState({
    mainTitle: 'Сайт знакомств',
    subTitle: 'Найдите свою любовь',
    description: 'Лучший сайт знакомств для серьезных отношений',
    headerBackground: 'color',
    headerBackgroundColor: 'linear-gradient(135deg, #6e8efb, #a777e3)',
    headerBackgroundImage: null
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/site-settings'));
      setSettings(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке настроек:', error);
    }
  };

  const getHeaderStyle = () => {
    if (settings.headerBackground === 'image' && settings.headerBackgroundImage) {
      return {
        backgroundImage: `url(${getMediaUrl(settings.headerBackgroundImage)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    return {
      background: settings.headerBackgroundColor
    };
  };

  return (
    <div className="home-page">
      <header className="hero" style={getHeaderStyle()}>
        <div className="hero-content">
          <h1>{settings.mainTitle}</h1>
          <h2>{settings.subTitle}</h2>
          <p>{settings.description}</p>
          <div className="hero-buttons">
            <Link to="/profiles" className="browse-button">
              Смотреть анкеты
            </Link>
          </div>
        </div>
      </header>

      <section className="features">
        <div className="feature">
          <div className="feature-icon">👥</div>
          <h3>Тысячи пользователей</h3>
          <p>Найдите того, кто разделяет ваши интересы</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🔒</div>
          <h3>Безопасность</h3>
          <p>Ваши данные надежно защищены</p>
        </div>
        <div className="feature">
          <div className="feature-icon">❤️</div>
          <h3>Успешные истории</h3>
          <p>Тысячи счастливых пар нашли друг друга</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 