module.exports = ({ env }) => ({
  config: {
    provider: 'nodemailer',
    providerOptions: {
      host: env('SMTP_HOST', 'smtp.gmail.com'),
      port: env('SMTP_PORT', 465),
      secure: true,
      auth: {
        user: env('SMTP_USERNAME'),
        pass: env('SMTP_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    },
    settings: {
      defaultFrom: env('SMTP_FROM', 'noreply@example.com'),
      defaultReplyTo: env('SMTP_REPLY_TO', 'noreply@example.com'),
    },
  },
});