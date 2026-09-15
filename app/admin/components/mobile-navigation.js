"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark } from "../../components/brand-mark";
import LanguageSwitcher from "../../components/language-switcher";
import { useLanguage } from "../../components/language-provider";

const items = [
  [{ en: "Dashboard", fr: "Tableau de bord" }, "/admin", null],
  [{ en: "Posts", fr: "Articles" }, "/admin/yazilar", "posts"],
  [{ en: "Newsletter", fr: "Infolettre" }, "/admin/e-bulten", "newsletter"],
  [{ en: "Ads", fr: "Publicités" }, "/admin/reklamlar", "ads"],
  [{ en: "Pages", fr: "Pages" }, "/admin/sayfalar", null],
  [{ en: "Analytics", fr: "Statistiques" }, "/admin/istatistik", "analytics"],
  [{ en: "Messages", fr: "Messages" }, "/admin/mesajlar", null],
  [{ en: "Users", fr: "Utilisateurs" }, "/admin/kullanicilar", null],
  [{ en: "Settings", fr: "Paramètres" }, "/admin/ayarlar", null],
];

function isSelected(active, href) {
  if (href === "/admin") return active === "/admin";
  return active === href || active.startsWith(`${href}/`);
}

export function MobileNavigation({ active, siteName, modules }) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", close);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="mobile-bar">
        <Link href="/admin" className="flex items-center gap-3">
          <BrandMark className="!size-10 text-black" />
          <strong>{siteName}</strong>
        </Link>
        <button aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)} className="grid size-11 place-items-center rounded-full bg-white">
          <Menu size={20} />
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/25" role="presentation" onMouseDown={() => setOpen(false)}>
          <aside role="dialog" aria-modal="true" aria-label="Main menu" className="ml-auto flex h-full w-[min(88vw,360px)] flex-col bg-[#efefef] p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between">
              <strong className="text-lg">{siteName}</strong>
              <button autoFocus aria-label="Close menu" onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-full bg-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {items
                .filter(([, , module]) => !module || modules[module])
                .map(([label, href]) => {
                  const selected = isSelected(active, href);
                  return (
                    <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex min-h-12 items-center rounded-2xl px-4 font-semibold ${selected ? "bg-black text-white" : "hover:bg-white"}`}>
                      {label[language]}
                    </Link>
                  );
                })}
            </nav>
            <div className="mt-3"><LanguageSwitcher light /></div>
            <Link href="/news" className="mt-auto rounded-2xl bg-white p-4 font-semibold">
              {language === "fr" ? "Voir le site" : "View site"} ↗
            </Link>
          </aside>
        </div>
      ) : null}
    </>
  );
}
