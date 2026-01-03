"use strict";

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");

module.exports = {
  async generateReceipt(order) {
    return new Promise(async (resolve, reject) => {
      try {
        const rootDir = process.cwd();
        const fontsDir = path.join(rootDir, "fonts");
        const logoPath = path.join(rootDir, "public", "invoices", "logo.png");

        const receiptNumber = `RCPT-${order.Order_ID || Date.now()}`;
        const fileName = `${receiptNumber}.pdf`;

        const doc = new PDFDocument({ size: "A4", margin: 40 });

        // 🔹 Capture PDF in memory
        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", async () => {
          try {
            const pdfBuffer = Buffer.concat(buffers);

            // 🔹 Upload to Strapi (uses YOUR GCS config)
            const uploadService = strapi
              .plugin("upload")
              .service("upload");

            const stream = new Readable();
            stream.push(pdfBuffer);
            stream.push(null);

            const uploadedFiles = await uploadService.upload({
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
              fileName: uploadedFiles[0].name,
              url: uploadedFiles[0].url, // ✅ DOWNLOAD THIS
            });
          } catch (err) {
            reject(err);
          }
        });

        // ---------------------------------------------------------
        // Fonts (safe fallback)
        // ---------------------------------------------------------
        const registerFontSafe = (name, p) => {
          if (fs.existsSync(p)) doc.registerFont(name, p);
          else doc.registerFont(name, "Helvetica");
        };

        registerFontSafe("Inter", path.join(fontsDir, "Inter_18pt-Regular.ttf"));
        registerFontSafe("InterMedium", path.join(fontsDir, "Inter_18pt-Medium.ttf"));
        registerFontSafe("InterBold", path.join(fontsDir, "Inter_18pt-Bold.ttf"));

        // ---------------------------------------------------------
        // Logo
        // ---------------------------------------------------------
        if (fs.existsSync(logoPath)) {
          const pageWidth = doc.page.width;
          doc.image(logoPath, (pageWidth - 50) / 2, 30, {
            fit: [50, 50],
          });
          doc.moveDown(2);
        }

        // ---------------------------------------------------------
        // CONTENT
        // ---------------------------------------------------------
        doc.font("InterBold").fontSize(26).text("AuroGurukul", { align: "center" });
        doc.font("InterBold").fontSize(18).text("PAYMENT RECEIPT", { align: "center" });
        doc.moveDown();

        doc.font("Inter").fontSize(12);
        doc.text(`Receipt Number: ${receiptNumber}`);
        doc.text(`Order ID: ${order.Order_ID}`);
        doc.text(`Date: ${new Date().toLocaleString()}`);
        doc.text(`Transaction ID: ${order.Transaction_Id || "N/A"}`);
        doc.moveDown();

        doc.font("InterBold").text("Payment Summary", { underline: true });
        doc.font("Inter").text(`Total Amount: ₹ ${order.Price || 0}`);
        doc.text(`Status: ${order.Payment_Status ? "Completed" : "Pending"}`);

        doc.moveDown(3);
        doc.fontSize(10).fillColor("#666").text(
          "Thank you for your enrollment with Auro Gurukul.",
          { align: "center" }
        );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  },
};
