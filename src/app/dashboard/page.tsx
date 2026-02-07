import { redirect } from "next/navigation";
import Link from "next/link";

import { createQrCode, signOut } from "@/app/dashboard/actions";
import { QrListItem } from "@/components/qr-list-item";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { getUserAnalyticsSnapshot, listOwnedQrCodeOptions } from "@/lib/analytics/service";
import { getAuthenticatedProfile } from "@/lib/auth/user";
import { getServerEnv } from "@/lib/env/server";
import { listOwnedQrCodes, QrOwnershipError } from "@/lib/qr/service";
import { parseQrSearchTerm, parseQrStatusFilter } from "@/lib/qr/validation";

type DashboardPageProps = {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    status?: string;
    notice?: string;
    error?: string;
    from?: string;
    to?: string;
    qr?: string;
    bots?: string;
  }>;
};

function parseTab(tab: string | undefined): "analytics" | "qr" {
  if (tab === "qr") {
    return "qr";
  }
  return "analytics";
}

function buildReturnToPath(
  tab: "analytics" | "qr",
  search: string,
  status: string,
  analyticsFilters: {
    fromInput: string;
    toInput: string;
    qrCodeId: string | null;
    excludeBots: boolean;
  },
): string {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (search) {
    params.set("q", search);
  }
  if (status !== "all") {
    params.set("status", status);
  }
  params.set("from", analyticsFilters.fromInput);
  params.set("to", analyticsFilters.toInput);
  if (analyticsFilters.qrCodeId) {
    params.set("qr", analyticsFilters.qrCodeId);
  }
  params.set("bots", analyticsFilters.excludeBots ? "1" : "0");
  const query = params.toString();
  return query ? `/dashboard?${query}` : "/dashboard";
}

