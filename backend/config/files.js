const path = require('path');

// Базовые пути для файлов
const PATHS = {
    uploads: path.join(__dirname, '..', 'uploads'),
    profiles: path.join(__dirname, '..', 'uploads', 'profiles'),
    backgrounds: path.join(__dirname, '..', 'uploads', 'backgrounds')
};

// Конфигурация для разных типов файлов
const FILE_TYPES = {
    profile: {
        path: PATHS.profiles,
        prefix: 'profile-',
        field: 'photo',
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    },
    background: {
        path: PATHS.backgrounds,
        prefix: 'bg-',
        field: 'headerBackgroundImage',
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    }
};

// Конфигурация оптимизации изображений
const IMAGE_OPTIMIZATION = {
    profile: {
        width: 800,
        height: null,
        quality: 80,
        fit: 'inside'
    },
    background: {
        width: 1920,
        height: null,
        quality: 80,
        fit: 'inside'
    }
};

// Функция для получения конфигурации по типу файла
const getFileConfig = (type) => FILE_TYPES[type] || FILE_TYPES.profile;

// Функция для получения конфигурации оптимизации
const getOptimizationConfig = (type) => IMAGE_OPTIMIZATION[type] || IMAGE_OPTIMIZATION.profile;

// Функция для получения относительного пути
const getRelativePath = (absolutePath) => {
    return path.relative(path.join(__dirname, '..'), absolutePath)
        .split(path.sep)
        .join('/');
};

module.exports = {
    PATHS,
    FILE_TYPES,
    IMAGE_OPTIMIZATION,
    getFileConfig,
    getOptimizationConfig,
    getRelativePath
}; 