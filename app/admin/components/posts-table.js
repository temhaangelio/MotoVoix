"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownUp, ExternalLink, ImagePlus, Pencil, Search, Trash2 } from "lucide-react";
import { deletePostAction } from "../actions";
import { ActionMenu } from "./ui/action-menu";
import { Badge } from "./ui/badge";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { EmptyState } from "./ui/empty-state";
import { Input } from "./ui/input";
import { Table, TableWrap, Td, Th } from "./ui/table";
import { useLanguage } from "../../components/language-provider";
import { getCategoryLabel } from "../../../lib/categories";

const labels = { published: "Published", draft: "Draft", scheduled: "Scheduled", archived: "Archived" };
const tabs = [["All", "all"], ["Published", "published"], ["Draft", "draft"], ["Scheduled", "scheduled"]];
const sortLabels = { newest: "Newest", oldest: "Oldest", "title-asc": "Title A–Z" };

export function PostsTable({ posts }) {
  const router = useRouter();
  const { language } = useLanguage();
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const sorted = useMemo(() => {
    const next = [...posts];
    if (sort === "oldest") next.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    else if (sort === "title-asc") next.sort((a, b) => a.title.localeCompare(b.title, "tr"));
    else next.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return next;
  }, [posts, sort]);

  const filtered = sorted.filter(
    (post) => (status === "all" || post.status === status) && `${post.title} ${post.excerpt} ${post.body} ${post.category}`.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")),
  );

  async function deleteSelectedPost() {
    if (!postToDelete) return false;
    const result = await deletePostAction(postToDelete.id);
    if (!result.success) {
      setDeleteError(result.message);
      return false;
    }
    router.refresh();
    return true;
  }

  return (
    <>
      <div className="mb-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
        {tabs.map(([label, value]) => (
          <button key={value} type="button" onClick={() => setStatus(value)} className={`flex h-[132px] flex-col justify-between rounded-[28px] p-6 text-left transition ${status === value ? "bg-black text-white" : "bg-white hover:-translate-y-0.5"}`}>
            <span className={`text-[15px] font-semibold ${status === value ? "text-white" : "text-[#4a4a4a]"}`}>{label}</span>
            <span className="text-[44px] font-bold leading-none tracking-[-.05em]">{value === "all" ? posts.length : posts.filter((post) => post.status === value).length}</span>
          </button>
        ))}
      </div>
      <div className="card">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#a1a1a1]" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title or content" className="pl-11" />
          </div>
          <ActionMenu
            label="Sort posts"
            trigger={<><ArrowDownUp size={15} /><span>Sort · {sortLabels[sort]}</span></>}
            triggerClassName="bg-[#f1f1f1] text-sm font-semibold text-black hover:bg-[#e8e8e8] hover:text-black"
            items={Object.entries(sortLabels).map(([value, label]) => ({ label, checked: sort === value, onSelect: () => setSort(value) }))}
          />
        </div>
        {filtered.length ? (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th className="w-[48%]">Post</Th>
                  <Th>Category</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Reads</Th>
                  <Th className="text-right">Date</Th>
                  <Th><span className="sr-only">Actions</span></Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((post) => (
                  <tr key={post.id} className="group hover:bg-[#f7f7f7]">
                    <Td className="align-top">
                      <Link href={`/admin/yazilar/${post.id}/duzenle`} className="block text-base font-bold tracking-[-.022em] hover:underline">{post.title}</Link>
                      <p className="mt-2 line-clamp-2 text-sm text-[#777]">{post.excerpt || post.description}</p>
                    </Td>
                    <Td>{getCategoryLabel(post.category, language)}</Td>
                    <Td><Badge className={post.status === "published" ? "bg-black text-white" : post.status === "scheduled" ? "border border-[#dedede] bg-white text-black" : ""}>{labels[post.status] || post.status}</Badge></Td>
                    <Td className="text-right font-semibold">{post.reads ? post.reads.toLocaleString(language === "fr" ? "fr-FR" : "en-US") : "—"}</Td>
                    <Td className="text-right text-[#a1a1a1]" suppressHydrationWarning>
                      {new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-US", { timeZone: "Europe/Istanbul", day: "numeric", month: "short" }).format(new Date(post.published_at || post.scheduled_at || post.created_at))}
                    </Td>
                    <Td>
                      <div className="flex justify-end">
                        <ActionMenu
                          label={`${post.title} actions`}
                          items={[
                            ...(post.status === "published"
                              ? [{ label: "View", href: `/haber/${post.slug}`, target: "_blank", icon: <ExternalLink size={15} /> }]
                              : []),
                            { label: "Edit", href: `/admin/yazilar/${post.id}/duzenle`, icon: <Pencil size={15} /> },
                            { label: "Generate image", href: `/admin/yazilar/${post.id}/gorsel-uret`, icon: <ImagePlus size={15} /> },
                            { label: language === "fr" ? "Supprimer" : "Delete", destructive: true, icon: <Trash2 size={15} />, onSelect: () => { setDeleteError(null); setPostToDelete(post); } },
                          ]}
                        />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        ) : (
          <EmptyState title="No matching posts found" description="Change the search or filter and try again." />
        )}
      </div>
      <ConfirmDialog
        open={Boolean(postToDelete)}
        title="Delete post?"
        description={postToDelete ? `“${postToDelete.title}” will be deleted from the local database.` : "This action cannot be undone."}
        confirmLabel="Delete post"
        variant="destructive"
        error={deleteError}
        onOpenChange={(open) => { if (!open) setPostToDelete(null); setDeleteError(null); }}
        onConfirm={deleteSelectedPost}
      />
    </>
  );
}
