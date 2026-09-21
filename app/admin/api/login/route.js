import { NextResponse } from "next/server";
import { authenticate } from "../../../../lib/users";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "../../../../lib/auth-session";

export async function POST(request) {
  // JS yüklenmeden gönderilen klasik form (urlencoded/multipart) ile
  // istemcideki fetch (JSON) isteğini ayırt ediyoruz.
  const isJson = (request.headers.get("content-type") || "").includes("application/json");
  let body = {};
  if (isJson) {
    body = await request.json().catch(() => ({}));
  } else {
    const form = await request.formData().catch(() => null);
    if (form) body = { email: form.get("email"), password: form.get("password") };
  }
  const email = String(body.email || "");
  const password = String(body.password || "");

  const fail = (message, status, code) =>
    isJson
      ? NextResponse.json({ success: false, message }, { status })
      : NextResponse.redirect(new URL(`/admin/login?error=${code}`, request.url), 303);

  if (!email || !password) {
    return fail("Email and password are required.", 400, "missing");
  }

  const user = await authenticate(email, password);
  if (!user) {
    // Hangi alanın yanlış olduğunu belli etmiyoruz.
    return fail("Incorrect email or password.", 401, "invalid");
  }

  let token;
  try {
    token = await createSessionToken(user.id);
  } catch {
    return fail("Session secret is not configured on the server.", 500, "server");
  }

  const response = isJson
    ? NextResponse.json({ success: true })
    : NextResponse.redirect(new URL("/admin", request.url), 303);
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    path: "/",
    maxAge: SESSION_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
