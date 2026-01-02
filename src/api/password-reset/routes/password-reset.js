module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth/forgot-password-otp',
      handler: 'password-reset.sendOtp',
      config: { auth: false }, // Public access
    },
    {
      method: 'POST',
      path: '/auth/verify-otp',
      handler: 'password-reset.verifyOtp',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/auth/reset-password-with-otp',
      handler: 'password-reset.resetPassword',
      config: { auth: false },
    },
  ],
};