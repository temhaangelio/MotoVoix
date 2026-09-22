"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteSubscriberAction, saveSubscriberAction } from "../actions";
import { ActionMenu } from "./ui/action-menu";
import { AdminDate } from "./admin-date";
import { Badge } from "./ui/badge";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { EmptyState } from "./ui/empty-state";
import { FormField } from "./ui/form-field";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Table, TableWrap, Td, Th } from "./ui/table";
import { LIMITS } from "../../../lib/field-limits";

const L = LIMITS.subscriber;

const statusLabels = { active: "Active", pending: "Pending", unsubscribed: "Unsubscribed" };

export function SubscribersTable({ subscribers }) {
  const router = useRouter();
  const formRef = useRef(null);
  const [editing, setEditing] = useState(null); // { subscriber } | { subscriber: null } = yeni
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState(null);

  async function save() {
    const form = formRef.current;
    if (!form) return false;
    if (!form.reportValidity()) return false;

    const result = await saveSubscriberAction(new FormData(form));
    if (!result.success) {
      setError(result.message);
      return false;
    }
    router.refresh();
    return true;
  }

  async function remove() {
    if (!toDelete) return false;
    const result = await deleteSubscriberAction(toDelete.id);
    if (!result.success) {
      setError(result.message);
      return false;
    }
    router.refresh();
    return true;
  }

  const current = editing?.subscriber ?? null;

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="section-title">Subscribers</h2>
        <div className="flex items-center gap-3">
          <span className="text-[#a1a1a1]">{subscribers.length} people</span>
          <button
            type="button"
            onClick={() => { setEditing({ subscriber: null }); setError(null); }}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-black px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus size={15} /> Add subscriber
          </button>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <EmptyState title="No subscribers yet" description="Signups from the site will appear here." />
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Status</Th>
                <Th>Source</Th>
                <Th className="text-right">Signup date</Th>
                <Th><span className="sr-only">Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <Td className="font-semibold">{subscriber.name || "—"}</Td>
                  <Td className="text-[#777]">{subscriber.email}</Td>
                  <Td>
                    <Badge className={subscriber.status === "active" ? "bg-black text-white" : ""}>
                      {statusLabels[subscriber.status] ?? subscriber.status}
                    </Badge>
                  </Td>
                  <Td className="text-[#777]">{subscriber.source || "Web sitesi"}</Td>
                  <Td className="text-right text-[#a1a1a1]"><AdminDate value={subscriber.created_at} /></Td>
                  <Td>
                    <div className="flex justify-end">
                      <ActionMenu
                        label={`${subscriber.email} actions`}
                        items={[
                          { label: "Edit", icon: <Pencil size={15} />, onSelect: () => { setEditing({ subscriber }); setError(null); } },
                          { label: "Delete", destructive: true, icon: <Trash2 size={15} />, onSelect: () => setToDelete(subscriber) },
                        ]}
                      />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}

      <ConfirmDialog
        open={Boolean(editing)}
        title={current ? "Edit subscriber" : "Add subscriber"}
        description={current ? current.email : "The subscriber is saved to the MySQL database."}
        confirmLabel="Save"
        error={error}
        onOpenChange={(open) => { if (!open) setEditing(null); setError(null); }}
        onConfirm={save}
      >
        <form ref={formRef} className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          {current ? <input type="hidden" name="id" value={current.id} /> : null}
          <FormField label="Email" htmlFor="subscriber-email">
            <Input id="subscriber-email" name="email" maxLength={L.email} type="email" required defaultValue={current?.email || ""} />
          </FormField>
          <FormField label="Name" htmlFor="subscriber-name">
            <Input id="subscriber-name" name="name" maxLength={L.name} defaultValue={current?.name || ""} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Status" htmlFor="subscriber-status">
              <Select id="subscriber-status" name="status" defaultValue={current?.status || "active"}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="unsubscribed">Unsubscribed</option>
              </Select>
            </FormField>
            <FormField label="Source" htmlFor="subscriber-source">
              <Input id="subscriber-source" name="source" maxLength={L.source} defaultValue={current?.source || "Panel"} />
            </FormField>
          </div>
        </form>
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete subscriber?"
        description={toDelete ? `“${toDelete.email}” will be removed from the list.` : ""}
        confirmLabel="Delete subscriber"
        variant="destructive"
        error={error}
        onOpenChange={(open) => { if (!open) setToDelete(null); setError(null); }}
        onConfirm={remove}
      />
    </>
  );
}
