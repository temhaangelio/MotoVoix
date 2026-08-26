import { getAnalytics } from "../../../lib/local-db";
import { AppShell } from "../components/app-shell";
import { PageHeader } from "../components/page-header";
import { AnalyticsDashboard } from "../components/analytics-dashboard";

export default async function AnalyticsPage({ searchParams }) {
  const query = await searchParams;
  const value = Array.isArray(query.aralik) ? query.aralik[0] : query.aralik;
  const range = value === "7" ? 7 : 30;
  const analytics = getAnalytics(range);
  return (
    <AppShell active="/admin/istatistik">
      <PageHeader title="İstatistik" note="Yerel demo analitikleri · Supabase yok" />
      <AnalyticsDashboard analytics={analytics} range={range} />
    </AppShell>
  );
}
