"use strict";

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
  async generateInvoice(order) {
    return new Promise((resolve, reject) => {
      let tempFilePath = null;

      try {
        console.log("--- Starting Invoice Generation (Smart Environment Check) ---");

        // 1. SETUP PATHS
        const rootDir = process.cwd();
        const fontsDir = path.join(rootDir, "fonts");
        const logoPath = path.join(rootDir, "public", "invoices", "logo.png");

        const invoiceNumber = "INV-" + Date.now();
        const fileName = `${invoiceNumber}.pdf`;

        // 2. CREATE TEMP FILE
        // We create it in a temp folder first for safety
        tempFilePath = path.join(os.tmpdir(), fileName);

        // 3. GENERATE PDF
        const doc = new PDFDocument({ size: "A4", margin: 40 });
        const writeStream = fs.createWriteStream(tempFilePath);

        doc.pipe(writeStream);

        // Handle Errors
        doc.on("error", (err) => {
           console.error("PDF Error:", err);
           reject(err);
        });

        writeStream.on("error", (err) => {
          console.error("File Write Error:", err);
          reject(err);
        });

        writeStream.on("finish", async () => {
          try {
            // Check if we are in Production
            const isProduction = process.env.NODE_ENV === 'production';

            if (isProduction) {
              // =========================================================
              // 🚀 PRODUCTION PATH: Use Strapi Upload (GCS)
              // =========================================================
              console.log("🚀 Production detected: Uploading to GCS via Plugin...");
              
              const stats = fs.statSync(tempFilePath);
              
              // This uses your working plugins.js configuration
              const uploadedFiles = await strapi.plugin("upload").service("upload").upload({
                data: {
                  fileInfo: {
                    name: fileName,
                    caption: `Invoice for Order ${order.Order_ID}`,
                    alternativeText: invoiceNumber,
                  },
                },
                files: {
                  name: fileName,
                  hash: invoiceNumber,
                  ext: ".pdf",
                  mime: "application/pdf",
                  size: stats.size,
                  type: "application/pdf",
                  path: tempFilePath,
                  filepath: tempFilePath,
                  getStream: () => fs.createReadStream(tempFilePath), // v5 fix
                },
              });

              const fileData = uploadedFiles[0];
              console.log("✅ GCS Upload Success:", fileData?.url);

              // Cleanup Temp
              if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

              resolve({
                invoiceNumber,
                fileName,
                url: fileData?.url,
                fileId: fileData?.id,
                // Return path just in case, though usually URL is enough for prod
                filePath: fileData?.url 
              });

            } else {
              // =========================================================
              // 🛠️ LOCAL PATH: Bypass Plugin completely
              // =========================================================
              console.log("⚠️ Dev Mode: Bypassing GCS Plugin to avoid Billing Error.");

              // Define local storage path (public/invoices)
              const publicDir = path.join(rootDir, "public", "invoices");
              if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
              }

              const localFilePath = path.join(publicDir, fileName);

              // Move file from Temp to Public folder manually
              fs.copyFileSync(tempFilePath, localFilePath);
              
              // Cleanup Temp
              if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

              console.log("✅ Invoice Saved Locally:", localFilePath);

              resolve({
                invoiceNumber,
                fileName,
                // Local URL (accessible via http://localhost:1337/invoices/...)
                url: `/invoices/${fileName}`, 
                // Full Filesystem Path (Fixes "Document filePath missing" error for emailers)
                filePath: localFilePath, 
                path: localFilePath, // Redundant fallback
                fileId: null 
              });
            }

          } catch (uploadError) {
            console.error("Processing Failed:", uploadError);
            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            reject(uploadError);
          }
        });

        // ---------------------------------------------------------
        // 4. PDF VISUAL CONTENT
        // ---------------------------------------------------------
        const safeExists = (p) => fs.existsSync(p);
        const registerFontSafe = (name, p) => safeExists(p) ? doc.registerFont(name, p) : doc.registerFont(name, "Helvetica");

        registerFontSafe("Inter", path.join(fontsDir, "Inter_18pt-Regular.ttf"));
        registerFontSafe("InterMedium", path.join(fontsDir, "Inter_18pt-Medium.ttf"));
        registerFontSafe("InterBold", path.join(fontsDir, "Inter_18pt-Bold.ttf"));

        if (safeExists(logoPath)) {
          try { doc.image(logoPath, (doc.page.width - 50) / 2, 30, { fit: [50, 50] }); doc.y = 80; } catch (e) {}
        }

        doc.font("InterBold").fontSize(26).text("AuroGurukul", { align: "center" });
        doc.moveDown(0.2);
        doc.font("InterBold").fontSize(18).text("INVOICE", { align: "center" });
        doc.moveDown(1.2);

        doc.font("Inter").fontSize(12);
        doc.text(`Invoice Number: ${invoiceNumber}`);
        doc.text(`Order ID: ${order.Order_ID || "N/A"}`);
        doc.text(`Date: ${new Date().toLocaleString()}`);
        doc.moveDown();

        const b = order.Billing_Address || {};
        doc.font("InterMedium").fontSize(14).text("Billing Address", { underline: true });
        doc.font("Inter").fontSize(11).text(
          `${b.Firstname || ""} ${b.Lastname || ""}\n${b.Address || ""}\n${b.City || ""}, ${b.State || ""}\n${b.Zipcode || ""}\nPhone: ${b.Phone || ""}\nEmail: ${b.Email || ""}`
        );
        doc.moveDown();

        const s = order.Shipping_Address || {};
        doc.font("InterMedium").fontSize(14).text("Shipping Address", { underline: true });
        doc.font("Inter").fontSize(11).text(
          `${s.Firstname || ""} ${s.Lastname || ""}\n${s.Address || ""}\n${s.City || ""}, ${s.State || ""}\n${s.Zipcode || ""}\nPhone: ${s.Phone || ""}\nEmail: ${s.Email || ""}`
        );
        doc.moveDown(1.5);

        doc.font("InterBold").fontSize(14).text("Items", { underline: true });
        const tableTop = doc.y + 15;
        doc.font("InterMedium").fontSize(12);
        doc.text("Item", 40, tableTop);
        doc.text("Qty", 290, tableTop);
        doc.text("Price", 390, tableTop);
        doc.moveTo(40, tableTop + 15).lineTo(500, tableTop + 15).stroke();
        
        let posY = tableTop + 25;
        if (order.Course_Item) {
          doc.font("Inter").fontSize(11).text(order.Course_Item.Course_Title || "Course", 40, posY, { width: 240 });
          doc.text("1", 290, posY);
          doc.text(`₹ ${order.Course_Item.Course_Fees || 0}`, 390, posY);
          posY += 20;
        }
        if (Array.isArray(order.Product_Item)) {
          order.Product_Item.forEach((p) => {
            doc.font("Inter").fontSize(11).text(p.Product_Title || "Product", 40, posY, { width: 240 });
            doc.text(String(p.Quantity || 1), 290, posY);
            doc.text(`₹ ${p.Product_Price || 0}`, 390, posY);
            posY += 20;
          });
        }

        doc.moveDown(2);
        doc.font("InterBold").fontSize(14).text("Payment Summary", { underline: true });
        doc.font("Inter").fontSize(12);
        doc.text(`Total Paid: ₹ ${order.Total || order.Price || 0}`);

        doc.end();

      } catch (err) {
        if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        reject(err);
      }
    });
  },
};