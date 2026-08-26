"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveNewsletterAction } from "../actions";
import { Button, buttonVariants } from "./ui/button";
import { FormField } from "./ui/form-field";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";

export function NewsletterForm() {
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await saveNewsletterAction(new FormData(event.currentTarget));
      if (!result?.success) {
        setMessage(result?.message || "Kayıt başarısız.");
        return;
      }
      router.push("/admin/e-bulten");
      router.refresh();
    } catch {
      setMessage("Sunucudan beklenmeyen bir yanıt geldi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-[920px] space-y-5">
      <div className="card space-y-5">
        <h2 className="section-title">Yeni bülten</h2>
        <FormField label="Konu" htmlFor="subject"><Input id="subject" name="subject" required /></FormField>
        <FormField label="Ön izleme" htmlFor="previewText"><Input id="previewText" name="previewText" /></FormField>
        <FormField label="İçerik" htmlFor="content"><Textarea id="content" name="content" className="min-h-[220px]" /></FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Durum" htmlFor="status">
            <Select id="status" name="status" defaultValue="draft">
              <option value="draft">Taslak</option>
              <option value="scheduled">Planlı</option>
              <option value="sent">Gönderildi (demo)</option>
            </Select>
          </FormField>
          <FormField label="Planlanan gönderim" htmlFor="scheduledAt"><Input id="scheduledAt" name="scheduledAt" type="datetime-local" /></FormField>
        </div>
        {message ? <p className="text-sm text-[#b42318]">{message}</p> : null}
        <div className="flex justify-end gap-2">
          <Link href="/admin/e-bulten" className={buttonVariants({ variant: "secondary" })}>Vazgeç</Link>
          <Button type="submit" disabled={pending}>{pending ? "Kaydediliyor…" : "Kaydet"}</Button>
        </div>
      </div>
    </form>
  );
}
