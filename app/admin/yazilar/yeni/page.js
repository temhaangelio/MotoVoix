import { AppShell } from "../../components/app-shell";
import { PageHeader } from "../../components/page-header";
import { PostForm } from "../../components/post-form";

export default function NewPostPage() {
  return (
    <AppShell active="/admin/yazilar">
      <PageHeader title="New post" note="The record is saved to the MySQL database." />
      <PostForm />
    </AppShell>
  );
}
