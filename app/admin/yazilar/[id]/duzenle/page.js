import { notFound } from "next/navigation";
import { getPostById } from "../../../../../lib/local-db";
import { AppShell } from "../../../components/app-shell";
import { PageHeader } from "../../../components/page-header";
import { PostForm } from "../../../components/post-form";

export default async function EditPostPage({ params }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();
  return (
    <AppShell active="/admin/yazilar">
      <PageHeader title="Edit post" note={post.title} />
      <PostForm post={post} />
    </AppShell>
  );
}
