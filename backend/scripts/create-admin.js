require('dotenv').config();
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

async function createAdmin() {
    try {
        console.log('Проверка подключения к базе данных...');
        await sequelize.authenticate();
        console.log('Успешное подключение к базе данных');

        // Проверяем, существует ли администратор
        console.log(`Проверка наличия администратора с email: ${process.env.ADMIN_EMAIL}`);
        const adminExists = await User.findOne({ where: { email: process.env.ADMIN_EMAIL } });
        
        if (!adminExists) {
            console.log('Администратор не найден. Создаем нового администратора...');
            
            // Хешируем пароль
            const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
            
            // Создаем администратора
            const admin = await User.create({
                email: process.env.ADMIN_EMAIL,
                password: adminPassword,
                role: 'admin'
            });
            
            console.log('Администратор успешно создан:', {
                id: admin.id,
                email: admin.email,
                role: admin.role
            });
        } else {
            console.log('Администратор уже существует:', {
                id: adminExists.id,
                email: adminExists.email,
                role: adminExists.role
            });
            
            // Обновляем пароль администратора, если указан флаг RESET_ADMIN_PASSWORD
            if (process.env.RESET_ADMIN_PASSWORD === 'true') {
                console.log('Сбрасываем пароль администратора...');
                
                // Хешируем новый пароль
                const newPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
                
                // Обновляем пароль
                await adminExists.update({ password: newPassword });
                
                console.log('Пароль администратора успешно сброшен');
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Ошибка при создании администратора:', error);
        process.exit(1);
    }
}

createAdmin(); 