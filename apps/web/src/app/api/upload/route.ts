import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripImageMetadata } from "@/lib/anonymize";
import { db } from "@/lib/db";
import { uploadEvidenceSchema } from "@/server/schemas/report";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const parsed = uploadEvidenceSchema.parse({
    type: formData.get("type"),
    reportId: formData.get("reportId") || undefined,
    declarationId: formData.get("declarationId") || undefined,
  });

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });

  const raw = Buffer.from(await file.arrayBuffer());
  const processed = file.type.startsWith("image/")
    ? await stripImageMetadata(raw)
    : { buffer: raw, mimeType: file.type || "application/octet-stream", width: null, height: null, exifStrippedAt: null };

  const filename = `${randomUUID()}${processed.mimeType === "image/jpeg" ? ".jpg" : ".bin"}`;
  await writeFile(path.join(uploadDir, filename), processed.buffer);

  const evidence = await db.evidence.create({
    data: {
      reportId: parsed.reportId,
      declarationId: parsed.declarationId,
      type: parsed.type,
      filePath: filename,
      mimeType: processed.mimeType,
      originalName: file.name,
      width: processed.width,
      height: processed.height,
      exifStrippedAt: processed.exifStrippedAt,
    },
  });

  return NextResponse.json({ evidence });
}
