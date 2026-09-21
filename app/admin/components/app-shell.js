import { redirect } from "next/navigation";
import { getSettings } from "../../../lib/local-db";
import { MobileNavigation } from "./mobile-navigation";
import { Sidebar } from "./sidebar";

const routeModules = {
  "/admin/posts": "posts",
  "/admin/newsletter": "newsletter",
  "/admin/ads": "ads",
  "/admin/analytics": "analytics",
};

export async function AppShell({ active, children }) {
  const settings = await getSettings();
  const modules = {
    posts: settings.modulePosts,
    newsletter: settings.moduleNewsletter,
    ads: settings.moduleAds,
    analytics: settings.moduleAnalytics,
    themes: settings.moduleThemes,
  };
  const activeModule = Object.entries(routeModules).find(([href]) => active === href || active.startsWith(`${href}/`))?.[1];
  if (activeModule && !modules[activeModule]) redirect("/admin");

  return (
    <div className="shell">
      <Sidebar active={active} siteName={settings.siteName} modules={modules} />
      <div className="min-w-0 flex-1">
        <MobileNavigation active={active} siteName={settings.siteName} modules={modules} />
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
