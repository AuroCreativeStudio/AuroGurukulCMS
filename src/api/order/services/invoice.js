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

        // PDF Document
        const doc = new PDFDocument({
          size: "A4",
          margin: 40,
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        //------------------------------------------------------------------
        // HEADER
        //------------------------------------------------------------------
        doc.fontSize(26).text("Auro Gurukul", { align: "center" });
        doc.moveDown(0.3);
        doc.fontSize(16).text("INVOICE", { align: "center" });
        doc.moveDown(1.2);

        //------------------------------------------------------------------
        // INVOICE META
        //------------------------------------------------------------------
        doc.fontSize(12);
        doc.text(`Invoice Number: ${invoiceNumber}`);
        doc.text(`Order ID: ${order.Order_ID}`);
        doc.text(`Date: ${new Date(order.Date).toLocaleString()}`);
        doc.moveDown(1.5);

        //------------------------------------------------------------------
        // BILLING ADDRESS
        //------------------------------------------------------------------
        const b = order.Billing_Address || {};
        doc.fontSize(14).text("Billing Address", { underline: true });
        doc.fontSize(11).text(
          `${b.Firstname || ""} ${b.Lastname || ""}\n` +
          `${b.Address || ""}\n${b.City || ""}, ${b.State || ""}\n` +
          `${b.Zipcode || ""}\nPhone: ${b.Phone || ""}\nEmail: ${b.Email || ""}`
        );
        doc.moveDown(1.2);

        //------------------------------------------------------------------
        // SHIPPING ADDRESS
        //------------------------------------------------------------------
        const s = order.Shipping_Address || {};
        doc.fontSize(14).text("Shipping Address", { underline: true });
        doc.fontSize(11).text(
          `${s.Firstname || ""} ${s.Lastname || ""}\n` +
          `${s.Address || ""}\n${s.City || ""}, ${s.State || ""}\n` +
          `${s.Zipcode || ""}\nPhone: ${s.Phone || ""}\nEmail: ${s.Email || ""}`
        );
        doc.moveDown(1.5);

        //------------------------------------------------------------------
        // ITEMS TABLE HEADER
        //------------------------------------------------------------------
        doc.fontSize(14).text("Items", { underline: true });
        doc.moveDown(0.6);

        const tableTop = doc.y;

        const columnWidths = {
          item: 250,
          qty: 100,
          price: 100,
        };

        // Header Row
        doc.fontSize(12).text("Item", 40, tableTop);
        doc.text("Qty", 40 + columnWidths.item, tableTop);
        doc.text("Price", 40 + columnWidths.item + columnWidths.qty, tableTop);

        doc.moveTo(40, tableTop + 15)
          .lineTo(500, tableTop + 15)
          .stroke();

        let posY = tableTop + 25;

        //------------------------------------------------------------------
        // COURSE ROW
        //------------------------------------------------------------------
        if (order.Course_Item) {
          const c = order.Course_Item;

          doc.fontSize(11).text(`${c.Title}`, 40, posY, {
            width: columnWidths.item,
          });

          doc.text("1", 40 + columnWidths.item, posY);

          doc.text(`₹${c.Price}`, 40 + columnWidths.item + columnWidths.qty, posY);

          posY += 20;
        }

        //------------------------------------------------------------------
        // PRODUCT ROWS
        //------------------------------------------------------------------
        if (Array.isArray(order.Product_Item)) {
          order.Product_Item.forEach((p) => {
            doc.fontSize(11).text(`${p.Title}`, 40, posY, {
              width: columnWidths.item,
            });

            doc.text(`${p.Quantity}`, 40 + columnWidths.item, posY);

            doc.text(
              `₹${p.Price}`,
              40 + columnWidths.item + columnWidths.qty,
              posY
            );

            posY += 20;
          });
        }

        doc.moveDown(2);

        //------------------------------------------------------------------
        // PAYMENT SUMMARY
        //------------------------------------------------------------------
        doc.fontSize(14).text("Payment Summary", { underline: true });
        doc.moveDown(0.6);

        const subtotal = order.Price || 0;
        const discount = order.Discount || 0;
        const totalPaid = order.Total || subtotal;

        doc.fontSize(12).text(`Subtotal: ₹${subtotal}`);
        doc.text(`Discount: ₹${discount}`);
        doc.text(`Total Paid: ₹${totalPaid}`);

        //------------------------------------------------------------------
        // FOOTER
        //------------------------------------------------------------------
        doc.moveDown(3);
        doc.fontSize(10).fillColor("#666")
          .text(
            "Thank you for choosing Auro Gurukul.",
            { align: "center" }
          );

        doc.end();

        stream.on("finish", () => {
          resolve({ invoiceNumber, fileName, filePath });
        });

        stream.on("error", reject);

      } catch (err) {
        reject(err);
      }
    });
  },
};
