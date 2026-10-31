import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";
import { verifySession } from "@/lib/jwt";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/archive",
  "/calendar",
  "/creative",
  "/payout",
  "/csr",
  "/marketing",
  "/users",
  "/account",
];

const AUTH_PAGES = ["/login", "/signup", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (AUTH_PAGES.includes(pathname) && session) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/reset-password",
    "/dashboard/:path*",
    "/archive/:path*",
    "/calendar/:path*",
    "/creative/:path*",
    "/payout/:path*",
    "/csr/:path*",
    "/marketing/:path*",
    "/users/:path*",
    "/account/:path*",
  ],
};
