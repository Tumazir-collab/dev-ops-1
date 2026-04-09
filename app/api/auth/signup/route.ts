import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createSupabase } from "@/lib/supabase";

/** Register a new user and start a session (simple email + password). */
export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const emailRaw = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!emailRaw || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const supabase = createSupabase();

  const { data, error } = await supabase
    .from("users")
    .insert({ email: emailRaw, password: passwordHash })
    .select("id, email")
    .single();

  if (error) {
    // Unique violation on email
    if (error.code === "23505" || error.message.includes("duplicate")) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: error.message ?? "Could not create account." },
      { status: 500 },
    );
  }

  const session = await getSession();
  session.userId = data.id;
  session.email = data.email;
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({ ok: true, email: data.email });
}
