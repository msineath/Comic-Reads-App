"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Collections", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      hasRead: {
        type: Sequelize.BOOLEAN,
      },
      wantsToRead: {
        type: Sequelize.BOOLEAN,
      },
      comicId: {
        type: Sequelize.INTEGER,
        references: { model: "Comics" },
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: "Users" },
      },
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("Collections");
  },
};
