"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ImageOff, Images, Upload, X } from "lucide-react";
import { listNewsImagesAction, uploadNewsImageAction } from "../actions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { IMAGE_QUALITY } from "../../../lib/images";

// lib/news-images.js ile aynı sınır; büyük dosya sunucuya gitmeden reddedilir.
const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";
// Kapak görseli detay sayfasında 1920 pikseli bulabiliyor; next/image
// görseli büyütmediği için bunun altındaki dosyalar esnetilip bulanıklaşıyor.
const MIN_COVER_WIDTH = 1200;

function formatSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function ImagePickerField({ id, name, defaultValue = "", placeholder = "/images/news/…", maxLength }) {
  const [value, setValue] = useState(defaultValue);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const fileRef = useRef(null);
  const closeLibrary = useCallback(() => setLibraryOpen(false), []);

  function choose(url) {
    setValue(url);
    setPreviewFailed(false);
    setWidth(0);
  }

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setStatus({ error: true, text: "The image must be 8 MB or smaller." });
      return;
    }

    const data = new FormData();
    data.set("file", file);
    setUploading(true);
    setStatus(null);
    try {
      const result = await uploadNewsImageAction(data);
      if (!result?.success) {
        setStatus({ error: true, text: result?.message || "Upload failed." });
        return;
      }
      choose(result.url);
      setStatus({ error: false, text: result.message });
    } catch {
      // Nginx'in 413'ü veya Server Action gövde sınırı buraya düşer.
      setStatus({ error: true, text: "Upload failed. The file may be too large for the server." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <Input id={id} name={name} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(event) => choose(event.target.value)} />
      {value && !previewFailed ? (
        <img
          // Görsel React bağlanmadan önce yüklenmiş olabilir; o durumda onLoad
          // hiç çalışmıyor, genişliği ref üzerinden okuyoruz.
          ref={(node) => {
            if (node?.complete && node.naturalWidth) setWidth(node.naturalWidth);
          }}
          src={value}
          alt=""
          onError={() => setPreviewFailed(true)}
          onLoad={(event) => setWidth(event.currentTarget.naturalWidth)}
          className="mt-3 aspect-[16/9] w-full rounded-2xl bg-[#f5f5f5] object-cover"
        />
      ) : null}
      {/* Önizlemenin gerçek genişliği: yüklenen, kütüphaneden seçilen ve elle
          yazılan adreslerin hepsi buradan geçiyor. */}
      {width > 0 && width < MIN_COVER_WIDTH ? (
        <p key={width} role="status" className="mt-2 text-[13px] text-[#b54708]">
          {`Low resolution: ${width} px wide. Cover images should be at least ${MIN_COVER_WIDTH} px.`}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="gap-1.5" disabled={uploading} onClick={() => fileRef.current?.click()}>
          <Upload size={15} />
          {/* key: metin değişince düğüm yeniden eklensin, panel çevirisi onu da yakalasın. */}
          <span key={uploading ? "uploading" : "idle"}>{uploading ? "Uploading…" : "Upload image"}</span>
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setLibraryOpen(true)}>
          <Images size={15} />
          <span>Choose from library</span>
        </Button>
        <input ref={fileRef} type="file" accept={ACCEPT} hidden onChange={upload} />
      </div>
      {status ? (
        <p key={status.text} role={status.error ? "alert" : "status"} className={`mt-2 text-[13px] ${status.error ? "text-[#b42318]" : "text-[#067647]"}`}>
          {status.text}
        </p>
      ) : null}
      {libraryOpen ? (
        <ImageLibrary
          selected={value}
          onClose={closeLibrary}
          onSelect={(url) => {
            choose(url);
            setStatus(null);
            setLibraryOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function ImageLibrary({ selected, onSelect, onClose }) {
  const titleId = useId();
  const closeButtonRef = useRef(null);
  const [images, setImages] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listNewsImagesAction()
      .then((result) => {
        if (cancelled) return;
        if (result?.success) setImages(result.images);
        else setError(result?.message || "Images could not be loaded.");
      })
      .catch(() => {
        if (!cancelled) setError("Images could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    // Yakalama aşamasında dinleniyor: kütüphane reklam düzenleme penceresinin
    // içinden açıldıysa Escape yalnızca kütüphaneyi kapatsın.
    function onKeyDown(event) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  // .admin-root içine: panel çevirisi (admin-translations.js) yalnızca orayı izliyor.
  const container = document.querySelector(".admin-root") || document.body;

  return createPortal(
    <div className="fixed inset-0 z-[110] grid place-items-center bg-black/35 px-4 py-8 backdrop-blur-[2px]" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-full w-full max-w-[760px] flex-col rounded-[28px] bg-white p-6 shadow-[0_28px_90px_rgba(0,0,0,.22)] sm:p-7"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2 id={titleId} className="text-[26px] font-bold leading-tight tracking-[-.04em]">Image library</h2>
            <p className="mt-1 text-sm text-[#999]">public/images/news</p>
          </div>
          <button ref={closeButtonRef} type="button" aria-label="Close library" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-full text-[#777] hover:bg-[#f5f5f5] hover:text-black">
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 min-h-0 overflow-y-auto">
          {error ? (
            <p role="alert" className="rounded-2xl bg-[#fff1f0] p-3 text-sm font-medium text-[#b42318]">{error}</p>
          ) : !images ? (
            <p className="py-10 text-center text-sm text-[#999]">Loading images…</p>
          ) : !images.length ? (
            <div className="grid place-items-center gap-2 py-10 text-sm text-[#999]">
              <ImageOff size={22} />
              <span>No images yet</span>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {images.map((image) => {
                const active = image.url === selected;
                return (
                  <li key={image.name}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => onSelect(image.url)}
                      className={`relative block w-full overflow-hidden rounded-2xl border-2 text-left transition-colors ${active ? "border-black" : "border-transparent hover:border-[#dedede]"}`}
                    >
                      <span className="relative block aspect-[4/3] bg-[#f5f5f5]">
                        <Image src={image.url} alt="" fill quality={IMAGE_QUALITY} sizes="(max-width: 640px) 45vw, 180px" className="object-cover" />
                      </span>
                      <span className="block truncate px-2 pt-1.5 text-xs font-medium">{image.name}</span>
                      <span className="block px-2 pb-1.5 text-[11px] text-[#999]">{formatSize(image.size)}</span>
                      {active ? (
                        <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-black text-white">
                          <Check size={14} />
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>,
    container,
  );
}
