module.exports = {
  routes: [
    {
      method: "POST",
      path: "/phonepe/webhook",
      handler: "phonepe.webhook",
      config: {
        auth: false,
      },
    },
  ],
};
