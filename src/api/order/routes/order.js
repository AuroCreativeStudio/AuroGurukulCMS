module.exports = {
  routes: [
    {
      method: "POST",
      path: "/orders",
      handler: "order.create",
      config: {
        auth: { scope: [] },
      },
    },
    {
      method: "GET",
      path: "/orders",
      handler: "order.find",
      config: {
        auth: { scope: [] },
      },
    },

    {
      method: "POST",
      path: "/orders/pay",
      handler: "order.createPayment",
      config: {
        auth: false,
      },
    },

    {
      method: "POST",
      path: "/orders/verify",
      handler: "order.verify",
      config: {
        auth: false,
      },
    },
  ],
};
