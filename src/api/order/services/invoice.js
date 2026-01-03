"use strict";

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");

module.exports = {
  async generateInvoice(order) {
    return new Promise(async (resolve, reject) => {
      try {
        // ---------------------------------------------------------
        // 1. PATHS (READ-ONLY)
        // ---------------------------------------------------------
        const rootDir = process.cwd();
        const fontsDir = path.join(rootDir, "fonts");
        const logoPath = path.join(rootDir, "public", "invoices", "logo.png");

        // ---------------------------------------------------------
        // 2. FILE SETUP
        // ---------------------------------------------------------
        const invoiceNumber = `INV-${Date.now()}`;
        const fileName = `${invoiceNumber}.pdf`;

        // ---------------------------------------------------------
        // 3. PDF GENERATION (IN-MEMORY)
        // ---------------------------------------------------------
        const doc = new PDFDocument({ size: "A4", margin: 40 });

        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));

        doc.on("end", async () => {
          try {
            const pdfBuffer = Buffer.concat(buffers);

            // -----------------------------------------------------
            // 4. UPLOAD TO STRAPI (USES YOUR GCS CONFIG)
            // -----------------------------------------------------
            const uploadService = strapi
              .plugin("upload")
              .service("upload");

            const stream = new Readable();
            stream.push(pdfBuffer);
            stream.push(null);

            const uploaded = await uploadService.upload({
              data: {},
              files: {
                path: null,
                name: fileName,
                type: "application/pdf",
                size: pdfBuffer.length,
                stream,
              },
            });

            resolve({
              invoiceNumber,
              fileName: uploaded[0].name,
              url: uploaded[0].url, // ✅ DOWNLOAD THIS
            });
          } catch (err) {
            reject(err);
          }
        });

        // ---------------------------------------------------------
        // 5. FONT REGISTRATION (SAFE FALLBACK)
        // ---------------------------------------------------------
        const registerFontSafe = (name, p) => {
          if (fs.existsSync(p)) {
            doc.registerFont(name, p);
          } else {
            doc.registerFont(name, "Helvetica");
          }
        };

        registerFontSafe("Inter", path.join(fontsDir, "Inter_18pt-Regular.ttf"));
        registerFontSafe("InterMedium", path.join(fontsDir, "Inter_18pt-Medium.ttf"));
        registerFontSafe("InterBold", path.join(fontsDir, "Inter_18pt-Bold.ttf"));

        // ---------------------------------------------------------
        // 6. DOCUMENT CONTENT
        // ---------------------------------------------------------

        // --- LOGO ---
        if (fs.existsSync(logoPath)) {
          const pageWidth = doc.page.width;
          doc.image(logoPath, (pageWidth - 50) / 2, 30, {
            fit: [50, 50],
          });
          doc.moveDown(2);
        }

        // --- HEADER ---
        doc.font("InterBold").fontSize(26).text("AuroGurukul", { align: "center" });
        doc.moveDown(0.2);
        doc.font("InterBold").fontSize(18).text("INVOICE", { align: "center" });
        doc.moveDown(1.2);

        // --- META INFO ---
        doc.font("Inter").fontSize(12);
        doc.text(`Invoice Number: ${invoiceNumber}`);
        doc.text(`Order ID: ${order.Order_ID}`);
        doc.text(`Date: ${new Date().toLocaleString()}`);
        doc.moveDown();

        // --- BILLING ---
        const b = order.Billing_Address || {};
        doc.font("InterMedium").fontSize(14).text("Billing Address", { underline: true });
        doc.font("Inter").fontSize(11).text(
          `${b.Firstname || ""} ${b.Lastname || ""}\n` +
          `${b.Address || ""}\n${b.City || ""}, ${b.State || ""}\n` +
          `${b.Zipcode || ""}\nPhone: ${b.Phone || ""}\nEmail: ${b.Email || ""}`
        );
        doc.moveDown(1.2);

        // --- SHIPPING ---
        const s = order.Shipping_Address || {};
        doc.font("InterMedium").fontSize(14).text("Shipping Address", { underline: true });
        doc.font("Inter").fontSize(11).text(
          `${s.Firstname || ""} ${s.Lastname || ""}\n` +
          `${s.Address || ""}\n${s.City || ""}, ${s.State || ""}\n` +
          `${s.Zipcode || ""}\nPhone: ${s.Phone || ""}\nEmail: ${s.Email || ""}`
        );
        doc.moveDown(1.5);

        // --- ITEMS ---
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

        // --- PAYMENT SUMMARY ---
        doc.font("InterBold").fontSize(14).text("Payment Summary", { underline: true });
        doc.moveDown(0.6);

        doc.font("Inter").fontSize(12);
        doc.text(`Subtotal: ₹ ${order.Price || 0}`);
        doc.text(`Discount: ₹ ${order.Discount || 0}`);
        doc.text(`Total Paid: ₹ ${order.Total || order.Price || 0}`);

        // --- FOOTER ---
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
