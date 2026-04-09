import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/** Clear the encrypted session cookie. */
export async function POST() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
