-- Run this in Supabase SQL Editor (no RLS; app uses the anon key only on the server).
-- Adjust if your project already has these tables.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password text not null
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  pinned boolean not null default false
);

-- Optional: help Supabase API pick rows by user quickly
create index if not exists notes_user_id_created_at_idx
  on public.notes (user_id, created_at desc);

create index if not exists notes_user_pinned_created_idx
  on public.notes (user_id, pinned desc, created_at desc);
