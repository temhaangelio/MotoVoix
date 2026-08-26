"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

const formats = [
  { id: "square", label: "Kare gönderi", width: 1080, height: 1080, ratio: "1:1" },
  { id: "portrait", label: "Dikey gönderi", width: 1080, height: 1350, ratio: "4:5" },
  { id: "landscape", label: "Yatay gönderi", width: 1080, height: 566, ratio: "1.91:1" },
  { id: "story", label: "Hikâye", width: 1080, height: 1920, ratio: "9:16" },
  { id: "reels", label: "Reels", width: 1080, height: 1920, ratio: "9:16" },
  { id: "reels-cover", label: "Reels kapak görseli", width: 1080, height: 1920, ratio: "9:16" },
  { id: "profile", label: "Profil fotoğrafı", width: 320, height: 320, ratio: "1:1" },
  { id: "carousel", label: "Karusel gönderisi", width: 1080, height: 1350, ratio: "4:5" },
];

const themes = {
  light: { label: "Açık", background: "#f2f2f0", foreground: "#101010", muted: "#6f6f6b" },
  dark: { label: "Koyu", background: "#111111", foreground: "#ffffff", muted: "#a8a8a8" },
  warm: { label: "Sıcak", background: "#e7dfd1", foreground: "#201d18", muted: "#766e62" },
};

const DEFAULT_TITLE_SIZE = 76;
const DEFAULT_BODY_SIZE = 46;
const DEFAULT_EDGE_PADDING = 72;
const DEFAULT_BOTTOM_PADDING = 72;

const fonts = {
  modern: { label: "Modern", family: "Arial, Helvetica, sans-serif" },
  editorial: { label: "Editoryal", family: "Georgia, 'Times New Roman', serif" },
  clean: { label: "Temiz", family: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  rounded: { label: "Yuvarlak", family: "ui-rounded, 'SF Pro Rounded', Arial, sans-serif" },
  mono: { label: "Mono", family: "'SFMono-Regular', Menlo, Consolas, monospace" },
};

function cleanMarkdown(value) {
  return String(value || "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`=>~]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitParagraphs(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return [];
  let parts = normalized.split(/\n{2,}/).map((item) => item.replace(/\n/g, " ").trim()).filter(Boolean);
  if (parts.length === 1) {
    parts = parts[0].split(/\n/).map((item) => item.trim()).filter(Boolean);
  }
  return parts;
}

function flattenParagraphGroups(groups) {
  const lines = [];
  groups.forEach((group, index) => {
    if (index) lines.push("");
    lines.push(...group);
  });
  return lines;
}

function contentLineCount(groups) {
  if (!groups.length) return 0;
  return groups.reduce((sum, group) => sum + group.length, 0) + Math.max(0, groups.length - 1);
}

function embeddedImage(value) {
  return value.match(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)[^)]*\)/)?.[1] ?? null;
}

