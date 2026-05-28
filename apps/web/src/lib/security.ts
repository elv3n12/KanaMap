import crypto from "node:crypto";
import { headers } from "next/headers";

function requireEnv(key: string, devFallback: string): string {
  const value = process.env[key];
  if (value && value.length > 0) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `Missing required env var: ${key}. Refusing to fall back to a publicly-known default in production.`,
    );
  }
  return devFallback;
}

// Lazily resolved so `next build`'s page-data-collection step doesn't trip the
// fail-closed env check before the runtime environment is loaded.
let saltCache: string | undefined;
let tokenSecretCache: string | undefined;

function getSalt(): string {
  if (saltCache !== undefined) return saltCache;
  saltCache = requireEnv("IP_HASH_SALT", "dev-only-ip-salt");
  return saltCache;
}

function getTokenSecret(): string {
  if (tokenSecretCache !== undefined) return tokenSecretCache;
  const explicit = process.env.TOKEN_HASH_SECRET;
  tokenSecretCache =
    explicit && explicit.length > 0 ? explicit : requireEnv("AUTH_SECRET", "dev-only-token-secret");
  return tokenSecretCache;
}

export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function hmac(value: string) {
  return crypto.createHmac("sha256", getTokenSecret()).update(value).digest("hex");
}

export function createRawToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hashToken(token: string) {
  return hmac(token);
}

export function hashIp(ip: string) {
  return sha256(`${ip}:${getSalt()}`);
}

// Number of trusted reverse-proxy hops in front of this app. Each hop appends
// its peer address to X-Forwarded-For; the last N entries (counted from the
// right) are appended by trusted infrastructure and are the only ones we can
// rely on. Defaults to 1 (single nginx/traefik in front, the typical VPS
// deployment). Set TRUSTED_PROXY_HOPS=2 if you sit behind a CDN as well.
function getTrustedProxyHops(): number {
  const raw = process.env.TRUSTED_PROXY_HOPS;
  const n = raw ? Number(raw) : 1;
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

function pickClientIp(headerLookup: (name: string) => string | null): string {
  // Cloudflare sets this directly from the TCP peer and strips client-set copies,
  // so it is not spoofable when the app actually sits behind Cloudflare.
  const cfIp = headerLookup("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const xff = headerLookup("x-forwarded-for");
  if (xff) {
    const parts = xff
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      const hops = getTrustedProxyHops();
      // Count `hops` from the right end: the entry your innermost trusted
      // proxy appended (= the IP it actually saw). Any earlier entries may
      // have been forged by the client.
      const idx = parts.length - hops;
      if (idx >= 0 && idx < parts.length) return parts[idx];
      // XFF shorter than the configured trust depth → fall back to leftmost
      // (still safer than trusting an unknown index).
      return parts[0];
    }
  }

  return headerLookup("x-real-ip")?.trim() || "0.0.0.0";
}

export function getIpFromRequest(request: Request): string {
  return pickClientIp((name) => request.headers.get(name));
}

export async function getIpHashFromHeaders() {
  const requestHeaders = await headers();
  return hashIp(pickClientIp((name) => requestHeaders.get(name)));
}

export function getVisitorHash(request: Request, visitorCookie?: string) {
  const ipHash = hashIp(getIpFromRequest(request));
  return sha256(`${ipHash}:${visitorCookie ?? "no-cookie"}:${getSalt()}`);
}
