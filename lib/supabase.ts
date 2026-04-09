import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client (anon key). Use only in Route Handlers / Server Components.
 * Tables should allow these operations without RLS (as in the project brief).
 */
export function createSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.");
  }
  return createClient(url, key);
}
