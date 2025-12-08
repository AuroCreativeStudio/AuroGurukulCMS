"use strict";

const { factories } = require("@strapi/strapi");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const invoiceService = require("../services/invoice");


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

      if (!invoice?.filePath) throw new Error("Invoice filePath missing");

      const sourcePath = path.resolve(invoice.filePath);
      const fileName = `${entry.Order_ID}.pdf`;

      // Define where Strapi stores uploads (public/uploads)
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const destPath = path.join(uploadDir, fileName);

      // Ensure uploads folder exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Copy the generated invoice to the uploads folder
      fs.copyFileSync(sourcePath, destPath);

      // *** CLEANUP: Delete the temporary source file after copying ***
      if (fs.existsSync(sourcePath)) {
        fs.unlinkSync(sourcePath);
      }
      // Get file stats for the database (using the new destination path)
      const stats = fs.statSync(destPath);
      // Create the file entry directly in the database
      const fileEntry = await strapi.entityService.create("plugin::upload.file", {
        data: {
          name: fileName,
          alternativeText: `Invoice for ${entry.Order_ID}`,
          caption: `Invoice #${entry.Order_ID}`,
          width: null,
          height: null,
          formats: null,
          hash: entry.Order_ID, // Use Order ID as the unique hash
          ext: ".pdf",
          mime: "application/pdf",
          size: (stats.size / 1024).toFixed(2), // Size in KB
          url: `/uploads/${fileName}`,
          provider: "local",
          folderPath: "/",
        },
      });
      console.log(`Invoice registered manually with ID: ${fileEntry.id}`);
      await strapi.entityService.update("api::order.order", entry.id, {
        data: {
          Invoice: {
            file: fileEntry.id,
          },
        },
      });
      return {
        success: true,
        orderId: entry.Order_ID,
        internalId: entry.id,
        invoiceUrl: fileEntry.url,
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
      },
    });
  },

  //------------------------------------------------------------------
  // CREATE PHONEPE PAYMENT (PG V2)
  //------------------------------------------------------------------
  async createPayment(ctx) {
    try {
      let { orderId, amount, internalId } = ctx.request.body;

      console.log("PAYMENT INIT BODY:", ctx.request.body);

      internalId = Number(internalId);
      if (!orderId || !amount || isNaN(internalId)) {
        return ctx.badRequest("orderId, amount & valid internalId are required");
      }

      // OAuth Token
      const authToken = await this.getPhonePeAuthToken(ctx);

      const payload = {
        amount: Math.round(amount * 100),
        expireAfter: 1200,
        metaInfo: { udf1: "additional-information-1" },
        paymentFlow: {
          type: "PG_CHECKOUT",
          message: `Payment for ${orderId}`,
          merchantUrls: {
            redirectUrl: `${process.env.FRONTEND_URL}/payment/success`
          }
        },
        merchantOrderId: orderId
      };

      console.log("PHONEPE PAYLOAD:", payload);

      const url = `${process.env.PHONEPE_HOST}${process.env.PHONEPE_BASE}/pay`;
      console.log("PAYMENT URL:", url);

      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `O-Bearer ${authToken}`
        }
      });

      console.log("PHONEPE RESPONSE:", response.data);

      const phonepeOrderId = response.data.orderId; // THIS is correct

      // ❗ DO NOT extract paymentDetails here — they don't exist yet

      // SAVE ONLY the PhonePe internal order id
      await strapi.db.query("api::order.order").update({
        where: { id: internalId },
        data: {
          PhonePe_Order_Id: phonepeOrderId
        }
      });

      return {
        success: true,
        redirectUrl: response.data.redirectUrl
      };

    } catch (err) {
      console.error("PhonePe Payment Error RAW:", err);
      console.error("PhonePe Payment Error RESPONSE:", err.response?.data);
      return ctx.internalServerError(
        err.response?.data?.message ||
        err.message ||
        "Payment initiation failed"
      );
    }
  },





  //------------------------------------------------------------------
  // VERIFY PAYMENT STATUS
  //------------------------------------------------------------------
  async verify(ctx) {
    console.log("RAW BODY RECEIVED:", ctx.request.body);

    try {
      const internalId = Number(ctx.request.body?.data?.internalId);

      if (!internalId || isNaN(internalId)) {
        return ctx.badRequest("internalId must be a valid number");
      }


      // Fetch order using internal DB ID
      const order = await strapi.db.query("api::order.order").findOne({
        where: { id: internalId }
      });

      if (!order) return ctx.notFound("Order not found");

      const merchantOrderId = order.Order_ID;

      const authToken = await this.getPhonePeAuthToken(ctx);

      // ✔ CORRECT STATUS URL (PG V2)
      const url = `${process.env.PHONEPE_HOST}/checkout/v2/order/${merchantOrderId}/status`;

      console.log("VERIFY URL:", url);

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `O-Bearer ${authToken}`
        }
      });

      console.log("PHONEPE RAW RESPONSE:", response.data);

      const paymentState = response.data.state;
      const isSuccess = paymentState === "COMPLETED";

      await strapi.db.query("api::order.order").update({
        where: { id: internalId },
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
      return ctx.internalServerError("Payment verification failed");
    }
  }



}));
