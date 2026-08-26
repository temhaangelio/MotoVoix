import fs from "node:fs/promises";

const databasePath = new URL("../data/local-db.json", import.meta.url);
const database = JSON.parse(await fs.readFile(databasePath, "utf8"));

function splitText(text, limit = 3200) {
  const blocks = String(text || "").split(/(\n\n+)/);
  const chunks = [];
  let current = "";
  for (const block of blocks) {
    if ((current + block).length <= limit) {
      current += block;
      continue;
    }
    if (current) chunks.push(current);
    if (block.length <= limit) {
      current = block;
      continue;
    }
    for (let index = 0; index < block.length; index += limit) chunks.push(block.slice(index, index + limit));
    current = "";
  }
  if (current) chunks.push(current);
  return chunks;
}

async function translateChunk(text, target) {
  if (!text.trim()) return text;
  const mobileUrl = new URL("https://translate.google.com/m");
  mobileUrl.searchParams.set("sl", "auto");
  mobileUrl.searchParams.set("tl", target);
  mobileUrl.searchParams.set("q", text);
  const mobileResponse = await fetch(mobileUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!mobileResponse.ok) throw new Error(`Translation failed (${mobileResponse.status})`);
  const html = await mobileResponse.text();
  const match = html.match(/<div class="result-container">([\s\S]*?)<\/div>/);
  if (!match) throw new Error("Translation result was not found");
  return match[1]
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function translate(text, target) {
  const chunks = splitText(text);
  const output = [];
  for (const chunk of chunks) {
    output.push(await translateChunk(chunk, target));
    await new Promise((resolve) => setTimeout(resolve, 900));
  }
  return output.join("");
}

for (let index = 0; index < database.posts.length; index += 1) {
  const post = database.posts[index];
  const sourceTitle = post.titleEn || post.title || "";
  const sourceExcerpt = post.excerptEn || post.excerpt || post.description || "";
  const sourceBody = post.bodyEn || post.body || "";

  if (post.titleEn && post.titleFr && post.bodyEn && post.bodyFr) {
    process.stdout.write(`Skipped ${index + 1}/${database.posts.length}: ${post.slug}\n`);
    continue;
  }

  post.titleEn = await translate(sourceTitle, "en");
  post.excerptEn = await translate(sourceExcerpt, "en");
  post.bodyEn = await translate(sourceBody, "en");
  post.titleFr = await translate(sourceTitle, "fr");
  post.excerptFr = await translate(sourceExcerpt, "fr");
  post.bodyFr = await translate(sourceBody, "fr");
  post.title = post.titleEn;
  post.excerpt = post.excerptEn;
  post.description = post.excerptEn;
  post.body = post.bodyEn;

  await fs.writeFile(databasePath, `${JSON.stringify(database, null, 2)}\n`);
  process.stdout.write(`Translated ${index + 1}/${database.posts.length}: ${post.slug}\n`);
}
