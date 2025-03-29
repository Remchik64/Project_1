const express = require('express');
const router = express.Router();
const { uploadMultiplePhotos } = require('../middleware/upload');

// Тестовый маршрут для проверки доступности API
router.get('/test', (req, res) => {
    res.json({ message: 'Upload API is working' });
});

// Маршрут для загрузки фотографий
router.post('/photos', uploadMultiplePhotos);

module.exports = router; 