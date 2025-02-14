const { Profile, User, SiteSettings } = require('../models');
const City = require('../models/City');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const locationExceptions = require('../config/locationExceptions');
const geoLocationService = require('../services/geoLocationService');

// Функция для получения MD5-хеша файла
const getFileHash = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('md5');
        const stream = fs.createReadStream(filePath);
        stream.on('error', err => reject(err));
        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
    });
};

// Функция проверки дубликата фото
const checkPhotoDuplicate = async (photoPath) => {
    try {
        const photoHash = await getFileHash(photoPath);
        const existingProfile = await Profile.findOne({ 
            where: { photoHash: photoHash }
        });
        return existingProfile;
    } catch (error) {
        console.error('Ошибка при проверке дубликата фото:', error);
        return null;
    }
};

// Получение всех профилей (для админа)
exports.getAllProfiles = async (req, res) => {
    try {
        console.log('Получение всех профилей...');
        const profiles = await Profile.findAll({
            order: [['createdAt', 'DESC']]
        });
        console.log(`Найдено ${profiles.length} профилей`);
        res.json(profiles);
    } catch (error) {
        console.error('Ошибка при получении профилей:', error);
        res.status(500).json({ message: 'Ошибка при получении профилей' });
    }
};

// Получение одного профиля
exports.getProfile = async (req, res) => {
    try {
        const profile = await Profile.findByPk(req.params.id);
        if (!profile) {
            return res.status(404).json({ message: 'Профиль не найден' });
        }
        res.json(profile);
    } catch (error) {
        console.error('Ошибка при получении профиля:', error);
        res.status(500).json({ message: 'Ошибка при получении профиля' });
    }
};

// Получение контактов профиля
exports.getProfileContacts = async (req, res) => {
    try {
        const profile = await Profile.findByPk(req.params.id);
        if (!profile) {
            return res.status(404).json({ message: 'Профиль не найден' });
        }

        // Получаем настройки сайта
        const settings = await SiteSettings.getSettings();

        // Формируем контакты для рекламодателя
        const contacts = {
            telegram: settings.telegramLink || null,
            whatsapp: settings.whatsappLink || null,
            vk: settings.vkLink || null
        };

        res.json(contacts);
    } catch (error) {
        console.error('Ошибка при получении контактов профиля:', error);
        res.status(500).json({ message: 'Ошибка при получении контактов профиля' });
    }
};

// Создание профиля
exports.createProfile = async (req, res) => {
    try {
        console.log('Создание профиля, данные:', req.body);
        console.log('Файл:', req.file);

        const profileData = {
            name: req.body.name,
            age: parseInt(req.body.age),
            gender: req.body.gender,
            city: req.body.city || null,
            about: req.body.about || '',
            interests: req.body.interests || '',
            status: 'pending'
        };

        if (req.file) {
            profileData.photo = `/uploads/${req.file.filename}`;
        }

        console.log('Создаем профиль с данными:', profileData);

        const profile = await Profile.create(profileData);
        console.log('Профиль создан:', profile.toJSON());
        
        res.status(201).json(profile);
    } catch (error) {
        console.error('Ошибка при создании профиля:', error);
        res.status(500).json({
            message: 'Ошибка при создании профиля',
            error: error.message,
            stack: error.stack
        });
    }
};

// Обновление профиля
exports.updateProfile = async (req, res) => {
    try {
        console.log('Обновление профиля:', req.params.id);
        console.log('Данные для обновления:', req.body);
        console.log('Файл:', req.file);

        const profile = await Profile.findByPk(req.params.id);
        
        if (!profile) {
            return res.status(404).json({ 
                message: 'Профиль не найден' 
            });
        }

        const updateData = {
            name: req.body.name,
            age: parseInt(req.body.age),
            gender: req.body.gender,
            city: req.body.city || null,
            about: req.body.about || '',
            interests: req.body.interests || '',
            status: req.body.status || profile.status
        };

        // Обработка фото
        if (req.file) {
            // Удаляем старое фото, если оно есть
            if (profile.photo) {
                const oldPhotoPath = path.join(__dirname, '..', profile.photo);
                if (fs.existsSync(oldPhotoPath)) {
                    try {
                        fs.unlinkSync(oldPhotoPath);
                    } catch (error) {
                        console.error('Ошибка при удалении старого фото:', error);
                    }
                }
            }
            updateData.photo = `/uploads/${req.file.filename}`;
        }

        console.log('Данные для обновления:', updateData);

        await profile.update(updateData);
        
        // Получаем обновленный профиль
        const updatedProfile = await Profile.findByPk(req.params.id);
        console.log('Профиль обновлен:', updatedProfile.toJSON());
        
        res.json(updatedProfile);
    } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        res.status(500).json({
            message: 'Ошибка при обновлении профиля',
            error: error.message,
            stack: error.stack
        });
    }
};

