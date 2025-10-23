module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 8080), 

  proxy: env.bool('TRUST_PROXY', true),

  url: env('PUBLIC_URL', 'https://strapi-526588758494.europe-west1.run.app'),

  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },

});
