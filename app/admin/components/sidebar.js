import Link from "next/link";
import { BrandMark } from "../../components/brand-mark";

const items = [
  ["Dashboard", "/admin", null],
  ["Yazılar", "/admin/yazilar", "posts"],
  ["E-bülten", "/admin/e-bulten", "newsletter"],
  ["Reklamlar", "/admin/reklamlar", "ads"],
  ["Sayfalar", "/admin/sayfalar", null],
  ["İstatistik", "/admin/istatistik", "analytics"],
  ["Ayarlar", "/admin/ayarlar", null],
];

function isSelected(active, href) {
  if (href === "/admin") return active === "/admin";
  return active === href || active.startsWith(`${href}/`);
}

export function Sidebar({ active, siteName, modules }) {
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
                <span>{label}</span>
                {selected ? <span aria-hidden="true" className="absolute right-3 top-2 size-1.5 rounded-full bg-white" /> : null}
              </Link>
            );
          })}
        <Link href="/news" className="mt-2 flex h-11 items-center justify-between rounded-[14px] px-4 text-[15px] font-medium text-[#a1a1a1] hover:bg-white hover:text-black">
          <span>Siteyi gör</span>
          <span>↗</span>
        </Link>
      </nav>
    </aside>
  );
}
