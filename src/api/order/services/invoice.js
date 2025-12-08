"use strict";

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports = {
  async generateInvoice(order) {
    return new Promise((resolve, reject) => {
      try {
        // ---------------------------------------------------------
        // 1. DYNAMIC PATH CONFIGURATION
        // ---------------------------------------------------------
        // process.cwd() gets the root folder of your project (e.g., D:/backend/AuroGurukulCMS)
        const rootDir = process.cwd(); 

        // Define Fonts Directory relative to root
        const fontsDir = path.join(rootDir, "fonts");
        
        // Define Output Directory relative to root
        const invoiceDir = path.join(rootDir, "public", "invoices");

        // Define Logo Path
        const logoPath = path.join(invoiceDir, "logo.png");

        // ---------------------------------------------------------
        // 2. FILE SETUP
        // ---------------------------------------------------------
        const invoiceNumber = "INV-" + Date.now();
        const fileName = `${invoiceNumber}.pdf`;

        // Ensure directory exists
        if (!fs.existsSync(invoiceDir)) {
          fs.mkdirSync(invoiceDir, { recursive: true });
        }

        const filePath = path.join(invoiceDir, fileName);
        console.log("Invoice being created at:", filePath);

        // ---------------------------------------------------------
        // 3. PDF GENERATION
        // ---------------------------------------------------------
        const doc = new PDFDocument({ size: "A4", margin: 40 });

        // Stream to file
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        stream.on("finish", () => resolve({ invoiceNumber, fileName, filePath }));
        stream.on("error", reject);

        // ---------------------------------------------------------
        // 4. FONT REGISTRATION (Safe Fallback)
        // ---------------------------------------------------------
        const fontPaths = {
          regular: path.join(fontsDir, "Inter_18pt-Regular.ttf"),
          medium:  path.join(fontsDir, "Inter_18pt-Medium.ttf"),
          bold:    path.join(fontsDir, "Inter_18pt-Bold.ttf")
        };

        // Helper to register font safely, falls back to Helvetica if missing
        const registerFontSafe = (name, path) => {
          if (fs.existsSync(path)) {
            doc.registerFont(name, path);
          } else {
            console.warn(`Font missing: ${path}. Using standard font.`);
            doc.registerFont(name, "Helvetica"); // Fallback
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

        // --- ITEMS TABLE ---
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

        // Render Course Item
        if (order.Course_Item) {
          const c = order.Course_Item;
          doc.font("Inter").fontSize(11).text(c.Course_Title, 40, posY, { width: col.item });
          doc.text("1", 40 + col.item, posY);
          doc.text(`₹ ${c.Course_Fees}`, 40 + col.item + col.qty, posY);
          posY += 20;
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