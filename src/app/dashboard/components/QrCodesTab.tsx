import Link from "next/link";

import { createQrCode } from "@/app/dashboard/actions";
import { buildDashboardUrl } from "@/app/dashboard/url";
import { QrListItem } from "@/components/qr-list-item";
import type { QrCodeListItem } from "@/lib/qr/types";

type QrCodesTabProps = {
  qrCodes: QrCodeListItem[];
  totalCount: number;
  page: number;
  totalPages: number;
  returnTo: string;
  shortLinkBaseUrl: string;
  search: string;
  status: string;
  analyticsFilters: {
    fromInput: string;
    toInput: string;
    qrCodeId: string | null;
    excludeBots: boolean;
  };
};

export function QrCodesTab({
  qrCodes,
  totalCount,
  page,
  totalPages,
  returnTo,
  shortLinkBaseUrl,
  search,
  status,
  analyticsFilters,
}: QrCodesTabProps) {
  return (
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
          <p className="text-sm text-text-muted">{totalCount} total</p>
        </div>

        <form className="mt-3 grid gap-2 sm:grid-cols-[1fr_180px_auto]">
          <input name="tab" type="hidden" value="qr" />
          <input name="from" type="hidden" value={analyticsFilters.fromInput} />
          <input name="to" type="hidden" value={analyticsFilters.toInput} />
          <input name="qr" type="hidden" value={analyticsFilters.qrCodeId ?? ""} />
          <input
            name="bots"
            type="hidden"
            value={analyticsFilters.excludeBots ? "1" : "0"}
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
          <>
            <div className="mt-3 max-h-[28rem] overflow-auto rounded-lg border border-border-card">
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
                      shortLinkBaseUrl={shortLinkBaseUrl}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-text-muted">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link
                      href={buildDashboardUrl({
                        tab: "qr",
                        search,
                        status,
                        from: analyticsFilters.fromInput,
                        to: analyticsFilters.toInput,
                        qrCodeId: analyticsFilters.qrCodeId,
                        excludeBots: analyticsFilters.excludeBots,
                        page: page - 1,
                      })}
                      className="rounded-lg border border-border-card bg-surface-card px-3 py-1.5 text-xs font-medium text-text-heading transition-colors duration-200 hover:border-primary hover:text-primary"
                    >
                      ← Previous
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link
                      href={buildDashboardUrl({
                        tab: "qr",
                        search,
                        status,
                        from: analyticsFilters.fromInput,
                        to: analyticsFilters.toInput,
                        qrCodeId: analyticsFilters.qrCodeId,
                        excludeBots: analyticsFilters.excludeBots,
                        page: page + 1,
                      })}
                      className="rounded-lg border border-border-card bg-surface-card px-3 py-1.5 text-xs font-medium text-text-heading transition-colors duration-200 hover:border-primary hover:text-primary"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
