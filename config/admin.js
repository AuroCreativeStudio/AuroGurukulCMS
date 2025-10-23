module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    sessions: {
      // Access token cookie settings
      cookie: {
        secure: false,
        sameSite: 'lax',
        httpOnly: true,
      },
      // IMPORTANT: Refresh token cookie settings (this is what's missing!)
      refreshToken: {
        cookie: {
          secure: false,
          sameSite: 'lax',
          httpOnly: true,
        },
      },
    },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});