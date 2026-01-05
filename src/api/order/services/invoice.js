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
        console.log("--- Starting Invoice Generation (Strapi v5 Fix) ---");

        // ---------------------------------------------------------
        // 1. SETUP & PATHS
        // ---------------------------------------------------------
        const rootDir = process.cwd();
        // Point to fonts relative to root
        const fontsDir = path.join(rootDir, "fonts");
        const logoPath = path.join(rootDir, "public", "invoices", "logo.png");

        const invoiceNumber = "INV-" + Date.now();
        const fileName = `${invoiceNumber}.pdf`;

        // Generate temp path
        tempFilePath = path.join(os.tmpdir(), fileName);
        console.log("Temp file path:", tempFilePath);

        // ---------------------------------------------------------
        // 2. PDF GENERATION
        // ---------------------------------------------------------
        const doc = new PDFDocument({ size: "A4", margin: 40 });
        const writeStream = fs.createWriteStream(tempFilePath);

        doc.pipe(writeStream);

        // Handle generation errors
        doc.on("error", (err) => {
           console.error("PDF Creation Error:", err);
           reject(err);
        });

        writeStream.on("error", (err) => {
          console.error("File Write Error:", err);
          reject(err);
        });

        writeStream.on("finish", async () => {
          try {
            console.log("PDF generated. Preparing upload...");
            
            // Verify file exists
            if (!fs.existsSync(tempFilePath)) {
               throw new Error(`Temp file not found at ${tempFilePath}`);
            }
            const stats = fs.statSync(tempFilePath);

            // ---------------------------------------------------------
            // 3. UPLOAD WITH MANUAL STREAM OVERRIDE
            // ---------------------------------------------------------
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
                
                // Polymorphic paths (for safety)
                path: tempFilePath,
                filepath: tempFilePath,
                
                // --- THE CRITICAL FIX FOR STRAPI v5 ---
                // We provide the stream manually so Strapi doesn't have to guess.
                getStream: () => fs.createReadStream(tempFilePath),
              },
            });

            // Strapi returns an array
            const fileData = uploadedFiles[0];
            console.log("Upload Success:", fileData?.url);

            // ---------------------------------------------------------
            // 4. CLEANUP
            // ---------------------------------------------------------
            fs.unlink(tempFilePath, (err) => {
              if (err) console.warn("Cleanup warning:", err.message);
            });

            resolve({
              invoiceNumber,
              fileName,
              url: fileData?.url,
              fileId: fileData?.id,
            });

          } catch (uploadError) {
            // Ensure cleanup happens even on error
            if (fs.existsSync(tempFilePath)) fs.unlink(tempFilePath, () => {});
            
            console.error("Upload Failed:", uploadError);
            reject(uploadError);
          }
        });

        // ---------------------------------------------------------
        // 5. DOC CONTENT & FONTS
        // ---------------------------------------------------------
        const safeExists = (p) => p && typeof p === "string" && fs.existsSync(p);
        
        const registerFontSafe = (name, p) => {
          if (safeExists(p)) doc.registerFont(name, p);
          else doc.registerFont(name, "Helvetica");
        };

        registerFontSafe("Inter", path.join(fontsDir, "Inter_18pt-Regular.ttf"));
        registerFontSafe("InterMedium", path.join(fontsDir, "Inter_18pt-Medium.ttf"));
        registerFontSafe("InterBold", path.join(fontsDir, "Inter_18pt-Bold.ttf"));

        // Logo
        if (safeExists(logoPath)) {
          try {
            doc.image(logoPath, (doc.page.width - 50) / 2, 30, { fit: [50, 50] });
            doc.y = 80;
          } catch (e) { console.warn("Logo skipped:", e.message); }
        }

        // --- INVOICE CONTENT ---
        doc.font("InterBold").fontSize(26).text("AuroGurukul", { align: "center" });
        doc.moveDown(0.2);
        doc.font("InterBold").fontSize(18).text("INVOICE", { align: "center" });
        doc.moveDown(1.2);

        // Meta
        doc.font("Inter").fontSize(12);
        doc.text(`Invoice Number: ${invoiceNumber}`);
        doc.text(`Order ID: ${order.Order_ID || "N/A"}`);
        doc.text(`Date: ${new Date().toLocaleString()}`);
        doc.moveDown();

        // Billing
        const b = order.Billing_Address || {};
        doc.font("InterMedium").fontSize(14).text("Billing Address", { underline: true });
        doc.font("Inter").fontSize(11).text(
          `${b.Firstname || ""} ${b.Lastname || ""}\n` +
          `${b.Address || ""}\n${b.City || ""}, ${b.State || ""}\n` +
          `${b.Zipcode || ""}\nPhone: ${b.Phone || ""}\nEmail: ${b.Email || ""}`
        );
        doc.moveDown();

        // Shipping
        const s = order.Shipping_Address || {};
        doc.font("InterMedium").fontSize(14).text("Shipping Address", { underline: true });
        doc.font("Inter").fontSize(11).text(
          `${s.Firstname || ""} ${s.Lastname || ""}\n` +
          `${s.Address || ""}\n${s.City || ""}, ${s.State || ""}\n` +
          `${s.Zipcode || ""}\nPhone: ${s.Phone || ""}\nEmail: ${s.Email || ""}`
        );
        doc.moveDown(1.5);

        // Table
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
        if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlink(tempFilePath, () => {});
        console.error("General Error:", err);
        reject(err);
      }
    });
  },
};