import { AppShell } from "../../components/app-shell";
import { PageHeader } from "../../components/page-header";
import { PageForm } from "../../components/page-form";

export default function NewPageAdmin() {
  return (
    <AppShell active="/admin/sayfalar">
      <PageHeader title="Yeni sayfa" note="Sayfa içeriği yerel veritabanında tutulur." />
      <PageForm />
    </AppShell>
  );
}
