const SiteSettings = require('../models/SiteSettings');
const fs = require('fs').promises;
const path = require('path');

// Получение настроек
exports.getSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create({});
        }
        res.json(settings);
    } catch (error) {
        console.error('Ошибка при получении настроек:', error);
        res.status(500).json({ message: 'Ошибка при получении настроек', error: error.message });
    }
};

// Обновление настроек
exports.updateSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        
        if (!settings) {
            settings = await SiteSettings.create({});
        }

        // Обновляем все поля из req.body
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                settings[key] = req.body[key];
            }
        });

        // Если есть новое изображение
        if (req.file) {
            const fieldName = req.file.fieldname;
            
            if (fieldName === 'headerBackgroundImage') {
                // Удаляем старое изображение шапки если оно существует
                if (settings.headerBackgroundImage) {
                    try {
                        const oldPath = path.join(__dirname, '..', settings.headerBackgroundImage.replace(/^\//, ''));
                        if (await fs.access(oldPath).then(() => true).catch(() => false)) {
                            await fs.unlink(oldPath);
                        }
                    } catch (error) {
                        console.warn('Ошибка при удалении старого фона шапки:', error.message);
                    }
                }
                settings.headerBackgroundImage = '/uploads/backgrounds/' + req.file.filename;
                settings.headerBackground = 'image';
            } else if (fieldName === 'siteBackground') {
                // Удаляем старое изображение фона если оно существует
                if (settings.siteBackgroundImage) {
                    try {
                        const oldPath = path.join(__dirname, '..', settings.siteBackgroundImage);
                        if (await fs.access(oldPath).then(() => true).catch(() => false)) {
                            await fs.unlink(oldPath);
                        }
                    } catch (error) {
                        console.error('Ошибка при удалении старого фона сайта:', error);
                    }
                }
                settings.siteBackgroundImage = '/uploads/' + req.file.filename;
                settings.siteBackground = 'image';
            }
        }

        await settings.save();
        res.json(settings);
    } catch (error) {
        console.error('Ошибка при обновлении настроек:', error);
        res.status(500).json({ 
            message: 'Ошибка при обновлении настроек', 
            error: error.message,
            stack: error.stack 
        });
    }
};

// Загрузка фонового изображения
exports.uploadBackground = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не был загружен' });
        }

        const settings = await SiteSettings.findOne();
        
        if (!settings) {
            return res.status(404).json({ message: 'Настройки не найдены' });
        }

        // Удаляем старое изображение если оно существует
        if (settings.siteBackgroundImage) {
            try {
                const oldPath = path.join(__dirname, '..', settings.siteBackgroundImage);
                if (await fs.access(oldPath).then(() => true).catch(() => false)) {
                    await fs.unlink(oldPath);
                }
            } catch (error) {
                console.error('Ошибка при удалении старого фона:', error);
            }
        }

        // Обновляем путь к фоновому изображению и тип фона
        settings.siteBackgroundImage = '/uploads/' + req.file.filename;
        settings.siteBackground = 'image';
        await settings.save();

        res.json({ 
            message: 'Фоновое изображение успешно загружено',
            path: settings.siteBackgroundImage,
            settings: settings
        });
    } catch (error) {
        console.error('Ошибка при загрузке фона:', error);
        res.status(500).json({ message: 'Ошибка при загрузке фонового изображения' });
    }
}; 