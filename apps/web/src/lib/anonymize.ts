import sharp from "sharp";
import { PlaceType } from "@prisma/client";

const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const phonePattern =
  /(?:\+33|0033|0)\s?[1-9](?:[\s.-]?\d{2}){4}|(?:\+\d{1,3}[\s.-]?)?(?:\d[\s.-]?){8,14}\d/g;

export function scrubPublicText(value: string | null | undefined) {
  if (!value) return value ?? null;
  return value
    .replace(emailPattern, "[email masqué]")
    .replace(phonePattern, "[téléphone masqué]")
    .trim();
}

export function sanitizeReportInput<T extends { placeType: PlaceType; exactAddress?: string | null; exactLat?: number | null; exactLng?: number | null }>(
  input: T,
) {
  if (input.placeType !== "INFORMAL_MARKET") return input;

  return {
    ...input,
    exactAddress: null,
    exactLat: null,
    exactLng: null,
  };
}

export async function stripImageMetadata(buffer: Buffer) {
  const image = sharp(buffer, { failOn: "none" }).rotate();
  const metadata = await image.metadata();
  const output = await image.jpeg({ quality: 88 }).toBuffer();

  return {
    buffer: output,
    mimeType: "image/jpeg",
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    exifStrippedAt: new Date(),
  };
}
