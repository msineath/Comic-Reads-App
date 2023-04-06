'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      review: {
        type: Sequelize.STRING
      },
      rating: {
        type: Sequelize.INTEGER(1,1)
      },
      comicId: {
        type: Sequelize.INTEGER,
        references: { model: "Comics" }
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: "Users" }
      },
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('Reviews');
  }
};
