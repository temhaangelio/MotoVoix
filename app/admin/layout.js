import { AdminTheme } from "./admin-theme";
import { AdminTranslations } from "./components/admin-translations";

export const dynamic = "force-dynamic";

export const metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-root min-h-screen bg-[#efefef] text-[#0a0a0a]">
      <AdminTheme />
      <AdminTranslations />
      {children}
    </div>
  );
}
