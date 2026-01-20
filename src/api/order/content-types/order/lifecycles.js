// @ts-nocheck
"use strict";

// ============================================================
// DEDUPE STORE (Anti-Spam)
// ============================================================
const EMAIL_DEDUPE_TTL_MS = 60 * 1000; 

function getDedupeStore() {
  if (!global.__AURO_ORDER_EMAIL_DEDUPE__) global.__AURO_ORDER_EMAIL_DEDUPE__ = new Map();
  return global.__AURO_ORDER_EMAIL_DEDUPE__;
}

function shouldSendOnce(key) {
  const store = getDedupeStore();
  const now = Date.now();

  for (const [k, ts] of store.entries()) {
    if (now - ts > EMAIL_DEDUPE_TTL_MS) store.delete(k);
  }

  const last = store.get(key);
  if (last && now - last < EMAIL_DEDUPE_TTL_MS) return false;

  store.set(key, now);
  return true;
}

// ✅ Creation Lock
// Tracks orders created in the last 15 seconds
function isRecentlyCreated(orderId) {
  const store = getDedupeStore();
  const now = Date.now();
  const createdTime = store.get(`order:${orderId}:created_at_ts`);
  if (createdTime && (now - createdTime < 15000)) return true;
  return false;
}

function markAsCreated(orderId) {
  const store = getDedupeStore();
  store.set(`order:${orderId}:created_at_ts`, Date.now());
}

// -------------------------
// Media Helpers
// -------------------------
function pickMedia(media) {
  if (!media) return null;
  if (Array.isArray(media)) return media[0] || null;
  return media;
}

function getMediaUrl(media) {
  const m = pickMedia(media);
  if (!m) return null;
  if (typeof m.url === "string") return m.url;
  if (m.data && typeof m.data.url === "string") return m.data.url;
  return null;
}

function getMediaId(media) {
  const m = pickMedia(media);
  if (!m) return null;
  if (m.id != null) return m.id;
  if (m.data && m.data.id != null) return m.data.id;
  return null;
}

function mediaSig(media) {
  const id = getMediaId(media);
  if (id != null) return `id:${String(id)}`;
  const url = getMediaUrl(media);
  if (typeof url === "string" && url.trim()) return `url:${url.trim()}`;
  return "";
}

function absUrl(relativeOrAbs, BACKEND_URL) {
  if (!relativeOrAbs) return null;
  return relativeOrAbs.startsWith("http") ? relativeOrAbs : `${BACKEND_URL}${relativeOrAbs}`;
}

function hasValidUrl(u) {
  return typeof u === "string" && u.trim().length > 0;
}

