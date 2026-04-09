import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createSupabase } from "@/lib/supabase";

/** List the signed-in user's notes (newest first). */
export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createSupabase();
  const { data, error } = await supabase
    .from("notes")
    .select("id, user_id, title, content, created_at, updated_at, pinned")
    .eq("user_id", session.userId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Could not load notes." },
      { status: 500 },
    );
  }

  return NextResponse.json({ notes: data ?? [] });
}

/** Create a note for the signed-in user. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { title?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const content = (body.content ?? "").trim();

  const supabase = createSupabase();
  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: session.userId,
      title: title || "Untitled",
      content,
    })
    .select("id, user_id, title, content, created_at, updated_at, pinned")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Could not create note." },
      { status: 500 },
    );
  }

  return NextResponse.json({ note: data });
}
