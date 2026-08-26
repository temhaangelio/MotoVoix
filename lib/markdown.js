export function parseFrontmatter(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return { data: {}, content: normalized };
  }

  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) {
    return { data: {}, content: normalized };
  }

  const frontmatterBlock = normalized.slice(4, end);
  const content = normalized.slice(end + 5).trim();
  const data = {};

  for (const line of frontmatterBlock.split("\n")) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let value = line.slice(sep + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  return { data, content };
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatInlineMarkdown(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, "<strong>$1$2</strong>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>")
    .replace(/==([^=]+)==/g, "<mark>$1</mark>")
    .replace(/_([^_\n]+)_|\*([^*\n]+)\*/g, "<em>$1$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let inList = false;

  const linkify = (text) => {
    const protectedAnchors = [];
    let withMarkdownLinks = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, url) => {
      const anchor = `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
      const token = `__ANCHOR_${protectedAnchors.length}__`;
      protectedAnchors.push(anchor);
      return token;
    });

    withMarkdownLinks = withMarkdownLinks.replace(
      /(^|[\s(])(https?:\/\/[^\s<)]+)/g,
      (_, prefix, url) => `${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`,
    );

    return withMarkdownLinks.replace(/__ANCHOR_(\d+)__/g, (_, index) => protectedAnchors[Number(index)] || "");
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      continue;
    }

    if (line.startsWith("- ")) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${linkify(formatInlineMarkdown(line.slice(2)))}</li>`);
      continue;
    }

    if (inList) {
      out.push("</ul>");
      inList = false;
    }

    if (line.startsWith("## ")) {
      out.push(`<h2>${linkify(formatInlineMarkdown(line.slice(3)))}</h2>`);
      continue;
    }

    if (line.startsWith("# ")) {
      out.push(`<h1>${linkify(formatInlineMarkdown(line.slice(2)))}</h1>`);
      continue;
    }

    if (line.startsWith("> ")) {
      out.push(`<blockquote>${linkify(formatInlineMarkdown(line.slice(2)))}</blockquote>`);
      continue;
    }

    out.push(`<p>${linkify(formatInlineMarkdown(line))}</p>`);
  }

  if (inList) out.push("</ul>");
  return out.join("\n");
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
