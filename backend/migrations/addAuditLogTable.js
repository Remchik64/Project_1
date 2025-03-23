/**
 * Миграция для добавления таблицы аудита (AuditLogs)
 */
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

// Функция для запуска миграции
async function runMigration() {
    console.log('Запуск миграции для создания таблицы аудита...');

    // Подключение к базе данных
    const dbPath = path.join(__dirname, '..', 'database.sqlite');
    
    // Проверяем наличие файла базы данных
    if (!fs.existsSync(dbPath)) {
        console.error('Файл базы данных не найден:', dbPath);
        return;
    }

    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: dbPath,
        logging: false
    });

    try {
        // Проверяем соединение
        await sequelize.authenticate();
        console.log('Подключение к БД установлено');
        
        // Получаем интерфейс для выполнения запросов
        const queryInterface = sequelize.getQueryInterface();
        
        // Проверяем, существует ли уже таблица AuditLogs
        const tables = await queryInterface.showAllTables();
        
        if (tables.includes('AuditLogs')) {
            console.log('Таблица AuditLogs уже существует');
            return;
        }
        
        // Создаем таблицу AuditLogs
        await queryInterface.createTable('AuditLogs', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'id'
                }
            },
            action: {
                type: Sequelize.STRING,
                allowNull: false
            },
            details: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            ipAddress: {
                type: Sequelize.STRING,
                allowNull: true
            },
            userAgent: {
                type: Sequelize.STRING,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
        
        // Создаем индекс для ускорения выборок по userId
        await queryInterface.addIndex('AuditLogs', ['userId']);
        // Создаем индекс для ускорения выборок по дате создания
        await queryInterface.addIndex('AuditLogs', ['createdAt']);
        
        console.log('Таблица AuditLogs успешно создана');
        
    } catch (error) {
        console.error('Ошибка при выполнении миграции:', error);
    } finally {
        // Закрываем соединение
        await sequelize.close();
    }
}

// Запускаем миграцию
runMigration(); 