module.exports = {
  // 1. Capture OLD data to compare later
  async beforeUpdate(event) {
    const { where } = event.params;
    const existingOrder = await strapi.entityService.findOne('api::order.order', where.id, {
      populate: {
        Invoice: { populate: ['file'] },
        receipt: true,
      }
    });
    event.state = { existingOrder };
  },

  // 2. Check for changes and send email
  async afterUpdate(event) {
    const { result } = event;
    const { existingOrder } = event.state || {};

    if (!existingOrder) return;

    // --- DETECT CHANGES ---
    const statusChanged = existingOrder.order_status !== result.order_status;

    // Invoice Check (Compare strings)
    const oldInvoiceStr = JSON.stringify(existingOrder.Invoice);
    const newInvoiceStr = JSON.stringify(result.Invoice);
    // basic check to see if *something* changed in the component
    const invoiceChanged = oldInvoiceStr !== newInvoiceStr && result.Invoice !== null;

    // Receipt Check
    const receiptChanged = (result.receipt && !existingOrder.receipt) ||
      (result.receipt && existingOrder.receipt && result.receipt.id !== existingOrder.receipt.id);

    if (!statusChanged && !invoiceChanged && !receiptChanged) return;

    try {
      // --- FETCH FULL DATA ---
      const fullOrder = await strapi.entityService.findOne('api::order.order', result.id, {
        populate: {
          Invoice: { populate: ['file'] },
          receipt: true,
          users_permissions_user: true,
          Product_Item: true,
          Course_Item: true,
          Billing_Address: true,
          Shipping_Address: true
        },
      });

      // *** 🛑 CRITICAL CHECK: PAYMENT STATUS ***
      if (fullOrder.Payment_Status !== true) {
        console.log(`Email skipped for Order #${fullOrder.id} (Payment Pending)`);
        return;
      }

      // Re-verify Receipt Change
      const oldReceiptId = existingOrder.receipt ? existingOrder.receipt.id : null;
      // @ts-ignore
      const newReceiptId = fullOrder.receipt ? fullOrder.receipt.id : null;
      const isReceiptUpdate = newReceiptId && (newReceiptId !== oldReceiptId);

      if (!statusChanged && !invoiceChanged && !isReceiptUpdate) return;

      // @ts-ignore
      const userEmail = fullOrder.users_permissions_user?.email;
      // @ts-ignore
      const userName = fullOrder.users_permissions_user?.username || "Valued Customer";

      if (!userEmail) return;

      // --- CONFIGURATION ---
      const BACKEND_URL = process.env.STRAPI_URL || 'http://localhost:1337';

      // --- BUILD EMAIL CONTENT ---
      let subject = "";
      let messageTitle = "";
      let finalHtmlBody = "";

      if (statusChanged) {
        // SCENARIO 1: Status Change
        subject = `Order Status Changed - #${fullOrder.id}`;
        messageTitle = "Order Status Updated";
        const oldStatus = existingOrder.order_status || 'Pending';
        const newStatus = fullOrder.order_status.toUpperCase();
        const detailsTable = generateOrderDetailsHtml(fullOrder);

        finalHtmlBody = `
          <p>Your order status has changed from <strong>${oldStatus}</strong> to <strong><span style="color: #214587;">${newStatus}</span></strong>.</p>
          ${detailsTable}
        `;

      } else if (isReceiptUpdate) {
        // SCENARIO 2: Receipt Update
        subject = `Payment Receipt Updated - #${fullOrder.id}`;
        messageTitle = "Receipt Updated";
        // @ts-ignore
        const relativeUrl = fullOrder.receipt.url;
        const finalUrl = relativeUrl.startsWith('http') ? relativeUrl : `${BACKEND_URL}${relativeUrl}`;

        finalHtmlBody = `
          <p>The payment receipt for your order has been updated.</p>
          <div style="text-align: center; margin: 30px 0;">
             <a href="${finalUrl}" target="_blank" style="background-color: #214587; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
               Download Receipt
             </a>
          </div>
        `;

      } else if (invoiceChanged) {
        // SCENARIO 3: Invoice Update
        
        // @ts-ignore
        const invoiceFile = fullOrder.Invoice?.file;

        // *** 🛑 FIX: Check if file actually exists inside the Invoice component ***
        // If the file is missing, we stop here and send NO email.
        if (!invoiceFile || !invoiceFile.url) {
            console.log(`Email skipped for Order #${fullOrder.id} (Invoice changed but 'file' field is empty)`);
            return;
        }

        subject = `Invoice Updated - #${fullOrder.id}`;
        messageTitle = "Invoice Updated";

        const relativeUrl = invoiceFile.url;
        const finalInvoiceUrl = relativeUrl.startsWith('http') ? relativeUrl : `${BACKEND_URL}${relativeUrl}`;

        const detailsTable = generateOrderDetailsHtml(fullOrder);

        finalHtmlBody = `
          <p>The invoice details for your order have been modified.</p>
          <div style="text-align: center; margin: 20px 0;">
            <p>You can download the official invoice file here:</p>
            <a href="${finalInvoiceUrl}" target="_blank" style="background-color: #214587; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              Download Invoice File
            </a>
          </div>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
          <p>Order Summary:</p>
          ${detailsTable}
        `;
      }

      // --- SEND EMAIL ---
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
        subject: subject,
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

      console.log(`Update email (${messageTitle}) sent to ${userEmail}`);

    } catch (err) {
      console.error("Failed to send update email:", err);
    }
  },
};

