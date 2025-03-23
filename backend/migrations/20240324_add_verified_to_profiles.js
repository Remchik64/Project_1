const { QueryInterface, DataTypes } = require('sequelize');

/**
 * Миграция для добавления поля verified в таблицу Profiles
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            // Проверяем, существует ли таблица Profiles
            const tableInfo = await queryInterface.describeTable('Profiles');
            
            // Проверяем, существует ли уже поле verified
            if (!tableInfo.verified) {
                // Добавляем поле verified
                await queryInterface.addColumn('Profiles', 'verified', {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                });
                console.log('Поле verified успешно добавлено в таблицу Profiles');
            } else {
                console.log('Поле verified уже существует в таблице Profiles');
            }
        } catch (error) {
            console.error('Ошибка при выполнении миграции:', error);
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        try {
            // Удаляем поле verified
            await queryInterface.removeColumn('Profiles', 'verified');
            console.log('Поле verified успешно удалено из таблицы Profiles');
        } catch (error) {
            console.error('Ошибка при откате миграции:', error);
            throw error;
        }
    }
}; 