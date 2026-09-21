"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { logoutAdminAction } from "../actions";
import { useLanguage } from "../../components/language-provider";

export function LogoutButton({ className }) {
  const { language } = useLanguage();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await logoutAdminAction();
      // Girişteki gibi tam sayfa geçişi: istemci önbelleğinde kalan panel
      // sayfaları oturum kapandıktan sonra geri tuşuyla gösterilmesin.
      window.location.replace("/admin/login");
    } catch {
      // Çerez silinemediyse giriş sayfasına gitmek yanıltıcı olur; burada kal.
      setPending(false);
    }
  }

  return (
    <button type="button" onClick={logout} disabled={pending} className={className}>
      <span>{pending ? "…" : language === "fr" ? "Se déconnecter" : "Sign out"}</span>
      <LogOut size={16} aria-hidden="true" />
    </button>
  );
}
