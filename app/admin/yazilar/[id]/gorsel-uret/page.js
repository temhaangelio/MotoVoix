import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getPostById } from "../../../../../lib/local-db";
import { AppShell } from "../../../components/app-shell";
import { PageHeader } from "../../../components/page-header";
import { PostImageGenerator } from "../../../components/post-image-generator";
import { buttonVariants } from "../../../components/ui/button";

export default async function GeneratePostImagePage({ params }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <AppShell active="/admin/yazilar">
      <div className="mx-auto w-full max-w-[1180px]">
        <PageHeader
          title="Generate image"
          note="Turn the post into a shareable Instagram card"
          actions={(
            <Link href="/admin/yazilar" className={buttonVariants({ variant: "outline" })}>
              <ArrowLeft className="mr-2 size-4" />Back to posts
            </Link>
          )}
        />
        <PostImageGenerator
          title={post.title}
          body={post.body || ""}
          imageUrl={post.image || null}
        />
      </div>
    </AppShell>
  );
}
