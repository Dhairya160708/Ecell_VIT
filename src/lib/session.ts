// Signed admin session cookie. Uses Web Crypto so it works in both proxy.ts and server actions.
export const COOKIE = "ecell_admin";
export const MAX_AGE = 60 * 60 * 24 * 7; // stay signed in for a week

function secret() {
  const s =
    process.env.SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    (process.env.NODE_ENV !== "production" ? "dev-only-secret" : "");
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function createToken() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  return `${exp}.${await hmac(exp)}`;
}

export async function verifyToken(token: string | undefined) {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  try {
    return timingSafeEqual(sig, await hmac(exp));
  } catch {
    return false;
  }
}

export function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
