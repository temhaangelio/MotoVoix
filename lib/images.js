// next/image yeniden kodlarken kullandığı kalite. Varsayılan 75, haber
// fotoğraflarında gözle görülür bozulma yapıyordu.
//
// Buradaki değer next.config.mjs'deki images.qualities listesinde de
// bulunmalı: Next 16 listede olmayan bir değeri en yakınına çekiyor.
export const IMAGE_QUALITY = 90;
