const { AuditLog } = require('../models');

/**
 * Middleware для аудита действий администратора
 * Записывает действия админов в журнал аудита
 */
const auditLogger = (req, res, next) => {
    // Сохраняем исходный метод end для перехвата ответа
    const originalEnd = res.end;
    const originalJson = res.json;
    
    // Получаем данные о пользователе и запросе
    // Пользователь может прийти из разных middleware
    const userId = req.user?.userId || req.user?.id;
    const ipAddress = req.headers['x-forwarded-for'] || req.ip;
    const userAgent = req.headers['user-agent'];
    
    // Определяем действие на основе URL и метода
    let action = `${req.method} ${req.path}`;
    
    // Расширяем метод end для перехвата ответа
    res.end = function(...args) {
        // Вызываем оригинальный метод
        originalEnd.apply(res, args);
        
        // Логируем только успешные действия (коды 2xx)
        if (res.statusCode >= 200 && res.statusCode < 300 && userId) {
            // Подготавливаем детали действия
            const details = {
                params: req.params,
                query: req.query,
                body: req.body,
                statusCode: res.statusCode
            };
            
            // Специальная обработка действий по типам
            if (req.path.includes('/profiles') && req.method === 'PUT') {
                action = 'Обновление профиля';
                if (req.body.status === 'active') {
                    action = 'Активация профиля';
                } else if (req.body.status === 'blocked') {
                    action = 'Блокировка профиля';
                }
            } else if (req.path.includes('/profiles') && req.method === 'DELETE') {
                action = 'Удаление профиля';
            } else if (req.path.includes('/auth/login') && req.method === 'POST') {
                action = 'Вход в систему';
            }
            
            // Записываем в журнал аудита
            AuditLog.create({
                userId: userId,
                action: action,
                details: JSON.stringify(details, null, 2),
                ipAddress: ipAddress,
                userAgent: userAgent
            }).catch(err => {
                console.error('Ошибка при логировании аудита:', err);
            });
        }
    };
    
    // Перехватываем res.json для более точного логирования
    res.json = function(obj) {
        // Сохраняем результат в res.locals для доступа в res.end
        res.locals.jsonResponse = obj;
        return originalJson.call(this, obj);
    };
    
    next();
};

module.exports = auditLogger; 