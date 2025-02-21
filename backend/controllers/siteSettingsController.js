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
        console.log('Получены данные:', req.body);
        console.log('Загруженный файл:', req.file);

        const settings = await SiteSettings.findOne();
        if (!settings) {
            return res.status(404).json({ message: 'Настройки не найдены' });
        }

        // Если загружен новый файл, обновляем путь к изображению
        if (req.file) {
            // Добавляем слеш перед путем для правильного URL
            const imagePath = '/uploads/' + req.file.filename;
            console.log('Сохраняемый путь к изображению:', imagePath);
            req.body.headerBackgroundImage = imagePath;
        }

        await settings.update(req.body);
        const updatedSettings = await SiteSettings.findOne();
        
        console.log('Обновленные настройки:', updatedSettings.toJSON());
        res.json(updatedSettings);
    } catch (error) {
        console.error('Ошибка при обновлении настроек:', error);
        res.status(500).json({ message: 'Ошибка при обновлении настроек', error: error.message });
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