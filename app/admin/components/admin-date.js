"use client";

import { useLanguage } from "../../components/language-provider";

export function AdminDate({ value, includeTime = false }) {
  const { language } = useLanguage();
  if (!value) return "—";

  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-US", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}
