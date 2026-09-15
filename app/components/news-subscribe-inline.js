"use client";

import { useState } from "react";
import { subscribeAction } from "../admin/actions";
import { LocalizedText } from "./language-provider";

// /news alt bandındaki abone formu. Görsel olarak eskisiyle aynı; tek fark
// artık gerçekten kayıt yapıyor (önceden input ve button boştaydı).
export default function NewsSubscribeInline() {
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setMessage("");

    try {
      const result = await subscribeAction(new FormData(form));
      setOk(Boolean(result?.success));
      setMessage(result?.message || "");
      if (result?.success) form.reset();
    } catch {
      setOk(false);
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-3 md:w-auto">
      <form
        onSubmit={onSubmit}
        className="flex w-full flex-col gap-3 md:w-auto md:min-w-[28rem] md:flex-row md:items-end md:gap-4"
      >
        <input
          aria-label="Email address"
          className="min-h-12 w-full bg-transparent border border-outline px-4 py-3 font-label text-base uppercase tracking-[0.18em] text-on-surface transition-all focus:border-primary focus:outline-none md:w-80"
          name="email"
          placeholder="Email"
          required
          type="email"
        />
        <button
          className="min-h-12 w-full bg-primary-container px-8 py-3 font-label text-sm uppercase tracking-widest text-on-primary-container transition-all hover:opacity-90 disabled:opacity-60 md:w-auto md:px-12"
          disabled={pending}
          type="submit"
        >
          {pending ? <LocalizedText en="Saving…" fr="Envoi…" /> : <LocalizedText en="Subscribe" fr="S’abonner" />}
        </button>
      </form>
      {message ? (
        <p aria-live="polite" className={`font-body text-sm ${ok ? "text-emerald-400" : "text-rose-400"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
