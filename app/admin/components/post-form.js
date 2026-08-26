"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { savePostAction } from "../actions";
import { Button, buttonVariants } from "./ui/button";
import { FormField } from "./ui/form-field";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { RichTextEditor } from "./rich-text-editor";

function localDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function PostForm({ post }) {
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);
  const [body, setBody] = useState(post?.body || "");

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const result = await savePostAction(new FormData(event.currentTarget));
      if (!result?.success) {
        setMessage(result?.message || "Kayıt başarısız.");
        return;
      }
      router.push("/admin/yazilar");
      router.refresh();
    } catch {
      setMessage("Sunucudan beklenmeyen bir yanıt geldi. Sayfayı yenileyip tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <div className="card space-y-5">
        <h2 className="section-title">İçerik</h2>
        <FormField label="Başlık" htmlFor="title"><Input id="title" name="title" required defaultValue={post?.title || ""} /></FormField>
        <FormField label="Kısa özet" htmlFor="excerpt"><Textarea id="excerpt" name="excerpt" defaultValue={post?.excerpt || post?.description || ""} /></FormField>
        <FormField label="Yazı" htmlFor="body" hint="Metni seçip araç çubuğundan biçim uygulayabilirsiniz.">
          <RichTextEditor id="body" name="body" value={body} onChange={setBody} />
        </FormField>
      </div>
      <aside className="space-y-5">
        <div className="card space-y-5">
          <h2 className="section-title">Yayın</h2>
          <FormField label="Slug" htmlFor="slug" hint="Boş bırakılırsa başlıktan üretilir."><Input id="slug" name="slug" defaultValue={post?.slug || ""} /></FormField>
          <FormField label="Kategori" htmlFor="category"><Input id="category" name="category" defaultValue={post?.category || "motorcycle"} /></FormField>
          <FormField label="Etiketler" htmlFor="tags"><Input id="tags" name="tags" defaultValue={post?.tags || ""} /></FormField>
          <FormField label="Kapak görseli" htmlFor="image" hint="Örn. /images/news/news1.png"><Input id="image" name="image" defaultValue={post?.image || ""} /></FormField>
          <FormField label="Durum" htmlFor="status">
            <Select id="status" name="status" defaultValue={post?.status || "published"}>
              <option value="published">Yayında</option>
              <option value="draft">Taslak</option>
              <option value="scheduled">Planlı</option>
            </Select>
          </FormField>
          <FormField label="Planlanan tarih" htmlFor="scheduledAt"><Input id="scheduledAt" name="scheduledAt" type="datetime-local" defaultValue={localDateTime(post?.scheduled_at)} /></FormField>
          <FormField label="Kaynak adı" htmlFor="sourceName"><Input id="sourceName" name="sourceName" defaultValue={post?.source_name || ""} /></FormField>
          <FormField label="Kaynak URL" htmlFor="sourceUrl"><Input id="sourceUrl" name="sourceUrl" defaultValue={post?.source_url || ""} /></FormField>
          {message ? <p className="rounded-2xl bg-[#fff1f0] p-3 text-sm text-[#b42318]">{message}</p> : null}
          <div className="flex gap-2">
            <Link href="/admin/yazilar" className={buttonVariants({ variant: "secondary" })}>Vazgeç</Link>
            <Button type="submit" disabled={pending}>{pending ? "Kaydediliyor…" : "Kaydet"}</Button>
          </div>
        </div>
      </aside>
    </form>
  );
}
