/** Small helpers for note stats (used in the dashboard UI). */

export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

export function countChars(text: string): number {
  return text.length;
}

/** Safe-ish filename from a note title for downloads. */
export function noteFilename(title: string): string {
  const base = title
    .trim()
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return base || "note";
}
