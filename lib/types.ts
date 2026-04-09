/** Shared types for session and notes (keeps API and UI aligned). */

export type SessionData = {
  userId?: string;
  email?: string;
  isLoggedIn: boolean;
};

export type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  /** Set when the `updated_at` column exists in Supabase (see `supabase/schema.sql`). */
  updated_at?: string | null;
  /** Pinned notes sort to the top. */
  pinned?: boolean;
};
