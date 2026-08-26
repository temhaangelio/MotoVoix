import { AppShell } from "../../components/app-shell";
import { PageHeader } from "../../components/page-header";
import { NewsletterForm } from "../../components/newsletter-form";

export default function NewNewsletterPage() {
  return (
    <AppShell active="/admin/e-bulten">
      <PageHeader title="Yeni bülten" note="Gönderim demo olarak yerel veritabanına kaydedilir." />
      <NewsletterForm />
    </AppShell>
  );
}
