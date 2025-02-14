const fs = require('fs');
const path = require('path');

// Функция для создания директории, если она не существует
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Создана директория: ${dirPath}`);
    }
};

// Инициализация всех необходимых директорий
const initializeDirectories = () => {
    const rootDir = path.join(__dirname, '..');
    
    // Основная директория для загрузок
    const uploadsDir = path.join(rootDir, 'uploads');
    ensureDirectoryExists(uploadsDir);

    // Директория для фоновых изображений
    const backgroundsDir = path.join(uploadsDir, 'backgrounds');
    ensureDirectoryExists(backgroundsDir);

    // Директория для фотографий профилей
    const profilesDir = path.join(uploadsDir, 'profiles');
    ensureDirectoryExists(profilesDir);

    console.log('Все необходимые директории созданы или уже существуют');
};

module.exports = {
    initializeDirectories
}; 