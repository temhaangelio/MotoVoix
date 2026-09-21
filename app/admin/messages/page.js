import { getMessages, getMessageStats } from "../../../lib/messages";
import { AppShell } from "../components/app-shell";
import { PageHeader } from "../components/page-header";
import { MessagesTable } from "../components/messages-table";
import { Card } from "../components/ui/card";

export default async function MessagesPage() {
  const [messages, stats] = await Promise.all([getMessages(), getMessageStats()]);

  const cards = [
    ["Total", stats.total, "messages received"],
    ["Unread", stats.unread, "waiting for a reply"],
    ["Archived", stats.archived, "closed threads"],
  ];

  return (
    <AppShell active="/admin/mesajlar">
      <PageHeader title="Messages" note={`${stats.unread} unread of ${stats.total}`} />

      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
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

      <MessagesTable messages={messages} />
    </AppShell>
  );
}
