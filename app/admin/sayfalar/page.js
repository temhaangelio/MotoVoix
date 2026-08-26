import Link from "next/link";
import { getPages } from "../../../lib/local-db";
import { AppShell } from "../components/app-shell";
import { PageHeader } from "../components/page-header";
import { PagesTable } from "../components/pages-table";
import { buttonVariants } from "../components/ui/button";

export default function PagesAdminPage() {
  const pages = getPages();
  return (
    <AppShell active="/admin/sayfalar">
      <PageHeader title="Sayfalar" note={`${pages.length} özel sayfa`} actions={<Link href="/admin/sayfalar/yeni" className={buttonVariants()}>Yeni sayfa</Link>} />
      <PagesTable pages={pages} />
    </AppShell>
  );
}
