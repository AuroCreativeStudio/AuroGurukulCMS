'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::cart.cart', {
  config: {
    find: {
      auth: false, // allows public access
    },
    findOne: {
      auth: false,
    },
  },
});
