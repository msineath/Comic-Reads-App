"use strict";
module.exports = (sequelize, DataTypes) => {
  const Library = sequelize.define(
    "Library",
    {
      shelfId: DataTypes.INTEGER,
      comicId: DataTypes.INTEGER,
    },
    {}
  );
  return Library;
};
