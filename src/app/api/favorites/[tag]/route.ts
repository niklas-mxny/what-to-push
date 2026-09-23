import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbRun } from "@/lib/db";
import { normalizePlayerTag } from "@/lib/supercell";

export async function DELETE(_request: Request, { params }: { params: Promise<{ tag: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in.", code: "not_authenticated" }, { status: 401 });
  }

  const { tag } = await params;
  await dbRun("DELETE FROM favorites WHERE user_id = ? AND player_tag = ?", [
    user.id,
    normalizePlayerTag(decodeURIComponent(tag)),
  ]);
  return NextResponse.json({ ok: true });
}
