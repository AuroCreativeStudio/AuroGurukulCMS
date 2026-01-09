"use strict";

module.exports = {
  // ------------------------------------------------------------
  // CREATE: Generate Shipping_ID
  // ------------------------------------------------------------
  async beforeCreate(event) {
    await generateShippingId(event);
  },

  // ------------------------------------------------------------
  // UPDATE: Capture old record + ensure Shipping_ID exists
  // ------------------------------------------------------------
  async beforeUpdate(event) {
    // 1) Capture OLD data for comparison
    const { where, data } = event.params;

    const existingShipping = await strapi.entityService.findOne(
      "api::shipping.shipping",
      where.id,
      {
        populate: {
          users_permissions_user: true,
        },
      }
    );

    event.state = { existingShipping };

    // 2) If Shipping_ID is empty during update, generate one (your existing logic)
    if (!data.Shipping_ID) {
      await generateShippingId(event);
    }
  },

  // ------------------------------------------------------------
  // UPDATE: Send email when Order_Status changes
  // Only if Tracking_Number and Courier_Partner exist
  // ------------------------------------------------------------
  async afterUpdate(event) {
    const { result } = event;
    const { existingShipping } = event.state || {};

    if (!existingShipping) return;

    // --- Detect status change ---
    const oldStatus = existingShipping.Order_Status;
    const newStatus = result.Order_Status;
    const statusChanged = oldStatus !== newStatus;

    if (!statusChanged) return;

    // --- Condition: Trigger only if both fields exist ---
    const hasTracking =
      typeof result.Tracking_Number === "string" &&
      result.Tracking_Number.trim().length > 0;

    const hasCourier =
      typeof result.Courier_Partner === "string" &&
      result.Courier_Partner.trim().length > 0;

    if (!hasTracking || !hasCourier) {
      strapi.log.info(
        `Shipping email skipped for Shipping #${result.id} (Tracking_Number or Courier_Partner missing)`
      );
      return;
    }

    try {
      // Fetch full shipping to build better email
      const fullShipping = await strapi.entityService.findOne(
        "api::shipping.shipping",
        result.id,
        {
          populate: {
            users_permissions_user: true,
            Product: true,
          },
        }
      );

      // @ts-ignore
      const userEmail = fullShipping?.users_permissions_user?.email;
      const userName =
        // @ts-ignore
        fullShipping?.users_permissions_user?.username || "Valued Customer";

      if (!userEmail) return;

      const subject = `Shipping Status Updated - Order #${
        fullShipping.Order_ID || fullShipping.Shipping_ID || fullShipping.id
      }`;

      const messageTitle = "Shipping Status Updated";
      const oldS = oldStatus || "Pending";
      const newS = (newStatus || "Pending").toUpperCase();

      const courier = fullShipping.Courier_Partner;
      const tracking = fullShipping.Tracking_Number;

      const estDelivery = fullShipping.Estimated_Delivery
        ? new Date(fullShipping.Estimated_Delivery).toLocaleString()
        : null;

      const itemsHtml = generateShippingItemsHtml(fullShipping);

      const finalHtmlBody = `
        <p>Your shipping status has changed from <strong>${oldS}</strong> to <strong><span style="color:#214587;">${newS}</span></strong>.</p>

        <div style="background:#f9f9f9; padding:15px; border-radius:6px; margin:16px 0;">
          <p style="margin:6px 0;"><strong>Courier Partner:</strong> ${courier}</p>
          <p style="margin:6px 0;"><strong>Tracking Number:</strong> ${tracking}</p>
          ${estDelivery ? `<p style="margin:6px 0;"><strong>Estimated Delivery:</strong> ${estDelivery}</p>` : ""}
        </div>

        ${itemsHtml}
      `;

      // Send email (same pattern as your Order hook)
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
        to: userEmail,
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

      strapi.log.info(`Shipping status email sent to ${userEmail}`);
    } catch (err) {
      strapi.log.error("Failed to send shipping status email:", err);
    }
  },
};

// ------------------------------------------------------------
// Your existing Shipping_ID generator (unchanged)
// ------------------------------------------------------------
async function generateShippingId(event) {
  const { data } = event.params;

  if (!data.Shipping_ID) {
    const lastEntry = await strapi.db
      .query("api::shipping.shipping")
      .findMany({
        orderBy: { id: "desc" },
        limit: 1,
      });

    let nextNumber = 1;

    if (lastEntry.length > 0 && lastEntry[0].Shipping_ID) {
      const lastId = lastEntry[0].Shipping_ID.replace("SHIP", "");
      const lastNumber = parseInt(lastId, 10);

      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    data.Shipping_ID = `SHIP${String(nextNumber).padStart(4, "0")}`;
  }
}

// ------------------------------------------------------------
// Helper: Build items table from Shipping.Product component
// ------------------------------------------------------------
function generateShippingItemsHtml(shipping) {
  const products = Array.isArray(shipping.Product) ? shipping.Product : [];

  const rows = products
    .map((item) => {
      const title = item.Product_Title || "Product";
      const qty = Number(item.Quantity || 1);
      const price = Number(item.Product_Price || 0);
      const total = (price * qty).toFixed(2);

      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${title}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${qty}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${price.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${total}</td>
        </tr>
      `;
    })
    .join("");

  const totalPrice = shipping.Total_price ? String(shipping.Total_price) : "0";

  return `
    <div style="background-color: #f9f9f9; padding: 15px; margin-top: 20px; border-radius: 4px;">
      <h3 style="margin-top: 0; color: #333;">Shipping Items</h3>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 0.9em;">
        <thead>
          <tr style="background-color: #eee;">
            <th style="text-align: left; padding: 8px;">Item</th>
            <th style="text-align: left; padding: 8px;">Qty</th>
            <th style="text-align: left; padding: 8px;">Price</th>
            <th style="text-align: left; padding: 8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="4" style="padding:10px;">No items found.</td></tr>`}
        </tbody>
      </table>

      <p style="text-align: right; font-size: 1.05em; margin: 10px 0;">
        <strong>Total: ₹${totalPrice}</strong>
      </p>
    </div>
  `;
}
