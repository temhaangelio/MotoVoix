"use client";

import { useState } from "react";
import { sendContactMessageAction } from "../admin/actions";
import { LocalizedText } from "./language-provider";
import { LIMITS } from "../../lib/field-limits";

const L = LIMITS.contact;

// Görsel olarak eskisiyle aynı; tek fark artık gerçekten gönderiyor
// (önceden butonun tipi "button" idi ve hiçbir yere bağlı değildi).
export default function ContactForm() {
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setMessage("");

    try {
      const result = await sendContactMessageAction(new FormData(form));
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
    <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <label className="font-label text-xs uppercase tracking-widest text-zinc-400 block mb-2" htmlFor="name">Name</label>
        <input
          className="w-full bg-transparent border border-outline-variant/30 px-4 py-3 text-base text-on-surface focus:outline-none focus:border-primary transition-colors"
          id="name"
          name="name"
          maxLength={L.name}
          required
          type="text"
        />
      </div>
      <div>
        <label className="font-label text-xs uppercase tracking-widest text-zinc-400 block mb-2" htmlFor="email">Email</label>
        <input
          className="w-full bg-transparent border border-outline-variant/30 px-4 py-3 text-base text-on-surface focus:outline-none focus:border-primary transition-colors"
          id="email"
          name="email"
          maxLength={L.email}
          required
          type="email"
        />
      </div>
      <div>
        <label className="font-label text-xs uppercase tracking-widest text-zinc-400 block mb-2" htmlFor="message">Message</label>
        <textarea
          className="w-full min-h-40 bg-transparent border border-outline-variant/30 px-4 py-3 text-base text-on-surface focus:outline-none focus:border-primary transition-colors"
          id="message"
          minLength={10}
          name="message"
          maxLength={L.message}
          required
        />
      </div>
      {message ? (
        <p aria-live="polite" className={`font-body text-sm ${ok ? "text-emerald-400" : "text-rose-400"}`}>
          {message}
        </p>
      ) : null}
      <button
        className="min-h-12 w-full bg-primary-container px-8 py-3 font-label text-sm uppercase tracking-widest text-on-primary-container transition-all hover:opacity-90 disabled:opacity-60 sm:w-auto"
        disabled={pending}
        type="submit"
      >
        {pending ? <LocalizedText en="Sending…" fr="Envoi…" /> : <LocalizedText en="Send Message" fr="Envoyer" />}
      </button>
    </form>
  );
}
