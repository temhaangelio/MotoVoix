import Link from "next/link";
import { getCurrentUser, getUsers } from "../../../lib/users";
import { AppShell } from "../components/app-shell";
import { PageHeader } from "../components/page-header";
import { UsersTable } from "../components/users-table";
import { buttonVariants } from "../components/ui/button";

export default async function UsersAdminPage() {
  const [users, current] = await Promise.all([getUsers(), getCurrentUser()]);

  return (
    <AppShell active="/admin/kullanicilar">
      <PageHeader
        title="Users"
        note={`${users.length} panel ${users.length === 1 ? "account" : "accounts"}`}
        actions={<Link href="/admin/kullanicilar/yeni" className={buttonVariants()}>New user</Link>}
      />
      <UsersTable users={users} currentUserId={current?.id} />
    </AppShell>
  );
}
