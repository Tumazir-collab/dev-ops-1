import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createSupabase } from "@/lib/supabase";

type RouteContext = { params: Promise<{ id: string }> };

/** Update a note (only if it belongs to the signed-in user). */
export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  let body: { title?: string; content?: string; pinned?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const supabase = createSupabase();
  const { data: existing, error: fetchError } = await supabase
    .from("notes")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json(
      { error: fetchError.message ?? "Could not update note." },
      { status: 500 },
    );
  }
  if (!existing || existing.user_id !== session.userId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const patch: {
    title?: string;
    content?: string;
    pinned?: boolean;
    updated_at: string;
  } = {
    updated_at: new Date().toISOString(),
  };
  if (body.title !== undefined) patch.title = body.title;
  if (body.content !== undefined) patch.content = body.content;
  if (body.pinned !== undefined) patch.pinned = body.pinned;

  const { data, error } = await supabase
    .from("notes")
    .update(patch)
    .eq("id", id)
    .eq("user_id", session.userId)
    .select("id, user_id, title, content, created_at, updated_at, pinned")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Could not update note." },
      { status: 500 },
    );
  }

  return NextResponse.json({ note: data });
}

/** Delete a note (only if it belongs to the signed-in user). */
export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = createSupabase();

  const { data: existing, error: fetchError } = await supabase
    .from("notes")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json(
      { error: fetchError.message ?? "Could not delete note." },
      { status: 500 },
    );
  }
  if (!existing || existing.user_id !== session.userId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Could not delete note." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
