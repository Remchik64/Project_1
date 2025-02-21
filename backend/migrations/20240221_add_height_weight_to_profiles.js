'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Profiles', 'height', {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 140,
        max: 220
      }
    });

    await queryInterface.addColumn('Profiles', 'weight', {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 40,
        max: 150
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Profiles', 'height');
    await queryInterface.removeColumn('Profiles', 'weight');
  }
}; 