import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Send anyone who isn't signed in to the login page, and keep the Supabase session cookie fresh.
// (The admin layout, every admin server action and the upload route also check that the account is faculty.)
export async function proxy(req: NextRequest) {
  if (process.env.SITE_PREVIEW === "true") return NextResponse.redirect(new URL("/", req.url));
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    },
  );
  const { data } = await supabase.auth.getUser();
  if (data.user) return res;
  const url = new URL("/admin/login", req.url);
  if (req.nextUrl.pathname !== "/admin") url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin", "/admin/((?!login).*)"] };
