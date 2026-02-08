"use client";

import { useLanguage } from "@/app/i18n/LanguageContext";

function IconArrowRight({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

type LandingFinalCTAProps = {
  onOpenAuth: (tab: "signin" | "signup") => void;
};

export default function LandingFinalCTA({ onOpenAuth }: LandingFinalCTAProps) {
  const { t } = useLanguage();

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenAuth("signup")}
        className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-light px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/40"
      >
        {t.finalCta.button}
        <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>
    </>
  );
}
