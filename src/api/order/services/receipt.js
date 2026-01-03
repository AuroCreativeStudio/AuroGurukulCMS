"use strict";

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports = {
  async generateReceipt(order) {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `RCPT-${order.Order_ID || Date.now()}.pdf`;
      const receiptDir = path.join(process.cwd(), "public", "receipts");

      if (!fs.existsSync(receiptDir)) {
        fs.mkdirSync(receiptDir, { recursive: true });
      }

      const filePath = path.join(receiptDir, fileName);
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(24).text("PAYMENT RECEIPT", { align: "center" });
      doc.moveDown();

      // Receipt Details
      doc.fontSize(12);
      doc.text(`Receipt No: ${order.Order_ID}`, { align: "right" });
      doc.text(`Date: ${new Date(order.Date).toLocaleDateString()}`, {
        align: "right",
      });
      doc.text(`Transaction ID: ${order.Transaction_Id || "Pending"}`, {
        align: "right",
      });
      doc.moveDown(2);

      // Billing Information
      doc.fontSize(14).text("Bill To:", { underline: true });
      doc.fontSize(11);
      const billing = order.Billing_Address;
      if (billing) {
        doc.text(`${billing.Firstname} ${billing.Lastname}`);
        doc.text(billing.Email);
        doc.text(billing.Phone);
        doc.text(
          `${billing.Address}, ${billing.City}, ${billing.State} - ${billing.Zipcode}`
        );
      }
      doc.moveDown(2);

      // Course Details
      doc.fontSize(14).text("Course Details:", { underline: true });
      doc.moveDown(0.5);

      const courseItems = Array.isArray(order.Course_Item)
        ? order.Course_Item
        : order.Course_Item
          ? [order.Course_Item]
          : [];

      if (courseItems.length > 0) {
        courseItems.forEach((course) => {
          doc.fontSize(11);
          doc.text(`Course: ${course.Course_Title}`);
          doc.text(`School: ${course.School}`);
          doc.text(`Class: ${course.Class}`);
          doc.text(`Fees: ₹${course.Course_Fees}`, { align: "right" });
          doc.moveDown(0.5);
        });
      }

      doc.moveDown();

      // Payment Details
      doc.fontSize(14).text("Payment Information:", { underline: true });
      doc.fontSize(11);
      doc.text(
        `Payment Status: ${order.Payment_Status ? "Completed" : "Pending"}`
      );
      doc.text(
        `Payment Mode: ${order.Payment_Response?.paymentDetails?.[0]?.paymentMode || "Online"}`
      );
      doc.moveDown();

      // Total
      doc.fontSize(16);
      doc.text(`Total Amount: ₹${order.Price}`, { align: "right", bold: true });

      doc.moveDown(3);

      // Footer
      doc
        .fontSize(10)
        .text("Thank you for your enrollment!", {
          align: "center",
          color: "gray",
        });
      doc.text("This is a computer-generated receipt.", {
        align: "center",
        color: "gray",
      });

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on("finish", () => {
          console.log(`Receipt created at: ${filePath}`);
          resolve({ filePath, fileName });
        });
        stream.on("error", reject);
      });
    } catch (error) {
      console.error("Receipt generation error:", error);
      throw error;
    }
  },
};