// Her ziyaretçi sayfasının başında çağrılan ortak hazırlık:
//   1. Ayarları döndürür (bakım modu bayrağı dahil).
//   2. Bakım modu kapalıysa ziyareti yanıt sonrası kaydeder.
//
// Ayarları zaten önbellekten okuduğu için ek veritabanı maliyeti yok.

import { after } from "next/server";
import { getPublicSettings } from "./news.js";
import { collectRequestInfo, isBotUserAgent, recordPageview } from "./analytics.js";

// onVisit: yalnızca gerçek (bot olmayan) ziyaretçide, yanıt sonrası çalışır.
// Örn. haber detayında okunma sayacı.
export async function preparePublicPage(pathname, { onVisit } = {}) {
  const settings = await getPublicSettings();

  // Bakım modunda ziyareti saymıyoruz; çağıran sayfa içeriği yerine
  // MaintenanceNotice render ediyor (settings.maintenanceMode kontrolü).
  if (settings.maintenanceMode) return settings;

  // Başlıklar burada, render sırasında okunuyor; after içinde okunamıyor.
  const requestInfo = await collectRequestInfo();
  after(() => recordPageview(pathname, requestInfo));

  if (onVisit && requestInfo && !requestInfo.isSideRequest && !isBotUserAgent(requestInfo.userAgent)) {
    after(onVisit);
  }

  return settings;
}
