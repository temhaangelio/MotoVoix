"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Archive, Eye, MailOpen, Trash2 } from "lucide-react";
import { deleteMessageAction, setMessageStatusAction } from "../actions";
import { ActionMenu } from "./ui/action-menu";
import { AdminDate } from "./admin-date";
import { Badge } from "./ui/badge";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { EmptyState } from "./ui/empty-state";
import { Table, TableWrap, Td, Th } from "./ui/table";

const statusLabels = { new: "New", read: "Read", archived: "Archived" };

export function MessagesTable({ messages }) {
  const router = useRouter();
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState(null);

  async function remove() {
    if (!toDelete) return false;
    const result = await deleteMessageAction(toDelete.id);
    if (!result.success) {
      setError(result.message);
      return false;
    }
    router.refresh();
    return true;
  }

  async function setStatus(id, status) {
    const result = await setMessageStatusAction(id, status);
    if (result.success) router.refresh();
  }

  if (!messages.length) {
    return <EmptyState title="No messages yet" description="Messages sent from the contact page will appear here." />;
  }

  return (
    <>
      <div className="card">
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>From</Th>
                <Th>Email</Th>
                <Th>Message</Th>
                <Th>Status</Th>
                <Th>Received</Th>
                <Th><span className="sr-only">Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {messages.map((item) => (
                <tr key={item.id}>
                  <Td className={item.status === "new" ? "font-bold" : "font-semibold"}>{item.name}</Td>
                  <Td className="text-[#777]">{item.email}</Td>
                  <Td className="max-w-[320px] truncate text-[#777]">{item.message}</Td>
                  <Td>
                    <Badge className={item.status === "new" ? "bg-black text-white" : ""}>
                      {statusLabels[item.status] ?? item.status}
                    </Badge>
                  </Td>
                  <Td className="text-[#a1a1a1]"><AdminDate value={item.created_at} includeTime /></Td>
                  <Td>
                    <div className="flex justify-end">
                      <ActionMenu
                        label={`${item.email} actions`}
                        items={[
                          { label: "View", href: `/admin/messages/${item.id}`, icon: <Eye size={15} /> },
                          ...(item.status === "new"
                            ? [{ label: "Mark as read", icon: <MailOpen size={15} />, onSelect: () => setStatus(item.id, "read") }]
                            : []),
                          ...(item.status !== "archived"
                            ? [{ label: "Archive", icon: <Archive size={15} />, onSelect: () => setStatus(item.id, "archived") }]
                            : [{ label: "Move to inbox", icon: <MailOpen size={15} />, onSelect: () => setStatus(item.id, "read") }]),
                          { label: "Delete", destructive: true, icon: <Trash2 size={15} />, onSelect: () => setToDelete(item) },
                        ]}
                      />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete message?"
        description={toDelete ? `The message from “${toDelete.email}” will be permanently deleted.` : ""}
        confirmLabel="Delete message"
        variant="destructive"
        error={error}
        onOpenChange={(open) => { if (!open) setToDelete(null); setError(null); }}
        onConfirm={remove}
      />
    </>
  );
}

// Detay sayfasındaki işlem düğmeleri.
export function MessageActions({ message }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);

  async function remove() {
    const result = await deleteMessageAction(message.id);
    if (!result.success) {
      setError(result.message);
      return false;
    }
    router.push("/admin/messages");
    router.refresh();
    return true;
  }

  async function archive() {
    await setMessageStatusAction(message.id, message.status === "archived" ? "read" : "archived");
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "MotoVoix"}`)}`}
          className="inline-flex h-11 items-center rounded-full bg-black px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Reply by email
        </Link>
        <button
          type="button"
          onClick={archive}
          className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold transition-colors hover:bg-[#f2f2f2]"
        >
          {message.status === "archived" ? "Move to inbox" : "Archive"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold text-[#b42318] transition-colors hover:bg-[#fff1f0]"
        >
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={open}
        title="Delete message?"
        description={`The message from “${message.email}” will be permanently deleted.`}
        confirmLabel="Delete message"
        variant="destructive"
        error={error}
        onOpenChange={(value) => { setOpen(value); if (!value) setError(null); }}
        onConfirm={remove}
      />
    </>
  );
}
