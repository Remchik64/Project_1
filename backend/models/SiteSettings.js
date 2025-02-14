const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SiteSettings = sequelize.define('SiteSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mainTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  subTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: 'Лучший сайт знакомств для серьезных отношений'
  },
  headerBackground: {
    type: DataTypes.STRING,
    allowNull: true
  },
  headerBackgroundColor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  headerBackgroundImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  siteBackground: {
    type: DataTypes.STRING,
    defaultValue: 'color'
  },
  siteBackgroundColor: {
    type: DataTypes.STRING,
    defaultValue: '#f5f5f5'
  },
  siteBackgroundImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  loginPageTitle: {
    type: DataTypes.STRING,
    defaultValue: 'Вход в личный кабинет'
  },
  telegramLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  whatsappLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  vkLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profileTelegramLink: {
    type: DataTypes.STRING,
    defaultValue: 'https://t.me/'
  },
  profileWhatsappLink: {
    type: DataTypes.STRING,
    defaultValue: 'https://wa.me/'
  },
  profileVkLink: {
    type: DataTypes.STRING,
    defaultValue: 'https://vk.com/'
  },
  footerText: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailSupport: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phoneSupport: {
    type: DataTypes.STRING,
    allowNull: true
  },
  workingHours: {
    type: DataTypes.STRING,
    defaultValue: '09:00 - 18:00'
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  backgroundGradient: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

// Метод для получения настроек (создает запись, если она не существует)
SiteSettings.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = SiteSettings;