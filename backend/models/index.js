const Profile = require('./Profile');
const User = require('./User');
const SiteSettings = require('./SiteSettings');
const City = require('./City');
const ProfileCity = require('./ProfileCity');

// Настройка ассоциаций
User.hasOne(Profile, { foreignKey: 'userId' });
Profile.belongsTo(User, { foreignKey: 'userId' });

// Связь многие-ко-многим между Profile и City
Profile.belongsToMany(City, { 
    through: ProfileCity,
    foreignKey: 'profileId'
});
City.belongsToMany(Profile, { 
    through: ProfileCity,
    foreignKey: 'cityId'
});

// Экспорт моделей
module.exports = {
    Profile,
    User,
    SiteSettings,
    City,
    ProfileCity
}; 