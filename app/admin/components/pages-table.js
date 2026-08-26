"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deletePageAction } from "../actions";
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

  if (!pages.length) return <EmptyState title="Henüz sayfa yok" description="Yeni bir sayfa ekleyebilirsiniz." />;

  return (
    <>
      <div className="card">
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Sayfa</Th>
                <Th>Slug</Th>
                <Th>Durum</Th>
                <Th className="text-right">Sıra</Th>
                <Th><span className="sr-only">İşlemler</span></Th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id}>
                  <Td className="font-bold">{page.title}</Td>
                  <Td className="text-[#777]">/{page.slug}</Td>
                  <Td><Badge className={page.published ? "bg-black text-white" : ""}>{page.published ? "Yayında" : "Taslak"}</Badge></Td>
                  <Td className="text-right">{page.menu_order}</Td>
                  <Td>
                    <div className="flex justify-end">
                      <ActionMenu
                        label={`${page.title} işlemleri`}
                        items={[
                          { label: "Düzenle", href: `/admin/sayfalar/${page.id}/duzenle`, icon: <Pencil size={15} /> },
                          { label: "Sil", destructive: true, icon: <Trash2 size={15} />, onSelect: () => setPageToDelete(page) },
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
        title="Sayfa silinsin mi?"
        description={pageToDelete ? `“${pageToDelete.title}” silinecek.` : ""}
        confirmLabel="Sayfayı sil"
        variant="destructive"
        error={error}
        onOpenChange={(open) => { if (!open) setPageToDelete(null); setError(null); }}
        onConfirm={remove}
      />
    </>
  );
}
