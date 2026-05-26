import nodemailer from "nodemailer";

type EmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function sendEmail({ to, subject, html, text }: EmailInput) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? "Cannabinoid Observatory Europe <no-reply@localhost>";

  if (!transporter) {
    console.info("[email skipped]", { to, subject, text: text ?? html });
    return;
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });
}

export function appUrl(path = "/") {
  const base = process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}
