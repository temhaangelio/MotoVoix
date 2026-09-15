import { NextResponse } from "next/server";
import { authenticate } from "../../../../lib/users";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "../../../../lib/auth-session";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "");
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json({ success: false, message: "Email and password are required." }, { status: 400 });
  }

  const user = await authenticate(email, password);
  if (!user) {
    // Hangi alanın yanlış olduğunu belli etmiyoruz.
    return NextResponse.json({ success: false, message: "Incorrect email or password." }, { status: 401 });
  }

  let token;
  try {
    token = await createSessionToken(user.id);
  } catch {
    return NextResponse.json(
      { success: false, message: "Session secret is not configured on the server." },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    path: "/",
    maxAge: SESSION_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
