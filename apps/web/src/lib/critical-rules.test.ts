import { describe, expect, it } from "vitest";
import { PlaceType } from "@prisma/client";
import { scrubPublicText, sanitizeReportInput, stripImageMetadata } from "@/lib/anonymize";
import { serializePublicReport, serializeZoneAggregate, type PublicReport } from "@/lib/report-serializers";
import { signupInputSchema } from "@/server/schemas/signup";

const baseReport = {
  id: "report-1",
  locationId: "loc-1",
  createdById: "user-1",
  placeType: "CBD_SHOP",
  placeOtherLabel: null,
  brandId: null,
  brandRawName: "Marque fictive A",
  productId: null,
  productCommercialName: "Produit fictif X",
  productType: "FLOWER",
  productOtherLabel: null,
  formOfUse: null,
  quantityObserved: null,
  priceObserved: null,
  priceMode: null,
  observationDate: new Date("2026-05-01"),
  narrative: "Observation fictive",
  moderationStatus: "PUBLISHED",
  exactAddressEncrypted: "secret",
  exactLat: 48.85,
  exactLng: 2.35,
  publishedAt: new Date("2026-05-02"),
  createdAt: new Date("2026-05-01"),
  updatedAt: new Date("2026-05-01"),
  location: {
    id: "loc-1",
    countryCode: "FR",
    countryName: "France",
    region: null,
    city: "Paris",
    district: "11e",
    postcode: null,
    displayZone: "Paris 11e",
    centroidLat: 48.858,
    centroidLng: 2.38,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  product: null,
  brand: null,
  molecules: [],
  marketingClaims: [],
  adverseEffects: [],
} as unknown as PublicReport;

describe("critical observatory rules", () => {
  it("does not expose exact coordinates or exact address in public report serialization", () => {
    const payload = serializePublicReport(baseReport);
    expect(JSON.stringify(payload)).not.toContain("exactLat");
    expect(JSON.stringify(payload)).not.toContain("exactLng");
    expect(JSON.stringify(payload)).not.toContain("exactAddress");
    expect(JSON.stringify(payload)).not.toContain("secret");
  });

  it("does not expose exact coordinates or exact address in zone aggregation", () => {
    const payload = serializeZoneAggregate({ location: baseReport.location, reports: [baseReport] });
    expect(JSON.stringify(payload)).not.toContain("exactLat");
    expect(JSON.stringify(payload)).not.toContain("exactLng");
    expect(JSON.stringify(payload)).not.toContain("exactAddress");
  });

  it("rejects signup payloads without charter acceptance", () => {
    expect(() =>
      signupInputSchema.parse({
        email: "test@example.org",
        password: "ChangeMe123!",
        termsAccepted: "on",
        charterAccepted: undefined,
      }),
    ).toThrow();
  });

  it("removes exact location data for informal markets", () => {
    const sanitized = sanitizeReportInput({
      placeType: PlaceType.INFORMAL_MARKET,
      exactAddress: "12 rue fictive",
      exactLat: 48.85,
      exactLng: 2.35,
    });
    expect(sanitized.exactAddress).toBeNull();
    expect(sanitized.exactLat).toBeNull();
    expect(sanitized.exactLng).toBeNull();
  });

  it("scrubs emails and phone numbers from public text", () => {
    const scrubbed = scrubPublicText("Contact test@example.org ou 06 12 34 56 78");
    expect(scrubbed).toContain("[email masqué]");
    expect(scrubbed).toContain("[téléphone masqué]");
  });

  it("strips image metadata by re-encoding to jpeg", async () => {
    const sharp = (await import("sharp")).default;
    const source = await sharp({
      create: { width: 2, height: 2, channels: 3, background: "#ffffff" },
    })
      .withMetadata({ exif: { IFD0: { Copyright: "secret" } } })
      .png()
      .toBuffer();
    const stripped = await stripImageMetadata(source);
    const metadata = await sharp(stripped.buffer).metadata();
    expect(stripped.mimeType).toBe("image/jpeg");
    expect(metadata.exif).toBeUndefined();
  });
});
