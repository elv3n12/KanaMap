import nodemailer from "nodemailer";

export function appUrl(path = "/") {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.info("[worker email skipped]", { to, subject });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "KanaMap <no-reply@localhost>",
    to,
    subject,
    html,
  });
}
