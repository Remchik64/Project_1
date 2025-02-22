const { Profile, User, SiteSettings } = require('../models');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

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
        console.log('Начало создания профиля');
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
        console.log('File:', req.file);
        console.log('Files:', req.files);

        // Валидация входных данных
        if (!req.body.name || !req.body.age || !req.body.gender) {
            console.log('Отсутствуют обязательные поля:', {
                name: !req.body.name,
                age: !req.body.age,
                gender: !req.body.gender
            });
            return res.status(400).json({
                message: 'Не все обязательные поля заполнены',
                requiredFields: {
                    name: !req.body.name,
                    age: !req.body.age,
                    gender: !req.body.gender
                }
            });
        }

        // Проверка возраста
        const age = parseInt(req.body.age);
        if (isNaN(age) || age < 18 || age > 100) {
            console.log('Некорректный возраст:', req.body.age);
            return res.status(400).json({
                message: 'Некорректный возраст. Допустимый возраст от 18 до 100 лет'
            });
        }

        // Проверка пола
        if (!['Мужской', 'Женский'].includes(req.body.gender)) {
            console.log('Некорректное значение пола:', req.body.gender);
            return res.status(400).json({
                message: 'Некорректное значение пола. Допустимые значения: Мужской, Женский'
            });
        }

        const profileData = {
            name: req.body.name,
            age: age,
            gender: req.body.gender,
            about: req.body.about || '',
            interests: req.body.interests || '',
            height: req.body.height ? parseInt(req.body.height) : null,
            weight: req.body.weight ? parseInt(req.body.weight) : null,
            phone: req.body.phone || '',
            status: 'pending'
        };

        // Добавляем фото, если оно есть
        if (req.files && req.files.photo && req.files.photo[0]) {
            const photoFile = req.files.photo[0];
            console.log('Обработка загруженного файла:', {
                originalname: photoFile.originalname,
                filename: photoFile.filename,
                path: photoFile.path,
                mimetype: photoFile.mimetype,
                size: photoFile.size
            });
            
            // Формируем URL для фото
            const photoUrl = `/uploads/${photoFile.filename}`;
            profileData.photo = photoUrl;
            console.log('Добавлено фото:', photoUrl);
        } else {
            console.log('Файл не был загружен');
        }

        console.log('Создаем профиль с данными:', profileData);

        const profile = await Profile.create(profileData);
        console.log('Профиль успешно создан:', profile.toJSON());
        
        res.status(201).json({
            message: 'Профиль успешно создан',
            profile: profile
        });
    } catch (error) {
        console.error('Ошибка при создании профиля:', error);
        
        // Если произошла ошибка, пытаемся удалить загруженный файл
        if (req.files && req.files.photo && req.files.photo[0]) {
            try {
                await fs.promises.unlink(req.files.photo[0].path);
                console.log('Загруженный файл удален после ошибки');
            } catch (unlinkError) {
                console.error('Ошибка при удалении файла:', unlinkError);
            }
        }

        res.status(500).json({
            message: 'Ошибка при создании профиля',
            error: error.message
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
            about: req.body.about || '',
            interests: req.body.interests || '',
            status: req.body.status || profile.status,
            height: req.body.height ? parseInt(req.body.height) : null,
            weight: req.body.weight ? parseInt(req.body.weight) : null,
            phone: req.body.phone || ''
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

// Получение публичных профилей
exports.getPublicProfiles = async (req, res) => {
    try {
        // Получаем все активные анкеты
        const profiles = await Profile.findAll({ 
            where: {
                status: 'active'
            },
            attributes: ['id', 'name', 'age', 'gender', 'photo', 'about', 'interests', 'height', 'weight', 'phone'],
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            profiles,
            total: profiles.length
        });
    } catch (error) {
        console.error('Ошибка при получении публичных анкет:', error);
        res.status(500).json({ message: 'Ошибка при получении анкет' });
    }
}; 