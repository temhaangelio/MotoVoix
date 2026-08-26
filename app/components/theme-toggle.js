"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "motovoix-theme";

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const initialTheme = saved === "light" ? "light" : "dark";
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  function handleToggle() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  return (
    <button
      aria-label="Toggle color theme"
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/30 text-zinc-300 hover:text-primary hover:border-primary transition-colors duration-300"
      onClick={handleToggle}
      type="button"
    >
      {!mounted ? (
        <Moon aria-hidden size={16} strokeWidth={2} />
      ) : theme === "dark" ? (
        <Sun aria-hidden size={16} strokeWidth={2} />
      ) : (
        <Moon aria-hidden size={16} strokeWidth={2} />
      )}
    </button>
  );
}
