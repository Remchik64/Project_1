require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initializeDatabase } = require('./config/database');
require('./config/cron');

// Импорт контроллеров
const authController = require('./controllers/authController');
const profileController = require('./controllers/profileController');
const siteSettingsController = require('./controllers/siteSettingsController');
const { uploadMiddleware, optimizeImage } = require('./middleware/upload');

// Импорт роутов
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');
const cityRoutes = require('./routes/cityRoutes');

const app = express();

// Настройка CORS
app.use(cors({
    origin: function(origin, callback) {
        // Разрешаем запросы без origin (например, от мобильных приложений)
        if (!origin) return callback(null, true);
        
        // Список разрешенных доменов
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5000',
            'http://185.255.120.50',        // IP сервера
            'https://185.255.120.50',       // IP сервера с https
            'http://escort-bar.live',       // Основной домен
            'https://escort-bar.live',      // Основной домен с https
            'http://www.escort-bar.live',   // www субдомен
            'https://www.escort-bar.live',  // www субдомен с https
            process.env.FRONTEND_URL        // Берем из переменной окружения, если она задана
        ].filter(Boolean); // Удаляем пустые значения
        
        // Для разработки разрешаем все источники
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log(`CORS отклонен для origin: ${origin}`);
            callback(null, true); // Временно разрешаем все запросы для отладки
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'X-Upload-Field']
}));

// Парсинг JSON
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Создаем папки для загрузок
const uploadsDir = path.join(__dirname, 'uploads');
const backgroundsDir = path.join(__dirname, 'uploads', 'backgrounds');

// Создаем директории с правильными правами доступа
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o777 });
}
if (!fs.existsSync(backgroundsDir)) {
    fs.mkdirSync(backgroundsDir, { recursive: true, mode: 0o777 });
}

// Маршруты аутентификации
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.register);
app.get('/api/auth/me', authController.requireAuth, authController.getCurrentUser);

// Маршруты профилей
app.get('/api/profiles', authController.requireAdmin, profileController.getAllProfiles);
app.get('/api/profiles/:id', authController.requireAdmin, profileController.getProfile);
app.post('/api/profiles', 
    authController.requireAdmin, 
    uploadMiddleware,
    (req, res, next) => {
        console.log('Файл получен:', req.file);
        next();
    },
    optimizeImage,
    (req, res, next) => {
        console.log('Файл оптимизирован');
        next();
    },
    profileController.createProfile
);
app.put('/api/profiles/:id', authController.requireAdmin, uploadMiddleware, optimizeImage, profileController.updateProfile);
app.patch('/api/profiles/:id/status', authController.requireAdmin, profileController.updateStatus);
app.delete('/api/profiles/:id', authController.requireAdmin, profileController.deleteProfile);

// Маршруты для фото
app.post('/api/upload-photo', authController.requireAdmin, uploadMiddleware, optimizeImage, profileController.uploadPhoto);
app.post('/api/profiles/:id/photo', authController.requireAdmin, uploadMiddleware, optimizeImage, profileController.uploadPhoto);

// Публичные маршруты
app.get('/api/public/profiles', profileController.getPublicProfiles);
app.get('/api/public/profiles/:id/contacts', profileController.getProfileContacts);

// Маршруты настроек сайта
app.use('/api/site-settings', siteSettingsRoutes);

// Маршруты для городов
app.use('/api/cities', cityRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Ошибка сервера' });
});

const PORT = process.env.PORT || 5000;

// Запуск сервера
async function startServer() {
    try {
        console.log('Инициализация базы данных...');
        const dbInitialized = await initializeDatabase();
        
        if (!dbInitialized) {
            console.error('Ошибка инициализации базы данных');
            process.exit(1);
        }

        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
    } catch (error) {
        console.error('Критическая ошибка:', error);
        process.exit(1);
    }
}

startServer();