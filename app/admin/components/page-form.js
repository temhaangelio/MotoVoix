"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { savePageAction } from "../actions";
import { Button, buttonVariants } from "./ui/button";
import { FormField } from "./ui/form-field";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { LIMITS } from "../../../lib/field-limits";

const L = LIMITS.page;

export function PageForm({ page }) {
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await savePageAction(new FormData(event.currentTarget));
      if (!result?.success) {
        setMessage(result?.message || "Save failed.");
        return;
      }
      router.push("/admin/pages");
      router.refresh();
    } catch {
      setMessage("The server returned an unexpected response.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-[920px] space-y-5">
      {page ? <input type="hidden" name="id" value={page.id} /> : null}
      <div className="card space-y-5">
        <h2 className="section-title">Page</h2>
        <FormField label="Title" htmlFor="title"><Input id="title" name="title" maxLength={L.title} required defaultValue={page?.title || ""} /></FormField>
        <FormField label="Heading (H1)" htmlFor="heading" hint="Shown as the big headline on the page. Falls back to the title when empty.">
          <Input id="heading" name="heading" maxLength={L.heading} defaultValue={page?.heading || ""} />
        </FormField>
        <FormField label="Slug" htmlFor="slug"><Input id="slug" name="slug" maxLength={L.slug} defaultValue={page?.slug || ""} /></FormField>
        <FormField label="Summary" htmlFor="excerpt"><Textarea id="excerpt" name="excerpt" maxLength={L.excerpt} defaultValue={page?.excerpt || ""} /></FormField>
        <FormField label="Content" htmlFor="body" hint="Markdown is supported (## for headings)."><Textarea id="body" name="body" className="min-h-[220px]" defaultValue={page?.body || ""} /></FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Menu order" htmlFor="menuOrder"><Input id="menuOrder" name="menuOrder" type="number" defaultValue={page?.menu_order || 1} /></FormField>
          <FormField label="Status" htmlFor="published">
            <Select id="published" name="published" defaultValue={page?.published ? "true" : "false"}>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </Select>
          </FormField>
        </div>
        {message ? <p className="text-sm text-[#b42318]">{message}</p> : null}
        <div className="flex justify-end gap-2">
          <Link href="/admin/pages" className={buttonVariants({ variant: "secondary" })}>Cancel</Link>
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        </div>
      </div>
    </form>
  );
}
