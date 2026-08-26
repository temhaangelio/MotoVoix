"use client";

import { useLanguage } from "./language-provider";
import { Languages } from "lucide-react";

export default function LanguageSwitcher({ light = false }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex h-10 items-center rounded-full border p-1 shadow-sm backdrop-blur-md ${light ? "border-black/10 bg-white" : "site-language-switcher border-white/10 bg-zinc-900/75 shadow-black/20"}`}
      aria-label="Language selection"
      role="group"
    >
      {!light ? (
        <span className="hidden items-center pl-2.5 pr-1 text-zinc-500 sm:flex" aria-hidden="true">
          <Languages size={14} strokeWidth={1.8} />
        </span>
      ) : null}
      {["en", "fr"].map((code) => (
        <button
          aria-pressed={language === code}
          aria-label={code === "en" ? "Switch to English" : "Passer au français"}
          className={`relative grid h-8 min-w-9 place-items-center rounded-full px-2.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${!light ? "site-language-option" : ""} ${language === code ? (light ? "bg-black text-white shadow-sm" : "site-language-option-active bg-primary-container text-on-primary-container shadow-[0_4px_16px_rgba(251,113,133,0.22)]") : (light ? "text-black/45 hover:bg-black/5 hover:text-black" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200")}`}
          data-active={language === code ? "true" : "false"}
          key={code}
          onClick={() => setLanguage(code)}
          type="button"
        >
          {code}
        </button>
      ))}
    </div>
  );
}
