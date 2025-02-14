const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProfileCity = sequelize.define('ProfileCity', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    profileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Profiles',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    cityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Cities',
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['profileId', 'cityId'],
            name: 'profile_city_unique'
        }
    ]
});

module.exports = ProfileCity; 