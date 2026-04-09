"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { NoteRow } from "@/lib/types";
import { countChars, countWords } from "@/lib/note-utils";
import NoteCard from "@/components/NoteCard";

type Props = {
  initialNotes: NoteRow[];
  email: string;
};

type SortMode = "newest" | "oldest" | "title";

function sortNotes(list: NoteRow[], mode: SortMode): NoteRow[] {
  const copy = [...list];
  copy.sort((a, b) => {
    const pa = a.pinned ? 1 : 0;
    const pb = b.pinned ? 1 : 0;
    if (pa !== pb) return pb - pa;
    if (mode === "title") {
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    }
    const ta = new Date(a.created_at).getTime();
    const tb = new Date(b.created_at).getTime();
    return mode === "oldest" ? ta - tb : tb - ta;
  });
  return copy;
}

/** Dashboard: search, sort, pin, copy/export, and note editing. */
export default function NotesClient({ initialNotes, email }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteRow[]>(initialNotes);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const visibleNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? notes
      : notes.filter(
          (n) =>
            n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
        );
    return sortNotes(filtered, sortMode);
  }, [notes, query, sortMode]);

  async function logout() {
    setError(null);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  function showToast(message: string) {
    setToast(message);
  }

  async function createNote(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, content: newContent }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not create note.");
      return;
    }
    if (data.note) {
      setNotes((prev) => [data.note as NoteRow, ...prev]);
    }
    setNewTitle("");
    setNewContent("");
    showToast("Note created");
  }

  async function saveNote(note: NoteRow, title: string, content: string) {
    setError(null);
    setBusyId(note.id);
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not save note.");
        return;
      }
      if (data.note) {
        const updated = data.note as NoteRow;
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      }
      showToast("Saved");
    } finally {
      setBusyId(null);
    }
  }

  async function togglePin(note: NoteRow) {
    setError(null);
    setBusyId(note.id);
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !(note.pinned ?? false) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not update pin.");
        return;
      }
      if (data.note) {
        const updated = data.note as NoteRow;
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      }
      showToast("Pin updated");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteNote(id: string) {
    if (!confirm("Delete this note?")) return;
    setError(null);
    setBusyId(id);
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not delete.");
        return;
      }
      setNotes((prev) => prev.filter((n) => n.id !== id));
      showToast("Note deleted");
    } finally {
      setBusyId(null);
    }
  }

  const newWords = countWords(newContent);
  const newChars = countChars(newContent);

  return (
    <div className="np-dash">
      <header className="np-bar">
        <div>
          <div className="np-bar-title">Your workspace</div>
          <div className="np-bar-meta">Signed in as {email}</div>
        </div>
        <div className="np-bar-actions">
          <Link className="np-link" href="/">
            Home
          </Link>
          <button className="np-button np-button-ghost" type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {error ? <p className="np-error">{error}</p> : null}

      <div className="np-toolbar">
        <div className="np-toolbar-grow">
          <input
            className="np-input np-search"
            type="search"
            placeholder="Search notes by title or content…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search notes"
          />
        </div>
        <label className="np-muted" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
          Sort
          <select
            className="np-select"
            style={{ marginLeft: "0.35rem", minWidth: "9rem" }}
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
          </select>
        </label>
        <span className="np-stat" style={{ whiteSpace: "nowrap" }}>
          {visibleNotes.length} of {notes.length} shown
        </span>
      </div>

      <section className="np-section">
        <div className="np-section-head">
          <h2>New note</h2>
        </div>
        <div className="np-card">
          <form className="np-stack" onSubmit={createNote}>
            <label className="np-label">
              Title
              <input
                className="np-input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Meeting ideas, grocery list…"
              />
            </label>
            <label className="np-label">
              Content
              <textarea
                className="np-textarea"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={5}
                placeholder="Jot anything down. You can pin or search notes below."
              />
            </label>
            <div className="np-stat">
              {newWords} words · {newChars} characters
            </div>
            <button className="np-button" type="submit" style={{ alignSelf: "flex-start" }}>
              Create note
            </button>
          </form>
        </div>
      </section>

      <section className="np-section">
        <div className="np-section-head">
          <h2>Library</h2>
        </div>
        {visibleNotes.length === 0 ? (
          <div className="np-empty">
            {notes.length === 0
              ? "No notes yet. Write your first one above."
              : "No notes match your search. Try a different keyword."}
          </div>
        ) : (
          <ul className="np-list">
            {visibleNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                busy={busyId === note.id}
                onSave={saveNote}
                onDelete={deleteNote}
                onTogglePin={togglePin}
                onToast={showToast}
              />
            ))}
          </ul>
        )}
      </section>

      {toast ? <div className="np-toast">{toast}</div> : null}
    </div>
  );
}
