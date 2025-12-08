"use strict";

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports = {
  async generateInvoice(order) {
    return new Promise((resolve, reject) => {
      try {
        const invoiceNumber = "INV-" + Date.now();
        const fileName = `${invoiceNumber}.pdf`;

        const invoiceDir = "D:/backend/AuroGurukulCMS/public/invoices";

        if (!fs.existsSync(invoiceDir)) {
          fs.mkdirSync(invoiceDir, { recursive: true });
        }

        const filePath = path.join(invoiceDir, fileName);
        console.log("Invoice will be created at:", filePath);

        // LOAD FONTS
        const interRegular = "D:/backend/AuroGurukulCMS/fonts/Inter_18pt-Regular.ttf";
        const interMedium = "D:/backend/AuroGurukulCMS/fonts/Inter_18pt-Medium.ttf";
        const interBold   = "D:/backend/AuroGurukulCMS/fonts/Inter_18pt-Bold.ttf";

        const doc = new PDFDocument({ size: "A4", margin: 40 });

        doc.registerFont("Inter", interRegular);
        doc.registerFont("InterMedium", interMedium);
        doc.registerFont("InterBold", interBold);

        // STREAM HANDLING
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        stream.on("finish", () => resolve({ invoiceNumber, fileName, filePath }));
        stream.on("error", reject);

        // SAFE LOGO BLOCK (FIXED)
        const logoPath = "D:/backend/AuroGurukulCMS/public/invoices/logo.png";

        try {
          if (fs.existsSync(logoPath)) {
            const pageWidth = doc.page.width;

            const logoWidth = 50;
            const logoHeight = 50;
            const logoX = (pageWidth - logoWidth) / 2;
            const logoY = 30;

            // THIS is where the previous crashes occurred.
            doc.image(logoPath, logoX, logoY, { fit: [logoWidth, logoHeight] });

            doc.y = logoY + logoHeight;
          } else {
            console.warn("Logo file missing at:", logoPath);
          }
        } catch (err) {
          console.warn("Logo could not be loaded, skipping:", err.message);
        }

        // HEADER
        doc.font("InterBold").fontSize(26).text("AuroGurukul", { align: "center" });
        doc.moveDown(0.2);
        doc.font("InterBold").fontSize(18).text("INVOICE", { align: "center" });
        doc.moveDown(1.2);

        // META INFO
        doc.font("Inter").fontSize(12);
        doc.text(`Invoice Number: ${invoiceNumber}`);
        doc.text(`Order ID: ${order.Order_ID}`);
        doc.text(`Date: ${new Date().toLocaleString()}`);
        doc.moveDown();

        // BILLING
        const b = order.Billing_Address || {};

        doc.font("InterMedium").fontSize(14).text("Billing Address", { underline: true });
        doc.font("Inter").fontSize(11).text(
          `${b.Firstname || ""} ${b.Lastname || ""}\n` +
          `${b.Address || ""}\n${b.City || ""}, ${b.State || ""}\n` +
          `${b.Zipcode || ""}\nPhone: ${b.Phone || ""}\nEmail: ${b.Email || ""}`
        );
        doc.moveDown(1.2);

        // SHIPPING
        const s = order.Shipping_Address || {};

        doc.font("InterMedium").fontSize(14).text("Shipping Address", { underline: true });
        doc.font("Inter").fontSize(11).text(
          `${s.Firstname || ""} ${s.Lastname || ""}\n` +
          `${s.Address || ""}\n${s.City || ""}, ${s.State || ""}\n` +
          `${s.Zipcode || ""}\nPhone: ${s.Phone || ""}\nEmail: ${s.Email || ""}`
        );
        doc.moveDown(1.5);

        // ITEMS TABLE
        doc.font("InterBold").fontSize(14).text("Items", { underline: true });
        doc.moveDown(0.6);

        const tableTop = doc.y;
        const col = { item: 250, qty: 100, price: 100 };

        doc.font("InterMedium").fontSize(12);
        doc.text("Item", 40, tableTop);
        doc.text("Qty", 40 + col.item, tableTop);
        doc.text("Price", 40 + col.item + col.qty, tableTop);

        doc.moveTo(40, tableTop + 15).lineTo(500, tableTop + 15).stroke();
        let posY = tableTop + 25;

        if (order.Course_Item) {
          const c = order.Course_Item;

          doc.font("Inter").fontSize(11).text(c.Course_Title, 40, posY, { width: col.item });
          doc.text("1", 40 + col.item, posY);
          doc.text(`₹ ${c.Course_Fees}`, 40 + col.item + col.qty, posY);

          posY += 20;
        }

        if (Array.isArray(order.Product_Item)) {
          order.Product_Item.forEach((p) => {
            const qty = p.Quantity ?? p.quantity ?? 1;

            doc.font("Inter").fontSize(11).text(p.Product_Title, 40, posY, { width: col.item });
            doc.text(String(qty), 40 + col.item, posY);
            doc.text(`₹ ${p.Product_Price}`, 40 + col.item + col.qty, posY);

            posY += 20;
          });
        }

        doc.moveDown(2);

        // PAYMENT
        doc.font("InterBold").fontSize(14).text("Payment Summary", { underline: true });
        doc.moveDown(0.6);

        doc.font("Inter").fontSize(12);
        doc.text(`Subtotal: ₹ ${order.Price || 0}`);
        doc.text(`Discount: ₹ ${order.Discount || 0}`);
        doc.text(`Total Paid: ₹ ${order.Total || order.Price || 0}`);

        // FOOTER
        doc.moveDown(3);
        doc.font("Inter").fontSize(10).fillColor("#666")
          .text("Thank you for choosing Auro Gurukul.", { align: "center" });

        doc.end();

      } catch (err) {
        reject(err);
      }
    });
  },
};
