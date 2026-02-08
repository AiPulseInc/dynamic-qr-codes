import { redirect } from "next/navigation";
import Link from "next/link";

import { signOut } from "@/app/dashboard/actions";
import { AnalyticsTab } from "@/app/dashboard/components/AnalyticsTab";
import { QrCodesTab } from "@/app/dashboard/components/QrCodesTab";
import { buildDashboardUrl } from "@/app/dashboard/url";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { getUserAnalyticsSnapshot, listOwnedQrCodeOptions } from "@/lib/analytics/service";
import { getAuthenticatedProfile } from "@/lib/auth/user";
import { getServerEnv } from "@/lib/env/server";
import { listOwnedQrCodes, QrOwnershipError } from "@/lib/qr/service";
import { parseQrPage, parseQrPageSize, parseQrSearchTerm, parseQrStatusFilter } from "@/lib/qr/validation";

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
    page?: string;
    pageSize?: string;
  }>;
};

function parseTab(tab: string | undefined): "analytics" | "qr" {
  if (tab === "qr") {
    return "qr";
  }
  return "analytics";
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
  const page = parseQrPage(params.page ?? null);
  const pageSize = parseQrPageSize(params.pageSize ?? null);
  const analyticsFilters = parseAnalyticsFilters({
    from: params.from,
    to: params.to,
    qr: params.qr,
    bots: params.bots,
  });
  const [qrResult, qrCodeOptions] = await Promise.all([
    listOwnedQrCodes(profile.id, {
      search,
      status,
      page,
      pageSize,
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
  const urlParams = {
    search,
    status,
    from: resolvedAnalyticsFilters.fromInput,
    to: resolvedAnalyticsFilters.toInput,
    qrCodeId: resolvedAnalyticsFilters.qrCodeId,
    excludeBots: resolvedAnalyticsFilters.excludeBots,
    page,
  };
  const returnTo = buildDashboardUrl({ tab: activeTab, ...urlParams });
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
          href={buildDashboardUrl({ tab: "analytics", ...urlParams })}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            activeTab === "analytics"
              ? "border-b-2 border-text-heading text-text-heading"
              : "text-text-muted hover:text-text-heading"
          }`}
        >
          Analytics
        </Link>
        <Link
          href={buildDashboardUrl({ tab: "qr", ...urlParams })}
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
        <AnalyticsTab
          analytics={analytics}
          filters={resolvedAnalyticsFilters}
          qrCodeOptions={qrCodeOptions}
          search={search}
          status={status}
          returnTo={returnTo}
          exportHref={analyticsExportHref}
        />
      ) : (
        <QrCodesTab
          qrCodes={qrResult.items}
          totalCount={qrResult.totalCount}
          page={qrResult.page}
          totalPages={qrResult.totalPages}
          returnTo={returnTo}
          shortLinkBaseUrl={env.SHORT_LINK_BASE_URL}
          search={search}
          status={status}
          analyticsFilters={resolvedAnalyticsFilters}
        />
      )}
    </main>
  );
}
