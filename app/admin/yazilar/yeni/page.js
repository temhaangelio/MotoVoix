import { AppShell } from "../../components/app-shell";
import { PageHeader } from "../../components/page-header";
import { PostForm } from "../../components/post-form";

export default function NewPostPage() {
  return (
    <AppShell active="/admin/yazilar">
      <PageHeader title="Yeni yazı" note="Kayıt data/local-db.json dosyasına yazılır." />
      <PostForm />
    </AppShell>
  );
}
