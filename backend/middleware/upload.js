const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Настройка хранилища
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = path.join(__dirname, '..', 'uploads');
        console.log('Путь для загрузки:', uploadPath);
        
        if (!fs.existsSync(uploadPath)) {
            console.log('Создаем директорию:', uploadPath);
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'profile-' + uniqueSuffix + path.extname(file.originalname);
        console.log('Генерируем имя файла:', filename);
        cb(null, filename);
    }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
    console.log('Проверка файла:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype
    });

    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Разрешены только изображения (jpg, jpeg, png, gif)'), false);
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
}).fields([
    { name: 'photo', maxCount: 1 },
    { name: 'headerBackgroundImage', maxCount: 1 }
]);

// Middleware для загрузки фото профиля
const uploadProfilePhoto = (req, res, next) => {
    console.log('Начало обработки загрузки фото профиля');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Тело запроса:', req.body);
    
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Ошибка Multer при загрузке фото профиля:', {
                message: err.message,
                code: err.code,
                field: err.field,
                stack: err.stack
            });
            return res.status(400).json({
                message: 'Ошибка при загрузке фото',
                error: err.message,
                code: err.code,
                field: err.field
            });
        } else if (err) {
            console.error('Ошибка при загрузке фото профиля:', err);
            return res.status(400).json({
                message: 'Ошибка при загрузке фото',
                error: err.message
            });
        }
        
        // Проверяем, есть ли загруженные файлы
        if (!req.files || !req.files.photo) {
            console.log('Фото профиля не было загружено, продолжаем без фото');
            return next();
        }
        
        // Берем первый файл из массива photo
        req.file = req.files.photo[0];
        
        console.log('Фото профиля успешно загружено:', {
            originalname: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
        
        next();
    });
};

// Middleware для загрузки одного файла
const uploadMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
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
        
        if (!req.files || !req.files.headerBackgroundImage) {
            console.log('Файл не был загружен, продолжаем без файла');
            return next();
        }
        
        // Берем первый файл из массива headerBackgroundImage
        req.file = req.files.headerBackgroundImage[0];
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
    uploadProfilePhoto,
    optimizeImage
}; 