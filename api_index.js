require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initializeDatabase } = require('./config/database');
require('./config/cron');
const https = require('https');

// ╨Ш╨╝╨┐╨╛╤А╤В ╨║╨╛╨╜╤В╤А╨╛╨╗╨╗╨╡╤А╨╛╨▓
const authController = require('./controllers/authController');
const profileController = require('./controllers/profileController');
const siteSettingsController = require('./controllers/siteSettingsController');
const { uploadMiddleware, optimizeImage } = require('./middleware/upload');

// ╨Ш╨╝╨┐╨╛╤А╤В ╤А╨╛╤Г╤В╨╛╨▓
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');
const cityRoutes = require('./routes/cityRoutes');

const app = express();

// ╨Э╨░╤Б╤В╤А╨╛╨╣╨║╨░ CORS
app.use(cors({
    origin: function(origin, callback) {
        // ╨а╨░╨╖╤А╨╡╤И╨░╨╡╨╝ ╨╖╨░╨┐╤А╨╛╤Б╤Л ╨▒╨╡╨╖ origin (╨╜╨░╨┐╤А╨╕╨╝╨╡╤А, ╨╛╤В ╨╝╨╛╨▒╨╕╨╗╤М╨╜╤Л╤Е ╨┐╤А╨╕╨╗╨╛╨╢╨╡╨╜╨╕╨╣)
        if (!origin) return callback(null, true);
        
        // ╨б╨┐╨╕╤Б╨╛╨║ ╤А╨░╨╖╤А╨╡╤И╨╡╨╜╨╜╤Л╤Е ╨┤╨╛╨╝╨╡╨╜╨╛╨▓
        const allowedOrigins = [
            'https://localhost:3000',
            'https://localhost:5000',
            'https://185.255.120.50',       // IP ╤Б╨╡╤А╨▓╨╡╤А╨░ ╤Б https
            'https://escort-bar.live',      // ╨Ю╤Б╨╜╨╛╨▓╨╜╨╛╨╣ ╨┤╨╛╨╝╨╡╨╜ ╤Б https
            'https://www.escort-bar.live',  // www ╤Б╤Г╨▒╨┤╨╛╨╝╨╡╨╜ ╤Б https
            process.env.FRONTEND_URL        // ╨С╨╡╤А╨╡╨╝ ╨╕╨╖ ╨┐╨╡╤А╨╡╨╝╨╡╨╜╨╜╨╛╨╣ ╨╛╨║╤А╤Г╨╢╨╡╨╜╨╕╤П, ╨╡╤Б╨╗╨╕ ╨╛╨╜╨░ ╨╖╨░╨┤╨░╨╜╨░
        ].filter(Boolean); // ╨г╨┤╨░╨╗╤П╨╡╨╝ ╨┐╤Г╤Б╤В╤Л╨╡ ╨╖╨╜╨░╤З╨╡╨╜╨╕╤П
        
        // ╨Ф╨╗╤П ╤А╨░╨╖╤А╨░╨▒╨╛╤В╨║╨╕ ╤А╨░╨╖╤А╨╡╤И╨░╨╡╨╝ ╨▓╤Б╨╡ ╨╕╤Б╤В╨╛╤З╨╜╨╕╨║╨╕
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log(`CORS ╨╛╤В╨║╨╗╨╛╨╜╨╡╨╜ ╨┤╨╗╤П origin: ${origin}`);
            callback(null, true); // ╨Т╤А╨╡╨╝╨╡╨╜╨╜╨╛ ╤А╨░╨╖╤А╨╡╤И╨░╨╡╨╝ ╨▓╤Б╨╡ ╨╖╨░╨┐╤А╨╛╤Б╤Л ╨┤╨╗╤П ╨╛╤В╨╗╨░╨┤╨║╨╕
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'X-Upload-Field']
}));

// ╨Я╨░╤А╤Б╨╕╨╜╨│ JSON
app.use(express.json());

// ╨Ы╨╛╨│╨╕╤А╨╛╨▓╨░╨╜╨╕╨╡ ╨╖╨░╨┐╤А╨╛╤Б╨╛╨▓
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// ╨б╤В╨░╤В╨╕╤З╨╡╤Б╨║╨╕╨╡ ╤Д╨░╨╣╨╗╤Л
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// ╨б╨╛╨╖╨┤╨░╨╡╨╝ ╨┐╨░╨┐╨║╨╕ ╨┤╨╗╤П ╨╖╨░╨│╤А╤Г╨╖╨╛╨║
const uploadsDir = path.join(__dirname, 'uploads');
const backgroundsDir = path.join(__dirname, 'uploads', 'backgrounds');

// ╨б╨╛╨╖╨┤╨░╨╡╨╝ ╨┤╨╕╤А╨╡╨║╤В╨╛╤А╨╕╨╕ ╤Б ╨┐╤А╨░╨▓╨╕╨╗╤М╨╜╤Л╨╝╨╕ ╨┐╤А╨░╨▓╨░╨╝╨╕ ╨┤╨╛╤Б╤В╤Г╨┐╨░
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o777 });
}
if (!fs.existsSync(backgroundsDir)) {
    fs.mkdirSync(backgroundsDir, { recursive: true, mode: 0o777 });
}

// ╨Ь╨░╤А╤И╤А╤Г╤В╤Л ╨░╤Г╤В╨╡╨╜╤В╨╕╤Д╨╕╨║╨░╤Ж╨╕╨╕
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.register);
app.get('/api/auth/me', authController.requireAuth, authController.getCurrentUser);
// ╨Ь╨░╤А╤И╤А╤Г╤В╤Л ╨┤╨╗╤П ╨╕╨╖╨╝╨╡╨╜╨╡╨╜╨╕╤П ╨┐╨░╤А╨╛╨╗╤П
app.post('/api/auth/change-password', authController.requireAuth, authController.changePassword);

