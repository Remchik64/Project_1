const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const siteSettingsController = require('../controllers/siteSettingsController');

// Публичные маршруты профилей
router.get('/profiles', profileController.getPublicProfiles);
router.get('/profiles/:id/contacts', profileController.getProfileContacts);

// Публичные маршруты настроек
router.get('/site-settings', siteSettingsController.getSettings);

module.exports = router;