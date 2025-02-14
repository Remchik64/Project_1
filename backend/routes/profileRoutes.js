const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Публичные маршруты
router.get('/public', profileController.getPublicProfiles);
router.get('/public/:id', profileController.getProfile);
router.get('/public/:id/contacts', profileController.getProfileContacts);

// Защищенные маршруты (требуют авторизации)
router.use(authMiddleware);
router.get('/', profileController.getAllProfiles);
router.post('/', upload.single('photo'), profileController.createProfile);
router.put('/:id', upload.single('photo'), profileController.updateProfile);
router.delete('/:id', profileController.deleteProfile);
router.patch('/:id/status', profileController.updateStatus);
router.post('/upload', upload.single('photo'), profileController.uploadPhoto);

module.exports = router;