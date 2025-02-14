const multer = require('multer');
const path = require('path');
const sharp = require('sharp');

// Настройка хранилища
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
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

// Middleware для загрузки одного файла
const uploadMiddleware = (req, res, next) => {
    const uploadField = upload.single('photo');
    uploadField(req, res, (err) => {
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

// Middleware для оптимизации изображений
const optimizeImage = async (req, res, next) => {
    if (!req.file) return next();

    try {
        const optimized = await sharp(req.file.path)
            .resize(800)
            .jpeg({ quality: 80 })
            .toBuffer();

        await sharp(optimized).toFile(req.file.path);
        next();
    } catch (error) {
        console.error('Ошибка при оптимизации изображения:', error);
        next(error);
    }
};

module.exports = {
    uploadMiddleware,
    optimizeImage
}; 