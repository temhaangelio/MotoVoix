"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { savePostAction } from "../actions";
import { Button, buttonVariants } from "./ui/button";
import { FormField } from "./ui/form-field";
import { ImagePickerField } from "./image-picker-field";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { RichTextEditor } from "./rich-text-editor";
import { getCategoryLabel } from "../../../lib/categories";
import { useLanguage } from "../../components/language-provider";

function localDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function PostForm({ post }) {
  const router = useRouter();
  const { language } = useLanguage();
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);
  const [bodyEn, setBodyEn] = useState(post?.bodyEn || post?.body || "");
  const [bodyFr, setBodyFr] = useState(post?.bodyFr || "");

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const result = await savePostAction(new FormData(event.currentTarget));
      if (!result?.success) {
        setMessage(result?.message || "Save failed.");
        return;
      }
      router.push("/admin/posts");
      router.refresh();
    } catch {
      setMessage("The server returned an unexpected response. Refresh and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <div className="card space-y-5">
        <h2 className="section-title">English content</h2>
        <FormField label="Title (English)" htmlFor="titleEn"><Input id="titleEn" name="titleEn" required defaultValue={post?.titleEn || post?.title || ""} /></FormField>
        <FormField label="Summary (English)" htmlFor="excerptEn"><Textarea id="excerptEn" name="excerptEn" defaultValue={post?.excerptEn || post?.excerpt || post?.description || ""} /></FormField>
        <FormField label="Article (English)" htmlFor="bodyEn"><RichTextEditor id="bodyEn" name="bodyEn" value={bodyEn} onChange={setBodyEn} /></FormField>
        <div className="border-t border-[#e4e4e4] pt-5"><h2 className="section-title">Contenu français</h2></div>
        <FormField label="Titre (français)" htmlFor="titleFr"><Input id="titleFr" name="titleFr" required defaultValue={post?.titleFr || ""} /></FormField>
        <FormField label="Résumé (français)" htmlFor="excerptFr"><Textarea id="excerptFr" name="excerptFr" defaultValue={post?.excerptFr || ""} /></FormField>
        <FormField label="Article (français)" htmlFor="bodyFr">
          <RichTextEditor id="bodyFr" name="bodyFr" value={bodyFr} onChange={setBodyFr} />
        </FormField>
      </div>
      <aside className="space-y-5">
        <div className="card space-y-5">
          <h2 className="section-title">Publishing</h2>
          <FormField label="Slug" htmlFor="slug" hint="Generated from the title if left blank."><Input id="slug" name="slug" defaultValue={post?.slug || ""} /></FormField>
          <FormField label="Category" htmlFor="category"><Input id="category" name="category" defaultValue={getCategoryLabel(post?.category || "motorcycle", "en")} /></FormField>
          <FormField label="Tags" htmlFor="tags"><Input id="tags" name="tags" defaultValue={post?.tags || ""} /></FormField>
          <FormField label="Cover image" htmlFor="image" hint="Upload an image or choose one from the library."><ImagePickerField id="image" name="image" defaultValue={post?.image || ""} /></FormField>
          <FormField label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue={post?.status || "published"}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </Select>
          </FormField>
          <FormField label="Scheduled date" htmlFor="scheduledAt"><Input id="scheduledAt" lang={language === "fr" ? "fr-FR" : "en-US"} name="scheduledAt" type="datetime-local" defaultValue={localDateTime(post?.scheduled_at)} /></FormField>
          <FormField label="Source name" htmlFor="sourceName"><Input id="sourceName" name="sourceName" defaultValue={post?.source_name || ""} /></FormField>
          <FormField label="Source URL" htmlFor="sourceUrl"><Input id="sourceUrl" name="sourceUrl" defaultValue={post?.source_url || ""} /></FormField>
          {message ? <p className="rounded-2xl bg-[#fff1f0] p-3 text-sm text-[#b42318]">{message}</p> : null}
          <div className="flex gap-2">
            <Link href="/admin/posts" className={buttonVariants({ variant: "secondary" })}>Cancel</Link>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
          </div>
        </div>
      </aside>
    </form>
  );
}
