import nodemailer from "nodemailer";

interface Mail {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Sends email through SMTP when SMTP_HOST is configured. In development (no SMTP) the message is printed to the
 * server console so password-reset links can still be copied and tested.
 */
export async function sendMail({ to, subject, text, html }: Mail) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.info(`\n[mail:dev] To: ${to}\n[mail:dev] Subject: ${subject}\n[mail:dev] ${text}\n`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await transporter.sendMail({ from: process.env.MAIL_FROM ?? "Vroomly <no-reply@vroomly.app>", to, subject, text, html });
}
