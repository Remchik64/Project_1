const express = require('express');
const router = express.Router();
const siteSettingsController = require('../controllers/siteSettingsController');
const { uploadMiddleware, optimizeImage } = require('../middleware/upload');
const uploadBackground = require('../middleware/backgroundUpload');
const authController = require('../controllers/authController');

// Получение настроек (публичный доступ)
router.get('/', siteSettingsController.getSettings);

// Обновление настроек (только для админов)
router.put('/', 
    authController.requireAdmin,
    uploadMiddleware,
    optimizeImage,
    siteSettingsController.updateSettings
);

// Загрузка фонового изображения (только для админов)
router.post('/background',
    authController.requireAdmin,
    uploadBackground,
    optimizeImage,
    siteSettingsController.uploadBackground
);

module.exports = router; 