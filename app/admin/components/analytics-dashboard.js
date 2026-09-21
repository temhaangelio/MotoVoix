import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { Card } from "./ui/card";
import { cn } from "../../../lib/cn";

const number = new Intl.NumberFormat("tr-TR");

function changeLabel(value) {
  if (value === null || value === undefined) return "no data for previous period";
  const sign = value > 0 ? "+" : "";
  return `${sign}${Math.abs(value) < 0.05 ? "0" : value.toFixed(1)}% vs previous period`;
}

function dayLabel(value, days) {
  return new Intl.DateTimeFormat("en-US", days === 7 ? { weekday: "short" } : { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00Z`));
}

export function AnalyticsDashboard({ analytics, range }) {
  const ranges = [7, 30];
  const maxViews = Math.max(...analytics.daily.map((day) => day.pageviews), 1);
  const yMax = Math.ceil(maxViews / 10) * 10;
  const yTicks = [yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0];
  const pagePerVisitor = analytics.visitors ? analytics.pageviews / analytics.visitors : 0;
  const dailyAverage = analytics.pageviews / range;

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-[15px] font-medium text-[#a1a1a1]">Last {range} days · live site traffic</p>
        <div className="flex gap-2">
          {ranges.map((days) => (
            <Link key={days} href={days === 30 ? "/admin/analytics" : `/admin/analytics?aralik=${days}`} className={buttonVariants({ variant: days === range ? "primary" : "outline", size: "sm" })}>
              {days} days
            </Link>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {[
          ["Views", number.format(analytics.pageviews), changeLabel(analytics.pageviewsChange)],
          ["Unique readers", number.format(analytics.visitors), changeLabel(analytics.visitorsChange)],
          ["Per visitor", pagePerVisitor.toFixed(1), "page views"],
          ["Daily average", number.format(Math.round(dailyAverage)), "views"],
        ].map(([label, value, note]) => (
          <Card key={label} className="flex h-[132px] flex-col justify-between">
            <strong>{label}</strong>
            <div>
              <span className="text-[40px] font-bold leading-none tracking-[-.05em]">{value}</span>
              <small className="ml-2 text-[#a1a1a1]">{note}</small>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <div className="flex justify-between">
            <h2 className="section-title">Daily views</h2>
            <span className="text-[#a1a1a1]">Last {range} days</span>
          </div>
          <div className="mt-8 flex h-[270px] gap-3">
            <div className="flex w-10 shrink-0 flex-col justify-between pb-7 text-right text-xs font-medium tabular-nums text-[#a1a1a1]">
              {yTicks.map((tick) => <span key={tick}>{number.format(tick)}</span>)}
            </div>
            <div className="min-w-0 flex-1 overflow-x-auto pb-1">
              <div className="relative flex h-full min-w-[620px] items-end gap-1.5 border-b border-[#dedede]">
                {analytics.daily.map((day, index) => {
                  const height = day.pageviews === 0 ? 2 : Math.max((day.pageviews / yMax) * 100, 4);
                  const showLabel = range === 7 || index % 5 === 0 || index === analytics.daily.length - 1;
                  return (
                    <div key={day.date} className="group relative z-[1] flex h-[calc(100%-28px)] min-w-0 flex-1 items-end" title={`${dayLabel(day.date, range)}: ${number.format(day.pageviews)}`}>
                      <span className="relative w-full rounded-t bg-black" style={{ height: `${height}%` }}>
                        <span className={cn("absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold tabular-nums", !showLabel && "sr-only")}>{number.format(day.pageviews)}</span>
                      </span>
                      <span className={cn("absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-[#a1a1a1]", !showLabel && "sr-only")}>{dayLabel(day.date, range)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
        <Card className="xl:col-span-4">
          <h2 className="section-title">Traffic sources</h2>
          <div className="mt-7 space-y-5">
            {analytics.sources.map((source) => (
              <div key={source.label}>
                <div className="mb-2 flex justify-between gap-3 text-sm font-semibold">
                  <span>{source.label}</span>
                  <span>%{Math.round(source.percentage)}</span>
                </div>
                <div className="h-2 rounded-full bg-[#ececec]">
                  <div className="h-full rounded-full bg-black" style={{ width: `${Math.max(source.percentage, 1)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="xl:col-span-6">
          <h2 className="section-title">Most visited</h2>
          <div className="mt-5 divide-y divide-[#f1f1f1]">
            {analytics.topPages.map((page, index) => (
              <div key={page.path} className="grid grid-cols-[36px_minmax(0,1fr)_80px_90px] gap-3 py-3">
                <span className="font-semibold text-[#a1a1a1]">{String(index + 1).padStart(2, "0")}</span>
                <strong className="truncate">{page.path}</strong>
                <span className="text-right text-[#a1a1a1]">{number.format(page.visitors)} readers</span>
                <span className="text-right font-semibold">{number.format(page.pageviews)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="xl:col-span-3">
          <h2 className="section-title">Audience breakdown</h2>
          <div className="mt-7 space-y-5">
            {analytics.countries.map((country) => (
              <div key={country.code} className="flex items-center justify-between">
                <span className="font-semibold">{country.label}</span>
                <span className="text-[#a1a1a1]">%{Math.round(country.percentage)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="xl:col-span-3">
          <h2 className="section-title">Device breakdown</h2>
          <div className="mt-7 space-y-5">
            {analytics.devices?.map((device) => (
              <div key={device.code}>
                <div className="mb-2 flex justify-between gap-3 text-sm font-semibold">
                  <span>{device.label}</span>
                  <span>%{Math.round(device.percentage)}</span>
                </div>
                <div className="h-2 rounded-full bg-[#ececec]">
                  <div className="h-full rounded-full bg-black" style={{ width: `${Math.max(device.percentage, 1)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
