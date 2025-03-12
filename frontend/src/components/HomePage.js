import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';
import './InfoBlocks.css';
import { getApiUrl, getMediaUrl } from '../config/api';

const HomePage = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getHeaderStyle = () => {
        console.log('Текущие настройки:', settings);
        if (settings.headerBackground === 'image' && settings.headerBackgroundImage) {
            console.log('Применяется фоновое изображение:', getMediaUrl(settings.headerBackgroundImage));
            return {
                backgroundImage: `url(${getMediaUrl(settings.headerBackgroundImage)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            };
        } else if (settings.headerBackground === 'color' && settings.headerBackgroundColor) {
            console.log('Применяется фоновый цвет:', settings.headerBackgroundColor);
            return {
                backgroundColor: settings.headerBackgroundColor
            };
        }
        console.log('Применяется стиль по умолчанию');
        return {
            backgroundColor: '#1a1a1a'
        };
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                console.log('Загрузка настроек...');
                const response = await axios.get(getApiUrl('/api/site-settings'));
                console.log('Получены настройки:', response.data);
                setSettings(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при загрузке настроек:', error);
                setError('Ошибка при загрузке настроек');
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="home-page">
            <section className="hero" style={getHeaderStyle()}>
                <div className="hero-content">
                    <h1>{settings.title || 'Добро пожаловать'}</h1>
                    <h2>{settings.subTitle || 'Найдите свою вторую половинку'}</h2>
                    <p>{settings.description || 'Присоединяйтесь к нашему сообществу и начните свой путь к счастью'}</p>
                    <div className="hero-buttons">
                        <Link to="/profiles" className="browse-button">Смотреть анкеты</Link>
                    </div>
                </div>
            </section>
            <section className="info-blocks">
                <div className="info-block">
                    <div className="info-block-icon">
                        <i className="fas fa-users"></i>
                    </div>
                    <h3>Тысячи пользователей</h3>
                    <p>Найдите того, кто разделяет ваши интересы</p>
                </div>
                <div className="info-block">
                    <div className="info-block-icon">
                        <i className="fas fa-shield-alt"></i>
                    </div>
                    <h3>Безопасность</h3>
                    <p>Ваши данные надежно защищены</p>
                </div>
                <div className="info-block">
                    <div className="info-block-icon">
                        <i className="fas fa-heart"></i>
                    </div>
                    <h3>Успешные истории</h3>
                    <p>Тысячи счастливых пар нашли друг друга</p>
                </div>
            </section>
        </div>
    );
};

export default HomePage; 