"use client";

import { useState } from "react";

import AuthModal from "@/app/components/AuthModal";
import { useLanguage } from "@/app/i18n/LanguageContext";

function IconArrowRight({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

type LandingHeroCTAProps = {
  isAuthenticated: boolean;
};

export default function LandingHeroCTA({ isAuthenticated }: LandingHeroCTAProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useLanguage();

  if (isAuthenticated) {
    return (
      <div className="animate-fade-in-up-delay-3 mt-8 flex flex-wrap items-center gap-4">
        <a
          href="/dashboard"
          className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-light px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/40"
        >
          {t.hero.ctaDashboard}
          <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in-up-delay-3 mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-light px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/40"
        >
          {t.hero.ctaPrimary}
          <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
        <a
          href="#dashboard-preview"
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-border-card bg-surface-card px-6 py-3 text-sm font-semibold text-text-heading transition-colors duration-200 hover:border-primary hover:text-primary"
        >
          {t.hero.ctaSecondary}
        </a>
      </div>

      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultTab="signup"
      />
    </>
  );
}
