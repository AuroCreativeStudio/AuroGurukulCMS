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
    // CREATE ORDER + GENERATE INVOICE
    //------------------------------------------------------------------
    async create(ctx) {
      try {
        const { data } = ctx.request.body;
        if (!data) return ctx.badRequest("Missing data payload");

        data.Order_ID = data.Order_ID || "ORD-" + Date.now();
        data.Date = new Date();
        data.Payment_Status = data.Payment_Status ?? false;

        // Default to checkout if not specified
        const orderType = data.order_type || "checkout";

        if (ctx.state.user) {
          data.users_permissions_user = ctx.state.user.id;
        }

        // -------------------------------------------------------------
        // ✅ FIX: HANDLE COURSE ITEM (Array -> Single Object conversion)
        // -------------------------------------------------------------
        // The frontend sends an Array [{...}], but Schema expects Object {...}
        if (Array.isArray(data.Course_Item)) {
          if (data.Course_Item.length > 0) {
            // Take the FIRST item from the array to save as the single component
            data.Course_Item = data.Course_Item[0];
          } else {
            // If array is empty, remove the field so Strapi doesn't complain
            delete data.Course_Item;
          }
        }
        // Fallback: If it's not an array, check if it's a valid object
        else if (!(data.Course_Item && data.Course_Item.Course_Id)) {
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

        // ✅ Generate Invoice for checkout, Receipt for direct enrollment
        let documentService;
        let documentPrefix;
        let documentType;

        if (orderType === "direct_enrollment") {
          // For Pay Online - Generate Receipt (will be created after payment)
          console.log("📝 Direct enrollment - Receipt will be generated after payment");
          documentService = null; // We'll generate receipt in verify method
          documentType = "receipt";
        } else {
          // For Checkout - Generate Invoice immediately
          documentService = invoiceService;
          documentPrefix = entry.Order_ID;
          documentType = "invoice";
        }

        let fileEntry = null;
        let documentUrl = null;

        // Only generate document for checkout orders
        if (documentService) {
          const document = await documentService.generateInvoice(entry);

          if (!document?.filePath) throw new Error("Document filePath missing");

          // ✅ CLOUD-SAFE UPLOAD LOGIC
          const { upload } = strapi.plugins.upload.services;

          // Prepare the file for Strapi's upload service
          const stats = fs.statSync(document.filePath);
          const fileData = {
            path: document.filePath,
            name: `${documentPrefix}.pdf`,
            type: "application/pdf",
            size: stats.size,
          };

          // This service automatically uses GCS in prod and local in dev
          const [uploadedFile] = await upload.upload({
            data: {
              refId: entry.id,
              ref: 'api::order.order',
              field: 'Invoice', // Matches your field name
            },
            files: fileData,
          });

          // Cleanup the temp file generated by the service
          if (fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
          }

          documentUrl = uploadedFile.url;
        }

        return {
          success: true,
          orderId: entry.Order_ID,
          internalId: entry.id,
          documentUrl: documentUrl,
          documentType: documentType,
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

        // ✅ Find order by Order_ID
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

        // ✅ Update using the found order's internal ID
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
    // VERIFY PAYMENT STATUS (PHONEPE PG v2 - CORRECT)
    //------------------------------------------------------------------
    async verify(ctx) {
      try {
        const { merchantOrderId } = ctx.request.body;

        console.log("🔍 VERIFYING ORDER:", merchantOrderId);

        if (!merchantOrderId) {
          return ctx.badRequest("merchantOrderId is required");
        }

        const authToken = await this.getPhonePeAuthToken(ctx);

        const url = `${process.env.PHONEPE_HOST_PG}${process.env.PHONEPE_BASE}/order/${merchantOrderId}/status`;
        console.log("📞 Calling PhonePe URL:", url);

        const response = await axios.get(url, {
          headers: {
            Authorization: `O-Bearer ${authToken}`,
            accept: "application/json",
          },
        });

        console.log(
          "✅ PhonePe Response:",
          JSON.stringify(response.data, null, 2)
        );

        const state = response.data?.state;
        const isSuccess = state === "COMPLETED";

        const transactionId =
          response.data?.paymentDetails?.[0]?.transactionId || null;

        console.log("💳 Payment State:", state, "| Is Success:", isSuccess);
        console.log("🆔 Transaction ID:", transactionId);

        if (isSuccess) {
          // ✅ Get order with BOTH id and documentId
          const orders = await strapi.entityService.findMany(
            "api::order.order",
            {
              filters: { Order_ID: merchantOrderId },
              populate: {
                Billing_Address: true,
                Shipping_Address: true,
                Course_Item: true,
                Product_Item: true,
              },
            }
          );

          if (!orders || orders.length === 0) {
            console.error("❌ Order not found for Order_ID:", merchantOrderId);
            return ctx.notFound("Order not found");
          }

          const order = orders[0];
          console.log("✅ Order found:", {
            id: order.id,
            documentId: order.documentId,
            Order_ID: order.Order_ID,
            order_type: order.order_type,
          });

          // Update payment status using id (numeric ID works for updates)
          const updateResult = await strapi.entityService.update(
            "api::order.order",
            order.id,
            {
              data: {
                Payment_Status: true,
                Payment_State: state,
                Transaction_Id: transactionId,
                Payment_Response: response.data,
              },
            }
          );

          console.log("📝 DB Update Result:", {
            id: updateResult.id,
            Order_ID: updateResult.Order_ID,
            Payment_Status: updateResult.Payment_Status,
            PhonePe_Order_Id: updateResult.PhonePe_Order_Id,
            Transaction_Id: updateResult.Transaction_Id,
          });

          // ✅ Generate Receipt for direct enrollment orders
          console.log("🔍 Checking order type:", order.order_type);

          if (order.order_type === "direct_enrollment") {
            console.log("📄 Generating receipt for direct enrollment...");

            try {
              const receiptService = require("../services/receipt");
              console.log("✅ Receipt service loaded");

              // ✅ We already have the full order with all populated fields!
              console.log("✅ Using already populated order:", order.Order_ID);

              // Add transaction ID to order for receipt
              order.Transaction_Id = transactionId;
              order.Payment_Response = response.data;
              order.Payment_Status = true; // Ensure this is set for receipt

              console.log("📄 Calling generateReceipt with order:", {
                Order_ID: order.Order_ID,
                hasTransactionId: !!order.Transaction_Id,
                hasBillingAddress: !!order.Billing_Address,
                hasCourseItem: !!order.Course_Item,
              });

              const receipt = await receiptService.generateReceipt(order);
              console.log("✅ Receipt generated:", receipt);

              if (receipt?.filePath) {
                const { upload } = strapi.plugins.upload.services;
                const stats = fs.statSync(receipt.filePath);

                const fileData = {
                  path: receipt.filePath,
                  name: receipt.fileName,
                  type: "application/pdf",
                  size: stats.size,
                };

                const [uploadedReceipt] = await upload.upload({
                  data: {
                    refId: order.id,
                    ref: 'api::order.order',
                    field: 'receipt',
                  },
                  files: fileData,
                });

                // Cleanup
                if (fs.existsSync(receipt.filePath)) {
                  fs.unlinkSync(receipt.filePath);
                }

                console.log("✅ Receipt uploaded and attached via Upload Service");
              } else {
                console.error("❌ Receipt generation returned no filePath");
              }
            } catch (receiptError) {
              console.error("❌ Receipt generation failed:");
              console.error("   Error message:", receiptError.message);
              console.error("   Error stack:", receiptError.stack);
              // Don't fail the payment verification if receipt generation fails
            }
          } else {
            console.log(
              "ℹ️  Order type is not direct_enrollment, skipping receipt generation"
            );
          }
        }

        return {
          success: true,
          paymentStatus: state,
          isPaymentSuccessful: isSuccess,
          transactionId,
          details: response.data,
        };
      } catch (err) {
        console.error("❌ VERIFY ERROR:", err.response?.data || err.message);
        return ctx.internalServerError({
          message: "Verification failed",
          error: err.response?.data || err.message,
        });
      }
    },


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
