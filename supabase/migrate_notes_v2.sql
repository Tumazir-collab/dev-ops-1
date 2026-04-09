-- Run once if you already created `notes` without these columns (Supabase SQL editor).

alter table public.notes
  add column if not exists updated_at timestamptz not null default now();

alter table public.notes
  add column if not exists pinned boolean not null default false;

update public.notes set updated_at = created_at where updated_at is null;

create index if not exists notes_user_pinned_created_idx
  on public.notes (user_id, pinned desc, created_at desc);
