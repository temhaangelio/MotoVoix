import { notFound } from "next/navigation";
import { getPageById } from "../../../../../lib/local-db";
import { AppShell } from "../../../components/app-shell";
import { PageHeader } from "../../../components/page-header";
import { PageForm } from "../../../components/page-form";

export default async function EditPageAdmin({ params }) {
  const { id } = await params;
  const page = getPageById(id);
  if (!page) notFound();
  return (
    <AppShell active="/admin/sayfalar">
      <PageHeader title="Edit page" note={page.title} />
      <PageForm page={page} />
    </AppShell>
  );
}
