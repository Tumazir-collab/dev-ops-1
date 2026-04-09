import NotesClient from "@/components/NotesClient";
import type { NoteRow } from "@/lib/types";
import { getSession } from "@/lib/session";
import { createSupabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

/** Protected screen: loads the current user's notes on the server, then hands off to the client UI. */
export default async function DashboardPage() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }

  const supabase = createSupabase();
  const { data: notes, error } = await supabase
    .from("notes")
    .select("id, user_id, title, content, created_at, updated_at, pinned")
    .eq("user_id", session.userId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="np-page">
        <div className="np-shell np-wide">
          <div className="np-card-elevated">
            <p className="np-error" style={{ margin: 0 }}>
              Could not load notes: {error.message}
            </p>
            <p className="np-muted" style={{ margin: "1rem 0 0" }}>
              If you just added columns in Supabase, run{" "}
              <code>supabase/migrate_notes_v2.sql</code> and refresh.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="np-page" style={{ alignItems: "stretch", paddingTop: "2.5rem" }}>
      <div className="np-shell np-wide" style={{ margin: "0 auto" }}>
        <NotesClient
          initialNotes={(notes ?? []) as NoteRow[]}
          email={session.email ?? ""}
        />
      </div>
    </main>
  );
}
