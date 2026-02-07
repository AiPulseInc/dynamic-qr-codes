"use client";

import { useState } from "react";

import { useLanguage } from "@/app/i18n/LanguageContext";
import type { Translations } from "@/app/i18n/translations";

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */

function IconCalendar({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconChevronDown({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconSearch({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconBarChart({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function IconQrCode({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="8" height="8" rx="1" />
      <rect x="14" y="2" width="8" height="8" rx="1" />
      <rect x="2" y="14" width="8" height="8" rx="1" />
      <path d="M14 14h2v2h-2zM20 14h2v2h-2zM14 20h2v2h-2zM20 20h2v2h-2zM17 17h2v2h-2z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const dailyScans = [
  { day: "Feb 3-7, 2026", scans: 29 },
  { day: "Feb 3-6, 2026", scans: 13 },
  { day: "Feb 3-5, 2026", scans: 2 },
  { day: "Feb 3-6, 2026", scans: 2 },
  { day: "Feb 3-7, 2026", scans: 2 },
];

const topQrCodes = [
  { name: "kod testowy nr 2", slug: "test4", scans: 29 },
  { name: "kod testowy nr 3", slug: "test2", scans: 10 },
  { name: "kod testowy nr 1", slug: "test1", scans: 1 },
];

const myQrCodes = [
  { name: "kod testowy nr 4", slug: "test4", created: "Feb 7, 2026", status: "Active" as const },
  { name: "kod testowy nr 1", slug: "test1", created: "Feb 7, 2026", status: "Inactive" as const },
  { name: "kod testowy nr 2", slug: "test2", created: "Feb 6, 2026", status: "Inactive" as const },
  { name: "kod testowy nr 3", slug: "test3", created: "Feb 6, 2026", status: "Active" as const },
];

/* ------------------------------------------------------------------ */
/*  Analytics Tab                                                      */
/* ------------------------------------------------------------------ */

function AnalyticsTab({ t }: { t: Translations }) {
  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="rounded-xl border border-border-card bg-surface-elevated p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* From */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">{t.dashboard.from}</label>
            <div className="flex items-center gap-2 rounded-lg border border-border-card bg-surface-card px-3 py-2">
              <span className="text-sm text-text-heading">08/01/2026</span>
              <IconCalendar className="ml-auto h-4 w-4 text-primary" />
            </div>
          </div>
          {/* To */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">{t.dashboard.to}</label>
            <div className="flex items-center gap-2 rounded-lg border border-border-card bg-surface-card px-3 py-2">
              <span className="text-sm text-text-heading">07/02/2026</span>
              <IconCalendar className="ml-auto h-4 w-4 text-primary" />
            </div>
          </div>
          {/* QR code */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">{t.dashboard.qrCode}</label>
            <div className="flex items-center gap-2 rounded-lg border border-border-card bg-surface-card px-3 py-2">
              <span className="text-sm text-text-heading">{t.dashboard.allQrCodes}</span>
              <IconChevronDown className="ml-auto h-4 w-4 text-text-muted" />
            </div>
          </div>
          {/* Bot filter */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">{t.dashboard.botFilter}</label>
            <div className="flex items-center gap-2 rounded-lg border border-border-card bg-surface-card px-3 py-2">
              <span className="text-sm text-text-heading">{t.dashboard.excludeBots}</span>
              <IconChevronDown className="ml-auto h-4 w-4 text-text-muted" />
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-light">
            {t.dashboard.refresh}
          </button>
          <div className="flex items-center gap-2">
            <button className="cursor-pointer rounded-lg border border-border-card bg-surface-card px-4 py-2 text-sm font-medium text-text-heading transition-colors duration-200 hover:border-primary hover:text-primary">
              {t.dashboard.exportCsv}
            </button>
            <button className="cursor-pointer rounded-lg border border-border-card bg-surface-card px-4 py-2 text-sm font-medium text-text-heading transition-colors duration-200 hover:border-primary hover:text-primary">
              {t.dashboard.applyFilters}
            </button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: t.dashboard.totalScans, value: "29" },
          { label: t.dashboard.uniqueScans, value: "2" },
          { label: t.dashboard.activeQrCodes, value: "2" },
          { label: t.dashboard.scans24h, value: "29" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border-card bg-surface-elevated p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">{kpi.label}</p>
            <p className="mt-2 text-3xl font-bold text-text-heading">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Daily scans + Top QR codes */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Daily scans table */}
        <div className="rounded-xl border border-border-card bg-surface-elevated p-5">
          <h3 className="mb-4 text-lg font-semibold text-text-heading">{t.dashboard.dailyScans}</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="pb-2 text-left text-xs font-medium text-text-muted">{t.dashboard.day}</th>
                <th className="pb-2 text-right text-xs font-medium text-text-muted">{t.dashboard.scans}</th>
              </tr>
            </thead>
            <tbody>
              {dailyScans.map((row, i) => (
                <tr key={i} className="border-b border-border-subtle/50 last:border-0">
                  <td className="py-2.5 text-sm text-text-heading">{row.day}</td>
                  <td className="py-2.5 text-right text-sm font-medium text-primary-light">{row.scans}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top QR codes table */}
        <div className="rounded-xl border border-border-card bg-surface-elevated p-5">
          <h3 className="mb-4 text-lg font-semibold text-text-heading">{t.dashboard.topQrCodes}</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="pb-2 text-left text-xs font-medium text-text-muted">{t.dashboard.name}</th>
                <th className="pb-2 text-left text-xs font-medium text-text-muted">{t.dashboard.slug}</th>
                <th className="pb-2 text-right text-xs font-medium text-text-muted">{t.dashboard.scans}</th>
              </tr>
            </thead>
            <tbody>
              {topQrCodes.map((row, i) => (
                <tr key={i} className="border-b border-border-subtle/50 last:border-0">
                  <td className="py-2.5 text-sm text-text-heading">{row.name}</td>
                  <td className="py-2.5 text-sm text-text-muted">{row.slug}</td>
                  <td className="py-2.5 text-right text-sm font-medium text-primary-light">{row.scans}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  QR Codes Tab                                                       */
/* ------------------------------------------------------------------ */

function QrCodesTab({ t }: { t: Translations }) {
  return (
    <div className="space-y-4">
      {/* Create QR Code card */}
      <div className="rounded-xl border border-border-card bg-surface-elevated p-5">
        <h3 className="mb-4 text-lg font-semibold text-text-heading">{t.dashboard.createQrCode}</h3>
        <div className="flex flex-col gap-5 sm:flex-row">
          {/* QR code preview */}
          <div className="flex shrink-0 items-center justify-center">
            <div className="rounded-xl border border-primary/30 bg-surface-card p-3">
              <div className="grid h-28 w-28 grid-cols-7 grid-rows-7 gap-0.5">
                {Array.from({ length: 49 }).map((_, i) => {
                  const row = Math.floor(i / 7);
                  const col = i % 7;
                  const isCorner =
                    (row < 3 && col < 3) ||
                    (row < 3 && col > 3) ||
                    (row > 3 && col < 3);
                  const isCenter = row === 3 && col === 3;
                  const filled = isCorner || isCenter || [10, 12, 17, 24, 31, 36, 38].includes(i);
                  return (
                    <div
                      key={i}
                      className={`rounded-[1px] ${filled ? "bg-gradient-to-br from-primary to-accent-teal" : "bg-transparent"}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="flex flex-1 flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-muted">{t.dashboard.name}</label>
                <div className="flex items-center rounded-lg border border-border-card bg-surface-card px-3 py-2">
                  <span className="text-sm text-text-heading">Main landing page</span>
                  <IconSearch className="ml-auto h-4 w-4 text-text-muted" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-muted">{t.dashboard.slug}</label>
                <div className="flex items-center rounded-lg border border-border-card bg-surface-card px-3 py-2">
                  <span className="text-sm text-text-heading">landing-page</span>
                  <IconQrCode className="ml-auto h-4 w-4 text-text-muted" />
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">{t.dashboard.destinationUrl}</label>
              <div className="rounded-lg border border-border-card bg-surface-card px-3 py-2">
                <span className="text-sm text-text-muted">https://example.com/landing</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              {/* Toggle */}
              <div className="flex items-center gap-2">
                <div className="relative h-5 w-9 rounded-full bg-primary">
                  <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm" />
                </div>
                <span className="text-sm font-medium text-text-heading">{t.dashboard.active}</span>
              </div>
              <button className="cursor-pointer rounded-lg bg-gradient-to-r from-primary to-accent-teal px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30">
                {t.dashboard.createQrCodeButton}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* My QR Codes list */}
      <div className="rounded-xl border border-border-card bg-surface-elevated p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-heading">{t.dashboard.myQrCodes}</h3>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <IconBarChart className="h-4 w-4 text-primary" />
            <span className="font-medium">4 {t.dashboard.total}</span>
          </div>
        </div>

        {/* Search & filter */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <IconSearch className="h-4 w-4 text-text-muted" />
            </div>
            <div className="w-full rounded-lg border border-border-card bg-surface-card py-2 pl-9 pr-3 text-sm text-text-muted">
              {t.dashboard.searchPlaceholder}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border-card bg-surface-card px-3 py-2">
              <span className="text-sm text-text-heading">{t.dashboard.allStatuses}</span>
              <IconChevronDown className="h-4 w-4 text-text-muted" />
            </div>
            <button className="cursor-pointer rounded-lg border border-border-card bg-surface-card px-4 py-2 text-sm font-medium text-text-heading transition-colors duration-200 hover:border-primary hover:text-primary">
              {t.dashboard.applyFilters}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="pb-2 text-left text-xs font-medium text-text-muted">{t.dashboard.name}</th>
                <th className="pb-2 text-left text-xs font-medium text-text-muted">{t.dashboard.slug}</th>
                <th className="pb-2 text-left text-xs font-medium text-text-muted">{t.dashboard.created}</th>
                <th className="pb-2 text-left text-xs font-medium text-text-muted">{t.dashboard.status}</th>
                <th className="pb-2 text-left text-xs font-medium text-text-muted">{t.dashboard.actions}</th>
              </tr>
            </thead>
            <tbody>
              {myQrCodes.map((row, i) => (
                <tr key={i} className="border-b border-border-subtle/50 last:border-0">
                  <td className="py-2.5 text-sm text-text-heading">{row.name}</td>
                  <td className="py-2.5">
                    <span className="rounded bg-surface-card px-2 py-0.5 font-mono text-xs text-text-muted">
                      {row.slug}
                    </span>
                  </td>
                  <td className="py-2.5 text-sm text-text-muted">{row.created}</td>
                  <td className="py-2.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.status === "Active"
                          ? "bg-primary/15 text-primary-light"
                          : "bg-border-subtle text-text-muted"
                      }`}
                    >
                      {row.status === "Active" ? t.dashboard.active : t.dashboard.inactive}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1.5">
                      <button className="cursor-pointer rounded border border-border-card bg-surface-card px-2.5 py-1 text-xs text-text-heading transition-colors duration-200 hover:border-primary hover:text-primary">
                        {t.dashboard.download}
                      </button>
                      <button className="cursor-pointer rounded border border-border-card bg-surface-card px-2.5 py-1 text-xs text-text-heading transition-colors duration-200 hover:border-primary hover:text-primary">
                        {t.dashboard.edit}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard Mockup Component                                    */
/* ------------------------------------------------------------------ */

export default function DashboardMockup() {
  const [activeTab, setActiveTab] = useState<"analytics" | "qrcodes">("analytics");
  const { t } = useLanguage();

  return (
    <div className="overflow-hidden rounded-2xl border border-border-card bg-surface-card shadow-2xl shadow-primary/10">
      {/* Dashboard header */}
      <div className="border-b border-border-subtle px-6 pb-0 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-text-heading">{t.dashboard.title}</h3>
            <p className="mt-0.5 text-xs text-text-muted">
              {t.dashboard.signedInAs} <span className="text-primary-light">user@example.com</span>
            </p>
          </div>
          <button className="cursor-pointer rounded-lg border border-primary bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary hover:text-white">
            {t.dashboard.signOut}
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-0">
          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`cursor-pointer border-b-2 px-4 pb-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === "analytics"
                ? "border-text-heading text-text-heading"
                : "border-transparent text-text-muted hover:text-text-heading"
            }`}
          >
            {t.dashboard.tabAnalytics}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("qrcodes")}
            className={`cursor-pointer border-b-2 px-4 pb-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === "qrcodes"
                ? "border-text-heading text-text-heading"
                : "border-transparent text-text-muted hover:text-text-heading"
            }`}
          >
            {t.dashboard.tabQrCodes}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="p-5">
        {activeTab === "analytics" ? <AnalyticsTab t={t} /> : <QrCodesTab t={t} />}
      </div>
    </div>
  );
}
