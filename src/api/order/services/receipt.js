"use strict";

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports = {
  async generateReceipt(order) {
    return new Promise((resolve, reject) => {
      try {
        // ---------------------------------------------------------
        // 1. DYNAMIC PATH CONFIGURATION
        // ---------------------------------------------------------
        const rootDir = process.cwd();
        const fontsDir = path.join(rootDir, "fonts");
        const receiptDir = path.join(rootDir, "public", "receipts");
        const logoPath = path.join(rootDir, "public", "invoices", "logo.png"); // Assuming same logo location

        // ---------------------------------------------------------
        // 2. FILE SETUP
        // ---------------------------------------------------------
        const receiptNumber = `RCPT-${order.Order_ID || Date.now()}`;
        const fileName = `${receiptNumber}.pdf`;

        if (!fs.existsSync(receiptDir)) {
          fs.mkdirSync(receiptDir, { recursive: true });
        }

        const filePath = path.join(receiptDir, fileName);
        console.log("Receipt being created at:", filePath);

        // ---------------------------------------------------------
        // 3. PDF GENERATION
        // ---------------------------------------------------------
        const doc = new PDFDocument({ size: "A4", margin: 40 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        stream.on("finish", () => resolve({ fileName, filePath }));
        stream.on("error", reject);

        // ---------------------------------------------------------
        // 4. FONT REGISTRATION (Matching Invoice)
        // ---------------------------------------------------------
        const fontPaths = {
          regular: path.join(fontsDir, "Inter_18pt-Regular.ttf"),
          medium: path.join(fontsDir, "Inter_18pt-Medium.ttf"),
          bold: path.join(fontsDir, "Inter_18pt-Bold.ttf"),
        };

        const registerFontSafe = (name, path) => {
          if (fs.existsSync(path)) {
            doc.registerFont(name, path);
          } else {
            // Fallback if fonts are missing
            doc.registerFont(name, "Helvetica"); 
          }
        };

        registerFontSafe("Inter", fontPaths.regular);
        registerFontSafe("InterMedium", fontPaths.medium);
        registerFontSafe("InterBold", fontPaths.bold);

        // ---------------------------------------------------------
        // 5. DOCUMENT CONTENT
        // ---------------------------------------------------------

        // --- LOGO ---
        try {
          if (fs.existsSync(logoPath)) {
            const pageWidth = doc.page.width;
            const logoWidth = 50;
            const logoHeight = 50;
            const logoX = (pageWidth - logoWidth) / 2;
            const logoY = 30;

            doc.image(logoPath, logoX, logoY, { fit: [logoWidth, logoHeight] });
            doc.y = logoY + logoHeight;
          }
        } catch (err) {
          console.warn("Logo skipped:", err.message);
        }

        // --- HEADER ---
        doc.font("InterBold").fontSize(26).text("AuroGurukul", { align: "center" });
        doc.moveDown(0.2);
        doc.font("InterBold").fontSize(18).text("PAYMENT RECEIPT", { align: "center" });
        doc.moveDown(1.2);

        // --- META INFO ---
        doc.font("Inter").fontSize(12);
        doc.text(`Receipt Number: ${receiptNumber}`);
        doc.text(`Order ID: ${order.Order_ID}`);
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

        // --- ITEMS TABLE (Matching Invoice UI) ---
        doc.font("InterBold").fontSize(14).text("Courses", { underline: true });
        doc.moveDown(0.6);

        const tableTop = doc.y;
        const col = { item: 250, qty: 100, price: 100 };

        doc.font("InterMedium").fontSize(12);
        doc.text("Item", 40, tableTop);
        doc.text("Price", 40 + col.item + col.qty, tableTop);

        doc.moveTo(40, tableTop + 15).lineTo(500, tableTop + 15).stroke();
        let posY = tableTop + 25;

        // Render Course Item
        if (order.Course_Item) {
          // Handle both single object or array if structure varies
          const courses = Array.isArray(order.Course_Item) ? order.Course_Item : [order.Course_Item];
          
          courses.forEach(c => {
             doc.font("Inter").fontSize(11).text(c.Course_Title || "Course Enrollment", 40, posY, { width: col.item });
             doc.text(`₹ ${c.Course_Fees}`, 40 + col.item + col.qty, posY);
             posY += 20;
          });
        }

        // Render Product Items
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
        
        // Payment Status Logic
        const paymentStatus = order.Payment_Status ? "Completed" : "Pending";
        const paymentMode = order.Payment_Response?.paymentDetails?.[0]?.paymentMode || "Online";

        doc.text(`Total Amount: ₹ ${order.Price || 0}`);
        doc.moveDown(0.5);
        doc.font("InterBold").text(`Status: ${paymentStatus}`);
        doc.font("Inter").text(`Mode: ${paymentMode}`);

        // --- FOOTER ---
        doc.moveDown(3);
        doc.font("Inter").fontSize(10).fillColor("#666")
           .text("Thank you for your enrollment with Auro Gurukul.", { align: "center" });
        doc.end();

      } catch (err) {
        console.error("Receipt generation failed:", err);
        reject(err);
      }
    });
  },
};