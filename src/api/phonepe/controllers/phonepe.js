"use strict";

module.exports = {
  //------------------------------------------------------------------
  // PHONEPE WEBHOOK (PG v2 - SOURCE OF TRUTH)
  //------------------------------------------------------------------
  async webhook(ctx) {
    try {
      // -------------------------------------------------------------
      // 1. BASIC AUTH VERIFICATION (YOUR EXISTING LOGIC - KEPT)
      // -------------------------------------------------------------
      const auth = ctx.request.headers["authorization"];

      if (!auth || !auth.startsWith("Basic ")) {
        return ctx.unauthorized("Missing Authorization Header");
      }

      const base64Credentials = auth.split(" ")[1];
      const decoded = Buffer.from(base64Credentials, "base64").toString("ascii");
      const [username, password] = decoded.split(":");

      if (
        username !== process.env.PHONEPE_WEBHOOK_USER ||
        password !== process.env.PHONEPE_WEBHOOK_PASS
      ) {
        return ctx.unauthorized("Invalid credentials");
      }

      // -------------------------------------------------------------
      // 2. WEBHOOK PAYLOAD
      // -------------------------------------------------------------
      const payload = ctx.request.body;
      const data = payload?.data || payload; // support both formats

      const merchantOrderId = data?.merchantOrderId;
      const state = data?.state;

      strapi.log.info("PHONEPE WEBHOOK RECEIVED:", payload);

      if (!merchantOrderId) {
        strapi.log.warn("Webhook missing merchantOrderId");
        return ctx.send({ received: true });
      }

      // -------------------------------------------------------------
      // 3. PROCESS ONLY COMPLETED PAYMENTS
      // -------------------------------------------------------------
      if (state === "COMPLETED") {
        // Idempotency: update only if not already paid
        const existingOrder = await strapi.db
          .query("api::order.order")
          .findOne({
            where: { Order_ID: merchantOrderId },
            select: ["Payment_Status"],
          });

        if (!existingOrder) {
          strapi.log.warn(`Order not found: ${merchantOrderId}`);
          return ctx.send({ received: true });
        }

        if (existingOrder.Payment_Status === true) {
          strapi.log.info(`Order already paid: ${merchantOrderId}`);
          return ctx.send({ received: true });
        }

        await strapi.db.query("api::order.order").update({
          where: { Order_ID: merchantOrderId },
          data: {
            Payment_Status: true,
            Payment_State: state,
            Payment_Response: payload,
          },
        });

        strapi.log.info(`Order ${merchantOrderId} marked as PAID`);
      }

      // -------------------------------------------------------------
      // 4. ALWAYS RETURN 200 OK
      // -------------------------------------------------------------
      ctx.send({ received: true });
    } catch (err) {
      strapi.log.error("PhonePe Webhook Error:", err);
      ctx.send({ received: true }); // still 200 to stop retries
    }
  },
};
