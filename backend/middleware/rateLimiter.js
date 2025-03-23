const rateLimit = require('express-rate-limit');

// Ограничение для обычных запросов API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // макс. 100 запросов за 15 минут
  message: 'Слишком много запросов с этого IP, пожалуйста, повторите через 15 минут',
  standardHeaders: true, // Возвращать info в заголовках `RateLimit-*`
  legacyHeaders: false, // Отключить заголовки `X-RateLimit-*`
});

// Жесткое ограничение для авторизации
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 5, // макс. 5 попыток входа за час
  message: 'Слишком много попыток входа. Пожалуйста, повторите через час',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  loginLimiter
}; 