const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimiter');

// Маршрут для входа с ограничением попыток
router.post('/login', loginLimiter, authController.login);

module.exports = router; 