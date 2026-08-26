import { AppShell } from "../components/app-shell";
import { PageHeader } from "../components/page-header";
import { SettingsNavigation } from "../components/settings-navigation";

export default function SettingsIndexPage() {
  return (
    <AppShell active="/admin/ayarlar">
      <PageHeader title="Ayarlar" note="Tüm ayarlar data/local-db.json içinde saklanır." />
      <SettingsNavigation />
    </AppShell>
  );
}