// Email Sender
async function sendEmail({ to, subject, messageTitle, userName, finalHtmlBody }) {
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Auro Gurukul" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px;">
        <h2 style="color: #214587; text-align: center; margin-bottom: 20px;">${messageTitle}</h2>
        <p>Hello ${userName},</p>
        ${finalHtmlBody}
        <br>
        <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 10px; text-align: center; color: #666; font-size: 0.9em;">
          <p>Best regards,<br>The Auro Gurukul Team</p>
        </div>
      </div>
    `,
  });
}

module.exports = {
  // ============================================================
  // LIFECYCLE: AFTER CREATE
  // ============================================================
  async afterCreate(event) {
    const { result } = event;

    if (Date.now() - new Date(result.createdAt).getTime() > 60000) return;

    try {
      const fullOrder = await strapi.entityService.findOne("api::order.order", result.id, {
        populate: {
          Invoice: { populate: ["file"] },
          receipt: true,
          users_permissions_user: true,
          Product_Item: true,
          Course_Item: true,
          Billing_Address: true,
          Shipping_Address: true,
        },
      });

      if (fullOrder.Payment_Status !== true) return;

      const userEmail = fullOrder.users_permissions_user?.email;
      const userName = fullOrder.users_permissions_user?.username || "Valued Customer";
      if (!userEmail) return;

      // ✅ LOCK: Mark as recently created
      markAsCreated(result.id);

      const BACKEND_URL = process.env.STRAPI_URL || "http://localhost:1337";
      const receiptUrl = absUrl(getMediaUrl(fullOrder.receipt), BACKEND_URL);
      const invoiceUrl = absUrl(getMediaUrl(fullOrder?.Invoice?.file), BACKEND_URL);
      const hasReceipt = hasValidUrl(receiptUrl);
      const hasInvoice = hasValidUrl(invoiceUrl);

      // Dedupe
      const dedupeKey = `order:${fullOrder.id}:create-docs`;
      if (!shouldSendOnce(dedupeKey)) return;

      const detailsTable = generateOrderDetailsHtml(fullOrder);
      const buttons = `
        <div style="text-align: center; margin: 20px 0;">
          ${hasReceipt ? `<a href="${receiptUrl}" target="_blank" style="display:inline-block; background-color:#4CAF50; color:white; padding:12px 24px; text-decoration:none; border-radius:5px; font-weight:bold; margin: 6px;">Download Receipt</a>` : ""}
          ${hasInvoice ? `<a href="${invoiceUrl}" target="_blank" style="display:inline-block; background-color:#214587; color:white; padding:12px 24px; text-decoration:none; border-radius:5px; font-weight:bold; margin: 6px;">Download Invoice</a>` : ""}
        </div>
      `;

      await sendEmail({
        to: userEmail,
        subject: `Order Confirmation - #${fullOrder.id}`,
        messageTitle: "Order Confirmation",
        userName,
        finalHtmlBody: `
          <p>Your order has been created and confirmed.</p>
          ${buttons}
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
          <p>Order Summary:</p>
          ${detailsTable}
        `,
      });

      console.log(`[Lifecycle] SENT Order Confirmation for #${fullOrder.id}`);

    } catch (err) {
      console.error("Failed to send manual create email:", err);
    }
  },

  // ============================================================
  // LIFECYCLE: BEFORE UPDATE
  // ============================================================
  async beforeUpdate(event) {
    const { where } = event.params;
    const existingOrder = await strapi.entityService.findOne("api::order.order", where.id, {
      populate: {
        Invoice: { populate: ["file"] },
        receipt: true,
      },
    });

    event.state = {
      existingOrder,
      oldStatus: existingOrder?.order_status, 
      oldReceiptSig: mediaSig(existingOrder?.receipt),
      oldInvoiceSig: mediaSig(existingOrder?.Invoice?.file),
    };
  },

  // ============================================================
  // LIFECYCLE: AFTER UPDATE
  // ============================================================
  async afterUpdate(event) {
    const { result } = event;
    const state = event.state || {};
    const existingOrder = state.existingOrder;

    if (!existingOrder) return;

    const data = event.params?.data || {};
    const touchedStatus = Object.prototype.hasOwnProperty.call(data, "order_status");
    const touchedReceipt = Object.prototype.hasOwnProperty.call(data, "receipt");
    const touchedInvoice = Object.prototype.hasOwnProperty.call(data, "Invoice");

    // Guard: If payload doesn't contain fields we care about, exit.
    if (!touchedStatus && !touchedReceipt && !touchedInvoice) return;

    // ✅ FIX: Creation Lock
    // We BLOCK updates if it's a STATUS or RECEIPT change during creation window.
    // We ALLOW Invoice changes because they often happen immediately after creation via frontend.
    const recentlyCreated = isRecentlyCreated(result.id);
    if (recentlyCreated && !touchedInvoice) {
        return;
    }

    try {
      const fullOrder = await strapi.entityService.findOne("api::order.order", result.id, {
        populate: {
          Invoice: { populate: ["file"] },
          receipt: true,
          users_permissions_user: true,
          Product_Item: true,
          Course_Item: true,
          Billing_Address: true,
          Shipping_Address: true,
        },
      });

      if (fullOrder.Payment_Status !== true) return;

      const userEmail = fullOrder.users_permissions_user?.email;
      const userName = fullOrder.users_permissions_user?.username || "Valued Customer";
      if (!userEmail) return;

      const BACKEND_URL = process.env.STRAPI_URL || "http://localhost:1337";

      // Detect Changes
      const oldStatus = state.oldStatus;
      const newStatus = fullOrder.order_status;
      const statusChanged = touchedStatus && oldStatus && (oldStatus !== newStatus);

      const newReceiptSig = mediaSig(fullOrder?.receipt);
      const oldReceiptSig = state.oldReceiptSig;
      const receiptUrl = absUrl(getMediaUrl(fullOrder?.receipt), BACKEND_URL);
      const receiptChanged = touchedReceipt && newReceiptSig && (newReceiptSig !== oldReceiptSig) && hasValidUrl(receiptUrl);

      const newInvoiceSig = mediaSig(fullOrder?.Invoice?.file);
      const oldInvoiceSig = state.oldInvoiceSig;
      const invoiceUrl = absUrl(getMediaUrl(fullOrder?.Invoice?.file), BACKEND_URL);
      
      // ✅ LOGIC UPDATE: We consider invoice changed if:
      // 1. Invoice field was touched AND file exists AND
      // 2. Either it's new (sig change) OR it's a "recent creation" delayed attachment
      const invoiceChanged = touchedInvoice && hasValidUrl(invoiceUrl) && (
          recentlyCreated || (newInvoiceSig && newInvoiceSig !== oldInvoiceSig)
      );

      if (!statusChanged && !receiptChanged && !invoiceChanged) return;

      let subject = "";
      let messageTitle = "";
      let finalHtmlBody = "";

      // Prioritize logic
      if (statusChanged && !recentlyCreated) {
        const dedupeKey = `order:${fullOrder.id}:status:${newStatus}`;
        if (!shouldSendOnce(dedupeKey)) return;

        subject = `Order Status Changed - #${fullOrder.id}`;
        messageTitle = "Order Status Updated";
        finalHtmlBody = `
          <p>Your order status has changed from <strong>${oldStatus}</strong> to <strong><span style="color: #214587;">${String(newStatus).toUpperCase()}</span></strong>.</p>
          ${generateOrderDetailsHtml(fullOrder)}
        `;
      } else if (receiptChanged && !recentlyCreated) {
        const dedupeKey = `order:${fullOrder.id}:receipt:${newReceiptSig}`;
        if (!shouldSendOnce(dedupeKey)) return;

        subject = `Payment Receipt Updated - #${fullOrder.id}`;
        messageTitle = "Receipt Updated";
        finalHtmlBody = `
          <p>The payment receipt for your order has been updated.</p>
          <div style="text-align: center; margin: 30px 0;">
             <a href="${receiptUrl}" target="_blank" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Download Receipt</a>
          </div>
        `;
      } else if (invoiceChanged) {
        // ✅ EXPLICITLY ALLOWED during creation window
        const dedupeKey = `order:${fullOrder.id}:invoice:${newInvoiceSig}`;
        if (!shouldSendOnce(dedupeKey)) return;

        subject = `Invoice Updated - #${fullOrder.id}`;
        messageTitle = "Invoice Updated";
        finalHtmlBody = `
          <p>The invoice details for your order have been modified.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${invoiceUrl}" target="_blank" style="background-color: #214587; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Download Invoice File</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
          <p>Order Summary:</p>
          ${generateOrderDetailsHtml(fullOrder)}
        `;
      }

      if (!subject) return;

      await sendEmail({
        to: userEmail,
        subject,
        messageTitle,
        userName,
        finalHtmlBody,
      });

      console.log(`[Lifecycle] SENT Update email (${messageTitle}) to ${userEmail}`);

    } catch (err) {
      console.error("Failed to send update email:", err);
    }
  },
};

