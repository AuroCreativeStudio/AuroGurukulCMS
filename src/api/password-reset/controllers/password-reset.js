'use strict';

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer'); // Import nodemailer directly

// Helper to send mail directly without config/plugins.js
const sendEmailDirectly = async (to, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Assuming you are using Gmail
    auth: {
      user: process.env.SMTP_USERNAME, // Reads directly from .env
      pass: process.env.SMTP_PASSWORD, // Reads directly from .env
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USERNAME, // Send from your email
    to: to,
    subject: subject,
    text: text,
    html: html,
  });
};

module.exports = {
  // 1. SEND OTP
  async sendOtp(ctx) {
    const { email } = ctx.request.body;

    // FIX: Correct plugin name is 'plugin::users-permissions'
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
      // 👇 CHANGED: Using direct nodemailer function instead of Strapi plugin
      await sendEmailDirectly(
        email,
        'Reset Password OTP',
        `Your OTP is ${otp}`,
        `<h4>Your OTP is:</h4><h1>${otp}</h1>`
      );
    } catch (err) {
      console.error('Email Error:', err);
      return ctx.internalServerError('Failed to send email. Check server logs.');
    }

    return ctx.send({ message: 'OTP sent successfully' });
  },

  // 2. VERIFY OTP
  async verifyOtp(ctx) {
    const { email, otp } = ctx.request.body;

    const validOtp = await strapi.db.query('api::otp.otp').findOne({
      where: { email, code: otp, isUsed: false },
      orderBy: { createdAt: 'desc' }, 
    });

    if (!validOtp) return ctx.badRequest('Invalid or expired OTP');

    return ctx.send({ message: 'OTP Verified' });
  },

  // 3. RESET PASSWORD
  async resetPassword(ctx) {
    const { email, otp, password, passwordConfirmation } = ctx.request.body;

    if (password !== passwordConfirmation) return ctx.badRequest('Passwords do not match');

    // Verify OTP again
    const validOtp = await strapi.db.query('api::otp.otp').findOne({
      where: { email, code: otp, isUsed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!validOtp) return ctx.badRequest('Invalid Request');

    // FIX: Correct plugin name
    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email },
    });

    if (!user) return ctx.badRequest('User not found');

    // FIX: Correct update path
    await strapi.entityService.update('plugin::users-permissions.user', user.id, {
      data: { password: password }, 
    });

    // Clean up: Delete the OTP
    await strapi.entityService.delete('api::otp.otp', validOtp.id);

    return ctx.send({ message: 'Password updated successfully' });
  }
};