"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { createAdAction, deleteAdAction, toggleAdAction, updateAdAction } from "../actions";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { FormField } from "./ui/form-field";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";

function hostname(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

export function AdsManager({ ads }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [active, setActive] = useState(true);
  const [message, setMessage] = useState(null);
  const [adToDelete, setAdToDelete] = useState(null);
  const [adToEdit, setAdToEdit] = useState(null);
  const [editError, setEditError] = useState(null);
  const editFormRef = useRef(null);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("active", String(active));
    setPending(true);
    const result = await createAdAction(formData);
    setPending(false);
    setMessage(result.message);
    if (result.success) {
      form.reset();
      setActive(true);
      router.refresh();
    }
  }

  async function toggle(ad, checked) {
    const result = await toggleAdAction(ad.id, checked);
    setMessage(result.message);
    if (result.success) router.refresh();
  }

  async function saveEdit() {
    const form = editFormRef.current;
    if (!form || !form.reportValidity()) return false;

    const formData = new FormData(form);
    const result = await updateAdAction(formData);
    if (!result.success) {
      setEditError(result.message);
      return false;
    }
    setMessage(result.message);
    router.refresh();
    return true;
  }

  async function removeSelected() {
    if (!adToDelete) return false;
    const result = await deleteAdAction(adToDelete.id);
    setMessage(result.message);
    if (result.success) router.refresh();
    return result.success;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <Card className="h-fit xl:col-span-5">
        <h2 className="section-title">New ad</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#a1a1a1]">The ad is saved to the MySQL database.</p>
        <form onSubmit={submit} className="mt-6 space-y-5">
          <FormField label="Title" htmlFor="ad-title"><Input id="ad-title" name="title" required /></FormField>
          <FormField label="Description" htmlFor="ad-description"><Textarea id="ad-description" name="description" required /></FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Button label" htmlFor="ad-cta"><Input id="ad-cta" name="ctaLabel" defaultValue="Discover" required /></FormField>
            <FormField label="Hedef adres" htmlFor="ad-url"><Input id="ad-url" name="targetUrl" type="url" placeholder="https://" required /></FormField>
          </div>
          <FormField label="Image URL" htmlFor="ad-image"><Input id="ad-image" name="imageUrl" placeholder="/images/news/news1.png" /></FormField>
          <FormField label="Language" htmlFor="ad-language">
            <Select id="ad-language" name="language" defaultValue="en">
              <option value="en">English</option>
              <option value="fr">Français</option>
            </Select>
          </FormField>
          <div className="flex items-center justify-between rounded-2xl bg-[#f7f7f7] p-4">
            <div>
              <strong className="block text-sm">Publish now</strong>
              <small className="mt-1 block text-[#a1a1a1]">If disabled, the ad is saved as a draft.</small>
            </div>
            <Switch checked={active} onCheckedChange={setActive} label="Publish ad now" />
          </div>
          {message ? <p aria-live="polite" className="rounded-2xl bg-[#f5f5f5] p-3 text-sm">{message}</p> : null}
          <Button type="submit" disabled={pending} className="w-full">{pending ? "Saving…" : "Add ad"}</Button>
        </form>
      </Card>

      <div className="space-y-4 xl:col-span-7">
        {ads.map((ad) => (
          <Card key={ad.id} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-[-.03em]">{ad.title}</h3>
                <Badge className={ad.active ? "bg-black text-white" : ""}>{ad.active ? "Published" : "Draft"}</Badge>
              </div>
              <p className="mt-2 text-sm text-[#666]">{ad.description}</p>
              <a href={ad.targetUrl} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold" target="_blank" rel="noreferrer">
                {hostname(ad.targetUrl)} <ExternalLink size={14} />
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={ad.active} onCheckedChange={(checked) => toggle(ad, checked)} label={`${ad.title} publishing`} />
              <button type="button" aria-label={`Edit ${ad.title}`} onClick={() => { setAdToEdit(ad); setEditError(null); }} className="grid size-10 place-items-center rounded-full text-[#4a4a4a] hover:bg-[#f2f2f2] hover:text-black">
                <Pencil size={16} />
              </button>
              <button type="button" aria-label={`Delete ${ad.title}`} onClick={() => setAdToDelete(ad)} className="grid size-10 place-items-center rounded-full text-[#b42318] hover:bg-[#fff1f0]">
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(adToEdit)}
        title="Edit ad"
        description={adToEdit ? adToEdit.title : ""}
        confirmLabel="Save"
        error={editError}
        onOpenChange={(open) => { if (!open) setAdToEdit(null); setEditError(null); }}
        onConfirm={saveEdit}
      >
        {adToEdit ? (
          <form ref={editFormRef} className="space-y-4" onSubmit={(event) => event.preventDefault()}>
            <input type="hidden" name="id" value={adToEdit.id} />
            <FormField label="Title" htmlFor="edit-ad-title"><Input id="edit-ad-title" name="title" required defaultValue={adToEdit.title} /></FormField>
            <FormField label="Description" htmlFor="edit-ad-description"><Textarea id="edit-ad-description" name="description" required defaultValue={adToEdit.description} /></FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Button label" htmlFor="edit-ad-cta"><Input id="edit-ad-cta" name="ctaLabel" required defaultValue={adToEdit.ctaLabel} /></FormField>
              <FormField label="Destination URL" htmlFor="edit-ad-url"><Input id="edit-ad-url" name="targetUrl" type="url" required defaultValue={adToEdit.targetUrl} /></FormField>
            </div>
            <FormField label="Image URL" htmlFor="edit-ad-image"><Input id="edit-ad-image" name="imageUrl" defaultValue={adToEdit.imageUrl} /></FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Language" htmlFor="edit-ad-language">
                <Select id="edit-ad-language" name="language" defaultValue={adToEdit.language}>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </Select>
              </FormField>
              <FormField label="Status" htmlFor="edit-ad-active">
                <Select id="edit-ad-active" name="active" defaultValue={adToEdit.active ? "true" : "false"}>
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </Select>
              </FormField>
            </div>
          </form>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(adToDelete)}
        title="Delete ad?"
        description={adToDelete ? `“${adToDelete.title}” will be deleted.` : ""}
        confirmLabel="Delete ad"
        variant="destructive"
        onOpenChange={(open) => { if (!open) setAdToDelete(null); }}
        onConfirm={removeSelected}
      />
    </div>
  );
}
