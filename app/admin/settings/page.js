import { AppShell } from "../components/app-shell";
import { PageHeader } from "../components/page-header";
import { SettingsNavigation } from "../components/settings-navigation";

export default function SettingsIndexPage() {
  return (
    <AppShell active="/admin/settings">
      <PageHeader title="Settings" note="All settings are stored in the MySQL database." />
      <SettingsNavigation />
    </AppShell>
  );
}
