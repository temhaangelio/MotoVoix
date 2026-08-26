import { AppShell } from "../components/app-shell";
import { PageHeader } from "../components/page-header";
import { SettingsNavigation } from "../components/settings-navigation";

export default function SettingsIndexPage() {
  return (
    <AppShell active="/admin/ayarlar">
      <PageHeader title="Settings" note="All settings are stored in data/local-db.json." />
      <SettingsNavigation />
    </AppShell>
  );
}
