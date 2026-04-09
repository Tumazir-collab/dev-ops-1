import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createSupabase } from "@/lib/supabase";

/** Verify email/password against `users` table and create a session. */
export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const supabase = createSupabase();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, password")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Login failed." },
      { status: 500 },
    );
  }
  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({ ok: true, email: user.email });
}
