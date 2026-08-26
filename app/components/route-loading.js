"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PageLoading } from "./page-loading";

function isInternalNavigation(anchor, pathname) {
  if (!anchor) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    return url.pathname !== pathname || url.search !== window.location.search;
  } catch {
    return false;
  }
}

export default function RouteLoading() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [adminOverlay, setAdminOverlay] = useState(false);

  useEffect(() => {
    function onClick(event) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const anchor = event.target.closest("a");
      if (!isInternalNavigation(anchor, pathname)) return;
      const href = anchor.getAttribute("href");
      try {
        setAdminOverlay(new URL(href, window.location.href).pathname.startsWith("/admin"));
      } catch {
        setAdminOverlay(false);
      }
      setVisible(true);
    }

    function onPopState() {
      setAdminOverlay(window.location.pathname.startsWith("/admin"));
      setVisible(true);
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [pathname]);

  useEffect(() => {
    if (!visible) return undefined;
    const timeout = window.setTimeout(() => setVisible(false), 400);
    return () => window.clearTimeout(timeout);
  }, [pathname, visible]);

  if (!visible) return null;

  return (
    <div className={`page-loading-overlay ${adminOverlay ? "page-loading-overlay-admin" : "page-loading-overlay-site"}`}>
      <PageLoading variant={adminOverlay ? "admin" : "site"} label={adminOverlay ? "" : "Yükleniyor"} />
    </div>
  );
}
