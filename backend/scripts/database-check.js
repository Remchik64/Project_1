const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Путь к базе данных
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Проверка существования файла базы данных
console.log('Проверка файла базы данных...');
if (!fs.existsSync(dbPath)) {
    console.log('Файл базы данных не существует. Создаем...');
    try {
        fs.writeFileSync(dbPath, '');
        console.log('Файл базы данных создан успешно.');
    } catch (error) {
        console.error('Ошибка создания файла базы данных:', error);
        process.exit(1);
    }
} else {
    console.log('Файл базы данных существует.');
}

// Инициализация Sequelize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: (msg) => console.log(`[SQL] ${msg}`)
});

// Функция проверки подключения
async function checkDatabase() {
    try {
        console.log('Попытка подключения к базе данных...');
        await sequelize.authenticate();
        console.log('Успешное подключение к базе данных');
        
        // Список всех моделей
        const models = [
            'User',
            'Profile',
            'City',
            'SiteSettings'
        ];

        // Синхронизация моделей
        for (const modelName of models) {
            try {
                const model = require(`../models/${modelName}`);
                await model.sync({ alter: true });
                console.log(`Модель ${modelName} синхронизирована`);
            } catch (modelError) {
                console.error(`Ошибка синхронизации модели ${modelName}:`, modelError);
            }
        }

        console.log('Все модели синхронизированы');
        process.exit(0);
    } catch (error) {
        console.error('Ошибка при проверке базы данных:', error);
        process.exit(1);
    }
}

checkDatabase();