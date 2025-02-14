const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const path = require('path');

// Инициализация Sequelize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: (msg) => console.log(`[SQL] ${msg}`)
});

// Функция инициализации базы данных
async function initializeDatabase() {
    try {
        // Аутентификация
        await sequelize.authenticate();
        console.log('Успешное подключение к базе данных');

        // Импортируем модели
        const User = require('../models/User');
        const SiteSettings = require('../models/SiteSettings');

        // Добавляем проверку существующих таблиц
        const checkExistingTables = async () => {
            try {
                const queryInterface = sequelize.getQueryInterface();
                const tables = await queryInterface.showAllTables();
                
                if (tables.length === 0) {
                    console.log('Таблицы не найдены. Создаю новые таблицы...');
                    await sequelize.sync({ force: true });
                    console.log('Таблицы успешно созданы');
                } else {
                    console.log('Таблицы уже существуют. Синхронизирую изменения...');
                    await sequelize.sync();
                    console.log('Синхронизация завершена');
                }
            } catch (error) {
                console.error('Ошибка при проверке/создании таблиц:', error);
                throw error;
            }
        };

        // Синхронизируем модели с базой данных
        await checkExistingTables();
        console.log('База данных синхронизирована');

        // Проверяем, существует ли администратор
        const adminExists = await User.findOne({ where: { email: process.env.ADMIN_EMAIL } });
        if (!adminExists) {
            // Создаем администратора
            const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
            const admin = await User.create({
                email: process.env.ADMIN_EMAIL,
                password: adminPassword,
                role: 'admin'
            });
            console.log('Администратор создан:', admin.toJSON());
        } else {
            console.log('Администратор уже существует');
        }

        // Проверяем, существуют ли настройки сайта
        const settingsExists = await SiteSettings.findOne();
        if (!settingsExists) {
            // Создаем начальные настройки сайта
            const settings = await SiteSettings.create({
                mainTitle: 'Сайт знакомств',
                subTitle: 'Найдите свою любовь',
                footerText: '© 2024 Сайт знакомств',
                backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            });
            console.log('Начальные настройки сайта созданы:', settings.toJSON());
        } else {
            console.log('Настройки сайта уже существуют');
        }

        return true;
    } catch (error) {
        console.error('Ошибка при инициализации базы данных:', error);
        return false;
    }
}

module.exports = sequelize;
module.exports.initializeDatabase = initializeDatabase; 