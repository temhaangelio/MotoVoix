"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATIC_PASSWORD = "Hande.2026+";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (password === STATIC_PASSWORD) {
      setError("");
      router.push("/news");
      return;
    }

    setError("Wrong password");
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input
        autoComplete="current-password"
        className="min-h-12 w-full rounded-[16px] border border-black/10 bg-[#f8f6f3] px-4 py-3 text-base text-center text-[#1e1d1c] transition-colors focus:border-primary focus:outline-none"
        id="password"
        name="password"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        type="password"
        value={password}
      />
      {error ? <p className="text-center font-label text-xs uppercase tracking-[0.18em] text-[#b42318]">{error}</p> : null}
      <button
        className="min-h-12 w-full rounded-[16px] bg-primary-container px-8 py-3 font-label text-sm uppercase tracking-widest text-on-primary-container transition-all hover:opacity-90"
        type="submit"
      >
        Enter Site
      </button>
    </form>
  );
}
