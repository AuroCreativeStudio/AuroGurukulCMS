'use strict';

/**
 * science-of-living service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::science-of-living.science-of-living');
