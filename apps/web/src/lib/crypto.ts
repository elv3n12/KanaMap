import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// AES-256-GCM envelope encryption for at-rest PII (exact address, contact email).
// Wire format (base64-encoded): VERSION_PREFIX + base64(iv ‖ authTag ‖ ciphertext)
// - VERSION_PREFIX lets us migrate the algorithm later without breaking existing rows.
// - Values written before this module existed are stored as raw base64 of the plaintext;
//   decryptPII falls back to that legacy decode so existing reports stay readable.

const ALG = "aes-256-gcm" as const;
const VERSION_PREFIX = "v1:";
const IV_LEN = 12;
const TAG_LEN = 16;

let cachedKey: Buffer | null = null;

function loadKey(): Buffer {
  if (cachedKey) return cachedKey;

  const b64 = process.env.PII_ENC_KEY_B64;
  if (!b64) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Missing required env var PII_ENC_KEY_B64 (32-byte AES-256 key, base64-encoded). " +
          "Generate with: openssl rand -base64 32",
      );
    }
    // Deterministic dev key so local seeded data round-trips. Never used in production.
    cachedKey = Buffer.alloc(32, 0);
    return cachedKey;
  }

  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) {
    throw new Error(
      `PII_ENC_KEY_B64 must decode to exactly 32 bytes (got ${key.length}). ` +
        "Generate with: openssl rand -base64 32",
    );
  }
  cachedKey = key;
  return cachedKey;
}

export function encryptPII(plain: string): string {
  const key = loadKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALG, key, iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return VERSION_PREFIX + Buffer.concat([iv, tag, ct]).toString("base64");
}

export function decryptPII(blob: string | null | undefined): string | null {
  if (!blob) return null;

  if (!blob.startsWith(VERSION_PREFIX)) {
    // Legacy: plaintext stored as raw base64 before AES-GCM was introduced.
    try {
      return Buffer.from(blob, "base64").toString("utf8");
    } catch {
      return null;
    }
  }

  const buf = Buffer.from(blob.slice(VERSION_PREFIX.length), "base64");
  if (buf.length < IV_LEN + TAG_LEN + 1) return null;

  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ct = buf.subarray(IV_LEN + TAG_LEN);

  try {
    const decipher = createDecipheriv(ALG, loadKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  } catch {
    // Wrong key, tampered ciphertext, or corrupted row.
    return null;
  }
}

export function isLegacyPIIBlob(blob: string | null | undefined): boolean {
  return !!blob && !blob.startsWith(VERSION_PREFIX);
}
