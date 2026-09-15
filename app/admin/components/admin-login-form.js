"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AdminLoginForm() {
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      const data = new FormData(event.currentTarget);
      const response = await fetch("/admin/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
        cache: "no-store",
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        setMessage(result?.message || "Sign-in failed.");
        setPending(false);
        return;
      }

      // router.push burada kullanılmıyor: giriş öncesi /admin için yapılan
      // prefetch, proxy tarafından /admin/giris'e yönlendirilmiş olarak
      // istemci önbelleğinde kalıyor ve yeni çereze rağmen tekrar giriş
      // sayfasına dönülüyordu. Tam sayfa geçişi önbelleği atlar ve yeni
      // oturum çereziyle temiz bir istek gönderir.
      window.location.replace("/admin");
    } catch {
      setMessage("Could not connect to the server. Refresh and try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input name="email" type="email" placeholder="Email" autoComplete="username" required />
      <Input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
      {message ? <p className="text-sm font-medium text-[#b42318]">{message}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}
