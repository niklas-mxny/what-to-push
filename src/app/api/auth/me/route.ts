import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, getUserBySession } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const user = await getUserBySession(token);
  return NextResponse.json({ user });
}
