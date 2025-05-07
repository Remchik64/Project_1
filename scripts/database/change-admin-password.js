/**
 * Скрипт для изменения пароля администратора
 * 
 * Использование: 
 * node change-admin-password.js "новый_пароль"
 * 
 * Автор: Claude
 * Версия: 1.0
 * Дата: 2025-05-07
 */

require('dotenv').config({ path: '../../backend/.env' });
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Проверка аргументов командной строки
if (process.argv.length < 3) {
  console.error('Ошибка: Не указан новый пароль');
  console.log('Использование: node change-admin-password.js "новый_пароль"');
  process.exit(1);
}

const newPassword = process.argv[2];

// Путь к базе данных
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../backend/database.sqlite');

// Функция для хеширования пароля
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

// Проверка наличия базы данных
if (!fs.existsSync(dbPath)) {
  console.error(`Ошибка: База данных не найдена по пути: ${dbPath}`);
  process.exit(1);
}

// Подключение к базе данных
const db = new sqlite3.Database(dbPath);

// Обновление пароля администратора
function updateAdminPassword() {
  const { salt, hash } = hashPassword(newPassword);
  
  // Обновление пароля для администратора
  db.get("SELECT id FROM users WHERE role = 'admin' LIMIT 1", (err, row) => {
    if (err) {
      console.error('Ошибка при поиске администратора:', err.message);
      db.close();
      process.exit(1);
    }
    
    if (!row) {
      console.error('Ошибка: Администратор не найден в базе данных');
      db.close();
      process.exit(1);
    }
    
    const adminId = row.id;
    
    // Обновление пароля
    db.run(
      "UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?",
      [hash, salt, adminId],
      function(err) {
        if (err) {
          console.error('Ошибка при обновлении пароля:', err.message);
          db.close();
          process.exit(1);
        }
        
        if (this.changes > 0) {
          console.log('Пароль администратора успешно обновлен');
        } else {
          console.error('Ошибка: Не удалось обновить пароль');
        }
        
        db.close();
      }
    );
  });
}

// Проверка структуры таблицы
db.get("PRAGMA table_info(users)", (err, rows) => {
  if (err) {
    console.error('Ошибка при проверке структуры таблицы:', err.message);
    db.close();
    process.exit(1);
  }
  
  if (!rows) {
    console.error('Ошибка: Таблица users не существует');
    db.close();
    process.exit(1);
  }
  
  updateAdminPassword();
});

process.on('uncaughtException', (err) => {
  console.error('Неожиданная ошибка:', err);
  if (db) {
    db.close();
  }
  process.exit(1);
}); 