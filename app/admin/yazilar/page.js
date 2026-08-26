import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPosts } from "../../../lib/local-db";
import { AppShell } from "../components/app-shell";
import { PageHeader } from "../components/page-header";
import { PostsTable } from "../components/posts-table";
import { buttonVariants } from "../components/ui/button";

export default function PostsPage() {
  const posts = getPosts();
  return (
    <AppShell active="/admin/yazilar">
      <div className="mx-auto w-full max-w-[1600px]">
        <PageHeader title="Yazılar" note={`${posts.length.toLocaleString("tr-TR")} yazı · yerel veritabanı`} actions={<Link href="/admin/yazilar/yeni" className={buttonVariants()}>Yeni yazı <ArrowRight className="ml-3 size-4" /></Link>} />
        <PostsTable posts={posts} />
      </div>
    </AppShell>
  );
}
