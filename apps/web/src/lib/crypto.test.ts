import { describe, expect, it } from "vitest";
import { decryptPII, encryptPII, isLegacyPIIBlob } from "@/lib/crypto";

describe("crypto / encryptPII + decryptPII", () => {
  it("round-trips a UTF-8 string", () => {
    const plain = "12 Rue de la Paix, Paris 75002";
    const blob = encryptPII(plain);
    expect(blob.startsWith("v1:")).toBe(true);
    expect(blob).not.toContain(plain);
    expect(decryptPII(blob)).toBe(plain);
  });

  it("round-trips non-ASCII characters", () => {
    const plain = "Crêperie Saint-Étienne · 北京路 · 🌿";
    expect(decryptPII(encryptPII(plain))).toBe(plain);
  });

  it("produces a different ciphertext each call (random IV)", () => {
    const plain = "same input";
    expect(encryptPII(plain)).not.toBe(encryptPII(plain));
  });

  it("returns null for null/undefined/empty input on decrypt", () => {
    expect(decryptPII(null)).toBeNull();
    expect(decryptPII(undefined)).toBeNull();
    expect(decryptPII("")).toBeNull();
  });

  it("returns null when ciphertext is tampered (auth tag mismatch)", () => {
    const blob = encryptPII("sensitive");
    // Decode -> flip a byte inside the auth tag (offset 12..28) -> re-encode.
    const payload = Buffer.from(blob.slice("v1:".length), "base64");
    payload[20] ^= 0xff;
    const tampered = "v1:" + payload.toString("base64");
    expect(decryptPII(tampered)).toBeNull();
  });

  it("falls back to raw base64 for legacy values (pre-AES-GCM)", () => {
    const plain = "legacy@example.org";
    const legacy = Buffer.from(plain).toString("base64");
    expect(isLegacyPIIBlob(legacy)).toBe(true);
    expect(decryptPII(legacy)).toBe(plain);
  });

  it("isLegacyPIIBlob returns false for v1 blobs", () => {
    expect(isLegacyPIIBlob(encryptPII("x"))).toBe(false);
  });
});
