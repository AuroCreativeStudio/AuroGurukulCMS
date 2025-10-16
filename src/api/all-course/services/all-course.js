'use strict';

/**
 * all-course service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::all-course.all-course');
