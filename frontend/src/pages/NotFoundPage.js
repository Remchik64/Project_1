import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const NotFoundPage = () => {
  useEffect(() => {
    // Устанавливаем статус код 404 для SEO
    document.title = '404 - Страница не найдена | Escort Bar';
    
    // Сообщаем поисковым системам, что это страница 404
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex';
    document.head.appendChild(metaRobots);
    
    return () => {
      document.head.removeChild(metaRobots);
    };
  }, []);

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Страница не найдена</h2>
        <p>Извините, но запрашиваемая вами страница не существует.</p>
        <Link to="/" className="btn-primary">Вернуться на главную</Link>
      </div>
    </div>
  );
};

export default NotFoundPage; 