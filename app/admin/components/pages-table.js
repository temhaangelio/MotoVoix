"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { deletePageAction } from "../actions";
import { pagePath } from "../../../lib/page-path";
import { ActionMenu } from "./ui/action-menu";
import { Badge } from "./ui/badge";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { EmptyState } from "./ui/empty-state";
import { Table, TableWrap, Td, Th } from "./ui/table";

export function PagesTable({ pages }) {
  const router = useRouter();
  const [pageToDelete, setPageToDelete] = useState(null);
  const [error, setError] = useState(null);

  async function remove() {
    if (!pageToDelete) return false;
    const result = await deletePageAction(pageToDelete.id);
    if (!result.success) {
      setError(result.message);
      return false;
    }
    router.refresh();
    return true;
  }

  if (!pages.length) return <EmptyState title="No pages yet" description="Create a new page to get started." />;

  return (
    <>
      <div className="card">
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Page</Th>
                <Th>Slug</Th>
                <Th>Status</Th>
                <Th className="text-right">Order</Th>
                <Th><span className="sr-only">Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id}>
                  <Td className="font-bold">{page.title}</Td>
                  <Td className="text-[#777]">/{page.slug}</Td>
                  <Td><Badge className={page.published ? "bg-black text-white" : ""}>{page.published ? "Published" : "Draft"}</Badge></Td>
                  <Td className="text-right">{page.menu_order}</Td>
                  <Td>
                    <div className="flex justify-end">
                      <ActionMenu
                        label={`${page.title} actions`}
                        items={[
                          { label: "View", href: pagePath(page.slug), target: "_blank", icon: <ExternalLink size={15} /> },
                          { label: "Edit", href: `/admin/pages/${page.id}/edit`, icon: <Pencil size={15} /> },
                          { label: "Delete", destructive: true, icon: <Trash2 size={15} />, onSelect: () => setPageToDelete(page) },
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
        open={Boolean(pageToDelete)}
        title="Delete page?"
        description={pageToDelete ? `“${pageToDelete.title}” will be deleted.` : ""}
        confirmLabel="Delete page"
        variant="destructive"
        error={error}
        onOpenChange={(open) => { if (!open) setPageToDelete(null); setError(null); }}
        onConfirm={remove}
      />
    </>
  );
}
