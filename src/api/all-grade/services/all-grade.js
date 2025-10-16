'use strict';

/**
 * all-grade service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::all-grade.all-grade');
