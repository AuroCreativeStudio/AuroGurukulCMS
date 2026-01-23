"use strict";

const nodemailer = require("nodemailer");

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Check if PDF was already sent
    if (result.pdfSent === true) {
      console.log("🔁 PDF already sent. Skipping.");
      return;
    }

    try {
      const userEmail = result.email;
      const boardName = result.board;
      const className = result.class;

      console.log("=".repeat(60));
      console.log("📧 NEW BLUEPRINT FORM SUBMISSION");
      console.log("Email:", userEmail);
      console.log("Board:", boardName);
      console.log("Class:", className);
      console.log("Submission ID:", result.id);
      console.log("=".repeat(60));

      if (!userEmail || !boardName || !className) {
        console.log("❌ Missing required fields - form saved but no email sent");
        return; // Form is already saved, just exit without sending email
      }

      /* --------------------------------------------------
       1. Find Board by name (with published filter)
      -------------------------------------------------- */
      const board = await strapi.db
        .query("api::board.board")
        .findOne({
          where: { 
            name: boardName,
            publishedAt: { $notNull: true }
          },
        });

      if (!board) {
        console.log("❌ Board not found or not published:", boardName);
        console.log("✅ Form submission saved to DB without email");
        return; // Exit without sending email, form already saved
      }

      console.log("✅ Board found:", board.name, "(ID:", board.id + ")");

      /* --------------------------------------------------
       2. Find Class by name (published only)
      -------------------------------------------------- */
      const studentClass = await strapi.db
        .query("api::class.class")
        .findOne({
          where: {
            name: className,
            publishedAt: { $notNull: true }
          },
        });

      if (!studentClass) {
        console.log("❌ Class not found or not published:", className);
        console.log("✅ Form submission saved to DB without email");
        return; // Exit without sending email, form already saved
      }

      console.log("✅ Class found:", studentClass.name, "(ID:", studentClass.id + ")");

      /* --------------------------------------------------
       3. Find Blueprint PDF by board ID and class ID
      -------------------------------------------------- */
      const blueprintPdf = await strapi.db
        .query("api::blueprint-pdf.blueprint-pdf")
        .findOne({
          where: {
            board: board.id,
            class: studentClass.id,
            publishedAt: { $notNull: true },
          },
          populate: ["pdf"],
        });

      if (!blueprintPdf || !blueprintPdf.pdf) {
        console.log("❌ Blueprint PDF not found for:");
        console.log("   Board ID:", board.id, "(" + board.name + ")");
        console.log("   Class ID:", studentClass.id, "(" + studentClass.name + ")");
        
        // List all available PDFs for debugging
        const allPdfs = await strapi.db
          .query("api::blueprint-pdf.blueprint-pdf")
          .findMany({
            where: { publishedAt: { $notNull: true } },
            populate: ["board", "class", "pdf"],
          });
        
        console.log("📋 Available Published PDFs:");
        allPdfs.forEach(pdf => {
          console.log(`   - Board: ${pdf.board?.name || 'N/A'} (ID: ${pdf.board?.id || 'N/A'})`);
          console.log(`     Class: ${pdf.class?.name || 'N/A'} (ID: ${pdf.class?.id || 'N/A'})`);
          console.log(`     Has PDF: ${pdf.pdf ? 'Yes' : 'No'}`);
        });

        console.log("✅ Form submission saved to DB without email");
        return; // Exit without sending email, form already saved
      }

      console.log("✅ Blueprint PDF found:", blueprintPdf.title || "Untitled");

      /* --------------------------------------------------
       4. Build PDF Path for email attachment
      -------------------------------------------------- */
      const pdf = blueprintPdf.pdf;
      
      // Use the absolute file system path for attachment
      const path = require('path');
      const fs = require('fs');
      
      // Construct the full file system path
      let pdfPath;
      if (pdf.url.startsWith('http')) {
        // External URL - use URL directly
        pdfPath = pdf.url;
        console.log("📎 PDF URL (external):", pdfPath);
      } else {
        // Local file - use file system path
        // Remove leading slash and construct path
        const relativePath = pdf.url.startsWith('/') ? pdf.url.slice(1) : pdf.url;
        pdfPath = path.join(process.cwd(), 'public', relativePath);
        console.log("📎 PDF Path (local):", pdfPath);
        
        // Verify file exists
        if (!fs.existsSync(pdfPath)) {
          console.log("❌ PDF file not found at:", pdfPath);
          console.log("   Trying alternative path...");
          
          // Try alternative path without 'public'
          pdfPath = path.join(process.cwd(), relativePath);
          console.log("📎 Alternative PDF Path:", pdfPath);
          
          if (!fs.existsSync(pdfPath)) {
            console.log("❌ PDF file does not exist on filesystem");
            console.log("✅ Form submission saved to DB without email");
            return; // Exit without sending email, form already saved
          }
        }
        console.log("✅ PDF file exists");
      }

      /* --------------------------------------------------
       5. Send Email with PDF
      -------------------------------------------------- */
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      console.log("📧 Sending email to:", userEmail);

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: userEmail,
        subject: `Your ${boardName} ${className} Blueprint`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #214587;">Hello ${result.name || "Student"}! 👋</h2>
            <p>Thank you for requesting your study blueprint.</p>
            <p>Please find your <strong>${boardName} ${className}</strong> blueprint attached to this email.</p>
            
            <div style="background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Board:</strong> ${boardName}</p>
              <p style="margin: 5px 0;"><strong>Class:</strong> ${className}</p>
            </div>
            
            <p>If you have any questions, feel free to contact us!</p>
            
            <p style="margin-top: 30px;">Best regards,<br/>
            <strong>AuroGurukul Team</strong></p>
          </div>
        `,
        attachments: [
          {
            filename: pdf.name || "Blueprint.pdf",
            path: pdfPath, // Use the file system path or URL
          },
        ],
      });

      /* --------------------------------------------------
       6. Update pdfSent = true (only if email was sent successfully)
      -------------------------------------------------- */
      await strapi.entityService.update(
        "api::blueprint-form-submission.blueprint-form-submission",
        result.id,
        { data: { pdfSent: true } }
      );

      console.log("✅ Blueprint PDF sent successfully to:", userEmail);
      console.log("✅ Submission marked as pdfSent: true");
      console.log("=".repeat(60));

    } catch (error) {
      console.error("❌ Error during email sending process:");
      console.error(error);
      console.log("✅ Form submission saved to DB without email");
      console.log("=".repeat(60));
      
      // Don't update pdfSent - leave it as false
      // Form is already saved, we just couldn't send the email
    }
  },
};