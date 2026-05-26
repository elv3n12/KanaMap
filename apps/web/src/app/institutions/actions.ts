"use server";

import { appUrl, sendEmail } from "@/lib/email";

export async function contactInstitutionAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const message = String(formData.get("message") ?? "");
  await sendEmail({
    to: process.env.ADMIN_EMAIL ?? "admin@localhost",
    subject: "Contact institution / journaliste",
    html: `<p>Contact: ${email}</p><p>${message}</p><p>Plateforme: ${appUrl("/")}</p>`,
  });
}
