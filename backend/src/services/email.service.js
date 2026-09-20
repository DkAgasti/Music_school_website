import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder_key");

export async function sendAdmissionConfirmation(to, name) {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("placeholder")) {
      console.log(`[Email Mock] Admission confirmation sent to ${to} (${name})`);
      return { success: true, mock: true };
    }
    return await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to,
      subject: "Admission Received - Harmony Music School",
      html: `<p>Hi <strong>${name}</strong>, we have received your admission application and will be in touch soon!</p>`,
    });
  } catch (err) {
    console.error("[Email Error] Failed to send admission email:", err.message);
    return { success: false, error: err.message };
  }
}

export async function sendEnquiryAlert(adminEmail, enquiry) {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("placeholder")) {
      console.log(`[Email Mock] Enquiry alert sent for ${enquiry.name}`);
      return { success: true, mock: true };
    }
    return await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: adminEmail || "admin@musicschool.com",
      subject: "New Enquiry Received",
      html: `<p><strong>${enquiry.name}</strong> (${enquiry.email}):<br/>${enquiry.message}</p>`,
    });
  } catch (err) {
    console.error("[Email Error] Failed to send enquiry alert:", err.message);
    return { success: false, error: err.message };
  }
}

export async function sendPasswordResetEmail(to, resetToken) {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("placeholder")) {
      console.log(`[Email Mock] Password reset link sent to ${to}: ${resetUrl}`);
      return { success: true, mock: true, resetUrl };
    }
    return await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to,
      subject: "Password Reset Request - Harmony Music School",
      html: `<p>You requested a password reset. Click the link below to set a new password (valid for 15 minutes):</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  } catch (err) {
    console.error("[Email Error] Failed to send password reset email:", err.message);
    return { success: false, error: err.message };
  }
}

export async function sendFeeReminderEmail(to, name, amount, dueDate) {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("placeholder")) {
      console.log(`[Email Mock] Fee reminder sent to ${to} (${name}) for ₹${amount} due by ${dueDate}`);
      return { success: true, mock: true };
    }
    return await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to,
      subject: `Fee Payment Reminder - Harmony Music School`,
      html: `<p>Dear <strong>${name}</strong>,</p>
             <p>This is a friendly reminder that your upcoming course fee of <strong>₹${amount}</strong> is due on <strong>${dueDate}</strong>.</p>
             <p>Please log in to your student portal to complete your fee payment.</p>`,
    });
  } catch (err) {
    console.error("[Email Error] Failed to send fee reminder email:", err.message);
    return { success: false, error: err.message };
  }
}

