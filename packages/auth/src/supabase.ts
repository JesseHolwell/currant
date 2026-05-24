import { createClient } from "@supabase/supabase-js";

/*
 * Shared Supabase client for the Currant suite.
 *
 * One project, one auth.users table, one session — every vertical imports
 * this same client so sign-in carries across Cash, Health, Mind, and Life.
 *
 * Configured via Vite env vars on the consuming app:
 *   VITE_SUPABASE_URL              — project URL
 *   VITE_SUPABASE_PUBLISHABLE_KEY  — anon key
 *
 * When unset, `isSupabaseConfigured` is false and consumers should hide
 * auth UI / cloud-sync entirely. The client is still constructed against a
 * placeholder so import sites don't need to handle `undefined`.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseKey ?? "placeholder"
);
