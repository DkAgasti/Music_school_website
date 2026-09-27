import nodemailer from "nodemailer";

let smtpTransport = null;
function getSmtpTransport() {
  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return smtpTransport;
}

// Shared sender for all transactional email — uses the SMTP credentials
// (Gmail) configured in .env. Falls back to a console mock when SMTP isn't
// configured, so local dev without real credentials doesn't crash.
async function sendMail({ to, subject, html }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email Mock - SMTP not configured] "${subject}" to ${to}`);
    return { success: true, mock: true };
  }
  await getSmtpTransport().sendMail({
    from: `"Synchrocity Music School" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
  return { success: true };
}

const BRAND = "#E91E63";
const DARK = "#1a1a2e";
const SITE_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Shared branded shell every transactional email renders inside — inline
// styles + a table wrapper only, since that's what actually survives Gmail's
// and Outlook's HTML sanitizers (a <style> block or flexbox would not).
function wrapEmail({ eyebrow, heading, bodyHtml }) {
  return `
  <div style="background-color:#f8f6f3; padding:32px 16px; font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #f3e2ec;">
      <tr>
        <td style="background-color:${BRAND}; padding:28px 32px;">
          <div style="font-size:20px; font-weight:bold; color:#ffffff;">&#9835; Synchrocity Music School</div>
          <div style="font-size:12px; color:#fce7f3; margin-top:2px; letter-spacing:0.5px;">Learn &middot; Play &middot; Grow</div>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 32px;">
          ${eyebrow ? `<div style="font-size:12px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; color:${BRAND}; margin-bottom:8px;">${eyebrow}</div>` : ""}
          <h1 style="margin:0 0 18px; font-size:22px; color:${DARK};">${heading}</h1>
          <div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:1.7; color:#4b5563;">
            ${bodyHtml}
          </div>
        </td>
      </tr>
      <tr>
        <td style="background-color:#fdf2f8; padding:18px 32px; text-align:center;">
          <div style="font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#9ca3af;">
            Synchrocity Music School &middot; Learn &middot; Play &middot; Grow
          </div>
        </td>
      </tr>
    </table>
  </div>`;
}

function button(label, href) {
  return `<a href="${href}" style="display:inline-block; margin-top:8px; padding:12px 28px; background-color:${BRAND}; color:#ffffff; font-family:Arial,Helvetica,sans-serif; font-size:14px; font-weight:bold; text-decoration:none; border-radius:999px;">${label}</a>`;
}