// ╨Ь╨░╤А╤И╤А╤Г╤В╤Л ╨╕╨╖╨╝╨╡╨╜╨╡╨╜╨╕╤П ╨┐╨░╤А╨╛╨╗╤П ╨░╨┤╨╝╨╕╨╜╨╕╤Б╤В╤А╨░╤В╨╛╤А╨░ - ╤В╨╛╨╗╤М╨║╨╛ ╨▓ ╤А╨╡╨╢╨╕╨╝╨╡ ╤А╨░╨╖╤А╨░╨▒╨╛╤В╨║╨╕
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/auth/change-admin-password', authController.requireAdmin, authController.changeAdminPassword);
} else {
  // ╨Т ╨┐╤А╨╛╨┤╨░╨║╤И╨╡╨╜╨╡ ╨▓╨╛╨╖╨▓╤А╨░╤Й╨░╨╡╨╝ 404 ╨┤╨╗╤П ╨▒╨╡╨╖╨╛╨┐╨░╤Б╨╜╨╛╤Б╤В╨╕
  app.post('/api/auth/change-admin-password', (req, res) => {
    res.status(404).json({ message: '╨Ь╨░╤А╤И╤А╤Г╤В ╨╜╨╡ ╨╜╨░╨╣╨┤╨╡╨╜' });
  });
}

// ╨Ь╨░╤А╤И╤А╤Г╤В╤Л ╨┐╤А╨╛╤Д╨╕╨╗╨╡╨╣
app.get('/api/profiles', authController.requireAdmin, profileController.getAllProfiles);
app.get('/api/profiles/:id', authController.requireAdmin, profileController.getProfile);
app.post('/api/profiles', 
    authController.requireAdmin, 
    uploadMiddleware,
    (req, res, next) => {
        console.log('╨д╨░╨╣╨╗ ╨┐╨╛╨╗╤Г╤З╨╡╨╜:', req.file);
        next();
    },
    optimizeImage,
    (req, res, next) => {
        console.log('╨д╨░╨╣╨╗ ╨╛╨┐╤В╨╕╨╝╨╕╨╖╨╕╤А╨╛╨▓╨░╨╜');
        next();
    },
    profileController.createProfile
);
app.put('/api/profiles/:id', authController.requireAdmin, uploadMiddleware, optimizeImage, profileController.updateProfile);
app.patch('/api/profiles/:id/status', authController.requireAdmin, profileController.updateStatus);
app.delete('/api/profiles/:id', authController.requireAdmin, profileController.deleteProfile);

// ╨Ь╨░╤А╤И╤А╤Г╤В╤Л ╨┤╨╗╤П ╤Д╨╛╤В╨╛
app.post('/api/upload-photo', authController.requireAdmin, uploadMiddleware, optimizeImage, profileController.uploadPhoto);
app.post('/api/profiles/:id/photo', authController.requireAdmin, uploadMiddleware, optimizeImage, profileController.uploadPhoto);

// ╨Я╤Г╨▒╨╗╨╕╤З╨╜╤Л╨╡ ╨╝╨░╤А╤И╤А╤Г╤В╤Л
app.get('/api/public/profiles', profileController.getPublicProfiles);
app.get('/api/public/profiles/:id/contacts', profileController.getProfileContacts);

// ╨Ь╨░╤А╤И╤А╤Г╤В╤Л ╨╜╨░╤Б╤В╤А╨╛╨╡╨║ ╤Б╨░╨╣╤В╨░
app.use('/api/site-settings', siteSettingsRoutes);

// ╨Ь╨░╤А╤И╤А╤Г╤В╤Л ╨┤╨╗╤П ╨│╨╛╤А╨╛╨┤╨╛╨▓
app.use('/api/cities', cityRoutes);

// ╨Ю╨▒╤А╨░╨▒╨╛╤В╨║╨░ ╨╛╤И╨╕╨▒╨╛╨║
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: '╨Ю╤И╨╕╨▒╨║╨░ ╤Б╨╡╤А╨▓╨╡╤А╨░' });
});

const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 8080 : 5000);

// Запуск сервера
async function startServer() {
    try {
        console.log('Инициализация базы данных...');
        const dbInitialized = await initializeDatabase();
        
        if (!dbInitialized) {
            console.error('Ошибка инициализации базы данных');
            process.exit(1);
        }

        console.log(`Запуск сервера в режиме ${process.env.NODE_ENV || 'development'} на порту ${PORT}...`);
        
        // Путь к SSL-сертификатам
        const sslOptions = {
            key: fs.readFileSync('/etc/letsencrypt/live/escort-bar.live/privkey.pem'),
            cert: fs.readFileSync('/etc/letsencrypt/live/escort-bar.live/fullchain.pem')
        };

        const server = https.createServer(sslOptions, app).listen(PORT, () => {
            console.log(`HTTPS сервер запущен на порту ${PORT}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Порт ${PORT} уже используется.`);
                
                if (process.env.NODE_ENV === 'production') {
                    console.error('Перезапустите сервер через PM2: pm2 restart all');
                } else {
                    console.error('Попробуйте выполнить команду npm run free-port');
                }
                
                process.exit(1);
            } else {
                console.error('Ошибка при запуске сервера:', err);
                process.exit(1);
            }
        });

        // Обработка завершения работы
        process.on('SIGTERM', () => {
            console.log('Получен сигнал SIGTERM. Закрытие сервера...');
            server.close(() => {
                console.log('Сервер закрыт');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('Получен сигнал SIGINT. Закрытие сервера...');
            server.close(() => {
                console.log('Сервер закрыт');
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('Критическая ошибка:', error);
        process.exit(1);
    }
}

startServer();
