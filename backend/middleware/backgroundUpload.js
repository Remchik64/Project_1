const multer = require('multer');
const path = require('path');
const sharp = require('sharp');

// Настройка хранилища для фоновых изображений
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'bg-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Разрешены только изображения'), false);
    }
};

// Создаем middleware для загрузки
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

// Middleware для загрузки фонового изображения
const uploadBackground = (req, res, next) => {
    upload.single('siteBackground')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                message: 'Ошибка при загрузке файла',
                error: err.message
            });
        } else if (err) {
            return res.status(400).json({
                message: 'Ошибка при загрузке файла',
                error: err.message
            });
        }
        next();
    });
};

module.exports = uploadBackground; 