export async function verifyTurnstile(token: string | null | undefined, ip?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return true;
  }

  if (!token) {
    return false;
  }

  const formData = new FormData();
  formData.set("secret", secret);
  formData.set("response", token);
  if (ip) formData.set("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) return false;

  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}
