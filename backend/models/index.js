const Profile = require('./Profile');
const User = require('./User');
const SiteSettings = require('./SiteSettings');

// Настройка ассоциаций
User.hasOne(Profile, { foreignKey: 'userId' });
Profile.belongsTo(User, { foreignKey: 'userId' });

// Временно отключаем связи с городами
// Profile.belongsTo(City, { foreignKey: 'city', targetKey: 'name' });
// City.hasMany(Profile, { foreignKey: 'city', sourceKey: 'name' });

// Экспорт моделей
module.exports = {
    Profile,
    User,
    SiteSettings
}; 