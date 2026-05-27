"use server";

import { appUrl, sendEmail } from "@/lib/email";

export async function contactAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const message = String(formData.get("message") ?? "");
  await sendEmail({
    to: process.env.ADMIN_EMAIL ?? "admin@localhost",
    subject: "Contact — Observatoire",
    html: `<p>Contact: ${email}</p><p>${message}</p><p>Plateforme: ${appUrl("/")}</p>`,
  });
}
