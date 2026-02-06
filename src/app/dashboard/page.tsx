import { redirect } from "next/navigation";
import Link from "next/link";

import {
  createQrCode,
  disableQrCode,
  enableQrCode,
  signOut,
  updateQrCode,
} from "@/app/dashboard/actions";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { getUserAnalyticsSnapshot, listOwnedQrCodeOptions } from "@/lib/analytics/service";
import { getAuthenticatedProfile } from "@/lib/auth/user";
import { getServerEnv } from "@/lib/env/server";
import { listOwnedQrCodes, QrOwnershipError } from "@/lib/qr/service";
import { parseQrSearchTerm, parseQrStatusFilter } from "@/lib/qr/validation";

type DashboardPageProps = {
  searchParams: Promise<{
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

function buildReturnToPath(
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

function shortUrlForSlug(baseUrl: string, slug: string): string {
  return `${baseUrl.replace(/\/$/, "")}/r/${slug}`;
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    redirect("/login");
  }

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
  const returnTo = buildReturnToPath(search, status, resolvedAnalyticsFilters);
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
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Signed in as <span className="font-medium">{profile.email}</span>
          </p>
        </div>

        <form action={signOut}>
          <button
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </header>

      {params.notice ? (
        <p className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {params.notice}
        </p>
      ) : null}

      {params.error ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}

      <section className="mt-8 rounded-xl border border-zinc-200 p-6">
        <h2 className="text-xl font-medium text-zinc-900">Analytics</h2>

        <form className="mt-4 grid gap-3 md:grid-cols-5">
          <input name="q" type="hidden" value={search} />
          <input name="status" type="hidden" value={status} />

          <label className="text-sm text-zinc-700">
            From
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              defaultValue={resolvedAnalyticsFilters.fromInput}
              name="from"
              type="date"
            />
          </label>

          <label className="text-sm text-zinc-700">
            To
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              defaultValue={resolvedAnalyticsFilters.toInput}
              name="to"
              type="date"
            />
          </label>

          <label className="text-sm text-zinc-700 md:col-span-2">
            QR code
            <select
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
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

          <label className="text-sm text-zinc-700">
            Bot filter
            <select
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              defaultValue={resolvedAnalyticsFilters.excludeBots ? "1" : "0"}
              name="bots"
            >
              <option value="1">Exclude bots</option>
              <option value="0">Include bots</option>
            </select>
          </label>

          <div className="flex flex-wrap gap-2 md:col-span-5">
            <button
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
              type="submit"
            >
              Apply filters
            </button>
            <Link
              href={returnTo}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Refresh
            </Link>
            <Link
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
              href={analyticsExportHref}
              prefetch={false}
            >
              Export CSV
            </Link>
          </div>
        </form>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-lg border border-zinc-200 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Total scans</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">{analytics.kpis.totalScans}</p>
          </article>
          <article className="rounded-lg border border-zinc-200 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Unique scans</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">{analytics.kpis.uniqueScans}</p>
          </article>
          <article className="rounded-lg border border-zinc-200 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Active QR codes</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">{analytics.kpis.activeQrCodes}</p>
          </article>
          <article className="rounded-lg border border-zinc-200 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Scans (24h)</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">
              {analytics.kpis.scansLast24Hours}
            </p>
          </article>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-lg border border-zinc-200 p-3">
            <h3 className="text-sm font-semibold text-zinc-900">Daily scans</h3>
            <div className="mt-2 max-h-64 overflow-auto rounded border border-zinc-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-zinc-50 text-left text-zinc-600">
                  <tr>
                    <th className="px-3 py-2 font-medium">Day</th>
                    <th className="px-3 py-2 font-medium">Scans</th>
                  </tr>
                </thead>
                <tbody>
                  {[...analytics.dailySeries].reverse().map((point) => (
                    <tr key={point.day} className="border-t border-zinc-100">
                      <td className="px-3 py-2 text-zinc-700">{point.day}</td>
                      <td className="px-3 py-2 text-zinc-900">{point.scans}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-lg border border-zinc-200 p-3">
            <h3 className="text-sm font-semibold text-zinc-900">Top QR codes</h3>
            <div className="mt-2 max-h-64 overflow-auto rounded border border-zinc-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-zinc-50 text-left text-zinc-600">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Slug</th>
                    <th className="px-3 py-2 font-medium">Scans</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topQrCodes.length === 0 ? (
                    <tr>
                      <td className="px-3 py-2 text-zinc-600" colSpan={3}>
                        No scan data in selected range.
                      </td>
                    </tr>
                  ) : (
                    analytics.topQrCodes.map((row) => (
                      <tr key={row.qrCodeId} className="border-t border-zinc-100">
                        <td className="px-3 py-2 text-zinc-700">{row.name}</td>
                        <td className="px-3 py-2 text-zinc-700">{row.slug}</td>
                        <td className="px-3 py-2 text-zinc-900">{row.scans}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-zinc-200 p-6">
        <h2 className="text-xl font-medium text-zinc-900">Create QR code</h2>
        <form action={createQrCode} className="mt-4 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="returnTo" value={returnTo} />

          <label className="text-sm text-zinc-700">
            Name
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              name="name"
              placeholder="Main landing page"
              required
              type="text"
            />
          </label>

          <label className="text-sm text-zinc-700">
            Slug
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              name="slug"
              placeholder="landing-page"
              required
              type="text"
            />
          </label>

          <label className="text-sm text-zinc-700 md:col-span-2">
            Destination URL
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              name="destinationUrl"
              placeholder="https://example.com/landing"
              required
              type="url"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input defaultChecked name="isActive" type="checkbox" value="true" />
            Active
          </label>

          <button
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            type="submit"
          >
            Create QR code
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-xl border border-zinc-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-medium text-zinc-900">My QR codes</h2>
          <p className="text-sm text-zinc-500">{qrCodes.length} total</p>
        </div>

        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
          <input name="from" type="hidden" value={resolvedAnalyticsFilters.fromInput} />
          <input name="to" type="hidden" value={resolvedAnalyticsFilters.toInput} />
          <input name="qr" type="hidden" value={resolvedAnalyticsFilters.qrCodeId ?? ""} />
          <input
            name="bots"
            type="hidden"
            value={resolvedAnalyticsFilters.excludeBots ? "1" : "0"}
          />

          <input
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            defaultValue={search}
            name="q"
            placeholder="Search by name, slug, or destination"
            type="search"
          />

          <select
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            defaultValue={status}
            name="status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>

          <button
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
            type="submit"
          >
            Apply filters
          </button>
        </form>

        {qrCodes.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-600">
            No QR codes yet. Create your first one above.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {qrCodes.map((qrCode) => {
              const shortUrl = shortUrlForSlug(env.SHORT_LINK_BASE_URL, qrCode.slug);
              const downloadHref = `/api/qr/${encodeURIComponent(qrCode.slug)}?download=1`;

              return (
                <article key={qrCode.id} className="rounded-xl border border-zinc-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-medium text-zinc-900">{qrCode.name}</h3>
                      <p className="text-sm text-zinc-600">
                        Slug: <code className="rounded bg-zinc-100 px-1 py-0.5">{qrCode.slug}</code>
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        qrCode.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-zinc-200 text-zinc-700"
                      }`}
                    >
                      {qrCode.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-zinc-600">
                    <p>
                      Dynamic URL:{" "}
                      <Link className="underline" href={shortUrl} target="_blank">
                        {shortUrl}
                      </Link>
                    </p>
                    <p>
                      Destination:{" "}
                      <Link className="underline" href={qrCode.destinationUrl} target="_blank">
                        {qrCode.destinationUrl}
                      </Link>
                    </p>
                    <p>Created: {formatDate(qrCode.createdAt)}</p>
                  </div>

                  <div className="mt-3">
                    <Link
                      className="text-sm font-medium text-zinc-900 underline"
                      href={downloadHref}
                      prefetch={false}
                    >
                      Download QR PNG
                    </Link>
                  </div>

                  <form action={updateQrCode} className="mt-4 grid gap-3 md:grid-cols-2">
                    <input name="qrCodeId" type="hidden" value={qrCode.id} />
                    <input name="returnTo" type="hidden" value={returnTo} />

                    <label className="text-sm text-zinc-700">
                      Name
                      <input
                        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                        defaultValue={qrCode.name}
                        name="name"
                        required
                        type="text"
                      />
                    </label>

                    <label className="text-sm text-zinc-700">
                      Slug
                      <input
                        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                        defaultValue={qrCode.slug}
                        name="slug"
                        required
                        type="text"
                      />
                    </label>

                    <label className="text-sm text-zinc-700 md:col-span-2">
                      Destination URL
                      <input
                        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                        defaultValue={qrCode.destinationUrl}
                        name="destinationUrl"
                        required
                        type="url"
                      />
                    </label>

                    <label className="flex items-center gap-2 text-sm text-zinc-700">
                      <input
                        defaultChecked={qrCode.isActive}
                        name="isActive"
                        type="checkbox"
                        value="true"
                      />
                      Active
                    </label>

                    <button
                      className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
                      type="submit"
                    >
                      Save changes
                    </button>
                  </form>

                  <div className="mt-3 flex gap-3">
                    {qrCode.isActive ? (
                      <form action={disableQrCode}>
                        <input name="qrCodeId" type="hidden" value={qrCode.id} />
                        <input name="returnTo" type="hidden" value={returnTo} />
                        <button
                          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
                          type="submit"
                        >
                          Disable
                        </button>
                      </form>
                    ) : (
                      <form action={enableQrCode}>
                        <input name="qrCodeId" type="hidden" value={qrCode.id} />
                        <input name="returnTo" type="hidden" value={returnTo} />
                        <button
                          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
                          type="submit"
                        >
                          Enable
                        </button>
                      </form>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
