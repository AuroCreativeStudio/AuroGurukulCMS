module.exports = {
  routes: [
    {
      method: "GET",
      path: "/orders/by-order-id/:orderId",
      handler: "order.findByOrderId",
      config: {
        auth: false, // or set to true if you want authentication
      },
    },
  ],
};