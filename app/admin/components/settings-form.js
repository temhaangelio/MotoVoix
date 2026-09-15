"use client";

import { useState } from "react";
import { saveSettingsAction } from "../actions";
import { Button } from "./ui/button";
import { FormField } from "./ui/form-field";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";

export function SettingsForm({ initialValues, section }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(null);
  const [values, setValues] = useState(initialValues);

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    ["newsletterEnabled", "showSubscriberCount", "maintenanceMode", "modulePosts", "moduleNewsletter", "moduleAds", "moduleAnalytics"].forEach((key) => {
      formData.set(key, String(Boolean(values[key])));
    });
    setPending(true);
    const result = await saveSettingsAction(formData);
    setPending(false);
    setMessage(result);
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-5">
      {section === "general" ? (
        <div className="card space-y-5">
          <h2 className="section-title">Visitor site</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Site name" htmlFor="siteName"><Input id="siteName" name="siteName" defaultValue={values.siteName} /></FormField>
            <FormField label="Domain" htmlFor="domain"><Input id="domain" name="domain" defaultValue={values.domain} /></FormField>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="French description" htmlFor="description"><Textarea id="description" name="description" defaultValue={values.description} /></FormField>
            <FormField label="English description" htmlFor="descriptionEn"><Textarea id="descriptionEn" name="descriptionEn" defaultValue={values.descriptionEn} /></FormField>
          </div>
          <FormField label="Posts to display" htmlFor="postsPerPage"><Input id="postsPerPage" name="postsPerPage" type="number" min={3} max={20} defaultValue={values.postsPerPage} /></FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Language" htmlFor="language">
              <Select id="language" name="language" defaultValue={values.language}>
                <option value="en">English</option>
                <option value="fr">Français</option>
              </Select>
            </FormField>
            <FormField label="Post feed layout" htmlFor="feedLayout">
              <Select id="feedLayout" name="feedLayout" defaultValue={values.feedLayout}>
                <option value="short">Compact feed</option>
                <option value="card">Cards</option>
                <option value="classic">Classic list</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Contact email" htmlFor="contactEmail"><Input id="contactEmail" name="contactEmail" type="email" defaultValue={values.contactEmail} /></FormField>
        </div>
      ) : null}

      {section === "newsletter" ? (
        <div className="card">
          <h2 className="section-title">Newsletter section</h2>
          <div className="mt-5 flex items-center justify-between gap-4 border-b border-[#f1f1f1] pb-5">
            <div>
              <strong className="text-[15px]">Show newsletter</strong>
              <p className="mt-1 text-[13px] text-[#a1a1a1]">Shows the subscription form in the visitor feed.</p>
            </div>
            <Switch label="Show newsletter" checked={values.newsletterEnabled} onCheckedChange={(value) => setField("newsletterEnabled", value)} />
          </div>
          <div className="mt-5 space-y-5">
            <FormField label="Newsletter title" htmlFor="newsletterTitle"><Input id="newsletterTitle" name="newsletterTitle" disabled={!values.newsletterEnabled} defaultValue={values.newsletterTitle} /></FormField>
            <FormField label="Newsletter description" htmlFor="newsletterDescription"><Textarea id="newsletterDescription" name="newsletterDescription" disabled={!values.newsletterEnabled} defaultValue={values.newsletterDescription} /></FormField>
          </div>
        </div>
      ) : null}

      {section === "visibility" ? (
        <div className="card">
          <h2 className="section-title">Visibility</h2>
          <div className="mt-5 divide-y divide-[#f1f1f1]">
            <div className="flex items-center justify-between gap-4 pb-4">
              <div>
                <strong className="text-[15px]">Show subscriber count</strong>
                <p className="mt-1 text-[13px] text-[#a1a1a1]">Shows the active subscriber count below the main heading.</p>
              </div>
              <Switch label="Show subscriber count" checked={values.showSubscriberCount} onCheckedChange={(value) => setField("showSubscriberCount", value)} />
            </div>
            <div className="flex items-center justify-between gap-4 pt-4">
              <div>
                <strong className="text-[15px]">Maintenance mode</strong>
                <p className="mt-1 text-[13px] text-[#a1a1a1]">When on, visitors see a maintenance page. The admin panel stays reachable.</p>
              </div>
              <Switch label="Maintenance mode" checked={values.maintenanceMode} onCheckedChange={(value) => setField("maintenanceMode", value)} />
            </div>
          </div>
        </div>
      ) : null}

      {section === "modules" ? (
        <div className="card">
          <h2 className="section-title">Panel modules</h2>
          <p className="mt-2 text-sm leading-6 text-[#a1a1a1]">Disabled modules are removed from the menu.</p>
          <div className="mt-5 divide-y divide-[#f1f1f1]">
            {[
              ["Posts", "Create and manage content", "modulePosts"],
              ["Newsletter", "Newsletter and subscriber management", "moduleNewsletter"],
              ["Ads", "Create and publish ads", "moduleAds"],
              ["Analytics", "Visitor statistics", "moduleAnalytics"],
            ].map(([title, description, name]) => (
              <div key={name} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div>
                  <strong className="text-[15px]">{title}</strong>
                  <p className="mt-1 text-[13px] text-[#a1a1a1]">{description}</p>
                </div>
                <Switch label={`Enable ${title} module`} checked={Boolean(values[name])} onCheckedChange={(value) => setField(name, value)} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {section === "profile" ? (
        <div className="card space-y-5">
          <h2 className="section-title">Profile</h2>
          <FormField label="Name" htmlFor="adminName"><Input id="adminName" name="adminName" defaultValue={values.adminName} /></FormField>
          <FormField label="Email" htmlFor="adminEmail"><Input id="adminEmail" name="adminEmail" type="email" defaultValue={values.adminEmail} /></FormField>
        </div>
      ) : null}

      {message ? <p aria-live="polite" className={`rounded-2xl p-4 text-sm ${message.success ? "bg-emerald-50 text-emerald-800" : "bg-[#fff1f0] text-[#b42318]"}`}>{message.message}</p> : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
      </div>
    </form>
  );
}
