import { AdminTheme } from "./admin-theme";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin | MotoVoix",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-root min-h-screen bg-[#efefef] text-[#0a0a0a]">
      <AdminTheme />
      {children}
    </div>
  );
}
