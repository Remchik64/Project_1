const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Публичные маршруты
router.get('/', cityController.getAllCities);
router.get('/:id', cityController.getCity);
router.get('/:cityId/profiles', cityController.getCityProfiles);

// Маршруты, требующие аутентификации и прав администратора
router.use(requireAuth, requireAdmin);

// Создание нового города
router.post('/', cityController.createCity);

// Обновление статуса города
router.patch('/:id/status', cityController.updateCityStatus);

// Удаление города
router.delete('/:id', cityController.deleteCity);

// Привязка анкет к городу
router.post('/:cityId/profiles', cityController.assignProfilesToCity);

module.exports = router; 