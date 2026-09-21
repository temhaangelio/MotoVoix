import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/users";
import { AppShell } from "../components/app-shell";
import { PageHeader } from "../components/page-header";
import { UserForm } from "../components/user-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/giris");

  return (
    <AppShell active="/admin/profil">
      <PageHeader title="Profile" note="Your own panel account. Leave the password blank to keep it unchanged." />
      <UserForm user={user} redirectTo="/admin" />
    </AppShell>
  );
}
