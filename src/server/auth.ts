import "server-only";
import { db } from "./supabase/admin";
import { sessionClient } from "./supabase/server";

export type Faculty = { id: string; email: string; name: string };

/** The logged-in faculty member, or null. Being signed in is not enough: the account must be in faculty_users. */
export async function currentFaculty(): Promise<Faculty | null> {
  const { data } = await (await sessionClient()).auth.getUser();
  if (!data.user) return null;
  const { data: row } = await db()
    .from("faculty_users")
    .select("user_id,email,name")
    .eq("user_id", data.user.id)
    .maybeSingle();
  return row ? { id: row.user_id, email: row.email, name: row.name } : null;
}

/** Throws unless the request comes from a faculty account. Call at the top of every admin action. */
export async function requireFaculty(): Promise<Faculty> {
  const f = await currentFaculty();
  if (!f) throw new Error("Your session has expired, or this account isn't faculty. Please log in again.");
  return f;
}
