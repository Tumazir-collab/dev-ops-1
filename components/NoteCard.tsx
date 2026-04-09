"use client";

import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import type { NoteRow } from "@/lib/types";
import { countChars, countWords, noteFilename } from "@/lib/note-utils";

type Props = {
  note: NoteRow;
  busy: boolean;
  onSave: (note: NoteRow, title: string, content: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (note: NoteRow) => void;
  onToast: (message: string) => void;
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function wasEdited(note: NoteRow) {
  if (!note.updated_at) return false;
  return (
    new Date(note.updated_at).getTime() - new Date(note.created_at).getTime() >
    1500
  );
}

/** Single note editor with pin, copy, export, stats, and Ctrl/Cmd+S to save. */
export default function NoteCard({
  note,
  busy,
  onSave,
  onDelete,
  onTogglePin,
  onToast,
}: Props) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const pinned = note.pinned ?? false;

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id, note.title, note.content]);

  function onShortcut(e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      onSave(note, title, content);
    }
  }

  async function copyNote() {
    const text = `${title}\n\n${content}`;
    try {
      await navigator.clipboard.writeText(text);
      onToast("Copied to clipboard");
    } catch {
      onToast("Could not copy");
    }
  }

  function downloadNote() {
    const blob = new Blob([`${title}\n\n${content}`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${noteFilename(title)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onToast("Download started");
  }

  function submitSave(e: FormEvent) {
    e.preventDefault();
    onSave(note, title, content);
  }

  const words = countWords(content);
  const chars = countChars(content);

  return (
    <li
      className={`np-card${pinned ? " np-card-pinned" : ""}`}
      data-note-id={note.id}
    >
      <div className="np-row np-row-spread" style={{ marginTop: 0 }}>
        <div className="np-stat">
          {pinned ? (
            <span className="np-pin-active" title="Pinned to top">
              ★ Pinned to top
            </span>
          ) : (
            <span className="np-muted">Note</span>
          )}
        </div>
        <div className="np-row" style={{ marginTop: 0 }}>
          <button
            type="button"
            className="np-button np-button-secondary np-button-sm np-button-icon"
            title={pinned ? "Unpin" : "Pin to top"}
            disabled={busy}
            onClick={() => onTogglePin(note)}
            aria-pressed={pinned}
          >
            {pinned ? "★" : "☆"}
          </button>
          <button
            type="button"
            className="np-button np-button-secondary np-button-sm"
            disabled={busy}
            onClick={copyNote}
          >
            Copy
          </button>
          <button
            type="button"
            className="np-button np-button-secondary np-button-sm"
            disabled={busy}
            onClick={downloadNote}
          >
            .txt
          </button>
        </div>
      </div>

      <form className="np-stack" onSubmit={submitSave} style={{ marginTop: "0.75rem" }}>
        <label className="np-label">
          Title
          <input
            className="np-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={onShortcut}
            disabled={busy}
          />
        </label>
        <label className="np-label">
          Content
          <textarea
            className="np-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={onShortcut}
            rows={6}
            disabled={busy}
            placeholder="Write something…"
          />
        </label>
        <div className="np-stat">
          {words} words · {chars} characters
        </div>
        <div className="np-row">
          <button className="np-button" type="submit" disabled={busy}>
            Save changes
          </button>
          <button
            className="np-button np-button-danger"
            type="button"
            disabled={busy}
            onClick={() => onDelete(note.id)}
          >
            Delete
          </button>
          <span className="np-muted np-small">
            Created {formatWhen(note.created_at)}
            {wasEdited(note) ? (
              <> · Updated {formatWhen(note.updated_at!)}</>
            ) : null}
          </span>
        </div>
        <p className="np-muted np-small" style={{ margin: 0 }}>
          Tip: use Ctrl+S (or ⌘S) to save while typing.
        </p>
      </form>
    </li>
  );
}
