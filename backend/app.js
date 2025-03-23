const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Маршруты
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');
const cityRoutes = require('./routes/cityRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Подключение маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/cities', cityRoutes);

// Административные маршруты с аудитом
app.use('/api/admin', adminRoutes);

module.exports = app; 