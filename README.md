# Notepad (Next.js + Supabase)

Simple notepad with **email/password signup and login**, **session cookie** (via [iron-session](https://github.com/vvo/iron-session)), and **CRUD notes** stored in Supabase. There is **no Express** server—APIs are **Next.js Route Handlers** under `app/api/`.

## Prerequisites

- Node.js 20+ recommended
- A Supabase project

## 1. Database setup

1. Open the Supabase dashboard → **SQL** → **New query**.
2. Paste and run the SQL in `supabase/schema.sql` (creates `users`, `notes` with `updated_at` and `pinned`).
3. If you created `notes` **before** those columns existed, also run `supabase/migrate_notes_v2.sql` once.
4. Ensure **RLS is off** for `users` and `notes` (or policies allow anon CRUD), matching the “simple database” brief.

### App features

- **Light UI** — single white / soft-gray theme (no dark mode).
- **Search** — filter by title or body text.
- **Sort** — newest, oldest, or title A–Z (pinned notes stay grouped at the top when sorting by date).
- **Pin** — star notes so they rise to the top of the list.
- **Copy / export** — copy to clipboard or download a `.txt` file.
- **Stats** — word and character counts on new notes and existing notes.
- **Keyboard** — **Ctrl+S** / **⌘S** saves while editing a note.
- **Timestamps** — created time; “Updated” appears after edits (uses `updated_at`).

## 2. Environment variables

1. Copy `.env.example` to `.env.local`.
2. Set:
   - `SUPABASE_URL` — Project URL
   - `SUPABASE_ANON_KEY` — Project API **anon** key
   - `SESSION_SECRET` — Any random string **at least 32 characters** (encrypts the session cookie)

## 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, then use the dashboard to manage notes.

Production:

```bash
npm run build
npm start
```

## Project layout

| Path | Role |
|------|------|
| `app/api/auth/*` | Signup, login, logout |
| `app/api/notes/*` | List/create/update/delete notes |
| `app/login`, `app/signup` | Auth pages |
| `app/dashboard` | Notes UI (server-loads notes, client edits) |
| `lib/session.ts` | Encrypted cookie session |
| `lib/supabase.ts` | Supabase client (server-only usage) |
| `components/*` | Auth forms, `NotesClient`, `NoteCard` |
| `lib/note-utils.ts` | Word/char counts and safe download filenames |
| `supabase/migrate_notes_v2.sql` | Adds `updated_at` / `pinned` for older databases |

## Security note

Using the anon key on the server with RLS disabled is fine for learning; for production, enable RLS and/or use a service role only on trusted servers.