function buildTabHref(
  targetTab: "analytics" | "qr",
  currentParams: {
    search: string;
    status: string;
    analyticsFilters: {
      fromInput: string;
      toInput: string;
      qrCodeId: string | null;
      excludeBots: boolean;
    };
  },
): string {
  const params = new URLSearchParams();
  params.set("tab", targetTab);
  if (currentParams.search) {
    params.set("q", currentParams.search);
  }
  if (currentParams.status !== "all") {
    params.set("status", currentParams.status);
  }
  params.set("from", currentParams.analyticsFilters.fromInput);
  params.set("to", currentParams.analyticsFilters.toInput);
  if (currentParams.analyticsFilters.qrCodeId) {
    params.set("qr", currentParams.analyticsFilters.qrCodeId);
  }
  params.set("bots", currentParams.analyticsFilters.excludeBots ? "1" : "0");
  return `/dashboard?${params.toString()}`;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    redirect("/?auth=signin&next=/dashboard");
  }

  const activeTab = parseTab(params.tab);
  const search = parseQrSearchTerm(params.q ?? null);
  const status = parseQrStatusFilter(params.status ?? null);
  const analyticsFilters = parseAnalyticsFilters({
    from: params.from,
    to: params.to,
    qr: params.qr,
    bots: params.bots,
  });
  const [qrCodes, qrCodeOptions] = await Promise.all([
    listOwnedQrCodes(profile.id, {
      search,
      status,
    }),
    listOwnedQrCodeOptions(profile.id),
  ]);
  let resolvedAnalyticsFilters = analyticsFilters;
  let analytics;

  try {
    analytics = await getUserAnalyticsSnapshot(profile.id, analyticsFilters);
  } catch (error) {
    if (!(error instanceof QrOwnershipError)) {
      throw error;
    }

    resolvedAnalyticsFilters = {
      ...analyticsFilters,
      qrCodeId: null,
    };
    analytics = await getUserAnalyticsSnapshot(profile.id, resolvedAnalyticsFilters);
  }
  const returnTo = buildReturnToPath(activeTab, search, status, resolvedAnalyticsFilters);
  const env = getServerEnv();
  const analyticsExportParams = new URLSearchParams({
    from: resolvedAnalyticsFilters.fromInput,
    to: resolvedAnalyticsFilters.toInput,
    bots: resolvedAnalyticsFilters.excludeBots ? "1" : "0",
  });
  if (resolvedAnalyticsFilters.qrCodeId) {
    analyticsExportParams.set("qr", resolvedAnalyticsFilters.qrCodeId);
  }
  const analyticsExportHref = `/api/analytics/export?${analyticsExportParams.toString()}`;

  const tabParams = {
    search,
    status,
    analyticsFilters: resolvedAnalyticsFilters,
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col bg-background px-4 py-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Dashboard</h1>
          <p className="text-sm text-text-muted">
            Signed in as <span className="font-medium text-primary-light">{profile.email}</span>
          </p>
        </div>

        <form action={signOut}>
          <button
            className="rounded-lg border border-primary bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary hover:text-white"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </header>

      {params.notice ? (
        <p className="mt-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm text-primary-light">
          {params.notice}
        </p>
      ) : null}

      {params.error ? (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-400">
          {params.error}
        </p>
      ) : null}

      <nav className="mt-4 flex gap-1 border-b border-border-subtle">
        <Link
          href={buildTabHref("analytics", tabParams)}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            activeTab === "analytics"
              ? "border-b-2 border-text-heading text-text-heading"
              : "text-text-muted hover:text-text-heading"
          }`}
        >
          Analytics
        </Link>
        <Link
          href={buildTabHref("qr", tabParams)}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            activeTab === "qr"
              ? "border-b-2 border-text-heading text-text-heading"
              : "text-text-muted hover:text-text-heading"
          }`}
        >
          QR Codes
        </Link>
      </nav>

      {activeTab === "analytics" ? (
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
                defaultValue={resolvedAnalyticsFilters.fromInput}
                name="from"
                type="date"
              />
            </label>

            <label className="text-sm text-text-muted">
              To
              <input
                className="mt-1 w-full rounded-lg border border-border-card bg-surface-card px-3 py-2 text-sm text-text-heading"
                defaultValue={resolvedAnalyticsFilters.toInput}
                name="to"
                type="date"
              />
            </label>

            <label className="text-sm text-text-muted md:col-span-2">
              QR code
              <select
                className="mt-1 w-full rounded-lg border border-border-card bg-surface-card px-3 py-2 text-sm text-text-heading"
                defaultValue={resolvedAnalyticsFilters.qrCodeId ?? ""}
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
                defaultValue={resolvedAnalyticsFilters.excludeBots ? "1" : "0"}
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
                href={analyticsExportHref}
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

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-xl border border-border-card bg-surface-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Total scans</p>
              <p className="mt-2 text-3xl font-bold text-text-heading">{analytics.kpis.totalScans}</p>
            </article>
            <article className="rounded-xl border border-border-card bg-surface-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Unique scans</p>
              <p className="mt-2 text-3xl font-bold text-text-heading">{analytics.kpis.uniqueScans}</p>
            </article>
            <article className="rounded-xl border border-border-card bg-surface-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Active QR codes</p>
              <p className="mt-2 text-3xl font-bold text-text-heading">{analytics.kpis.activeQrCodes}</p>
            </article>
            <article className="rounded-xl border border-border-card bg-surface-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Scans (24h)</p>
              <p className="mt-2 text-3xl font-bold text-text-heading">
                {analytics.kpis.scansLast24Hours}
              </p>
            </article>
          </div>

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
      ) : (
        <>
          <section className="mt-4 rounded-xl border border-border-card bg-surface-elevated p-5">
            <h2 className="text-lg font-semibold text-text-heading">Create QR code</h2>
            <form action={createQrCode} className="mt-3 grid gap-2 md:grid-cols-2">
              <input type="hidden" name="returnTo" value={returnTo} />

              <label className="text-sm text-text-muted">
                Name
                <input
                  className="mt-1 w-full rounded-lg border border-border-card bg-surface-card px-3 py-2 text-sm text-text-heading placeholder-text-muted/50"
                  name="name"
                  placeholder="Main landing page"
                  required
                  type="text"
                />
              </label>

              <label className="text-sm text-text-muted">
                Slug
                <input
                  className="mt-1 w-full rounded-lg border border-border-card bg-surface-card px-3 py-2 text-sm text-text-heading placeholder-text-muted/50"
                  name="slug"
                  placeholder="landing-page"
                  required
                  type="text"
                />
              </label>

              <label className="text-sm text-text-muted md:col-span-2">
                Destination URL
                <input
                  className="mt-1 w-full rounded-lg border border-border-card bg-surface-card px-3 py-2 text-sm text-text-heading placeholder-text-muted/50"
                  name="destinationUrl"
                  placeholder="https://example.com/landing"
                  required
                  type="url"
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-text-heading">
                <input defaultChecked name="isActive" type="checkbox" value="true" className="accent-primary" />
                Active
              </label>

              <button
                className="rounded-lg bg-gradient-to-r from-primary to-accent-teal px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30"
                type="submit"
              >
                Create QR code
              </button>
            </form>
          </section>

          <section className="mt-4 rounded-xl border border-border-card bg-surface-elevated p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-text-heading">My QR codes</h2>
              <p className="text-sm text-text-muted">{qrCodes.length} total</p>
            </div>

            <form className="mt-3 grid gap-2 sm:grid-cols-[1fr_180px_auto]">
              <input name="tab" type="hidden" value="qr" />
              <input name="from" type="hidden" value={resolvedAnalyticsFilters.fromInput} />
              <input name="to" type="hidden" value={resolvedAnalyticsFilters.toInput} />
              <input name="qr" type="hidden" value={resolvedAnalyticsFilters.qrCodeId ?? ""} />
              <input
                name="bots"
                type="hidden"
                value={resolvedAnalyticsFilters.excludeBots ? "1" : "0"}
              />

              <input
                className="rounded-lg border border-border-card bg-surface-card px-3 py-2 text-sm text-text-heading placeholder-text-muted/50"
                defaultValue={search}
                name="q"
                placeholder="Search by name, slug, or destination"
                type="search"
              />

              <select
                className="rounded-lg border border-border-card bg-surface-card px-3 py-2 text-sm text-text-heading"
                defaultValue={status}
                name="status"
              >
                <option value="all">All statuses</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>

              <button
                className="rounded-lg border border-border-card bg-surface-card px-4 py-2 text-sm font-medium text-text-heading transition-colors duration-200 hover:border-primary hover:text-primary"
                type="submit"
              >
                Apply filters
              </button>
            </form>

            {qrCodes.length === 0 ? (
              <p className="mt-3 text-sm text-text-muted">
                No QR codes yet. Create your first one above.
              </p>
            ) : (
              <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-border-card">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-surface-card text-left">
                    <tr className="border-b border-border-subtle">
                      <th className="px-3 py-2 text-xs font-medium text-text-muted">Name</th>
                      <th className="px-3 py-2 text-xs font-medium text-text-muted">Slug</th>
                      <th className="px-3 py-2 text-xs font-medium text-text-muted">Created</th>
                      <th className="px-3 py-2 text-xs font-medium text-text-muted">Status</th>
                      <th className="px-3 py-2 text-xs font-medium text-text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qrCodes.map((qrCode) => (
                      <QrListItem
                        key={qrCode.id}
                        qrCode={qrCode}
                        returnTo={returnTo}
                        shortLinkBaseUrl={env.SHORT_LINK_BASE_URL}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
