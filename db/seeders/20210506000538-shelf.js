'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('Shelves', [
      {name: 'Super-Hero', userId: 1, isRecommended: true},
      {name: 'Horror', userId: 1, isRecommended: true},
      {name: 'My-Personal-Shelf', userId: 1, isRecommended: false},
    ]);
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('Shelves', null, {});
  }
};
