import "server-only";
import { cookies } from "next/headers";
import { COOKIE, verifyToken } from "./session";

/** Throws unless the request carries a valid admin session. Call at the top of every admin action. */
export async function requireAdmin() {
  const jar = await cookies();
  if (!(await verifyToken(jar.get(COOKIE)?.value)))
    throw new Error("Your session has expired. Please log in again.");
}

/** The admin password. Local dev falls back to "admin" so the panel works out of the box. */
export function adminPassword() {
  return process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== "production" ? "admin" : "");
}
