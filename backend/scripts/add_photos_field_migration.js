const path = require('path');
const fs = require('fs');
const sequelize = require('../config/database');

// Функция для выполнения миграций с помощью прямого SQL-запроса
async function runMigration() {
    console.log('Запуск миграции для добавления поля photos...');

    try {
        // Аутентификация в базе
        await sequelize.authenticate();
        console.log('Успешное подключение к базе данных');

        // Проверяем, существует ли колонка photos
        try {
            await sequelize.query('SELECT photos FROM Profiles LIMIT 1');
            console.log('Поле photos уже существует в таблице Profiles');
        } catch (error) {
            // Если возникает ошибка, значит колонка не существует
            console.log('Добавление поля photos в таблицу Profiles...');
            
            await sequelize.query(`
                ALTER TABLE Profiles 
                ADD COLUMN photos JSON DEFAULT '[]'
            `);
            
            console.log('Поле photos успешно добавлено в таблицу Profiles');
        }

        console.log('Миграция успешно выполнена');
        process.exit(0);
    } catch (error) {
        console.error('Ошибка при выполнении миграции:', error);
        process.exit(1);
    }
}

// Запуск миграций
runMigration(); 