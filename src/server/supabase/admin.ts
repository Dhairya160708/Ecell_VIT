import "server-only";
import { createClient } from "@supabase/supabase-js";
import { isPreviewMode } from "@/server/preview";

/** Service-role client: bypasses RLS. Server-only; every caller must have checked who the user is first. */
export function db() {
  if (isPreviewMode()) throw new Error("Database access is disabled in local preview mode.");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error("Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
