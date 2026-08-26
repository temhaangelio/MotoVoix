import { NextResponse } from "next/server";

function isPublicAdminPath(pathname) {
  return pathname === "/admin/giris" || pathname.startsWith("/admin/giris/") || pathname.startsWith("/admin/api/");
}

function nextWithPath(request) {
  const headers = new Headers(request.headers);
  headers.set("x-motovoix-path", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export function proxy(request) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return nextWithPath(request);
  }

  if (isPublicAdminPath(pathname) || request.headers.get("next-action")) {
    return nextWithPath(request);
  }

  const session = request.cookies.get("mv_admin")?.value;
  if (session !== "1") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/giris";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return nextWithPath(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
