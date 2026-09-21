import { AppShell } from "../../components/app-shell";
import { PageHeader } from "../../components/page-header";
import { PageForm } from "../../components/page-form";

export default function NewPageAdmin() {
  return (
    <AppShell active="/admin/pages">
      <PageHeader title="New page" note="Page content is stored in the local database." />
      <PageForm />
    </AppShell>
  );
}
