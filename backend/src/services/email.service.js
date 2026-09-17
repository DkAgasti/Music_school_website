import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAdmissionConfirmation(to, name) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Admission received",
    html: `<p>Hi ${name}, we've received your admission request and will be in touch soon.</p>`,
  });
}

export async function sendEnquiryAlert(adminEmail, enquiry) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: adminEmail,
    subject: "New enquiry",
    html: `<p>${enquiry.name} (${enquiry.email}): ${enquiry.message}</p>`,
  });
}
