"use strict";

module.exports = {
  async webhook(ctx) {
    try {
      const auth = ctx.request.headers["authorization"];

      if (!auth || !auth.startsWith("Basic ")) {
        return ctx.unauthorized("Missing Authorization Header");
      }

      // Decode username:password
      const base64Credentials = auth.split(" ")[1];
      const decoded = Buffer.from(base64Credentials, "base64").toString("ascii");
      const [username, password] = decoded.split(":");

      // Compare with .env values
      if (
        username !== process.env.PHONEPE_WEBHOOK_USER ||
        password !== process.env.PHONEPE_WEBHOOK_PASS
      ) {
        return ctx.unauthorized("Invalid credentials");
      }

      // webhook body
      const event = ctx.request.body.event;
      const data = ctx.request.body.data;

      strapi.log.info("WEBHOOK RECEIVED:", event, data);

      if (event === "pg.order.completed") {
        const merchantOrderId = data.merchantOrderId;

        // update order to success
        await strapi.db.query("api::order.order").update({
          where: { Order_ID: merchantOrderId },
          data: { Payment_Status: true }
        });
      }

      ctx.send({ received: true });
    } catch (err) {
      strapi.log.error("Webhook Error:", err);
      ctx.internalServerError("Webhook processing failed");
    }
  },
};
