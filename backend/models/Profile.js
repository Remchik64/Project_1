const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Profile = sequelize.define('Profile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 18,
            max: 100
        }
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Мужской', 'Женский']]
        }
    },
    about: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    interests: {
        type: DataTypes.STRING,
        allowNull: true
    },
    photo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
        validate: {
            isIn: [['active', 'pending', 'blocked']]
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    socialVk: {
        type: DataTypes.STRING,
        allowNull: true
    },
    socialTg: {
        type: DataTypes.STRING,
        allowNull: true
    },
    socialWa: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['status'] }
    ]
});

module.exports = Profile; 