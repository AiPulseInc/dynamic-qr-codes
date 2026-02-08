import Link from "next/link";

import { KpiCards } from "@/app/dashboard/components/KpiCards";
import type { AnalyticsSummary } from "@/lib/analytics/service";

type QrCodeOption = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

type AnalyticsTabProps = {
  analytics: AnalyticsSummary;
  filters: {
    fromInput: string;
    toInput: string;
    qrCodeId: string | null;
    excludeBots: boolean;
  };
  qrCodeOptions: QrCodeOption[];
  search: string;
  status: string;
  returnTo: string;
  exportHref: string;
};

export function AnalyticsTab({
  analytics,
  filters,
  qrCodeOptions,
  search,
  status,
  returnTo,
  exportHref,
}: AnalyticsTabProps) {
  return (
    <section className="mt-4 rounded-xl border border-border-card bg-surface-elevated p-5">
      <h2 className="text-lg font-semibold text-text-heading">Analytics</h2>

      <form className="mt-3 grid gap-2 md:grid-cols-5">
        <input name="tab" type="hidden" value="analytics" />
        <input name="q" type="hidden" value={search} />
        <input name="status" type="hidden" value={status} />

        <label className="text-sm text-text-muted">
          From
          <input
            className="mt-1 w-full rounded-lg border border-border-card bg-surface-card px-3 py-2 text-sm text-text-heading"
            defaultValue={filters.fromInput}
            name="from"
            type="date"
          />
        </label>

        <label className="text-sm text-text-muted">
          To
          <input
            className="mt-1 w-full rounded-lg border border-border-card bg-surface-card px-3 py-2 text-sm text-text-heading"
            defaultValue={filters.toInput}
            name="to"
            type="date"
          />
        </label>

        <label className="text-sm text-text-muted md:col-span-2">
          QR code
          <select
            className="mt-1 w-full rounded-lg border border-border-card bg-surface-card px-3 py-2 text-sm text-text-heading"
            defaultValue={filters.qrCodeId ?? ""}
            name="qr"
          >
            <option value="">All QR codes</option>
            {qrCodeOptions.map((qrOption) => (
              <option key={qrOption.id} value={qrOption.id}>
                {qrOption.name} ({qrOption.slug})
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-text-muted">
          Bot filter
          <select
            className="mt-1 w-full rounded-lg border border-border-card bg-surface-card px-3 py-2 text-sm text-text-heading"
            defaultValue={filters.excludeBots ? "1" : "0"}
            name="bots"
          >
            <option value="1">Exclude bots</option>
            <option value="0">Include bots</option>
          </select>
        </label>

        <div className="flex flex-wrap justify-end gap-2 md:col-span-5">
          <Link
            href={returnTo}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-light"
          >
            Refresh
          </Link>
          <Link
            className="rounded-lg border border-border-card bg-surface-card px-4 py-2 text-sm font-medium text-text-heading transition-colors duration-200 hover:border-primary hover:text-primary"
            href={exportHref}
            prefetch={false}
          >
            Export CSV
          </Link>
          <button
            className="rounded-lg border border-border-card bg-surface-card px-4 py-2 text-sm font-medium text-text-heading transition-colors duration-200 hover:border-primary hover:text-primary"
            type="submit"
          >
            Apply filters
          </button>
        </div>
      </form>

      <KpiCards kpis={analytics.kpis} />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-border-card bg-surface-card p-5">
          <h3 className="text-lg font-semibold text-text-heading">Daily scans</h3>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="pb-2 text-left text-xs font-medium text-text-muted">Day</th>
                <th className="pb-2 text-right text-xs font-medium text-text-muted">Scans</th>
              </tr>
            </thead>
            <tbody>
              {[...analytics.dailySeries].reverse().slice(0, 5).map((point) => (
                <tr key={point.day} className="border-b border-border-subtle/50 last:border-0">
                  <td className="py-2.5 text-text-heading">{point.day}</td>
                  <td className="py-2.5 text-right font-medium text-primary-light">{point.scans}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="rounded-xl border border-border-card bg-surface-card p-5">
          <h3 className="text-lg font-semibold text-text-heading">Top QR codes</h3>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="pb-2 text-left text-xs font-medium text-text-muted">Name</th>
                <th className="pb-2 text-left text-xs font-medium text-text-muted">Slug</th>
                <th className="pb-2 text-right text-xs font-medium text-text-muted">Scans</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topQrCodes.length === 0 ? (
                <tr>
                  <td className="py-2.5 text-text-muted" colSpan={3}>
                    No scan data in selected range.
                  </td>
                </tr>
              ) : (
                analytics.topQrCodes.map((row) => (
                  <tr key={row.qrCodeId} className="border-b border-border-subtle/50 last:border-0">
                    <td className="py-2.5 text-text-heading">{row.name}</td>
                    <td className="py-2.5 text-text-muted">{row.slug}</td>
                    <td className="py-2.5 text-right font-medium text-primary-light">{row.scans}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </article>
      </div>
    </section>
  );
}
