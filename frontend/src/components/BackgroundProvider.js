import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';

const BackgroundProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);

    const updateBackground = (data) => {
        console.log('Обновление фона с данными:', data);
        
        if (data.siteBackground === 'image' && data.siteBackgroundImage) {
            const imageUrl = data.siteBackgroundImage.startsWith('http') 
                ? data.siteBackgroundImage 
                : `http://localhost:5000${data.siteBackgroundImage}`;
                
            console.log('Применяем фоновое изображение:', imageUrl);
            
            document.body.style.backgroundImage = `url(${imageUrl})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundColor = '#f5f5f5';
        } else {
            console.log('Применяем цветовой фон:', data.siteBackgroundColor);
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = data.siteBackgroundColor || '#f5f5f5';
        }

        console.log('Применены настройки фона:', {
            type: data.siteBackground,
            image: data.siteBackgroundImage,
            color: data.siteBackgroundColor
        });
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(getApiUrl('/api/site-settings'));
                setSettings(response.data);
                updateBackground(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке настроек фона:', error);
                document.body.style.backgroundImage = 'none';
                document.body.style.backgroundColor = '#f5f5f5';
            }
        };

        const handleSettingsUpdate = () => {
            console.log('Получено событие обновления настроек');
            fetchSettings();
        };

        // Подписываемся на событие обновления настроек
        window.addEventListener('settingsUpdated', handleSettingsUpdate);

        fetchSettings();

        return () => {
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = '#f5f5f5';
            window.removeEventListener('settingsUpdated', handleSettingsUpdate);
        };
    }, []);

    return <>{children}</>;
};

export default BackgroundProvider; 