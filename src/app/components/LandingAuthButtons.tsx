"use client";

import { useLanguage } from "@/app/i18n/LanguageContext";

type LandingAuthButtonsProps = {
  isAuthenticated: boolean;
  onOpenAuth: (tab: "signin" | "signup") => void;
};

export default function LandingAuthButtons({ isAuthenticated, onOpenAuth }: LandingAuthButtonsProps) {
  const { t } = useLanguage();

  if (isAuthenticated) {
    return (
      <a
        href="/dashboard"
        className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-light"
      >
        {t.nav.dashboard}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        type="button"
        onClick={() => onOpenAuth("signin")}
        className="cursor-pointer text-text-muted transition-colors duration-200 hover:text-primary"
      >
        {t.auth.tabSignIn}
      </button>
      <span className="text-border-card">|</span>
      <button
        type="button"
        onClick={() => onOpenAuth("signup")}
        className="cursor-pointer text-text-muted transition-colors duration-200 hover:text-primary"
      >
        {t.auth.tabSignUp}
      </button>
    </div>
  );
}
