'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::cart.cart', ({ strapi }) => ({
  async find(ctx) {
    try {
      // Explicit populate for all relations
      const populate = {
        users_permissions_user: { fields: ['id', 'username', 'email'] },
        cart_product: {
          populate: {
            products: { populate: ['Image'] },
          },
        },
      };

      // Fetch all carts with populate
      const carts = await strapi.db.query('api::cart.cart').findMany({
        populate,
      });

      return { data: carts };
    } catch (err) {
      ctx.throw(500, err);
    }
  },
}));