// ------------------------------------------------------------
// HELPER FUNCTION
// ------------------------------------------------------------
function generateOrderDetailsHtml(order) {
  const items = [];
  const products = order.Product_Item || [];
  
  products.forEach(item => {
    const price = parseFloat(item.Product_Price) || 0;
    const qty = parseInt(item.Quantity) || 1;
    const total = (price * qty).toFixed(2);
    items.push(`<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.Product_Title}</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${qty}</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${price.toFixed(2)}</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${total}</td></tr>`);
  });

  const course = order.Course_Item;
  if (course) {
    const fees = parseFloat(course.Course_Fees) || 0;
    items.push(`<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">Course: ${course.Course_Title}</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">1</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${fees.toFixed(2)}</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${fees.toFixed(2)}</td></tr>`);
  }

  const billing = order.Billing_Address || {};
  const shipping = order.Shipping_Address || {};
  const totalPrice = parseFloat(order.Price) || 0;
  const isPaid = order.Payment_Status === true;
  const paymentStatusHtml = isPaid ? '<span style="color: green; font-weight: bold;">PAID</span>' : '<span style="color: red; font-weight: bold;">PENDING/FAILED</span>';

  return `
    <div style="background-color: #f9f9f9; padding: 15px; margin-top: 20px; border-radius: 4px;">
      <h3 style="margin-top: 0; color: #333;">Order Details</h3>
      <div style="margin-bottom: 15px; background-color: #fff; padding: 10px; border: 1px solid #eee;"><p style="margin: 5px 0;"><strong>Payment Status:</strong> ${paymentStatusHtml}</p><p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.Date || order.createdAt).toLocaleDateString()}</p></div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 0.9em;"><thead><tr style="background-color: #eee;"><th style="text-align: left; padding: 8px;">Item</th><th style="text-align: left; padding: 8px;">Qty</th><th style="text-align: left; padding: 8px;">Price</th><th style="text-align: left; padding: 8px;">Total</th></tr></thead><tbody>${items.length > 0 ? items.join('') : '<tr><td colspan="4" style="padding:10px;">No items found.</td></tr>'}</tbody></table>
      <p style="text-align: right; font-size: 1.1em; margin: 10px 0;"><strong>Total Amount: ₹${totalPrice.toFixed(2)}</strong></p>
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;"><tr><td style="width: 50%; vertical-align: top; padding-right: 10px;"><h4 style="margin: 0 0 5px 0; color: #555;">Billing Address</h4><p style="font-size: 0.9em; line-height: 1.4; color: #444; margin: 0;">${billing.Firstname || ''} ${billing.Lastname || ''}<br>${billing.City || ''}, ${billing.Zipcode || ''}</p></td><td style="width: 50%; vertical-align: top; padding-left: 10px;"><h4 style="margin: 0 0 5px 0; color: #555;">Shipping Address</h4><p style="font-size: 0.9em; line-height: 1.4; color: #444; margin: 0;">${shipping.Firstname || ''} ${shipping.Lastname || ''}<br>${shipping.City || ''}, ${shipping.Zipcode || ''}</p></td></tr></table>
    </div>
  `;
}