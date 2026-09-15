import { notFound } from "next/navigation";
import { getUserById } from "../../../../../lib/users";
import { AppShell } from "../../../components/app-shell";
import { PageHeader } from "../../../components/page-header";
import { UserForm } from "../../../components/user-form";

export default async function EditUserPage({ params }) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) notFound();

  return (
    <AppShell active="/admin/kullanicilar">
      <PageHeader title="Edit user" note={user.email} />
      <UserForm user={user} />
    </AppShell>
  );
}
