import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getNewsletterDashboard } from "../../../lib/local-db";
import { AppShell } from "../components/app-shell";
import { PageHeader } from "../components/page-header";
import { Badge } from "../components/ui/badge";
import { buttonVariants } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { EmptyState } from "../components/ui/empty-state";
import { AdminDate } from "../components/admin-date";
import { NewslettersTable } from "../components/newsletters-table";
import { SubscribersTable } from "../components/subscribers-table";

export default async function NewsletterAdminPage() {
  const { newsletters, subscribers, stats } = await getNewsletterDashboard();
  const scheduled = newsletters.filter((item) => item.status === "scheduled" && item.scheduled_at).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0];
  const sentCampaigns = newsletters.filter((item) => item.status === "sent");
  const chartCampaigns = sentCampaigns.slice(0, 6).reverse();
  const cards = [
    ["Subscribers", stats.active.toLocaleString("en-US"), `${stats.pending} pending`],
    ["Opens", `${stats.openRate.toFixed(1)}%`, `${stats.sent} sends`],
    ["Clicks", `%${stats.clickRate.toFixed(1).replace(".", ",")}`, "of recipients"],
    ["Unsubscribes", stats.unsubscribed.toLocaleString("en-US"), "people"],
  ];

  return (
    <AppShell active="/admin/newsletter">
      <div className="mx-auto w-full max-w-[1600px]">
        <PageHeader title="Newsletter" note={`${stats.active.toLocaleString("en-US")} active subscribers · ${stats.sent} issues sent`} actions={<Link href="/admin/newsletter/new" className={buttonVariants()}>New newsletter <ArrowRight className="ml-3 size-4" /></Link>} />
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {cards.map(([label, value, note]) => (
            <Card key={label} className="flex h-[132px] flex-col justify-between">
              <strong className="text-[15px]">{label}</strong>
              <div>
                <span className="text-[42px] font-bold leading-none tracking-[-.05em]">{value}</span>
                <small className="ml-2 text-[#a1a1a1]">{note}</small>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-12">
          <Card className="xl:col-span-7">
            {scheduled ? (
              <>
                <div className="text-sm font-medium text-[#a1a1a1]">Next send · <AdminDate value={scheduled.sent_at ?? scheduled.scheduled_at ?? scheduled.created_at} /></div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="section-title">#{scheduled.issue_number} · {scheduled.subject}</h2>
                    <p className="mt-1 text-[#a1a1a1]">{scheduled.preview_text || "No preview text added"}</p>
                  </div>
                  <Badge className="bg-black text-white">Scheduled</Badge>
                </div>
              </>
            ) : (
              <EmptyState title="No scheduled newsletters" description="Create a newsletter and schedule its send date." />
            )}
          </Card>
          <Card className="xl:col-span-5">
            <div className="flex justify-between">
              <h2 className="section-title">Open rate</h2>
              <span className="text-[#a1a1a1]">Last {chartCampaigns.length} issues</span>
            </div>
            <div className="mt-5 text-[42px] font-bold tracking-[-.05em]">%{stats.openRate.toFixed(1).replace(".", ",")}</div>
            {chartCampaigns.length ? (
              <div className="mt-8 flex h-28 items-end gap-3">
                {chartCampaigns.map((newsletter) => {
                  const percentage = newsletter.recipient_count ? (newsletter.open_count / newsletter.recipient_count) * 100 : 0;
                  return (
                    <div key={newsletter.id} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <span className="w-full rounded bg-black" style={{ height: `${Math.max(percentage, 3)}%` }} />
                      <small className="text-[#a1a1a1]">#{newsletter.issue_number}</small>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-8 text-sm text-[#a1a1a1]">The chart will appear here once sent-newsletter data is available.</p>
            )}
          </Card>
          <Card className="xl:col-span-12">
            <SubscribersTable subscribers={subscribers} />
          </Card>
          <Card className="xl:col-span-12">
            <div className="mb-5 flex justify-between">
              <h2 className="section-title">Newsletters</h2>
              <span className="text-[#a1a1a1]">{newsletters.length} issues</span>
            </div>
            <NewslettersTable newsletters={newsletters} />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
