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
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
      // Ensure cookies are not marked secure (Cloud Run terminates HTTPS at the load balancer)
      secure: false,
    },
  },
});
