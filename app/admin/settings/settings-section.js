import { getSettings } from "../../../lib/local-db";
import { AppShell } from "../components/app-shell";
import { PageHeader } from "../components/page-header";
import { SettingsForm } from "../components/settings-form";

export async function SettingsSection({ section, title, note }) {
  const settings = await getSettings();
  return (
    <AppShell active="/admin/settings">
      <div className="w-full">
        <PageHeader title={title} note={note} />
        <SettingsForm initialValues={settings} section={section} />
      </div>
    </AppShell>
  );
}
