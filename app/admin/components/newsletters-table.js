"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteNewsletterAction } from "../actions";
import { ActionMenu } from "./ui/action-menu";
import { AdminDate } from "./admin-date";
import { Badge } from "./ui/badge";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { EmptyState } from "./ui/empty-state";
import { Table, TableWrap, Td, Th } from "./ui/table";

const statusLabels = { draft: "Draft", scheduled: "Scheduled", sent: "Sent" };

function rate(value, total) {
  return total ? `%${((value / total) * 100).toFixed(1).replace(".", ",")}` : "—";
}

export function NewslettersTable({ newsletters }) {
  const router = useRouter();
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState(null);

  async function remove() {
    if (!toDelete) return false;
    const result = await deleteNewsletterAction(toDelete.id);
    if (!result.success) {
      setError(result.message);
      return false;
    }
    router.refresh();
    return true;
  }

  if (!newsletters.length) {
    return <EmptyState title="No newsletters yet" description="Create your first issue to get started." />;
  }

  return (
    <>
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
              <Th><span className="sr-only">Actions</span></Th>
            </tr>
          </thead>
          <tbody>
            {newsletters.map((newsletter) => (
              <tr key={newsletter.id}>
                <Td className="font-bold">#{newsletter.issue_number}</Td>
                <Td className="font-semibold">{newsletter.subject}</Td>
                <Td>
                  <Badge className={newsletter.status === "sent" ? "bg-black text-white" : ""}>
                    {statusLabels[newsletter.status] ?? newsletter.status}
                  </Badge>
                </Td>
                <Td className="text-right">{newsletter.recipient_count ? newsletter.recipient_count.toLocaleString("en-US") : "—"}</Td>
                <Td className="text-right">{rate(newsletter.open_count, newsletter.recipient_count)}</Td>
                <Td className="text-right text-[#a1a1a1]">
                  <AdminDate value={newsletter.sent_at ?? newsletter.scheduled_at ?? newsletter.created_at} />
                </Td>
                <Td>
                  <div className="flex justify-end">
                    <ActionMenu
                      label={`Issue ${newsletter.issue_number} actions`}
                      items={[
                        { label: "Edit", href: `/admin/e-bulten/${newsletter.id}/duzenle`, icon: <Pencil size={15} /> },
                        { label: "Delete", destructive: true, icon: <Trash2 size={15} />, onSelect: () => setToDelete(newsletter) },
                      ]}
                    />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete newsletter?"
        description={toDelete ? `Issue #${toDelete.issue_number} “${toDelete.subject}” will be deleted.` : ""}
        confirmLabel="Delete newsletter"
        variant="destructive"
        error={error}
        onOpenChange={(open) => { if (!open) setToDelete(null); setError(null); }}
        onConfirm={remove}
      />
    </>
  );
}
