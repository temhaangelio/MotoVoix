"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import ThemeToggle from "./theme-toggle";

const NAV_ITEMS = [
  { href: "/news", label: "News", match: (pathname) => pathname === "/news" || pathname.startsWith("/haber/") },
  { href: "/newsletter", label: "Newsletter", match: (pathname) => pathname === "/newsletter" },
  { href: "/about", label: "About", match: (pathname) => pathname === "/about" },
  { href: "/contact", label: "Contact", match: (pathname) => pathname === "/contact" },
];

function getLinkClass(isActive) {
  return isActive
    ? "text-rose-400 font-semibold font-label text-sm uppercase tracking-widest"
    : "text-zinc-400 hover:text-rose-400 font-semibold transition-colors duration-300 font-label text-sm uppercase tracking-widest";
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 md:px-8 md:py-5">
        <div className="flex items-center justify-between gap-4">
          <Link href="/news" className="brand-logo text-xl font-semibold tracking-tight text-[#E5E2E1] sm:text-2xl">
            MOTOVOIX
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link className={getLinkClass(item.match(pathname))} href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              aria-controls="mobile-navigation"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/30 text-zinc-200 transition-colors duration-300 hover:border-primary hover:text-primary md:hidden"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              type="button"
            >
              {isMenuOpen ? <X aria-hidden size={18} strokeWidth={2} /> : <Menu aria-hidden size={18} strokeWidth={2} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav
            className="mt-4 grid gap-2 rounded-[20px] border border-outline-variant/20 bg-surface-container/95 p-3 shadow-2xl md:hidden"
            id="mobile-navigation"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                className={`${getLinkClass(item.match(pathname))} rounded-[14px] px-4 py-3 ${item.match(pathname) ? "bg-primary/10" : "bg-transparent"}`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
