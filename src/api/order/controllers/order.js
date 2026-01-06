"use strict";

const { factories } = require("@strapi/strapi");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const invoiceService = require("../services/invoice");

module.exports = factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    //------------------------------------------------------------------
    // HELPER: GET PHONEPE AUTH TOKEN (OAuth PG-V2)
    //------------------------------------------------------------------
    async getPhonePeAuthToken(ctx) {
      try {
       const url = `${process.env.PHONEPE_HOST_IDM}/v1/oauth/token`;
        const params = new URLSearchParams();
        params.append("client_id", process.env.PHONEPE_CLIENT_ID);
        params.append("client_secret", process.env.PHONEPE_CLIENT_SECRET);
        params.append("grant_type", "client_credentials");
        params.append("client_version", process.env.PHONEPE_CLIENT_VERSION);

        const response = await axios.post(url, params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json",
          },
        });

        return response.data.access_token;
      } catch (err) {
        console.error("PhonePe Auth Token Error:", err.response?.data || err);
        throw new Error("Unable to authenticate with PhonePe");
      }
    },

    //------------------------------------------------------------------
    // CREATE ORDER (Invoice generated on frontend)
    //------------------------------------------------------------------
    async create(ctx) {
      try {
        const { data } = ctx.request.body;
        if (!data) return ctx.badRequest("Missing data payload");

        data.Order_ID = data.Order_ID || "ORD-" + Date.now();
        data.Date = new Date();
        data.Payment_Status = data.Payment_Status ?? false;

        if (ctx.state.user) {
          data.users_permissions_user = ctx.state.user.id;
        }

        // Handle Course Item (Array -> Single Object conversion)
        if (Array.isArray(data.Course_Item)) {
          if (data.Course_Item.length > 0) {
            data.Course_Item = data.Course_Item[0];
          } else {
            delete data.Course_Item;
          }
        } else if (!(data.Course_Item && data.Course_Item.Course_Id)) {
          delete data.Course_Item;
        }

        if (
          !(Array.isArray(data.Product_Item) && data.Product_Item.length > 0)
        ) {
          delete data.Product_Item;
        }

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

        console.log("✅ Order created:", entry.Order_ID);
        console.log("📝 Invoice will be generated on frontend");

        return {
          success: true,
          orderId: entry.Order_ID,
          internalId: entry.id,
          entry,
        };
      } catch (error) {
        strapi.log.error("Order create error:", error);
        return ctx.internalServerError(
          error.message || "Failed to create order"
        );
      }
    },

    //------------------------------------------------------------------
    // GET USER ORDERS
    //------------------------------------------------------------------
    async find(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("Login required");

      return await strapi.entityService.findMany("api::order.order", {
        filters: { users_permissions_user: user.id },
        populate: {
          Product_Item: true,
          Course_Item: true,
          Billing_Address: true,
          Shipping_Address: true,
          Invoice: {
            populate: ["file"],
          },
          receipt: true,
        },
      });
    },

    //------------------------------------------------------------------
    // CREATE PHONEPE PAYMENT (PG V2)
    //------------------------------------------------------------------
    async createPayment(ctx) {
      try {
        let { orderId, amount } = ctx.request.body;

        console.log("💰 PAYMENT INIT BODY:", ctx.request.body);

        if (!orderId || !amount) {
          return ctx.badRequest("orderId and amount are required");
        }

        const orders = await strapi.entityService.findMany("api::order.order", {
          filters: { Order_ID: orderId },
        });

        if (!orders || orders.length === 0) {
          console.error("❌ Order not found with Order_ID:", orderId);
          return ctx.notFound(`Order ${orderId} not found`);
        }

        const order = orders[0];
        console.log(
          "✅ Found order - Internal ID:",
          order.id,
          "| Order_ID:",
          order.Order_ID
        );

        const authToken = await this.getPhonePeAuthToken(ctx);

        const payload = {
          amount: Math.round(amount * 100),
          expireAfter: 1200,
          metaInfo: { udf1: "additional-information-1" },
          paymentFlow: {
            type: "PG_CHECKOUT",
            message: `Payment for ${orderId}`,
            merchantUrls: {
              redirectUrl: `${process.env.FRONTEND_URL}/payment/success`,
            },
          },
          merchantOrderId: orderId,
        };

        console.log("PHONEPE PAYLOAD:", payload);

const url = `${process.env.PHONEPE_HOST_PG}${process.env.PHONEPE_BASE}/pay`;
        console.log("PAYMENT URL:", url);

        const response = await axios.post(url, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `O-Bearer ${authToken}`,
          },
        });

        console.log("PHONEPE RESPONSE:", response.data);

        const phonepeOrderId = response.data.orderId;

        console.log(
          "🆔 Saving PhonePe_Order_Id:",
          phonepeOrderId,
          "to order ID:",
          order.id
        );

        const updatedOrder = await strapi.entityService.update(
          "api::order.order",
          order.id,
          {
            data: {
              PhonePe_Order_Id: phonepeOrderId,
            },
          }
        );

        console.log("✅ Successfully updated order:");
        console.log("   - Internal ID:", updatedOrder.id);
        console.log("   - Order_ID:", updatedOrder.Order_ID);
        console.log("   - PhonePe_Order_Id:", updatedOrder.PhonePe_Order_Id);

        return {
          success: true,
          redirectUrl: response.data.redirectUrl,
        };
      } catch (err) {
        console.error("❌ PhonePe Payment Error:", err.message);
        console.error("❌ Error Details:", err.response?.data || err.stack);
        return ctx.internalServerError(
          err.response?.data?.message ||
            err.message ||
            "Payment initiation failed"
        );
      }
    },

    //------------------------------------------------------------------
    // VERIFY PAYMENT STATUS (Receipt generated on frontend)
    //------------------------------------------------------------------
    async verify(ctx) {
      try {
        const { merchantOrderId } = ctx.request.body;
        if (!merchantOrderId) {
          return ctx.badRequest("merchantOrderId required");
        }

        const authToken = await this.getPhonePeAuthToken();

const url = `${process.env.PHONEPE_HOST_PG}${process.env.PHONEPE_BASE}/order/${merchantOrderId}/status`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `O-Bearer ${authToken}`,
            accept: "application/json",
          },
        });

        const state = response.data?.state;
        const success = state === "COMPLETED";
        const transactionId =
          response.data?.paymentDetails?.[0]?.transactionId || null;

        if (!success) {
          return { success: false, state };
        }

        const orders = await strapi.entityService.findMany("api::order.order", {
          filters: { Order_ID: merchantOrderId },
          populate: {
            Billing_Address: true,
            Shipping_Address: true,
            Course_Item: true,
            Product_Item: true,
          },
        });

        if (!orders.length) {
          return ctx.notFound("Order not found");
        }

        const order = orders[0];

        await strapi.entityService.update("api::order.order", order.id, {
          data: {
            Payment_Status: true,
            Payment_State: state,
            Transaction_Id: transactionId,
            Payment_Response: response.data,
          },
        });

        console.log("✅ Payment verified:", transactionId);
        console.log("📝 Receipt will be generated on frontend");

        return {
          success: true,
          paymentState: state,
          transactionId,
        };

      } catch (err) {
        console.error("❌ VERIFY ERROR:", err);
        console.error("Stack trace:", err.stack);
        return ctx.internalServerError("Verification failed");
      }
    },

    //------------------------------------------------------------------
    // FIND ORDER BY ORDER_ID
    //------------------------------------------------------------------
    async findByOrderId(ctx) {
      try {
        const { orderId } = ctx.params;

        if (!orderId) {
          return ctx.badRequest("Order ID is required");
        }

        const orders = await strapi.entityService.findMany("api::order.order", {
          filters: { Order_ID: orderId },
          populate: {
            Product_Item: true,
            Course_Item: true,
            Billing_Address: true,
            Shipping_Address: true,
            Invoice: {
              populate: ["file"],
            },
            receipt: true,
            users_permissions_user: true,
          },
        });

        if (!orders || orders.length === 0) {
          return ctx.notFound("Order not found");
        }

        return orders[0];
      } catch (error) {
        strapi.log.error("Find order by Order_ID error:", error);
        return ctx.internalServerError("Failed to fetch order");
      }
    },
  })
);