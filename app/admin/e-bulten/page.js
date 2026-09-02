import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getNewsletterDashboard } from "../../../lib/local-db";
import { AppShell } from "../components/app-shell";
import { PageHeader } from "../components/page-header";
import { Badge } from "../components/ui/badge";
import { buttonVariants } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { EmptyState } from "../components/ui/empty-state";
import { Table, TableWrap, Td, Th } from "../components/ui/table";
import { AdminDate } from "../components/admin-date";

const statusLabels = { draft: "Draft", scheduled: "Scheduled", sent: "Sent", cancelled: "Cancelled" };
const subscriberStatusLabels = { active: "Active", pending: "Pending", unsubscribed: "Unsubscribed" };

function rate(value, total) {
  return total ? `%${((value / total) * 100).toFixed(1).replace(".", ",")}` : "—";
}

export default function NewsletterAdminPage() {
  const { newsletters, subscribers, stats } = getNewsletterDashboard();
  const scheduled = newsletters.filter((item) => item.status === "scheduled" && item.scheduled_at).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0];
  const sentCampaigns = newsletters.filter((item) => item.status === "sent");
  const chartCampaigns = sentCampaigns.slice(0, 6).reverse();
  const cards = [
    ["Subscribers", stats.active.toLocaleString("en-US"), `${stats.pending} pending`],
    ["Opens", `${stats.openRate.toFixed(1)}%`, `${stats.sent} sends`],
    ["Clicks", `%${stats.clickRate.toFixed(1).replace(".", ",")}`, "demo rate"],
    ["Unsubscribes", stats.unsubscribed.toLocaleString("tr-TR"), "people"],
  ];

  return (
    <AppShell active="/admin/e-bulten">
      <div className="mx-auto w-full max-w-[1600px]">
        <PageHeader title="Newsletter" note={`${stats.active.toLocaleString("en-US")} active subscribers · ${stats.sent} issues sent`} actions={<Link href="/admin/e-bulten/yeni" className={buttonVariants()}>New newsletter <ArrowRight className="ml-3 size-4" /></Link>} />
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
            <div className="mb-5 flex justify-between">
              <h2 className="section-title">Subscribers</h2>
              <span className="text-[#a1a1a1]">{subscribers.length} people</span>
            </div>
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Status</Th>
                    <Th>Source</Th>
                    <Th className="text-right">Signup date</Th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id}>
                      <Td className="font-semibold">{subscriber.name || "—"}</Td>
                      <Td className="text-[#777]">{subscriber.email}</Td>
                      <Td><Badge className={subscriber.status === "active" ? "bg-black text-white" : ""}>{subscriberStatusLabels[subscriber.status]}</Badge></Td>
                      <Td className="text-[#777]">{subscriber.source || "Web sitesi"}</Td>
                      <Td className="text-right text-[#a1a1a1]"><AdminDate value={subscriber.created_at} /></Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </Card>
          <Card className="xl:col-span-12">
            <div className="mb-5 flex justify-between">
              <h2 className="section-title">Newsletters</h2>
              <span className="text-[#a1a1a1]">{newsletters.length} issues</span>
            </div>
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>Issue</Th>
                    <Th>Subject</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Recipients</Th>
                    <Th className="text-right">Opens</Th>
                    <Th className="text-right">Date</Th>
                  </tr>
                </thead>
                <tbody>
                  {newsletters.map((newsletter) => (
                    <tr key={newsletter.id}>
                      <Td className="font-bold">#{newsletter.issue_number}</Td>
                      <Td className="font-semibold">{newsletter.subject}</Td>
                      <Td><Badge className={newsletter.status === "sent" ? "bg-black text-white" : ""}>{statusLabels[newsletter.status]}</Badge></Td>
                      <Td className="text-right">{newsletter.recipient_count ? newsletter.recipient_count.toLocaleString("tr-TR") : "—"}</Td>
                      <Td className="text-right">{rate(newsletter.open_count, newsletter.recipient_count)}</Td>
                      <Td className="text-right text-[#a1a1a1]"><AdminDate value={newsletter.sent_at ?? newsletter.scheduled_at ?? newsletter.created_at} /></Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
