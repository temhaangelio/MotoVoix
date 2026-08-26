"use client";

import { useLayoutEffect } from "react";

export function AdminTheme() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.classList.add("admin-mode");
    return () => {
      root.classList.remove("admin-mode");
      if (!window.location.pathname.startsWith("/admin")) {
        root.classList.add("dark");
      }
    };
  }, []);

  return null;
}
