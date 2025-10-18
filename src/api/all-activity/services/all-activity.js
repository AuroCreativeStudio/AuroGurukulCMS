'use strict';

/**
 * all-activity service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::all-activity.all-activity');
