const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Создание соли и хеша для пароля (с увеличенным числом раундов)
async function hashPassword(password) {
  // Увеличиваем количество раундов для более стойкого шифрования
  const saltRounds = 12; // Рекомендуемое значение 10-12
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

// Проверка пароля
async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Генерация сильного случайного пароля (для сброса)
function generateStrongPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+=-';
  let password = '';
  
  // Используем crypto для получения криптостойких случайных чисел
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    const index = randomBytes[i] % chars.length;
    password += chars.charAt(index);
  }
  
  return password;
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateStrongPassword
}; 