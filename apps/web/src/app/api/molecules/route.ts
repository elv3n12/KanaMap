import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const molecules = await db.molecule.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ molecules });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!["ADMIN", "MODERATOR"].includes(session?.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Nom obligatoire" }, { status: 400 });
  }

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  await db.molecule.upsert({
    where: { slug },
    update: { name, description: description || null },
    create: { name, slug, description: description || null },
  });

  return NextResponse.redirect(new URL("/admin", request.url));
}
