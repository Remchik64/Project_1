const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { hashPassword, verifyPassword } = require('../services/passwordService');

// Регистрация нового пользователя
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Хешируем пароль с улучшенным алгоритмом
        const hashedPassword = await hashPassword(password);

        // Создаем пользователя
        const user = await User.create({
            email,
            password: hashedPassword,
            role: 'user'
        });

        // Создаем токен
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ message: 'Ошибка при регистрации' });
    }
};

// Вход пользователя
exports.login = async (req, res) => {
    try {
        console.log('Попытка входа:', req.body);
        const { email, password } = req.body;

        // Ищем пользователя
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('Пользователь не найден');
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Проверяем пароль с улучшенной функцией
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            console.log('Неверный пароль');
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Создаем токен
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Успешный вход:', { id: user.id, email: user.email, role: user.role });
        console.log('Сгенерированный токен:', token);
        console.log('Данные пользователя для отправки:', {
            id: user.id,
            email: user.email,
            role: user.role
        });
        
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Ошибка при входе:', error);
        res.status(500).json({ message: 'Ошибка при входе' });
    }
};

// Получение текущего пользователя
exports.getCurrentUser = async (req, res) => {
    try {
        console.log('Получение текущего пользователя...');
        console.log('Данные пользователя из токена:', req.user);
        
        const user = await User.findByPk(req.user.userId, {
            attributes: ['id', 'email', 'role']
        });
        
        if (!user) {
            console.log('Пользователь не найден в базе данных');
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        console.log('Пользователь найден:', user.toJSON());
        res.json(user);
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
        res.status(500).json({ message: 'Ошибка при получении пользователя' });
    }
};

// Middleware для проверки аутентификации
exports.requireAuth = async (req, res, next) => {
    try {
        console.log('Проверка аутентификации...');
        console.log('Заголовки запроса:', req.headers);
        
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Заголовок авторизации отсутствует или имеет неверный формат');
            return res.status(401).json({ message: 'Требуется авторизация' });
        }

        const token = authHeader.split(' ')[1];
        console.log('Токен получен, проверка...');
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Токен декодирован:', decoded);
        
        req.user = decoded;
        console.log('Аутентификация пройдена успешно');
        next();
    } catch (error) {
        console.error('Ошибка аутентификации:', error);
        res.status(401).json({ message: 'Недействительный токен' });
    }
};

// Middleware для проверки роли администратора
exports.requireAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Требуется авторизация' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        res.status(401).json({ message: 'Недействительный токен' });
    }
};

// Изменение пароля пользователя (для любого пользователя)
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        // Проверки на корректность ввода
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Текущий и новый пароли обязательны' });
        }

        // Проверка надежности нового пароля
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Новый пароль должен содержать минимум 8 символов' });
        }

        // Находим пользователя
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Проверяем текущий пароль
        const isPasswordValid = await verifyPassword(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Неверный текущий пароль' });
        }

        // Хешируем новый пароль
        const hashedPassword = await hashPassword(newPassword);

        // Обновляем пароль
        user.password = hashedPassword;
        await user.save();

        // Логирование для безопасности (но без паролей)
        console.log(`Пароль изменен для пользователя: ${user.email}`);

        res.json({ message: 'Пароль успешно изменен' });
    } catch (error) {
        console.error('Ошибка при изменении пароля:', error);
        res.status(500).json({ message: 'Ошибка при изменении пароля' });
    }
};

// Изменение пароля администратора (только для пользователей с ролью admin)
exports.changeAdminPassword = async (req, res) => {
    try {
        // Проверка роли
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { adminEmail, currentPassword, newPassword } = req.body;

        // Проверки на корректность ввода
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Текущий и новый пароли обязательны' });
        }

        if (!adminEmail) {
            return res.status(400).json({ message: 'Email администратора обязателен' });
        }

        // Проверка надежности нового пароля
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Новый пароль должен содержать минимум 8 символов' });
        }

        // Находим администратора
        const admin = await User.findOne({ where: { email: adminEmail, role: 'admin' } });
        if (!admin) {
            return res.status(404).json({ message: 'Администратор не найден' });
        }

        // Проверяем текущий пароль
        const isPasswordValid = await verifyPassword(currentPassword, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Неверный текущий пароль' });
        }

        // Хешируем новый пароль
        const hashedPassword = await hashPassword(newPassword);

        // Обновляем пароль
        admin.password = hashedPassword;
        await admin.save();

        // Аудит действия (но без паролей!)
        console.log(`Пароль администратора изменен: ${adminEmail} (изменил: ${req.user.userId})`);

        res.json({ message: 'Пароль администратора успешно изменен' });
    } catch (error) {
        console.error('Ошибка при изменении пароля администратора:', error);
        res.status(500).json({ message: 'Ошибка при изменении пароля администратора' });
    }
}; 