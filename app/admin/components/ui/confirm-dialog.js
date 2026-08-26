"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./button";
import { BrandMark } from "../../../components/brand-mark";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  error,
  variant = "primary",
  onConfirm,
  onOpenChange,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);
  const cancelRef = useRef(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape" && !pending) onOpenChange(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onOpenChange, pending]);

  if (!open) return null;

  async function confirm() {
    setPending(true);
    try {
      const shouldClose = await onConfirm();
      if (shouldClose !== false) onOpenChange(false);
    } finally {
      setPending(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/35 px-4 py-8 backdrop-blur-[2px]" onMouseDown={() => !pending && onOpenChange(false)}>
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-[440px] rounded-[28px] bg-white p-6 shadow-[0_28px_90px_rgba(0,0,0,.22)] sm:p-7"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5">
          <BrandMark className="!size-11 shrink-0 text-black" />
          <button type="button" disabled={pending} aria-label="Onay penceresini kapat" onClick={() => onOpenChange(false)} className="grid size-10 shrink-0 place-items-center rounded-full text-[#777] hover:bg-[#f5f5f5] hover:text-black disabled:opacity-50">
            <X size={18} />
          </button>
        </div>
        <h2 id={titleId} className="mt-5 text-[26px] font-bold leading-tight tracking-[-.04em]">{title}</h2>
        <p id={descriptionId} className="mt-2 text-[15px] font-medium leading-relaxed text-[#777]">{description}</p>
        {error ? <p role="alert" className="mt-4 rounded-2xl bg-[#fff1f0] p-3 text-sm font-medium text-[#b42318]">{error}</p> : null}
        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" disabled={pending} onClick={() => onOpenChange(false)}>{cancelLabel}</Button>
          <Button disabled={pending} onClick={confirm} className={variant === "destructive" ? "bg-[#b42318] text-white hover:bg-[#912018]" : undefined}>{pending ? "İşleniyor…" : confirmLabel}</Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
