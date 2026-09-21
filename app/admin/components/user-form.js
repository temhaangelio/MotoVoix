"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveUserAction } from "../actions";
import { Button, buttonVariants } from "./ui/button";
import { FormField } from "./ui/form-field";
import { Input } from "./ui/input";
import { Select } from "./ui/select";

export function UserForm({ user, redirectTo = "/admin/users" }) {
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);

  const isEdit = Boolean(user);

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      const result = await saveUserAction(new FormData(event.currentTarget));
      if (!result?.success) {
        setMessage(result?.message || "Save failed.");
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setMessage("The server returned an unexpected response.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-[920px] space-y-5">
      {isEdit ? <input type="hidden" name="id" value={user.id} /> : null}
      <div className="card space-y-5">
        <h2 className="section-title">Account</h2>

        <FormField label="Name" htmlFor="name">
          <Input id="name" name="name" defaultValue={user?.name || ""} autoComplete="name" />
        </FormField>

        <FormField label="Email" htmlFor="email" hint="Used to sign in to the panel.">
          <Input id="email" name="email" type="email" required defaultValue={user?.email || ""} autoComplete="username" />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          hint={isEdit ? "Leave blank to keep the current password. Minimum 8 characters." : "Minimum 8 characters."}
        >
          <Input
            id="password"
            name="password"
            type="password"
            required={!isEdit}
            minLength={8}
            autoComplete="new-password"
            placeholder={isEdit ? "••••••••" : ""}
          />
        </FormField>

        <FormField label="Role" htmlFor="role">
          <Select id="role" name="role" defaultValue={user?.role || "admin"}>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </Select>
        </FormField>

        {message ? <p className="text-sm text-[#b42318]">{message}</p> : null}

        <div className="flex justify-end gap-2">
          <Link href={redirectTo} className={buttonVariants({ variant: "secondary" })}>Cancel</Link>
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        </div>
      </div>
    </form>
  );
}
