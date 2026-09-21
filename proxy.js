import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/auth-session";

function isPublicAdminPath(pathname) {
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/") || pathname.startsWith("/admin/api/");
}

function nextWithPath(request) {
  const headers = new Headers(request.headers);
  headers.set("x-motovoix-path", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return nextWithPath(request);
  }

  if (isPublicAdminPath(pathname) || request.headers.get("next-action")) {
    return nextWithPath(request);
  }

  // Çerez artık imzalı bir jeton; elle "1" yazılarak geçilemiyor.
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    const response = NextResponse.redirect(url);
    // Süresi dolmuş / bozuk çerezi temizle.
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  return nextWithPath(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
