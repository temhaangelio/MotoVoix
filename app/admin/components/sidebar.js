"use client";

import Link from "next/link";
import { BrandMark } from "../../components/brand-mark";
import LanguageSwitcher from "../../components/language-switcher";
import { useLanguage } from "../../components/language-provider";
import { LogoutButton } from "./logout-button";

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

export function Sidebar({ active, siteName, modules }) {
  const { language } = useLanguage();
  return (
    <aside className="sidebar">
      <Link href="/admin" className="flex items-center gap-3">
        <BrandMark className="text-black" />
        <strong className="block text-base tracking-[-.03em]">{siteName}</strong>
      </Link>
      <nav className="flex flex-col gap-1">
        {items
          .filter(([, , module]) => !module || modules[module])
          .map(([label, href]) => {
            const selected = isSelected(active, href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex h-11 items-center justify-between rounded-[14px] px-4 text-[15px] transition-colors ${selected ? "bg-black font-semibold text-white" : "font-medium text-[#4a4a4a] hover:bg-white hover:text-black"}`}
              >
                <span>{label[language]}</span>
                {selected ? <span aria-hidden="true" className="absolute right-3 top-2 size-1.5 rounded-full bg-white" /> : null}
              </Link>
            );
          })}
        <div className="px-1 py-2">
          <LanguageSwitcher light />
        </div>
        <Link href="/news" className="mt-2 flex h-11 items-center justify-between rounded-[14px] px-4 text-[15px] font-medium text-[#a1a1a1] hover:bg-white hover:text-black">
          <span>{language === "fr" ? "Voir le site" : "View site"}</span>
          <span>↗</span>
        </Link>
        <LogoutButton className="flex h-11 w-full items-center justify-between rounded-[14px] px-4 text-left text-[15px] font-medium text-[#a1a1a1] transition-colors hover:bg-white hover:text-[#b42318] disabled:opacity-50" />
      </nav>
    </aside>
  );
}
