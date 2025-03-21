import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiUrl, getMediaUrl } from '../config/api';
import './Header.css';

const Header = () => {
    const [settings, setSettings] = useState({
        mainTitle: 'Сайт знакомств',
        subTitle: '',
        headerBackground: 'color',
        headerBackgroundColor: '',
        headerBackgroundImage: null
    });

    useEffect(() => {
        fetchSettings();
        // Подписываемся на обновления настроек
        window.addEventListener('settingsUpdated', fetchSettings);
        return () => window.removeEventListener('settingsUpdated', fetchSettings);
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get(getApiUrl('/api/site-settings'));
            console.log('Полученные настройки:', response.data);
            setSettings(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке настроек:', error);
        }
    };

    const headerStyle = {
        background: settings.headerBackground === 'image' && settings.headerBackgroundImage
            ? `url(${getMediaUrl(settings.headerBackgroundImage)}) center/cover no-repeat`
            : settings.headerBackgroundColor || 'linear-gradient(135deg, #6e8efb, #a777e3)'
    };

    console.log('Применяемые стили:', headerStyle);
    console.log('Текущий фон:', settings.headerBackground);
    console.log('Путь к изображению:', settings.headerBackgroundImage);

    return (
        <header style={headerStyle} className="main-header">
            <div className="header-content">
                <h1>{settings.mainTitle}</h1>
                {settings.subTitle && <h2>{settings.subTitle}</h2>}
            </div>
        </header>
    );
};

export default Header; 