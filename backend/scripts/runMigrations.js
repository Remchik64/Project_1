const path = require('path');
const fs = require('fs');
const sequelize = require('../config/database');

// Функция для выполнения миграций с помощью прямого SQL-запроса
async function runMigration() {
    console.log('Запуск миграции для добавления поля verified...');

    try {
        // Аутентификация в базе
        await sequelize.authenticate();
        console.log('Успешное подключение к базе данных');

        // Проверяем, существует ли колонка verified
        const queryInterface = sequelize.getQueryInterface();
        try {
            await sequelize.query('SELECT verified FROM Profiles LIMIT 1');
            console.log('Поле verified уже существует в таблице Profiles');
        } catch (error) {
            // Если возникает ошибка, значит колонка не существует
            console.log('Добавление поля verified в таблицу Profiles...');
            
            await sequelize.query(`
                ALTER TABLE Profiles 
                ADD COLUMN verified BOOLEAN NOT NULL DEFAULT 0
            `);
            
            console.log('Поле verified успешно добавлено в таблицу Profiles');
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