export async function sendAdmissionConfirmation(to, name) {
  try {
    const html = wrapEmail({
      eyebrow: "Admission",
      heading: "Your application is in! &#127881;",
      bodyHtml: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for applying to Synchrocity Music School! We've received your admission application and our team will review it shortly.</p>
        <p>We'll be in touch within 1&ndash;2 business days with the next steps. In the meantime, feel free to explore our classes and teachers.</p>
        ${button("Visit Our Website", SITE_URL)}
      `,
    });

    return await sendMail({
      to,
      subject: "Admission Received - Synchrocity Music School",
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed to send admission email:", err.message);
    return { success: false, error: err.message };
  }
}

export async function sendEnquiryAlert(adminEmail, enquiry) {
  try {
    const html = wrapEmail({
      eyebrow: "Website Enquiry",
      heading: "You've got a new enquiry &#128172;",
      bodyHtml: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; border-radius:12px; margin-bottom:20px;">
          <tr>
            <td style="padding:16px 20px;">
              <div style="margin-bottom:10px;"><strong style="color:${DARK};">Name:</strong> ${enquiry.name}</div>
              <div style="margin-bottom:10px;"><strong style="color:${DARK};">Email:</strong> <a href="mailto:${enquiry.email}" style="color:${BRAND};">${enquiry.email}</a></div>
              ${enquiry.phone ? `<div style="margin-bottom:10px;"><strong style="color:${DARK};">Phone:</strong> ${enquiry.phone}</div>` : ""}
              <div><strong style="color:${DARK};">Message:</strong><br/><span style="white-space:pre-line;">${enquiry.message}</span></div>
            </td>
          </tr>
        </table>
        ${button(`Reply to ${enquiry.name}`, `mailto:${enquiry.email}`)}
      `,
    });

    return await sendMail({
      to: adminEmail || process.env.SMTP_USER,
      subject: `New Enquiry from ${enquiry.name} - Synchrocity Music School`,
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed to send enquiry alert:", err.message);
    return { success: false, error: err.message };
  }
}

export async function sendPasswordResetOtpEmail(to, otp) {
  try {
    const html = wrapEmail({
      eyebrow: "Security",
      heading: "Reset your password &#128274;",
      bodyHtml: `
        <p>Use the one-time password below to reset your admin password:</p>
        <div style="text-align:center; margin:24px 0;">
          <span style="display:inline-block; padding:16px 32px; background-color:#fdf2f8; border:1px dashed ${BRAND}; border-radius:12px; font-family:Arial,Helvetica,sans-serif; font-size:32px; font-weight:bold; letter-spacing:10px; color:${DARK};">${otp}</span>
        </div>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p style="color:#9ca3af; font-size:13px;">If you did not request this, you can safely ignore this email &mdash; your password will not be changed.</p>
      `,
    });

    return await sendMail({
      to,
      subject: "Your Password Reset OTP - Synchrocity Music School",
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed to send password reset OTP:", err.message);
    return { success: false, error: err.message };
  }
}

// Auto-triggered by the daily fee-due cron (src/services/feeReminder.service.js)
// — copy/subject adapt to how many days remain, since "due in 5 days" and
// "3 days overdue" need very different tones.
export async function sendFeeDueReminderEmail(to, name, amountRupees, dueDateLabel, daysUntilDue, className) {
  try {
    const courseLabel = className ? `${className} ` : "";
    const isOverdue = daysUntilDue < 0;
    const isDueToday = daysUntilDue === 0;
    const overdueDays = Math.abs(daysUntilDue);

    const eyebrow = isOverdue ? "Payment Overdue" : "Fee Reminder";
    const heading = isOverdue
      ? `Your ${courseLabel}fee is overdue &#9888;&#65039;`
      : isDueToday
      ? `Your ${courseLabel}fee is due today &#128197;`
      : `Your ${courseLabel}fee is due in ${daysUntilDue} day${daysUntilDue > 1 ? "s" : ""} &#128197;`;
    const subject = isOverdue
      ? `Overdue: Your fee payment is ${overdueDays} day${overdueDays > 1 ? "s" : ""} late - Synchrocity Music School`
      : `Fee Reminder: Due ${isDueToday ? "today" : `in ${daysUntilDue} day${daysUntilDue > 1 ? "s" : ""}`} - Synchrocity Music School`;
    const statusLine = isOverdue
      ? `<span style="color:#dc2626; font-weight:bold;">Overdue by ${overdueDays} day${overdueDays > 1 ? "s" : ""}</span>`
      : `Due by <strong>${dueDateLabel}</strong>`;

    const html = wrapEmail({
      eyebrow,
      heading,
      bodyHtml: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>${
          isOverdue
            ? `Your course fee payment is now overdue. Please pay as soon as possible to avoid interruption to your classes.`
            : `This is a reminder that your upcoming course fee is due soon.`
        }</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f8; border-radius:12px; margin:20px 0;">
          <tr>
            <td style="padding:18px 20px; text-align:center;">
              <div style="font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Amount Due</div>
              <div style="font-size:28px; font-weight:bold; color:${DARK}; margin-top:4px;">&#8377;${amountRupees}</div>
              <div style="font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#4b5563; margin-top:6px;">${statusLine}</div>
            </td>
          </tr>
        </table>
        <p>Please log in to your student portal to complete your payment.</p>
        ${button("Go to Student Portal", `${SITE_URL}/student-login`)}
      `,
    });

    return await sendMail({ to, subject, html });
  } catch (err) {
    console.error("[Email Error] Failed to send fee due reminder email:", err.message);
    return { success: false, error: err.message };
  }
}

export async function sendFeeReminderEmail(to, name, amount, dueDate) {
  try {
    const html = wrapEmail({
      eyebrow: "Fee Reminder",
      heading: "A fee payment is coming up &#128197;",
      bodyHtml: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>This is a friendly reminder that your upcoming course fee is due soon.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f8; border-radius:12px; margin:20px 0;">
          <tr>
            <td style="padding:18px 20px; text-align:center;">
              <div style="font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Amount Due</div>
              <div style="font-size:28px; font-weight:bold; color:${DARK}; margin-top:4px;">&#8377;${amount}</div>
              <div style="font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#4b5563; margin-top:6px;">Due by <strong>${dueDate}</strong></div>
            </td>
          </tr>
        </table>
        <p>Please log in to your student portal to complete your payment.</p>
        ${button("Go to Student Portal", `${SITE_URL}/student-login`)}
      `,
    });

    return await sendMail({
      to,
      subject: "Fee Payment Reminder - Synchrocity Music School",
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed to send fee reminder email:", err.message);
    return { success: false, error: err.message };
  }
}
