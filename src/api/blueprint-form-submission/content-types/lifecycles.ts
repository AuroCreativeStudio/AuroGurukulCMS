import nodemailer from "nodemailer";

export default {
  async afterCreate(event) {
    const { result } = event;

    try {
      // 1. Get submitted values
      const userEmail = result.email;
      const boardName = result.board;
      const className = result.class;

      if (!userEmail || !boardName || !className) {
        return;
      }

      // 2. Find Board ID by name
      const boards = await strapi.entityService.findMany(
        "api::board.board",
        {
          filters: { name: boardName },
          limit: 1,
        }
      );

      if (!boards.length) return;

      const boardId = boards[0].id;

      // 3. Find Class ID by name + board
      const classes = await strapi.entityService.findMany(
        "api::class.class",
        {
          filters: {
            name: className,
            board: boardId,
          },
          limit: 1,
        }
      );

      if (!classes.length) return;

      const classId = classes[0].id;

      // 4. Find matching Blueprint PDF
      const pdfRecords = await strapi.entityService.findMany(
        "api::blueprint-pdf.blueprint-pdf",
        {
          filters: {
            board: boardId,
            class: classId,
          },
          populate: ["pdf"],
          limit: 1,
        }
      );

      if (!pdfRecords.length || !pdfRecords[0].pdf) {
        // ❌ No PDF found
        await strapi.entityService.update(
          "api::blueprint-form-submission.blueprint-form-submission",
          result.id,
          { data: { pdfSent: false } }
        );
        return;
      }

      const pdf = pdfRecords[0].pdf;
      const pdfUrl = `${strapi.config.get("server.url")}${pdf.url}`;

      // 5. Send Email with PDF
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: userEmail,
        subject: `Your ${boardName} ${className} Blueprint`,
        html: `
          <p>Hi ${result.name},</p>
          <p>Please find your requested blueprint attached below.</p>
          <p><strong>Board:</strong> ${boardName}</p>
          <p><strong>Class:</strong> ${className}</p>
          <p>All the best,<br/>AuroGurukul Team</p>
        `,
        attachments: [
          {
            filename: pdf.name || "Blueprint.pdf",
            path: pdfUrl,
          },
        ],
      });

      // 6. Update pdfSent = true
      await strapi.entityService.update(
        "api::blueprint-form-submission.blueprint-form-submission",
        result.id,
        { data: { pdfSent: true } }
      );

    } catch (error) {
      console.error("Blueprint PDF email error:", error);

      // Fail-safe: mark pdfSent false
      await strapi.entityService.update(
        "api::blueprint-form-submission.blueprint-form-submission",
        event.result.id,
        { data: { pdfSent: false } }
      );
    }
  },
};
