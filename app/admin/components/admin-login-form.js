"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AdminLoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      const password = new FormData(event.currentTarget).get("password");
      const response = await fetch("/admin/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        setMessage(result?.message || "Giriş yapılamadı.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setMessage("Sunucuya bağlanılamadı. Sayfayı yenileyip tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input name="password" type="password" placeholder="Şifre" autoComplete="current-password" required />
      {message ? <p className="text-sm font-medium text-[#b42318]">{message}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Giriş yapılıyor…" : "Panele gir"}</Button>
    </form>
  );
}
