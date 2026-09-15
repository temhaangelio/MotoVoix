"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveNewsletterAction, updateNewsletterAction } from "../actions";
import { Button, buttonVariants } from "./ui/button";
import { FormField } from "./ui/form-field";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useLanguage } from "../../components/language-provider";

// datetime-local alani "YYYY-MM-DDTHH:mm" bekliyor.
function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function NewsletterForm({ newsletter }) {
  const isEdit = Boolean(newsletter);
  const router = useRouter();
  const { language } = useLanguage();
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    try {
      const data = new FormData(event.currentTarget);
      const result = isEdit ? await updateNewsletterAction(data) : await saveNewsletterAction(data);
      if (!result?.success) {
        setMessage(result?.message || "Save failed.");
        return;
      }
      router.push("/admin/e-bulten");
      router.refresh();
    } catch {
      setMessage("The server returned an unexpected response.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-[920px] space-y-5">
      <div className="card space-y-5">
        {isEdit ? <input type="hidden" name="id" value={newsletter.id} /> : null}
        <h2 className="section-title">{isEdit ? `Issue #${newsletter.issue_number}` : "New newsletter"}</h2>
        <FormField label="Subject" htmlFor="subject"><Input id="subject" name="subject" required defaultValue={newsletter?.subject || ""} /></FormField>
        <FormField label="Preview text" htmlFor="previewText"><Input id="previewText" name="previewText" defaultValue={newsletter?.preview_text || ""} /></FormField>
        <FormField label="Content" htmlFor="content"><Textarea id="content" name="content" className="min-h-[220px]" defaultValue={newsletter?.content || ""} /></FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue={newsletter?.status || "draft"}>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sent">Sent</option>
            </Select>
          </FormField>
          <FormField
            label="Scheduled send"
            htmlFor="scheduledAt"
            hint={isEdit && newsletter.sent_at ? "This issue has already been sent." : undefined}
          >
            <Input id="scheduledAt" lang={language === "fr" ? "fr-FR" : "en-US"} name="scheduledAt" type="datetime-local" defaultValue={toLocalInput(newsletter?.scheduled_at)} />
          </FormField>
        </div>
        {message ? <p className="text-sm text-[#b42318]">{message}</p> : null}
        <div className="flex justify-end gap-2">
          <Link href="/admin/e-bulten" className={buttonVariants({ variant: "secondary" })}>Cancel</Link>
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        </div>
      </div>
    </form>
  );
}
