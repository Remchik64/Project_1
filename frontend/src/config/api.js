// Настройка axios по умолчанию
import axios from 'axios';

// Базовый URL для API
export const API_BASE_URL = 'http://localhost:3001';

// Функция для формирования полного URL API
export const getApiUrl = (path) => {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${path}`;
};

// Функция для формирования полного URL для медиа-файлов
export const getMediaUrl = (path) => 
    path ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${path}` : null;

// Добавляем перехватчик для добавления токена к запросам
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Добавляем перехватчик для обработки ошибок
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            // Если сервер вернул ошибку 401 (неавторизован), очищаем токен
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/';
            }
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        return Promise.reject(error);
    }
); 