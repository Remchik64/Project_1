const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadProfilePhoto } = require('../middleware/upload');

// Публичные маршруты
router.get('/public', profileController.getPublicProfiles);
router.get('/public/:id', profileController.getProfile);
router.get('/public/:id/contacts', profileController.getProfileContacts);

// Защищенные маршруты (требуют авторизации)
router.use(authMiddleware);
router.get('/', profileController.getAllProfiles);
router.post('/', uploadProfilePhoto, profileController.createProfile);
router.put('/:id', uploadProfilePhoto, profileController.updateProfile);
router.delete('/:id', profileController.deleteProfile);
router.patch('/:id/status', profileController.updateStatus);
router.post('/upload', uploadProfilePhoto, profileController.uploadPhoto);

module.exports = router;