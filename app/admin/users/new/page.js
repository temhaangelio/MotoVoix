import { AppShell } from "../../components/app-shell";
import { PageHeader } from "../../components/page-header";
import { UserForm } from "../../components/user-form";

export default function NewUserPage() {
  return (
    <AppShell active="/admin/users">
      <PageHeader title="New user" note="The account is saved to the MySQL database." />
      <UserForm />
    </AppShell>
  );
}