// Обновление статуса профиля
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log(`Обновление статуса профиля ${id} на ${status}`);

        // Проверяем допустимые значения статуса
        if (!['active', 'pending', 'blocked'].includes(status)) {
            return res.status(400).json({
                message: 'Недопустимое значение статуса'
            });
        }

        const profile = await Profile.findByPk(id);
        
        if (!profile) {
            return res.status(404).json({
                message: 'Профиль не найден'
            });
        }

        await profile.update({ status });

        // Получаем обновленный профиль
        const updatedProfile = await Profile.findByPk(id);
        
        console.log('Статус профиля обновлен:', updatedProfile.toJSON());
        
        res.json(updatedProfile);
    } catch (error) {
        console.error('Ошибка при обновлении статуса профиля:', error);
        res.status(500).json({
            message: 'Ошибка при обновлении статуса профиля',
            error: error.message
        });
    }
};

// Удаление профиля
exports.deleteProfile = async (req, res) => {
    try {
        const profile = await Profile.findByPk(req.params.id);
        if (!profile) {
            return res.status(404).json({ message: 'Профиль не найден' });
        }

        // Удаляем фото профиля, если оно есть
        if (profile.photo) {
            const photoPath = path.join(__dirname, '..', profile.photo);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        await profile.destroy();
        res.json({ message: 'Профиль успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении профиля:', error);
        res.status(500).json({ message: 'Ошибка при удалении профиля' });
    }
};

// Загрузка фото
exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не загружен' });
        }
        res.json({ 
            photo: `/uploads/${req.file.filename}`,
            message: 'Фото успешно загружено'
        });
    } catch (error) {
        console.error('Ошибка при загрузке фото:', error);
        res.status(500).json({ message: 'Ошибка при загрузке фото' });
    }
};

// Получение публичных профилей с учетом геолокации
exports.getPublicProfiles = async (req, res) => {
    try {
        // Получаем IP пользователя
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log('IP пользователя:', ip);

        // Определяем город пользователя
        const locationData = await geoLocationService.getCityByIp(ip);
        console.log('Данные геолокации:', locationData);

        let cityName = null;
        if (locationData) {
            // Если пользователь не в областном центре, используем областной центр
            cityName = locationData.isRegionalCenter ? 
                locationData.city : 
                locationData.regionalCenter;
        }

        // Проверяем, активен ли город в нашей системе
        let city = null;
        if (cityName) {
            city = await City.findOne({
                where: { 
                    name: cityName,
                    status: 'active'
                }
            });
        }

        // Получаем профили
        const profiles = await Profile.findAll({
            where: {
                status: 'active',
                ...(city ? { city: city.name } : {})
            },
            order: [['createdAt', 'DESC']]
        });

        // Добавляем информацию о геолокации в ответ
        res.json({
            profiles,
            location: locationData ? {
                city: locationData.city,
                region: locationData.region,
                isRegionalCenter: locationData.isRegionalCenter,
                regionalCenter: locationData.regionalCenter
            } : null
        });
    } catch (error) {
        console.error('Ошибка при получении профилей:', error);
        res.status(500).json({ message: 'Ошибка при получении профилей' });
    }
};

// Получение всех анкет (для админа)
exports.getAllProfiles = async (req, res) => {
    try {
        const profiles = await Profile.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(profiles);
    } catch (error) {
        console.error('Ошибка при получении анкет:', error);
        res.status(500).json({ message: 'Ошибка при получении анкет' });
    }
};

// Получение публичных анкет
exports.getPublicProfiles = async (req, res) => {
    try {
        const { city } = req.query;
        
        let whereClause = {
            status: 'active'
        };

        if (city) {
            whereClause.city = city;
        }

        // Получаем активные города
        const activeCities = await City.findAll({
            where: { status: 'active' },
            order: [['name', 'ASC']]
        });

        // Если город не определен, возвращаем пустой список и список активных городов
        if (!city) {
            console.log('Город не определен');
            return res.json({
                profiles: [],
                cities: activeCities.map(city => ({
                    name: city.name,
                    isActive: true
                })),
                total: 0,
                message: 'Не удалось определить город'
            });
        }

        // Проверяем, находится ли город в исключениях
        if (locationExceptions[city]) {
            console.log('Город находится в исключениях:', city);
            return res.json({
                profiles: [],
                city: {
                    name: city,
                    isActive: false,
                    message: locationExceptions[city].message
                },
                total: 0
            });
        }

        // Ищем город в базе данных
        const targetCity = await City.findOne({ 
            where: { name: city }
        });
        console.log('Найден город:', targetCity);

        if (!targetCity || targetCity.status !== 'active') {
            console.log('Город неактивен или не найден:', city);
            return res.json({
                profiles: [],
                city: {
                    name: city,
                    isActive: false,
                    message: 'Сервис пока не доступен в этом городе'
                },
                total: 0
            });
        }

        // Получаем все активные анкеты для указанного города
        const profiles = await Profile.findAll({ 
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
        
        console.log('Найдено анкет:', profiles.length);

        res.json({
            profiles,
            city: {
                name: targetCity.name,
                isActive: true
            },
            total: profiles.length
        });
    } catch (error) {
        console.error('Ошибка при получении публичных анкет:', error);
        res.status(500).json({ message: 'Ошибка при получении анкет' });
    }
}; 