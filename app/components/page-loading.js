import { BrandMark } from "./brand-mark";

export function PageLoading({ variant = "site", label = "Yükleniyor" }) {
  const isAdmin = variant === "admin";

  return (
    <div
      className={`page-loading page-loading-${variant} grid min-h-screen place-items-center px-5`}
      role="status"
      aria-live="polite"
    >
      <div className="flex min-w-[190px] flex-col items-center gap-4 px-8 py-9">
        {isAdmin ? (
          <BrandMark className="!size-12 text-black" spinning />
        ) : (
          <span className="brand-logo text-2xl font-semibold tracking-tight text-primary-container">MOTOVOIX</span>
        )}
        {label ? (
          <span className={`text-sm font-semibold tracking-[-.02em] ${isAdmin ? "text-[#8a8a8a]" : "text-zinc-400"}`}>{label}</span>
        ) : (
          <span className="sr-only">Yükleniyor</span>
        )}
      </div>
    </div>
  );
}
