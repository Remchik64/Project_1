const express = require('express');
const router = express.Router();
const { uploadMultiplePhotos } = require('../middleware/upload');
const authController = require('../controllers/authController');

// Маршрут для загрузки фотографий
// Добавляем проверку авторизации
router.post('/photos', authController.requireAuth, uploadMultiplePhotos);

module.exports = router; 