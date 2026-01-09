'use strict';

/**
 * pincode-master service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::pincode-master.pincode-master');
