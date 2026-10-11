import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifyToken } from "@/lib/session";

// Send anyone without a valid admin session to the login page.
// (Every admin server action and upload route checks the session again on its own.)
export async function proxy(req: NextRequest) {
  if (await verifyToken(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  const url = new URL("/admin/login", req.url);
  if (req.nextUrl.pathname !== "/admin") url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin", "/admin/((?!login).*)"] };
