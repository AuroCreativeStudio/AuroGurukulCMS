"use strict";

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
  async generateReceipt(order) {
    return new Promise((resolve, reject) => {
      let tempFilePath = null;

      try {
        console.log("--- Starting Receipt Generation (Smart Environment Check) ---");

        // 1. SETUP & PATHS
        const rootDir = process.cwd();
        const fontsDir = path.join(rootDir, "fonts");
        const logoPath = path.join(rootDir, "public", "invoices", "logo.png"); // Re-use logo

        const receiptNumber = `RCPT-${order.Order_ID || Date.now()}`;
        const fileName = `${receiptNumber}.pdf`;

        // 2. CREATE TEMP FILE
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
              console.log("🚀 Production detected: Uploading Receipt to GCS...");
              
              const stats = fs.statSync(tempFilePath);
              
              const uploadedFiles = await strapi.plugin("upload").service("upload").upload({
                data: {
                  fileInfo: {
                    name: fileName,
                    caption: `Receipt for Order ${order.Order_ID}`,
                    alternativeText: receiptNumber,
                  },
                },
                files: {
                  name: fileName,
                  hash: receiptNumber,
                  ext: ".pdf",
                  mime: "application/pdf",
                  size: stats.size,
                  type: "application/pdf",
                  path: tempFilePath,
                  filepath: tempFilePath,
                  getStream: () => fs.createReadStream(tempFilePath),
                },
              });

              const fileData = uploadedFiles[0];
              console.log("✅ GCS Upload Success:", fileData?.url);

              // Cleanup Temp
              if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

              resolve({
                receiptNumber,
                fileName,
                url: fileData?.url,
                fileId: fileData?.id,
                filePath: fileData?.url 
              });

            } else {
              // =========================================================
              // 🛠️ LOCAL PATH: Bypass Plugin completely
              // =========================================================
              console.log("⚠️ Dev Mode: Bypassing GCS for Receipt, saving locally.");

              // Define local storage path (public/receipts)
              const publicDir = path.join(rootDir, "public", "receipts");
              if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
              }

              const localFilePath = path.join(publicDir, fileName);

              // Move file from Temp to Public folder
              fs.copyFileSync(tempFilePath, localFilePath);
              
              // Cleanup Temp
              if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

              console.log("✅ Receipt Saved Locally:", localFilePath);

              resolve({
                receiptNumber,
                fileName,
                // Local URL
                url: `/receipts/${fileName}`, 
                // Full Filesystem Path
                filePath: localFilePath, 
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
        // 4. PDF CONTENT
        // ---------------------------------------------------------
        const safeExists = (p) => fs.existsSync(p);
        
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
            const pageWidth = doc.page.width;
            const logoWidth = 50;
            const logoHeight = 50;
            const logoX = (pageWidth - logoWidth) / 2;
            const logoY = 30;

            doc.image(logoPath, logoX, logoY, { fit: [logoWidth, logoHeight] });
            doc.y = logoY + logoHeight;
          } catch (e) { console.warn("Logo skipped:", e.message); }
        }

        // --- HEADER ---
        doc.font("InterBold").fontSize(26).text("AuroGurukul", { align: "center" });
        doc.moveDown(0.2);
        doc.font("InterBold").fontSize(18).text("PAYMENT RECEIPT", { align: "center" });
        doc.moveDown(1.2);

        // --- META INFO ---
        doc.font("Inter").fontSize(12);
        doc.text(`Receipt Number: ${receiptNumber}`);
        doc.text(`Order ID: ${order.Order_ID || "N/A"}`);
        doc.text(`Date: ${new Date().toLocaleString()}`);
        doc.text(`Transaction ID: ${order.Transaction_Id || "N/A"}`);
        doc.moveDown();

        // --- BILLING ADDRESS ---
        const b = order.Billing_Address || {};
        doc.font("InterMedium").fontSize(14).text("Billed To", { underline: true });
        doc.font("Inter").fontSize(11).text(
          `${b.Firstname || ""} ${b.Lastname || ""}\n` +
          `${b.Address || ""}\n${b.City || ""}, ${b.State || ""}\n` +
          `${b.Zipcode || ""}\nPhone: ${b.Phone || ""}\nEmail: ${b.Email || ""}`
        );
        doc.moveDown(1.5);

        // --- ITEMS TABLE ---
        doc.font("InterBold").fontSize(14).text("Details", { underline: true });
        doc.moveDown(0.6);

        const tableTop = doc.y;
        const col = { item: 250, price: 100 };

        doc.font("InterMedium").fontSize(12);
        doc.text("Item", 40, tableTop);
        doc.text("Amount", 40 + col.item + 100, tableTop); 

        doc.moveTo(40, tableTop + 15).lineTo(500, tableTop + 15).stroke();
        let posY = tableTop + 25;

        // Render Course Item
        if (order.Course_Item) {
          const courses = Array.isArray(order.Course_Item) ? order.Course_Item : [order.Course_Item];
          courses.forEach(c => {
             doc.font("Inter").fontSize(11).text(c.Course_Title || "Course Enrollment", 40, posY, { width: col.item });
             doc.text(`₹ ${c.Course_Fees}`, 40 + col.item + 100, posY);
             posY += 20;
          });
        }

        // Render Product Items
        if (Array.isArray(order.Product_Item)) {
          order.Product_Item.forEach((p) => {
            const qty = p.Quantity ?? p.quantity ?? 1;
            const title = p.Product_Title + (qty > 1 ? ` (x${qty})` : "");
            
            doc.font("Inter").fontSize(11).text(title, 40, posY, { width: col.item });
            doc.text(`₹ ${p.Product_Price}`, 40 + col.item + 100, posY);
            posY += 20;
          });
        }

        doc.moveDown(2);

        // --- PAYMENT SUMMARY ---
        doc.font("InterBold").fontSize(14).text("Payment Summary", { underline: true });
        doc.moveDown(0.6);

        doc.font("Inter").fontSize(12);
        
        const paymentStatus = order.Payment_Status ? "Completed" : "Pending";
        const paymentMode = order.Payment_Response?.paymentDetails?.[0]?.paymentMode || "Online";

        doc.text(`Total Amount: ₹ ${order.Total || order.Price || 0}`);
        doc.moveDown(0.5);
        doc.font("InterBold").text(`Status: ${paymentStatus}`);
        doc.font("Inter").text(`Mode: ${paymentMode}`);

        // --- FOOTER ---
        doc.moveDown(3);
        doc.font("Inter").fontSize(10).fillColor("#666")
            .text("Thank you for your enrollment with Auro Gurukul.", { align: "center" });

        doc.end();

      } catch (err) {
        if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        console.error("Receipt generation failed:", err);
        reject(err);
      }
    });
  },
};