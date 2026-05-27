import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAdminCounts } from "@/lib/admin";
import { canModerate } from "@/lib/moderation";

export async function GET() {
  const session = await auth();
  if (!canModerate(session?.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const counts = await getAdminCounts();
  return NextResponse.json(counts);
}
