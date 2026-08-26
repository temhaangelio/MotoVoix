import { getSettings } from "../../../lib/local-db";
import { AppShell } from "../components/app-shell";
import { PageHeader } from "../components/page-header";
import { SettingsForm } from "../components/settings-form";

export function SettingsSection({ section, title, note }) {
  const settings = getSettings();
  return (
    <AppShell active="/admin/ayarlar">
      <div className="w-full">
        <PageHeader title={title} note={note} />
        <SettingsForm initialValues={settings} section={section} />
      </div>
    </AppShell>
  );
}
