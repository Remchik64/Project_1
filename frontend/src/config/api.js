// Настройка axios по умолчанию
import axios from 'axios';

/**
 * Конфигурация API и утилиты для работы с URL
 */

/**
 * Получает базовый URL API из переменных окружения или использует значение по умолчанию
 * @returns {string} Базовый URL API
 */
export const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

/**
 * Формирует полный URL для API запроса
 * @param {string} path - Путь к API эндпоинту (должен начинаться с /)
 * @returns {string} Полный URL для API запроса
 */
export const getApiUrl = (path) => {
  return `${getApiBaseUrl()}${path}`;
};

/**
 * Формирует URL для медиа-файлов (изображений, документов и т.д.)
 * @param {string} path - Путь к медиа-файлу
 * @returns {string|null} Полный URL для медиа-файла или null, если путь не указан
 */
export const getMediaUrl = (path) => {
  if (!path) return null;
  
  // Если путь уже является полным URL (начинается с http:// или https://)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Если путь начинается с /, то это относительный путь от корня сервера
  return `${getApiBaseUrl()}${path}`;
};

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