const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Настройка хранилища
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Определяем путь в зависимости от типа загружаемого файла
        let uploadPath = path.join(__dirname, '..', 'uploads');
        
        // Создаем директорию, если она не существует
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true, mode: 0o777 });
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Разрешены только изображения (jpg, jpeg, png, gif)'), false);
    }
    if (file.size > 50 * 1024 * 1024) {
        return cb(new Error('Размер файла не должен превышать 50MB'), false);
    }
    cb(null, true);
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
    const uploadSingle = upload.single('photo');
    
    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Ошибка Multer при загрузке файла:', err);
            return res.status(400).json({
                message: 'Ошибка при загрузке файла',
                error: err.message
            });
        } else if (err) {
            console.error('Ошибка при загрузке файла:', err);
            return res.status(400).json({
                message: 'Ошибка при загрузке файла',
                error: err.message
            });
        }
        
        // Если файл не был загружен, просто продолжаем
        if (!req.file) {
            console.log('Файл не был загружен, продолжаем без файла');
            return next();
        }
        
        console.log('Файл успешно загружен:', req.file);
        next();
    });
};

// Middleware для оптимизации изображений
const optimizeImage = async (req, res, next) => {
    if (!req.file) {
        console.log('Нет файла для оптимизации');
        return next();
    }

    try {
        console.log('Начинаем оптимизацию файла:', req.file.path);
        
        // Создаем временное имя файла
        const tempPath = req.file.path + '.temp';
        
        // Оптимизируем изображение и сохраняем во временный файл
        await sharp(req.file.path)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toFile(tempPath);

        // Удаляем оригинальный файл
        await fs.promises.unlink(req.file.path);
        
        // Переименовываем временный файл в оригинальный
        await fs.promises.rename(tempPath, req.file.path);
        
        console.log('Файл успешно оптимизирован');
        next();
    } catch (error) {
        console.error('Ошибка при оптимизации изображения:', error);
        
        // Попытка очистить временные файлы
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