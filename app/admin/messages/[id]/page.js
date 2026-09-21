import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { getMessageById, updateMessageStatus } from "../../../../lib/messages";
import { AppShell } from "../../components/app-shell";
import { PageHeader } from "../../components/page-header";
import { AdminDate } from "../../components/admin-date";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { MessageActions } from "../../components/messages-table";
import { buttonVariants } from "../../components/ui/button";

const statusLabels = { new: "New", read: "Read", archived: "Archived" };

export default async function MessageDetailPage({ params }) {
  const { id } = await params;
  const message = await getMessageById(id);

  if (!message) notFound();

  // Görüntülenen mesaj okundu sayılıyor; yanıt gönderildikten sonra yazılıyor.
  if (message.status === "new") {
    after(() => updateMessageStatus(message.id, "read"));
  }

  return (
    <AppShell active="/admin/messages">
      <PageHeader
        title={message.name}
        note={message.email}
        actions={<Link href="/admin/messages" className={buttonVariants({ variant: "secondary" })}>Back to messages</Link>}
      />

      <div className="mx-auto grid w-full max-w-[1100px] gap-5 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="section-title">{message.subject || "No subject"}</h2>
            <Badge className={message.status === "new" ? "bg-black text-white" : ""}>
              {statusLabels[message.status] ?? message.status}
            </Badge>
          </div>
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-[#4a4a4a]">{message.message}</p>
        </Card>

        <Card className="h-fit xl:col-span-4">
          <h2 className="section-title mb-5">Details</h2>
          <div className="space-y-3 text-sm">
            <p><span className="text-[#a1a1a1]">Name:</span> {message.name}</p>
            <p><span className="text-[#a1a1a1]">Email:</span> {message.email}</p>
            <p><span className="text-[#a1a1a1]">Received:</span> <AdminDate value={message.created_at} includeTime /></p>
          </div>
          <div className="mt-7">
            <MessageActions message={message} />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
