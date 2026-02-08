import type { AnalyticsSummary } from "@/lib/analytics/service";

type KpiCardsProps = {
  kpis: AnalyticsSummary["kpis"];
};

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <article className="rounded-xl border border-border-card bg-surface-card p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Total scans</p>
        <p className="mt-2 text-3xl font-bold text-text-heading">{kpis.totalScans}</p>
      </article>
      <article className="rounded-xl border border-border-card bg-surface-card p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Unique scans</p>
        <p className="mt-2 text-3xl font-bold text-text-heading">{kpis.uniqueScans}</p>
      </article>
      <article className="rounded-xl border border-border-card bg-surface-card p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Active QR codes</p>
        <p className="mt-2 text-3xl font-bold text-text-heading">{kpis.activeQrCodes}</p>
      </article>
      <article className="rounded-xl border border-border-card bg-surface-card p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Scans (24h)</p>
        <p className="mt-2 text-3xl font-bold text-text-heading">
          {kpis.scansLast24Hours}
        </p>
      </article>
    </div>
  );
}
