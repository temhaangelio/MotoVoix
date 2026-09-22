"use client";

import { useState } from "react";
import { subscribeAction } from "../admin/actions";
import { LIMITS } from "../../lib/field-limits";

const L = LIMITS.subscriber;

export default function NewsletterSubscribeForm() {
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    const result = await subscribeAction(new FormData(event.currentTarget));
    setPending(false);
    setOk(Boolean(result.success));
    setMessage(result.message);
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-2 block font-label text-xs uppercase tracking-widest text-zinc-400" htmlFor="newsletter-email">
          Email
        </label>
        <input
          className="min-h-12 w-full rounded-[16px] border border-outline-variant/30 bg-transparent px-4 py-3 text-base text-on-surface transition-colors focus:border-primary focus:outline-none"
          id="newsletter-email"
          name="email"
          maxLength={L.email}
          placeholder="name@email.com"
          required
          type="email"
        />
      </div>
      <button
        className="min-h-12 w-full rounded-[16px] bg-primary-container px-8 py-3 font-label text-sm uppercase tracking-widest text-on-primary-container transition-all hover:opacity-90 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving…" : "Subscribe"}
      </button>
      {message ? <p className={`font-body text-sm ${ok ? "text-emerald-400" : "text-rose-400"}`}>{message}</p> : null}
    </form>
  );
}
