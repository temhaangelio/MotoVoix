"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteUserAction } from "../actions";
import { ActionMenu } from "./ui/action-menu";
import { AdminDate } from "./admin-date";
import { Badge } from "./ui/badge";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { EmptyState } from "./ui/empty-state";
import { Table, TableWrap, Td, Th } from "./ui/table";

export function UsersTable({ users, currentUserId }) {
  const router = useRouter();
  const [userToDelete, setUserToDelete] = useState(null);
  const [error, setError] = useState(null);

  async function remove() {
    if (!userToDelete) return false;
    const result = await deleteUserAction(userToDelete.id);
    if (!result.success) {
      setError(result.message);
      return false;
    }
    router.refresh();
    return true;
  }

  if (!users.length) return <EmptyState title="No users yet" description="Create an admin account to get started." />;

  return (
    <>
      <div className="card">
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Created</Th>
                <Th><span className="sr-only">Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isCurrent = user.id === currentUserId;
                return (
                  <tr key={user.id}>
                    <Td className="font-bold">
                      {user.name || "—"}
                      {isCurrent ? <span className="ml-2 text-[13px] font-medium text-[#a1a1a1]">(you)</span> : null}
                    </Td>
                    <Td className="text-[#777]">{user.email}</Td>
                    <Td><Badge className={user.role === "admin" ? "bg-black text-white" : ""}>{user.role}</Badge></Td>
                    <Td className="text-[#777]"><AdminDate value={user.created_at} /></Td>
                    <Td>
                      <div className="flex justify-end">
                        <ActionMenu
                          label={`${user.email} actions`}
                          items={[
                            { label: "Edit", href: `/admin/users/${user.id}/edit`, icon: <Pencil size={15} /> },
                            ...(isCurrent
                              ? []
                              : [{ label: "Delete", destructive: true, icon: <Trash2 size={15} />, onSelect: () => setUserToDelete(user) }]),
                          ]}
                        />
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
      </div>
      <ConfirmDialog
        open={Boolean(userToDelete)}
        title="Delete user?"
        description={userToDelete ? `“${userToDelete.email}” will lose access to the panel.` : ""}
        confirmLabel="Delete user"
        variant="destructive"
        error={error}
        onOpenChange={(open) => { if (!open) setUserToDelete(null); setError(null); }}
        onConfirm={remove}
      />
    </>
  );
}
