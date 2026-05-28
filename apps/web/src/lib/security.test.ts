import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getIpFromRequest } from "@/lib/security";

function makeRequest(headers: Record<string, string>): Request {
  return new Request("https://example.org/", { headers });
}

describe("getIpFromRequest", () => {
  const ORIGINAL_HOPS = process.env.TRUSTED_PROXY_HOPS;

  beforeEach(() => {
    delete process.env.TRUSTED_PROXY_HOPS;
  });

  afterEach(() => {
    if (ORIGINAL_HOPS === undefined) delete process.env.TRUSTED_PROXY_HOPS;
    else process.env.TRUSTED_PROXY_HOPS = ORIGINAL_HOPS;
  });

  it("trusts cf-connecting-ip when present (Cloudflare path)", () => {
    expect(
      getIpFromRequest(
        makeRequest({
          "cf-connecting-ip": "203.0.113.7",
          "x-forwarded-for": "1.1.1.1, 2.2.2.2",
        }),
      ),
    ).toBe("203.0.113.7");
  });

  it("with default TRUSTED_PROXY_HOPS=1, picks the rightmost XFF entry (your proxy's view)", () => {
    expect(
      getIpFromRequest(makeRequest({ "x-forwarded-for": "evil-spoof, 203.0.113.7" })),
    ).toBe("203.0.113.7");
  });

  it("ignores client-injected leftmost XFF entries (default hops=1)", () => {
    // Client sends `X-Forwarded-For: 8.8.8.8` -> nginx appends real peer 203.0.113.7.
    // Trusted entry is the rightmost.
    expect(
      getIpFromRequest(makeRequest({ "x-forwarded-for": "8.8.8.8, 203.0.113.7" })),
    ).toBe("203.0.113.7");
  });

  it("honors TRUSTED_PROXY_HOPS=2 for CDN + reverse-proxy stacks", () => {
    process.env.TRUSTED_PROXY_HOPS = "2";
    // Each trusted proxy appends ONE entry (the peer IP it saw).
    // Chain: client(spoof) -> CDN sees 203.0.113.7 (appends) -> nginx sees CDN ip 10.0.0.1 (appends).
    // Final XFF length = (client-supplied count) + 2.
    // parts[length - hops] = parts[3 - 2] = parts[1] = real client IP.
    expect(
      getIpFromRequest(
        makeRequest({ "x-forwarded-for": "spoof, 203.0.113.7, 10.0.0.1" }),
      ),
    ).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip when XFF and cf-connecting-ip are absent", () => {
    expect(getIpFromRequest(makeRequest({ "x-real-ip": "198.51.100.5" }))).toBe("198.51.100.5");
  });

  it("falls back to 0.0.0.0 with no relevant headers", () => {
    expect(getIpFromRequest(makeRequest({}))).toBe("0.0.0.0");
  });

  it("ignores malformed TRUSTED_PROXY_HOPS values and defaults to 1", () => {
    process.env.TRUSTED_PROXY_HOPS = "not-a-number";
    expect(
      getIpFromRequest(makeRequest({ "x-forwarded-for": "spoof, 203.0.113.7" })),
    ).toBe("203.0.113.7");
  });
});
