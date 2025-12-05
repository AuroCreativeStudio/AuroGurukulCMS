"use strict";

const { factories } = require("@strapi/strapi");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const invoiceService = require("../services/invoice");

// Cache token (optional)
let cachedToken = null;
let tokenExpiry = null;

module.exports = factories.createCoreController("api::order.order", ({ strapi }) => ({

  //------------------------------------------------------------------
  // HELPER: GET PHONEPE AUTH TOKEN (OAuth PG-V2)
  //------------------------------------------------------------------
  async getPhonePeAuthToken(ctx) {
    try {
      const url = `${process.env.PHONEPE_HOST}/v1/oauth/token`;

      const params = new URLSearchParams();
      params.append("client_id", process.env.PHONEPE_CLIENT_ID);
      params.append("client_secret", process.env.PHONEPE_CLIENT_SECRET);
      params.append("grant_type", "client_credentials");
      params.append("client_version", process.env.PHONEPE_CLIENT_VERSION);

      const response = await axios.post(url, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "accept": "application/json"
        }
      });

      return response.data.access_token;

    } catch (err) {
      console.error("PhonePe Auth Token Error:", err.response?.data || err);
      throw new Error("Unable to authenticate with PhonePe");
    }
  },

  //------------------------------------------------------------------
  // CREATE ORDER + GENERATE INVOICE
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

      if (!(data.Course_Item && data.Course_Item.Course_Id)) {
        delete data.Course_Item;
      }

      if (!(Array.isArray(data.Product_Item) && data.Product_Item.length > 0)) {
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
        }
      });

      const invoice = await invoiceService.generateInvoice(entry);

      if (!invoice?.filePath) {
        throw new Error("Invoice generation failed — filePath missing");
      }

      const safePath = path.resolve(invoice.filePath);

      if (!fs.existsSync(safePath)) {
        throw new Error("Generated invoice file not found at: " + safePath);
      }

      return {
        success: true,
        orderId: entry.Order_ID,
        invoicePath: safePath,
        entry
      };

    } catch (error) {
      strapi.log.error("Order create error:", error);
      return ctx.internalServerError(error.message || "Failed to create order");
    }
  },

  //------------------------------------------------------------------
  // GET USER ORDERS
  //------------------------------------------------------------------
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

  //------------------------------------------------------------------
  // CREATE PHONEPE PAYMENT (PG V2)
  //------------------------------------------------------------------
  async createPayment(ctx) {
    try {
      const { orderId, amount } = ctx.request.body;
      if (!orderId || !amount) return ctx.badRequest("orderId & amount required");

      const authToken = await this.getPhonePeAuthToken(ctx);

      const payload = {
        amount: Math.round(amount * 100),
        expireAfter: 1200,
        metaInfo: { udf1: "additional-information-1" },
        paymentFlow: {
          type: "PG_CHECKOUT",
          message: `Payment for ${orderId}`,
          merchantUrls: {
            // PhonePe will return here (WITHOUT QUERY PARAMS)
            redirectUrl: `${process.env.FRONTEND_URL}/payment/success`
          }
        },
        merchantOrderId: orderId
      };

      const url = `${process.env.PHONEPE_HOST}${process.env.PHONEPE_BASE}/pay`;
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `O-Bearer ${authToken}`
        }
      });

      const phonepeOrderId = response.data.orderId;

      // STEP 1 — Save PhonePe Order ID in Strapi
      await strapi.db.query("api::order.order").update({
        where: { Order_ID: orderId },
        data: { PhonePe_Order_Id: phonepeOrderId }
      });

      return {
        success: true,
        redirectUrl: response.data.redirectUrl
      };

    } catch (err) {
      console.error("PhonePe Payment Error:", err.response?.data || err);
      return ctx.internalServerError("Payment initiation failed");
    }
  },


  //------------------------------------------------------------------
  // VERIFY PAYMENT STATUS
  //------------------------------------------------------------------
  async verify(ctx) {
    let phonepeOrderId = null;
    let url = null;
    let responseData = null;

    try {
const merchantOrderId = ctx.request.body?.data?.merchantOrderId;

      if (!merchantOrderId) {
        return ctx.badRequest("merchantOrderId required");
      }

      // Step 3.1: Fetch order
      const order = await strapi.db.query("api::order.order").findOne({
        where: { Order_ID: merchantOrderId }
      });

      if (!order) return ctx.notFound("Order not found");

      // Step 3.2: Get PhonePe order ID from DB
      phonepeOrderId = order.PhonePe_Order_Id;

      if (!phonepeOrderId) {
        return ctx.badRequest("PhonePe_Order_Id missing. Payment was not initialized.");
      }

      const authToken = await this.getPhonePeAuthToken(ctx);

      // Step 3.3: Build URL
      url = `${process.env.PHONEPE_HOST}${process.env.PHONEPE_BASE}/order/${phonepeOrderId}`;
      console.log("VERIFY URL:", url);

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `O-Bearer ${authToken}`
        }
      });

      responseData = response.data;
      console.log("PHONEPE RAW RESPONSE:", responseData);

      const paymentState = response.data.state;
      const isSuccess = paymentState === "COMPLETED";

      // Step 3.4 Update Order
      await strapi.db.query("api::order.order").update({
        where: { id: order.id },
        data: {
          Payment_Status: isSuccess,
          Payment_Response: response.data
        }
      });

      return {
        success: true,
        paymentStatus: paymentState,
        isPaymentSuccessful: isSuccess,
        data: response.data
      };

    } catch (err) {
      console.error("PhonePe Verify Error:", err.response?.data || err.message);
      console.log("DEBUG LOGS:");
      console.log("  merchantOrderId:", ctx.request.body?.merchantOrderId);
      console.log("  phonepeOrderId:", phonepeOrderId);
      console.log("  verifyURL:", url);
      console.log("  rawResponse:", responseData);
      return ctx.internalServerError("Payment verification failed");
    }
  }
}));