// ... Helper function `generateOrderDetailsHtml` remains exactly the same ...
function generateOrderDetailsHtml(order) {
  // (Paste existing helper function here)
  const items = [];
  const products = order.Product_Item || [];
  
  products.forEach(item => {
    const price = parseFloat(item.Product_Price) || 0;
    const qty = parseInt(item.Quantity) || 1;
    const total = (price * qty).toFixed(2);
    items.push(`
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.Product_Title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${qty}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${total}</td>
      </tr>
    `);
  });

  const course = order.Course_Item;
  if (course) {
    const fees = parseFloat(course.Course_Fees) || 0;
    items.push(`
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">Course: ${course.Course_Title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">1</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${fees.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${fees.toFixed(2)}</td>
      </tr>
    `);
  }

  const billing = order.Billing_Address || {};
  const shipping = order.Shipping_Address || {};
  const totalPrice = parseFloat(order.Price) || 0;
  
  const isPaid = order.Payment_Status === true;
  const paymentStatusHtml = isPaid 
    ? '<span style="color: green; font-weight: bold;">PAID</span>' 
    : '<span style="color: red; font-weight: bold;">PENDING/FAILED</span>';

  return `
    <div style="background-color: #f9f9f9; padding: 15px; margin-top: 20px; border-radius: 4px;">
      <h3 style="margin-top: 0; color: #333;">Order Details</h3>
      <div style="margin-bottom: 15px; background-color: #fff; padding: 10px; border: 1px solid #eee;">
        <p style="margin: 5px 0;"><strong>Payment Status:</strong> ${paymentStatusHtml}</p>
        <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.Date || order.createdAt).toLocaleDateString()}</p>
      </div>

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
          ${items.length > 0 ? items.join('') : '<tr><td colspan="4" style="padding:10px;">No items found.</td></tr>'}
        </tbody>
      </table>
      
      <p style="text-align: right; font-size: 1.1em; margin: 10px 0;"><strong>Total Amount: ₹${totalPrice.toFixed(2)}</strong></p>
      
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 10px;">
            <h4 style="margin: 0 0 5px 0; color: #555;">Billing Address</h4>
            <p style="font-size: 0.9em; line-height: 1.4; color: #444; margin: 0;">
              ${billing.Firstname || ''} ${billing.Lastname || ''}<br>
              ${billing.City || ''}, ${billing.Zipcode || ''}
            </p>
          </td>
          <td style="width: 50%; vertical-align: top; padding-left: 10px;">
            <h4 style="margin: 0 0 5px 0; color: #555;">Shipping Address</h4>
            <p style="font-size: 0.9em; line-height: 1.4; color: #444; margin: 0;">
              ${shipping.Firstname || ''} ${shipping.Lastname || ''}<br>
              ${shipping.City || ''}, ${shipping.Zipcode || ''}
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
}