const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auditLogger = require('../middleware/auditLogger');
const profileController = require('../controllers/profileController');
const siteSettingsController = require('../controllers/siteSettingsController');
const cityController = require('../controllers/cityController');
const auditController = require('../controllers/auditController');

// Применяем middleware для аудита
// Используем requireAdmin из authController, так как он используется в исходном коде
router.use(authController.requireAdmin, auditLogger);

// Маршруты для управления профилями
router.get('/profiles', profileController.getAllProfiles);
router.get('/profiles/:id', profileController.getProfile);
router.put('/profiles/:id', profileController.updateProfile);
router.delete('/profiles/:id', profileController.deleteProfile);

// Маршруты для управления городами
router.get('/cities', cityController.getAllCities);
router.post('/cities', cityController.createCity);
router.patch('/cities/:id/status', cityController.updateCityStatus);
router.delete('/cities/:id', cityController.deleteCity);

// Маршруты для управления настройками сайта
router.get('/site-settings', siteSettingsController.getSettings);
router.put('/site-settings', siteSettingsController.updateSettings);

// Маршруты для журнала аудита
router.get('/audit', auditController.getAuditLogs);
router.get('/audit/actions', auditController.getAuditActions);

module.exports = router; 