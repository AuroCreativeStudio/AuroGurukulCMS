"use strict";

const { factories } = require("@strapi/strapi");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const invoiceService = require("../services/invoice");
const { generatePhonePeToken } = require("../../../utils/phonepeAuth");

module.exports = factories.createCoreController("api::order.order", ({ strapi }) => ({

  //------------------------------------------------------------------
  // 1. CREATE ORDER + GENERATE INVOICE + SAVE TO INVOICE COMPONENT
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

      //------------------------------------------------------------------
      // CREATE ORDER
      //------------------------------------------------------------------
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

      //------------------------------------------------------------------
      // GENERATE INVOICE PDF
      //------------------------------------------------------------------
      const invoice = await invoiceService.generateInvoice(entry);

      if (!invoice?.filePath) {
        throw new Error("Invoice generation failed — filePath missing");
      }

      const safePath = path.resolve(invoice.filePath);

      if (!fs.existsSync(safePath)) {
        throw new Error("Generated invoice file not found at: " + safePath);
      }

      //------------------------------------------------------------------
      // VERIFY UPLOAD CONFIG IS LOADED (STRAPI V5 CORRECT PATH)
      //------------------------------------------------------------------
      const uploadConfig = strapi.config.get("plugin::upload.config");

      console.log("UPLOAD CONFIG:", uploadConfig);

      if (!uploadConfig) {
        throw new Error("Upload configuration missing. Check config/plugins.js");
      }



      //------------------------------------------------------------------
      // UPLOAD FILE USING BUFFER MODE
      //------------------------------------------------------------------
      const fileBuffer = fs.readFileSync(safePath);

      const fileToUpload = {
        name: invoice.fileName,
        type: "application/pdf",
        size: fileBuffer.length,
        buffer: fileBuffer,
      };

      const uploadService = strapi.plugin("upload").service("upload");
      const uploaded = await uploadService.upload({
        data: {},
        files: { file: fileToUpload },
      });

      const fileData = uploaded?.[0];
      if (!fileData?.id) {
        throw new Error("Invoice upload failed — invalid upload response");
      }

      //------------------------------------------------------------------
      // SAVE THE FILE INSIDE THE INVOICE COMPONENT
      //------------------------------------------------------------------
      await strapi.entityService.update("api::order.order", entry.id, {
        data: {
          Invoice: {
            file: fileData.id,
          },
        },
      });

      //------------------------------------------------------------------
      // SUCCESS RESPONSE
      //------------------------------------------------------------------
      return {
        success: true,
        orderId: entry.Order_ID,
        invoiceUrl: fileData.url,
        entry,
      };

    } catch (error) {
      strapi.log.error("Order create error:", error);
      return ctx.internalServerError(error.message || "Failed to create order");
    }
  },

  //------------------------------------------------------------------
  // 2. GET USER ORDERS
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
  // 3. CREATE PHONEPE PAYMENT SESSION
  //------------------------------------------------------------------
  async createPayment(ctx) {
    try {
      const { orderId, amount } = ctx.request.body;
      if (!orderId || !amount) {
        return ctx.badRequest("orderId & amount required");
      }

      const clientId = process.env.PHONEPE_CLIENT_ID;
      const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
      const version = process.env.PHONEPE_CLIENT_VERSION;
      const merchantId = process.env.PHONEPE_MID;
      const host = process.env.PHONEPE_HOST;

      const payload = {
        merchantId,
        merchantTransactionId: orderId,
        merchantUserId: "user01",
        amount: amount * 100,
        redirectUrl: `${process.env.FRONTEND_URL}/payment/success`,
        callbackUrl: `${process.env.STRAPI_URL}/api/orders/verify`,
        paymentInstrument: { type: "PAY_PAGE" },
      };

      const rawBody = JSON.stringify(payload);
      const token = generatePhonePeToken(clientId, clientSecret, rawBody, version);
      const url = `${host}/apis/hermes/pg/v3/pay`;

      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-CLIENT-ID": clientId,
          "X-CLIENT-VERSION": version,
          "Authorization": `Bearer ${token}`,
        },
      });

      return { success: true, data: response.data };

    } catch (err) {
      console.log("PhonePe Payment Error:", err.response?.data || err);
      return ctx.internalServerError("PhonePe payment failed");
    }
  },

  //------------------------------------------------------------------
  // 4. VERIFY PAYMENT
  //------------------------------------------------------------------
  async verify(ctx) {
    try {
      let { merchantTransactionId } = ctx.request.body;
      if (ctx.request.body?.data?.merchantTransactionId) {
        merchantTransactionId = ctx.request.body.data.merchantTransactionId;
      }

      if (!merchantTransactionId) {
        return ctx.badRequest("merchantTransactionId missing");
      }

      const clientId = process.env.PHONEPE_CLIENT_ID;
      const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
      const version = process.env.PHONEPE_CLIENT_VERSION;
      const merchantId = process.env.PHONEPE_MID;
      const host = process.env.PHONEPE_HOST;

      const token = generatePhonePeToken(clientId, clientSecret, "", version);
      const url = `${host}/apis/hermes/pg/v3/status/${merchantId}/${merchantTransactionId}`;

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "X-CLIENT-ID": clientId,
          "X-CLIENT-VERSION": version,
          "Authorization": `Bearer ${token}`,
        },
      });

      const status = response.data?.data?.state;

      await strapi.db.query("api::order.order").update({
        where: { Order_ID: merchantTransactionId },
        data: {
          Payment_Status: status === "SUCCESS",
          Payment_Response: response.data,
        },
      });

      return { success: true, paymentStatus: status };

    } catch (err) {
      console.log("PhonePe Verify Error:", err.response?.data || err);
      return ctx.internalServerError("Payment verification failed");
    }
  },

}));
