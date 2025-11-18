"use strict";

const { factories } = require("@strapi/strapi");
const crypto = require("crypto");
const axios = require("axios");

module.exports = factories.createCoreController("api::order.order", ({ strapi }) => ({

  // 1️⃣ CREATE ORDER (Already provided by you)
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      if (!data) return ctx.badRequest("Missing data payload");

      data.Order_ID = data.Order_ID || "ORD-" + Date.now();
      data.Date = new Date();

      if (data.Payment_Status === undefined) {
        data.Payment_Status = false;
      }

      if (ctx.state.user) {
        data.users_permissions_user = ctx.state.user.id;
      }

      const hasCourse = data.Course_Item && data.Course_Item.Course_Id;
      if (!hasCourse) delete data.Course_Item;

      const hasProducts = Array.isArray(data.Product_Item) && data.Product_Item.length > 0;
      if (!hasProducts) delete data.Product_Item;

      const entry = await strapi.entityService.create("api::order.order", {
        data,
        populate: {
          Billing_Address: true,
          Shipping_Address: true,
          Product_Item: true,
          Course_Item: true,
          users_permissions_user: true,
        },
      });

      return {
        success: true,
        orderId: data.Order_ID,
        entry,
      };

    } catch (error) {
      strapi.log.error("Order create error:", error);
      return ctx.internalServerError("Failed to create order");
    }
  },


  // 2️⃣ GET USER ORDERS (Already provided by you)
  async find(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("Login required");

      const entries = await strapi.entityService.findMany("api::order.order", {
        filters: { users_permissions_user: user.id },
        populate: "*",
      });

      return entries;
    } catch (error) {
      strapi.log.error("Order find error:", error);
      return ctx.internalServerError("Failed to fetch orders");
    }
  },

// 3️⃣ CREATE PHONEPE PAYMENT SESSION (FIXED)
async createPayment(ctx) {
  try {
    const { orderId, amount } = ctx.request.body;

    if (!orderId || !amount) {
      return ctx.badRequest("orderId and amount are required");
    }

    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX;

    const payload = {
      merchantId,
      merchantTransactionId: orderId,
      merchantUserId: "user01",
      amount: amount * 100, // convert to paisa
      redirectUrl: `${process.env.FRONTEND_URL}/payment/success`,
      redirectMode: "POST",
      callbackUrl: `${process.env.STRAPI_URL}/api/orders/verify`,
      mobileNumber: "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

    // Correct Checksum: base64 + /pg/v1/pay + saltKey
    const checksum =
      crypto.createHash("sha256")
        .update(base64Payload + "/pg/v1/pay" + saltKey)
        .digest("hex") +
      "###" +
      saltIndex;

    const response = await axios.post(
      "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": merchantId
        },
      }
    );

    return {
      success: true,
      phonepe: response.data,
    };

  } catch (error) {
    console.log("Payment error:", error.response?.data || error);
    return ctx.internalServerError("Payment creation failed");
  }
},


  // 4️⃣ VERIFY PAYMENT (PhonePe Callback)
  async verify(ctx) {
    try {
      const body = ctx.request.body;
      strapi.log.info("📌 PhonePe Verify Callback:", body);

      const {
        merchantTransactionId,
        code,
        message
      } = body.data || {};

      if (!merchantTransactionId) {
        return ctx.badRequest("Missing merchantTransactionId");
      }

      // SUCCESS
      if (code === "PAYMENT_SUCCESS") {

        await strapi.db.query("api::order.order").update({
          where: { Order_ID: merchantTransactionId },
          data: {
            Payment_Status: true,
            Payment_Response: body,
          },
        });

        return { status: "success" };
      }

      // FAILED
      await strapi.db.query("api::order.order").update({
        where: { Order_ID: merchantTransactionId },
        data: {
          Payment_Status: false,
          Payment_Response: body,
        },
      });

      return { status: "failed", message };

    } catch (error) {
      strapi.log.error("Verify error:", error);
      return ctx.internalServerError("Failed to verify payment");
    }
  }

}));