function wrapLines(context, text, maxWidth) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || context.measureText(candidate).width <= maxWidth) line = candidate;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawLines(context, lines, x, y, lineHeight) {
  lines.forEach((item, index) => context.fillText(item, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function loadCanvasImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function fileBase(title, formatId) {
  return `${title.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi, "-").replace(/^-|-$/g, "").slice(0, 70) || "haber"}-${formatId}`;
}

function downloadDataUrl(href, name) {
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  link.click();
}

function getMetrics(format, padding, fontId, hasImage, titleSize, bodySize) {
  const logicalHeight = format.height / (format.width / 1080);
  const padTop = padding.top;
  const padRight = padding.right;
  const padBottom = padding.bottom;
  const padLeft = padding.left;
  const textWidth = Math.max(120, 1080 - padLeft - padRight);
  const titleLine = Math.round(titleSize * 1.18);
  const bodyLine = Math.round(bodySize * 1.38);
  const imageHeight = hasImage ? Math.round(Math.min(logicalHeight * 0.42, 720)) : 0;
  const fontFamily = fonts[fontId].family;
  const canvas = typeof document === "undefined" ? null : document.createElement("canvas");
  const context = canvas?.getContext("2d");
  return { logicalHeight, padTop, padRight, padBottom, padLeft, textWidth, titleSize, bodySize, titleLine, bodyLine, imageHeight, fontFamily, context };
}

function paginateParagraphs(groups, firstMax, otherMax) {
  if (!groups.length) return [[]];
  const firstLimit = Math.max(firstMax, groups[0].length);
  const firstGroups = [groups[0]];
  let index = 1;
  while (index < groups.length && contentLineCount([...firstGroups, groups[index]]) <= firstLimit) {
    firstGroups.push(groups[index]);
    index += 1;
  }
  const pages = [flattenParagraphGroups(firstGroups)];
  let current = [];
  const chunk = Math.max(1, otherMax);

  function flush() {
    if (current.length) {
      pages.push(flattenParagraphGroups(current));
      current = [];
    }
  }

  while (index < groups.length) {
    const group = groups[index];
    if (current.length && contentLineCount([...current, group]) > chunk) flush();
    if (group.length > chunk && !current.length) {
      let rest = group;
      while (rest.length > chunk) {
        pages.push(rest.slice(0, chunk));
        rest = rest.slice(chunk);
      }
      if (rest.length) current = [rest];
      index += 1;
      continue;
    }
    current.push(group);
    index += 1;
  }
  flush();
  return pages;
}

export function PostImageGenerator({ title, body, imageUrl: savedImageUrl }) {
  const canvasRef = useRef(null);
  const defaultText = useMemo(() => cleanMarkdown(body), [body]);
  const defaultImage = useMemo(() => savedImageUrl || embeddedImage(body), [body, savedImageUrl]);
  const [text, setText] = useState(defaultText);
  const [theme, setTheme] = useState("light");
  const [fontId, setFontId] = useState("modern");
  const [formatId, setFormatId] = useState("portrait");
  const [padding, setPadding] = useState({
    top: DEFAULT_EDGE_PADDING,
    right: DEFAULT_EDGE_PADDING,
    bottom: DEFAULT_BOTTOM_PADDING,
    left: DEFAULT_EDGE_PADDING,
  });
  const [titleSize, setTitleSize] = useState(DEFAULT_TITLE_SIZE);
  const [bodySize, setBodySize] = useState(DEFAULT_BODY_SIZE);
  const [pageIndex, setPageIndex] = useState(0);
  const format = formats.find((item) => item.id === formatId) ?? formats[1];
  const imageUrl = defaultImage;

  function setEdgePadding(value) {
    const next = Math.min(220, Math.max(0, Number(value) || 0));
    setPadding((current) => ({ ...current, top: next, left: next, right: next }));
  }

  function setBottomPadding(value) {
    const next = Math.min(220, Math.max(0, Number(value) || 0));
    setPadding((current) => ({ ...current, bottom: next }));
  }

  const plan = useMemo(() => {
    const hasImage = Boolean(imageUrl);
    const metrics = getMetrics(format, padding, fontId, hasImage, titleSize, bodySize);
    if (!metrics.context) return { bodyPages: [[]], titleLines: [], metrics, hasImage };
    metrics.context.font = `700 ${metrics.titleSize}px ${metrics.fontFamily}`;
    const titleLines = wrapLines(metrics.context, title, metrics.textWidth);
    metrics.context.font = `400 ${metrics.bodySize}px ${metrics.fontFamily}`;
    const paragraphGroups = splitParagraphs(text).map((paragraph) => wrapLines(metrics.context, paragraph, metrics.textWidth));
    const firstParagraph = paragraphGroups[0] || [];
    const titleBlock = (imageHeight) => imageHeight + metrics.padTop + metrics.titleSize + titleLines.length * metrics.titleLine;
    const firstNeeded = firstParagraph.length * metrics.bodyLine + 24;
    let imageHeight = metrics.imageHeight;
    const roomFor = (imageHeightValue) => metrics.logicalHeight - titleBlock(imageHeightValue) - metrics.padBottom - 32;
    if (firstNeeded > roomFor(imageHeight) && imageHeight) {
      imageHeight = Math.max(0, imageHeight - (firstNeeded - roomFor(imageHeight)));
    }
    metrics.imageHeight = imageHeight;
    const firstMax = Math.max(firstParagraph.length, Math.max(0, Math.floor(roomFor(imageHeight) / metrics.bodyLine)));
    const otherStart = metrics.padTop + metrics.bodySize;
    const otherMax = Math.max(1, Math.floor((metrics.logicalHeight - otherStart - metrics.padBottom - 36) / metrics.bodyLine));
    return { bodyPages: paginateParagraphs(paragraphGroups, firstMax, otherMax), titleLines, metrics, hasImage };
  }, [bodySize, fontId, format, imageUrl, padding, text, title, titleSize]);

  const pageCount = plan.bodyPages.length;

  useEffect(() => {
    setPageIndex((current) => Math.min(current, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  const paint = useCallback(async (target, index) => {
    const context = target?.getContext("2d");
    if (!target || !context) return;
    const { bodyPages, titleLines, metrics, hasImage } = plan;
    const colors = themes[theme];
    const pageLines = bodyPages[index] || [];
    const isFirst = index === 0;
    target.width = format.width;
    target.height = format.height;
    const scale = format.width / 1080;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, 1080, metrics.logicalHeight);
    context.fillStyle = colors.background;
    context.fillRect(0, 0, 1080, metrics.logicalHeight);

    let image = null;
    if (hasImage && isFirst && imageUrl) {
      try {
        image = await loadCanvasImage(imageUrl);
      } catch {
        /* Remote images without CORS fall back to text. */
      }
    }
    if (image) {
      const imageScale = Math.max(1080 / image.naturalWidth, metrics.imageHeight / image.naturalHeight);
      const drawnWidth = image.naturalWidth * imageScale;
      const drawnHeight = image.naturalHeight * imageScale;
      context.save();
      context.beginPath();
      context.rect(0, 0, 1080, metrics.imageHeight);
      context.clip();
      context.drawImage(image, (1080 - drawnWidth) / 2, (metrics.imageHeight - drawnHeight) / 2, drawnWidth, drawnHeight);
      context.restore();
    }

    context.textBaseline = "alphabetic";
    if (isFirst) {
      context.fillStyle = colors.foreground;
      context.font = `700 ${metrics.titleSize}px ${metrics.fontFamily}`;
      const titleStart = metrics.imageHeight + metrics.padTop + metrics.titleSize;
      const titleEnd = drawLines(context, titleLines, metrics.padLeft, titleStart, metrics.titleLine);
      context.fillStyle = colors.muted;
      context.font = `400 ${metrics.bodySize}px ${metrics.fontFamily}`;
      drawLines(context, pageLines, metrics.padLeft, titleEnd + 24, metrics.bodyLine);
    } else {
      context.fillStyle = colors.muted;
      context.font = `400 ${metrics.bodySize}px ${metrics.fontFamily}`;
      drawLines(context, pageLines, metrics.padLeft, metrics.padTop + metrics.bodySize, metrics.bodyLine);
    }

    context.fillStyle = colors.muted;
    context.font = `600 22px ${metrics.fontFamily}`;
    context.textAlign = "left";
    context.fillText("motovoix", metrics.padLeft, metrics.logicalHeight - Math.max(28, metrics.padBottom / 2));

    if (bodyPages.length > 1) {
      context.textAlign = "right";
      context.fillText(`${index + 1} / ${bodyPages.length}`, 1080 - metrics.padRight, metrics.logicalHeight - Math.max(28, metrics.padBottom / 2));
      context.textAlign = "left";
    }
  }, [format, imageUrl, plan, theme]);

  useEffect(() => {
    void paint(canvasRef.current, pageIndex);
  }, [paint, pageIndex]);

  function reset() {
    setText(defaultText);
    setTheme("light");
    setFontId("modern");
    setFormatId("portrait");
    setPadding({
      top: DEFAULT_EDGE_PADDING,
      right: DEFAULT_EDGE_PADDING,
      bottom: DEFAULT_BOTTOM_PADDING,
      left: DEFAULT_EDGE_PADDING,
    });
    setTitleSize(DEFAULT_TITLE_SIZE);
    setBodySize(DEFAULT_BODY_SIZE);
    setPageIndex(0);
  }

  async function downloadCurrent() {
    await paint(canvasRef.current, pageIndex);
    const suffix = pageCount > 1 ? `-${pageIndex + 1}` : "";
    downloadDataUrl(canvasRef.current?.toDataURL("image/png", 1) ?? "", `${fileBase(title, format.id)}${suffix}.png`);
  }

  async function downloadAll() {
    const scratch = document.createElement("canvas");
    for (let index = 0; index < pageCount; index += 1) {
      await paint(scratch, index);
      downloadDataUrl(scratch.toDataURL("image/png", 1), `${fileBase(title, format.id)}-${index + 1}.png`);
      await new Promise((resolve) => window.setTimeout(resolve, 250));
    }
    await paint(canvasRef.current, pageIndex);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(300px,.72fr)_minmax(0,1.28fr)]">
      <section className="card h-fit">
        <h2 className="text-xl font-bold tracking-[-.035em]">Kart ayarları</h2>
        <p className="mt-2 text-sm leading-6 text-[#777]">Uzun yazılar otomatik olarak birden fazla karta bölünür.</p>
        <label htmlFor="card-text" className="mt-6 block text-sm font-semibold">Kart metni</label>
        <textarea id="card-text" value={text} onChange={(event) => setText(event.target.value)} rows={8} className="mt-2 w-full resize-y rounded-[20px] border border-[#dedede] bg-white p-4 text-[15px] leading-6 outline-none transition focus:border-black" />
        <div className="mt-2 text-right text-xs text-[#999]">{text.length} karakter · {pageCount} görsel</div>
        <label htmlFor="card-format" className="mt-5 block text-sm font-semibold">Boyut</label>
        <select id="card-format" value={formatId} onChange={(event) => setFormatId(event.target.value)} className="mt-2 h-12 w-full rounded-full border border-[#dedede] bg-white px-4 text-[15px] font-semibold outline-none focus:border-black">
          {formats.map((item) => (
            <option key={item.id} value={item.id}>{item.label} · {item.width} × {item.height} · {item.ratio}</option>
          ))}
        </select>
        <label htmlFor="card-font" className="mt-5 block text-sm font-semibold">Yazı tipi</label>
        <select id="card-font" value={fontId} onChange={(event) => setFontId(event.target.value)} className="mt-2 h-12 w-full rounded-full border border-[#dedede] bg-white px-4 text-[15px] font-semibold outline-none focus:border-black">
          {Object.keys(fonts).map((value) => (
            <option key={value} value={value} style={{ fontFamily: fonts[value].family }}>{fonts[value].label}</option>
          ))}
        </select>
        <span className="mt-5 block text-sm font-semibold">Yazı boyutu</span>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#777]">
              Başlık
              <span className="tabular-nums text-[#111]">{titleSize}</span>
            </span>
            <input type="range" min="28" max="96" value={titleSize} onChange={(event) => setTitleSize(Number(event.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e8e8e8] accent-black" />
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#777]">
              Paragraf
              <span className="tabular-nums text-[#111]">{bodySize}</span>
            </span>
            <input type="range" min="18" max="56" value={bodySize} onChange={(event) => setBodySize(Number(event.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e8e8e8] accent-black" />
          </label>
        </div>
        <span className="mt-5 block text-sm font-semibold">İç boşluk</span>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#777]">
              Üst ve yanlar
              <span className="tabular-nums text-[#111]">{padding.top}</span>
            </span>
            <input type="range" min="0" max="220" value={padding.top} onChange={(event) => setEdgePadding(event.target.value)} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e8e8e8] accent-black" />
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#777]">
              Alt
              <span className="tabular-nums text-[#111]">{padding.bottom}</span>
            </span>
            <input type="range" min="0" max="220" value={padding.bottom} onChange={(event) => setBottomPadding(event.target.value)} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e8e8e8] accent-black" />
          </label>
        </div>
        <span className="mt-5 block text-sm font-semibold">Tema</span>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {Object.keys(themes).map((value) => (
            <button key={value} type="button" onClick={() => setTheme(value)} className={`h-11 rounded-full text-sm font-semibold transition ${theme === value ? "bg-black text-white" : "bg-[#f1f1f1] text-black hover:bg-[#e7e7e7]"}`}>
              {themes[value].label}
            </button>
          ))}
        </div>
        <Button type="button" variant="ghost" onClick={reset} className="mt-6 w-full">
          <RotateCcw className="mr-2 size-4" />Başlangıca dön
        </Button>
      </section>
      <section className="card">
        <div className="flex flex-col gap-4 border-b border-[#ececec] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-[-.035em]">Önizleme</h2>
            <p className="mt-1 text-sm text-[#999]">{format.width} × {format.height} px · {pageCount} görsel</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {pageCount > 1 ? (
              <Button type="button" variant="outline" onClick={downloadAll}>
                <Download className="mr-2 size-4" />Tümünü indir
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={downloadCurrent}>
              <Download className="mr-2 size-4" />PNG indir
            </Button>
          </div>
        </div>
        <div className="pt-5">
          {pageCount > 1 ? (
            <div className="mb-4 flex items-center justify-center gap-3">
              <Button type="button" variant="ghost" size="sm" disabled={pageIndex === 0} onClick={() => setPageIndex((value) => Math.max(0, value - 1))} aria-label="Önceki görsel">
                <ChevronLeft className="size-4" />
              </Button>
              <span className="min-w-16 text-center text-sm font-semibold tabular-nums">{pageIndex + 1} / {pageCount}</span>
              <Button type="button" variant="ghost" size="sm" disabled={pageIndex >= pageCount - 1} onClick={() => setPageIndex((value) => Math.min(pageCount - 1, value + 1))} aria-label="Sonraki görsel">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          ) : null}
          <div className="mx-auto max-h-[75vh] max-w-full overflow-hidden bg-[#e8e8e8]" style={{ aspectRatio: `${format.width} / ${format.height}` }}>
            <canvas ref={canvasRef} width={format.width} height={format.height} aria-label={`${format.label} önizlemesi ${pageIndex + 1}`} className="block size-full" />
          </div>
        </div>
      </section>
    </div>
  );
}
