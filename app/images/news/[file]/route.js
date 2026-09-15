import { readNewsImage } from "../../../../lib/news-images";

// `next start`, public/ klasörünü yalnızca açılışta tarar. Panelden sonradan
// yüklenen görseller o listede olmadığından istek buraya düşer ve dosya diskten
// okunur (/_next/image de aynı yoldan geçer). PM2 yeniden başlayınca aynı
// dosyalar yine doğrudan public/'ten sunulur; bu handler devreye girmez.
export async function GET(_request, { params }) {
  const { file } = await params;
  const image = await readNewsImage(file);
  if (!image) return new Response("Not found", { status: 404 });

  return new Response(image.body, {
    headers: {
      "Content-Type": image.contentType,
      // public/ dosyalarıyla aynı başlık.
      "Cache-Control": "public, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
