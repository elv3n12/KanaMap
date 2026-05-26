import crypto from "node:crypto";
import { headers } from "next/headers";

const salt = process.env.IP_HASH_SALT ?? "dev-only-ip-salt";
const tokenSecret = process.env.TOKEN_HASH_SECRET ?? process.env.AUTH_SECRET ?? "dev-only-token-secret";

export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function hmac(value: string) {
  return crypto.createHmac("sha256", tokenSecret).update(value).digest("hex");
}

export function createRawToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hashToken(token: string) {
  return hmac(token);
}

export function hashIp(ip: string) {
  return sha256(`${ip}:${salt}`);
}

export function getIpFromRequest(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "0.0.0.0";
}

export async function getIpHashFromHeaders() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "0.0.0.0";
  return hashIp(ip);
}

export function getVisitorHash(request: Request, visitorCookie?: string) {
  const ipHash = hashIp(getIpFromRequest(request));
  return sha256(`${ipHash}:${visitorCookie ?? "no-cookie"}:${salt}`);
}
