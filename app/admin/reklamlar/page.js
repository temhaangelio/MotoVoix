import { getAds } from "../../../lib/local-db";
import { AppShell } from "../components/app-shell";
import { PageHeader } from "../components/page-header";
import { AdsManager } from "../components/ads-manager";

export default function AdsPage() {
  const ads = getAds();
  const active = ads.filter((ad) => ad.active).length;
  return (
    <AppShell active="/admin/reklamlar">
      <PageHeader title="Ads" note={`${ads.length} ads · ${active} published`} />
      <AdsManager ads={ads} />
    </AppShell>
  );
}
