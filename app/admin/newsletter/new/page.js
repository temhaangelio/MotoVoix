import { AppShell } from "../../components/app-shell";
import { PageHeader } from "../../components/page-header";
import { NewsletterForm } from "../../components/newsletter-form";

export default function NewNewsletterPage() {
  return (
    <AppShell active="/admin/newsletter">
      <PageHeader title="New newsletter" note="The issue is saved to the MySQL database." />
      <NewsletterForm />
    </AppShell>
  );
}
