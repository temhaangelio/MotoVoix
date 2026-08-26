import { NextResponse } from "next/server";

const ADMIN_PASSWORD = "Hande.2026+";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const password = String(body.password || "");

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, message: "Şifre hatalı" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("mv_admin", "1", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
  return response;
}
