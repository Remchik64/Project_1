const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Получение журнала аудита действий администратора
 * С возможностью фильтрации и пагинации
 */
exports.getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, userId, action, startDate, endDate } = req.query;
        const offset = (page - 1) * limit;
        
        // Подготавливаем условия фильтрации
        const where = {};
        
        if (userId) {
            where.userId = userId;
        }
        
        if (action) {
            where.action = action;
        }
        
        // Фильтрация по дате
        if (startDate || endDate) {
            where.createdAt = {};
            
            if (startDate) {
                where.createdAt[Op.gte] = new Date(startDate);
            }
            
            if (endDate) {
                where.createdAt[Op.lte] = new Date(endDate);
            }
        }
        
        // Получаем записи с пагинацией
        const { count, rows } = await AuditLog.findAndCountAll({
            where,
            include: [{
                model: User,
                attributes: ['id', 'email', 'role']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        // Форматируем ответ с метаданными пагинации
        res.json({
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            logs: rows
        });
    } catch (error) {
        console.error('Ошибка при получении журнала аудита:', error);
        res.status(500).json({ 
            message: 'Ошибка при получении журнала аудита',
            error: error.message
        });
    }
};

/**
 * Получение списка уникальных действий для фильтрации
 */
exports.getAuditActions = async (req, res) => {
    try {
        const actions = await AuditLog.findAll({
            attributes: ['action'],
            group: ['action'],
            order: [['action', 'ASC']]
        });
        
        res.json(actions.map(item => item.action));
    } catch (error) {
        console.error('Ошибка при получении списка действий:', error);
        res.status(500).json({ 
            message: 'Ошибка при получении списка действий',
            error: error.message
        });
    }
}; 