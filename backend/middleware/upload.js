const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Настройка хранилища
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Определяем путь в зависимости от типа загружаемого файла
        let uploadPath = path.join(__dirname, '..', 'uploads');
        if (file.fieldname === 'headerBackgroundImage' || file.fieldname === 'siteBackgroundImage') {
            uploadPath = path.join(__dirname, '..', 'uploads', 'backgrounds');
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const prefix = file.fieldname === 'headerBackgroundImage' ? 'header-' : 
                      file.fieldname === 'siteBackgroundImage' ? 'bg-' : '';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
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
    const uploadSingle = upload.single('headerBackgroundImage');
    uploadSingle(req, res, (err) => {
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
        // Создаем временное имя файла
        const tempPath = req.file.path + '.temp';
        
        // Оптимизируем изображение и сохраняем во временный файл
        await sharp(req.file.path)
            .resize(1920, 1080, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 85 })
            .toFile(tempPath);

        // Удаляем оригинальный файл
        await fs.promises.unlink(req.file.path);
        
        // Переименовываем временный файл в оригинальный
        await fs.promises.rename(tempPath, req.file.path);
        
        next();
    } catch (error) {
        console.error('Ошибка при оптимизации изображения:', error);
        // Попытка очистить временные файлы в случае ошибки
        try {
            const tempPath = req.file.path + '.temp';
            if (await fs.promises.access(tempPath).then(() => true).catch(() => false)) {
                await fs.promises.unlink(tempPath);
            }
        } catch (cleanupError) {
            console.error('Ошибка при очистке временных файлов:', cleanupError);
        }
        
        return res.status(500).json({
            message: 'Ошибка при оптимизации изображения',
            error: error.message
        });
    }
};

module.exports = {
    uploadMiddleware,
    optimizeImage
}; 