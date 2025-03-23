/**
 * Скрипт для безопасного изменения пароля администратора
 * Запуск: node scripts/change-admin-password.js [newPassword]
 * Если пароль не указан в аргументах, скрипт запросит его интерактивно
 * 
 * ВАЖНО: В production среде изменение пароля администратора через API отключено.
 * Этот CLI-скрипт является единственным способом изменения пароля администратора
 * в production среде для обеспечения повышенной безопасности.
 */

require('dotenv').config();
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const { hashPassword } = require('../services/passwordService');

// Определяем окружение
const NODE_ENV = process.env.NODE_ENV || 'development';
console.log(`Окружение: ${NODE_ENV}`);

// Создаем интерфейс для чтения ввода
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Функция для безопасного ввода пароля (без отображения в консоли)
function getPasswordFromConsole(prompt) {
  return new Promise((resolve) => {
    // В идеале хотелось бы скрыть ввод, но это сложно сделать кроссплатформенно в Node.js
    // Поэтому предупреждаем пользователя
    console.log('ВНИМАНИЕ: В целях безопасности рекомендуется очистить историю терминала после выполнения.');
    rl.question(prompt, (password) => {
      resolve(password);
    });
  });
}

// Функция проверки надежности пароля
function checkPasswordStrength(password) {
  if (password.length < 8) {
    return { valid: false, message: 'Пароль должен содержать минимум 8 символов' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Пароль должен содержать хотя бы одну заглавную букву' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Пароль должен содержать хотя бы одну строчную букву' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Пароль должен содержать хотя бы одну цифру' };
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Пароль должен содержать хотя бы один специальный символ' };
  }
  
  return { valid: true };
}

// Главная функция изменения пароля администратора
async function changeAdminPassword() {
  try {
    // Получаем новый пароль из аргументов или запрашиваем интерактивно
    let newPassword = process.argv[2];
    if (!newPassword) {
      newPassword = await getPasswordFromConsole('Введите новый пароль для администратора: ');
    }
    
    // Проверяем надежность пароля
    const passwordCheck = checkPasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      console.error(`Ошибка: ${passwordCheck.message}`);
      rl.close();
      return;
    }

    // Находим пользователя с ролью admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('Ошибка: ADMIN_EMAIL не указан в .env файле');
      rl.close();
      return;
    }

    console.log(`Поиск администратора с email: ${adminEmail}...`);
    const admin = await User.findOne({ where: { email: adminEmail, role: 'admin' } });
    
    if (!admin) {
      console.error('Администратор не найден! Создаем нового администратора...');
      
      // Запрашиваем подтверждение
      const confirm = await getPasswordFromConsole('Создать нового администратора? (y/n): ');
      if (confirm.toLowerCase() !== 'y') {
        console.log('Операция отменена.');
        rl.close();
        return;
      }
      
      // Хешируем пароль
      const hashedPassword = await hashPassword(newPassword);
      
      // Создаем нового администратора
      await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log(`Новый администратор создан с email: ${adminEmail}`);
    } else {
      // Хешируем пароль
      const hashedPassword = await hashPassword(newPassword);
      
      // Обновляем пароль
      admin.password = hashedPassword;
      await admin.save();
      
      console.log(`Пароль администратора (${adminEmail}) успешно обновлен`);
    }
    
    if (NODE_ENV === 'production') {
      console.log('ВАЖНО: Это изменение НЕ обновляет переменные окружения в .env файле.');
      console.log('Для полной синхронизации, обновите ADMIN_PASSWORD в .env файле вручную, если необходимо.');
    }
    
    rl.close();
  } catch (error) {
    console.error('Ошибка при изменении пароля:', error);
    rl.close();
    process.exit(1);
  }
}

// Запускаем основную функцию
changeAdminPassword(); 