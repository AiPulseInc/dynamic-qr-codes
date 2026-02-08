"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import AuthModal from "@/app/components/AuthModal";
import DashboardMockup from "@/app/components/DashboardMockup";
import {
  IconBarChart,
  IconCheck,
  IconDownload,
  IconGlobe,
  IconLink,
  IconQrCode,
  IconShield,
} from "@/app/components/icons";
import LandingAuthButtons from "@/app/components/LandingAuthButtons";
import LandingFinalCTA from "@/app/components/LandingFinalCTA";
import LandingHeroCTA from "@/app/components/LandingHeroCTA";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { useLanguage } from "@/app/i18n/LanguageContext";

const featureIcons = [IconLink, IconBarChart, IconDownload, IconShield, IconGlobe, IconQrCode];

type LandingContentProps = {
  isAuthenticated: boolean;
  authAction?: "signin" | "signup";
  authNext?: string;
};

export default function LandingContent({ isAuthenticated, authAction, authNext }: LandingContentProps) {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    if (authAction) {
      setModalTab(authAction);
      setModalOpen(true);
    }
  }, [authAction]);

  const openAuth = useCallback((tab: "signin" | "signup") => {
    setModalTab(tab);
    setModalOpen(true);
  }, []);

  const stats = [
    { value: "99.9%", label: t.stats.uptimeSla },
    { value: "<50ms", label: t.stats.redirectLatency },
    { value: "CSV", label: t.stats.exportFormat },
    { value: t.stats.unlimited, label: t.stats.qrCodes },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Decorative gradient blobs ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-[400px] w-[400px] rounded-full bg-accent-teal/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-primary-light/5 blur-3xl" />
      </div>

      {/* ── Navbar ── */}
      <nav className="glass-strong sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <IconQrCode className="h-7 w-7 text-primary" />
            <span className="text-lg font-semibold text-text-heading">DynamicQR</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="cursor-pointer text-sm font-medium text-text-muted transition-colors duration-200 hover:text-primary">{t.nav.features}</a>
            <a href="#how-it-works" className="cursor-pointer text-sm font-medium text-text-muted transition-colors duration-200 hover:text-primary">{t.nav.howItWorks}</a>
            <a href="#pricing" className="cursor-pointer text-sm font-medium text-text-muted transition-colors duration-200 hover:text-primary">{t.nav.pricing}</a>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <LandingAuthButtons isAuthenticated={isAuthenticated} onOpenAuth={openAuth} />
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="animate-fade-in-up inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-light">
              {t.hero.badge}
            </span>
            <h1 className="animate-fade-in-up-delay-1 mt-5 text-4xl font-bold leading-tight text-text-heading sm:text-5xl lg:text-6xl">
              {t.hero.titleStart}<span className="bg-gradient-to-r from-primary-light to-accent-teal bg-clip-text text-transparent">{t.hero.titleHighlight}</span>{t.hero.titleEnd}
            </h1>
            <p className="animate-fade-in-up-delay-2 mt-6 max-w-lg text-lg text-text-muted">
              {t.hero.description}
            </p>
            <LandingHeroCTA isAuthenticated={isAuthenticated} onOpenAuth={openAuth} />
          </div>

          {/* Hero visual — dark glassmorphism QR card mockup */}
          <div className="relative flex items-center justify-center" aria-hidden="true">
            <div className="absolute h-64 w-64 rounded-full bg-primary/15 animate-pulse-ring" />
            <div className="glass relative z-10 animate-float rounded-2xl p-8 shadow-2xl shadow-primary/20">
              <div className="mx-auto grid h-40 w-40 grid-cols-5 grid-rows-5 gap-1.5">
                {Array.from({ length: 25 }).map((_, i) => {
                  const filled = [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,6,8,12,16,18].includes(i);
                  return (
                    <div
                      key={i}
                      className={`rounded-sm ${filled ? "bg-primary-light" : "bg-border-card"}`}
                    />
                  );
                })}
              </div>
              <div className="mt-4 text-center">
                <p className="font-mono text-xs text-text-muted">yoursite.com/r/promo</p>
                <div className="mx-auto mt-2 h-1.5 w-20 rounded-full bg-gradient-to-r from-primary to-accent-teal" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-border-subtle bg-surface-card/50 backdrop-blur-sm">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary-light">{stat.value}</p>
              <p className="mt-1 text-sm text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-heading sm:text-4xl">
            {t.features.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
            {t.features.subtitle}
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((feature, idx) => {
            const Icon = featureIcons[idx];
            return (
              <div
                key={idx}
                className="group cursor-default rounded-xl border border-border-card bg-surface-card p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text-heading">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="border-y border-border-subtle bg-surface-card/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text-heading sm:text-4xl">
              {t.howItWorks.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-text-muted">
              {t.howItWorks.subtitle}
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {t.howItWorks.steps.map((item, idx) => (
              <div key={idx} className="relative text-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-teal text-xl font-bold text-white shadow-lg shadow-primary/30">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-text-heading">{item.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{item.description}</p>
              </div>
            ))}
          </div>

          {/* ── Expanded explainers ── */}
          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {/* Dynamic QR explanation */}
            <div className="rounded-xl border border-border-card bg-surface-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-heading">{t.howItWorks.dynamicTitle}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{t.howItWorks.dynamicDescription}</p>
              <ul className="mt-5 space-y-2.5">
                {t.howItWorks.dynamicPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-text-muted">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tracking explanation */}
            <div className="rounded-xl border border-border-card bg-surface-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-teal/15 text-accent-teal">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-heading">{t.howItWorks.trackingTitle}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{t.howItWorks.trackingDescription}</p>
              <ul className="mt-5 space-y-2.5">
                {t.howItWorks.trackingPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-text-muted">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dashboard Preview (mockup) ── */}
      <section id="dashboard-preview" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-heading sm:text-4xl">
            {t.dashboardPreview.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
            {t.dashboardPreview.subtitle}
          </p>
        </div>

        <div className="mt-12">
          <div className="origin-top scale-[0.8] mb-[-10%]">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="border-y border-border-subtle bg-surface-card/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text-heading sm:text-4xl">
              {t.pricing.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-text-muted">
              {t.pricing.subtitle}
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {t.pricing.plans.map((plan, idx) => {
              const highlighted = idx === 1;
              return (
                <div
                  key={idx}
                  className={`relative flex flex-col rounded-2xl p-8 transition-all duration-200 ${
                    highlighted
                      ? "border-2 border-primary bg-surface-card shadow-xl shadow-primary/15"
                      : "border border-border-card bg-surface-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  }`}
                >
                  {highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent-teal px-4 py-1 text-xs font-semibold text-white">
                      {t.pricing.mostPopular}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-text-heading">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-text-heading">{plan.price}</span>
                    {plan.period && <span className="text-sm text-text-muted">{plan.period}</span>}
                  </div>
                  <p className="mt-3 text-sm text-text-muted">{plan.description}</p>

                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((feat, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-slate-300">
                        <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/?auth=signup"
                    className={`mt-8 block cursor-pointer rounded-lg px-6 py-3 text-center text-sm font-semibold transition-all duration-200 ${
                      highlighted
                        ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40"
                        : "border border-border-card bg-surface-elevated text-text-heading hover:border-primary hover:text-primary"
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="relative overflow-hidden rounded-2xl border border-border-card bg-surface-card px-8 py-16 text-center shadow-xl shadow-primary/10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/15 blur-2xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent-teal/10 blur-2xl" aria-hidden="true" />

          <h2 className="relative text-3xl font-bold text-text-heading sm:text-4xl">
            {t.finalCta.title}
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-lg text-text-muted">
            {t.finalCta.subtitle}
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
            <LandingFinalCTA onOpenAuth={openAuth} />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border-subtle bg-surface-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <IconQrCode className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-text-heading">DynamicQR</span>
          </div>
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} DynamicQR. {t.footer.rights}
          </p>
          <div className="flex gap-6">
            <a href="#features" className="cursor-pointer text-xs text-text-muted transition-colors duration-200 hover:text-primary">{t.nav.features}</a>
            <a href="#pricing" className="cursor-pointer text-xs text-text-muted transition-colors duration-200 hover:text-primary">{t.nav.pricing}</a>
            <a href="/?auth=signin" className="cursor-pointer text-xs text-text-muted transition-colors duration-200 hover:text-primary">{t.nav.signIn}</a>
          </div>
        </div>
      </footer>
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultTab={modalTab}
        nextPath={authNext}
      />
    </div>
  );
}
