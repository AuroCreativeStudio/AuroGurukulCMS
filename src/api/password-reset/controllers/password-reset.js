'use strict';

const bcrypt = require('bcryptjs'); 

module.exports = {
  // 1. SEND OTP (No changes here - we MUST create it initially to verify it later)
  async sendOtp(ctx) {
    const { email } = ctx.request.body;

    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email },
    });

    if (!user) return ctx.badRequest('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create the entry temporarily
    await strapi.entityService.create('api::otp.otp', {
      data: {
        email,
        code: otp,
        isUsed: false,
        publishedAt: new Date(),
      },
    });

    try {
      await strapi.plugins['email'].services.email.send({
        to: email,
        subject: 'Reset Password OTP',
        text: `Your OTP is ${otp}`,
        html: `<h4>Your OTP is:</h4><h1>${otp}</h1>`,
      });
    } catch (err) {
      return ctx.internalServerError('Failed to send email');
    }

    return ctx.send({ message: 'OTP sent successfully' });
  },

  // 2. VERIFY OTP (No changes here)
  async verifyOtp(ctx) {
    const { email, otp } = ctx.request.body;

    const validOtp = await strapi.db.query('api::otp.otp').findOne({
      where: { email, code: otp, isUsed: false },
      orderBy: { createdAt: 'desc' }, 
    });

    if (!validOtp) return ctx.badRequest('Invalid or expired OTP');

    return ctx.send({ message: 'OTP Verified' });
  },

  // 3. RESET PASSWORD (UPDATED: Deletes the data)
  async resetPassword(ctx) {
    const { email, otp, password, passwordConfirmation } = ctx.request.body;

    if (password !== passwordConfirmation) return ctx.badRequest('Passwords do not match');

    // Verify OTP again
    const validOtp = await strapi.db.query('api::otp.otp').findOne({
      where: { email, code: otp, isUsed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!validOtp) return ctx.badRequest('Invalid Request');

    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email },
    });

    if (!user) return ctx.badRequest('User not found');

    // Update User Password (Plain text, let Strapi hash it automatically as discussed before)
    await strapi.entityService.update('plugin::users-permissions.user', user.id, {
      data: { password: password }, 
    });

    // ---------------------------------------------------------
    // 👇 CHANGED HERE: DELETE the OTP immediately
    // ---------------------------------------------------------
    await strapi.entityService.delete('api::otp.otp', validOtp.id);

    return ctx.send({ message: 'Password updated successfully' });
  }
};