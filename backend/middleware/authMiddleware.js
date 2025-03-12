const jwt = require('jsonwebtoken');

// Проверка токена
exports.verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Токен не предоставлен' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Ошибка верификации токена:', error);
        return res.status(401).json({ message: 'Недействительный токен' });
    }
};

// Проверка роли админа
exports.isAdmin = (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }
        next();
    } catch (error) {
        console.error('Ошибка проверки роли:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Проверка аутентификации
exports.requireAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Требуется аутентификация' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Ошибка аутентификации:', error);
        return res.status(401).json({ message: 'Ошибка аутентификации' });
    }
};

// Проверка роли админа (для старых маршрутов)
exports.requireAdmin = (req, res, next) => {
    try {
        console.log('Проверка прав администратора...');
        console.log('Заголовки запроса:', req.headers);
        
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            console.log('Токен не предоставлен');
            return res.status(401).json({ message: 'Требуется аутентификация' });
        }

        console.log('Токен получен, проверка...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Токен декодирован:', decoded);
        
        if (decoded.role !== 'admin') {
            console.log('Доступ запрещен: роль пользователя не admin, а', decoded.role);
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        console.log('Проверка прав администратора пройдена успешно');
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Ошибка проверки прав админа:', error);
        return res.status(401).json({ message: 'Ошибка аутентификации' });
    }
}; 