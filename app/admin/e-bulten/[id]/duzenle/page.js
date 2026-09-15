import { notFound } from "next/navigation";
import { getNewsletterById } from "../../../../../lib/local-db";
import { AppShell } from "../../../components/app-shell";
import { PageHeader } from "../../../components/page-header";
import { NewsletterForm } from "../../../components/newsletter-form";

export default async function EditNewsletterPage({ params }) {
  const { id } = await params;
  const newsletter = await getNewsletterById(id);

  if (!newsletter) notFound();

  return (
    <AppShell active="/admin/e-bulten">
      <PageHeader title="Edit newsletter" note={newsletter.subject} />
      <NewsletterForm newsletter={newsletter} />
    </AppShell>
  );
}
