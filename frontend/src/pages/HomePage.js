import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, getMediaUrl } from '../config/api';
import { setPageMetadata, setStructuredData, createOrganizationStructuredData } from '../utils/seo';
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
    
    // Устанавливаем SEO метаданные для главной страницы
    setPageMetadata({
      title: 'Сервис знакомств по городам России',
      description: 'Сервис знакомств и анкет по городам России. Найдите интересных людей в вашем городе.',
      keywords: 'знакомства, анкеты, города России, поиск анкет, сайт знакомств',
      canonical: window.location.href,
      og: {
        title: 'Сервис знакомств по городам России',
        description: 'Найдите интересных людей в вашем городе. Просматривайте анкеты и знакомьтесь.',
        type: 'website',
        url: window.location.href,
        image: `${window.location.origin}/og-image.jpg`
      }
    });
    
    // Устанавливаем структурированные данные для организации
    setStructuredData(createOrganizationStructuredData());
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/site-settings'));
      setSettings(response.data);
      
      // Обновляем SEO метаданные с учетом настроек сайта
      if (response.data) {
        setPageMetadata({
          title: response.data.mainTitle || 'Сервис знакомств по городам России',
          description: response.data.description || 'Сервис знакомств и анкет по городам России. Найдите интересных людей в вашем городе.',
          keywords: 'знакомства, анкеты, города России, поиск анкет, сайт знакомств',
          canonical: window.location.href,
          og: {
            title: response.data.mainTitle || 'Сервис знакомств по городам России',
            description: response.data.description || 'Найдите интересных людей в вашем городе. Просматривайте анкеты и знакомьтесь.',
            type: 'website',
            url: window.location.href,
            image: `${window.location.origin}/og-image.jpg`
          }
        });
      }
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
        <div className="feature" itemScope itemType="https://schema.org/Service">
          <div className="feature-icon">👥</div>
          <h3 itemProp="name">Тысячи пользователей</h3>
          <p itemProp="description">Найдите того, кто разделяет ваши интересы</p>
        </div>
        <div className="feature" itemScope itemType="https://schema.org/Service">
          <div className="feature-icon">🔒</div>
          <h3 itemProp="name">Безопасность</h3>
          <p itemProp="description">Ваши данные надежно защищены</p>
        </div>
        <div className="feature" itemScope itemType="https://schema.org/Service">
          <div className="feature-icon">❤️</div>
          <h3 itemProp="name">Успешные истории</h3>
          <p itemProp="description">Тысячи счастливых пар нашли друг друга</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 