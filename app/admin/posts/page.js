import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPosts } from "../../../lib/local-db";
import { AppShell } from "../components/app-shell";
import { PageHeader } from "../components/page-header";
import { PostsTable } from "../components/posts-table";
import { buttonVariants } from "../components/ui/button";

export default async function PostsPage() {
  const posts = await getPosts();
  return (
    <AppShell active="/admin/posts">
      <div className="mx-auto w-full max-w-[1600px]">
        <PageHeader title="Posts" note={`${posts.length.toLocaleString("en-US")} posts · local database`} actions={<Link href="/admin/posts/new" className={buttonVariants()}>New post <ArrowRight className="ml-3 size-4" /></Link>} />
        <PostsTable posts={posts} />
      </div>
    </AppShell>
  );
}
