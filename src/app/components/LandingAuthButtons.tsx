"use client";

import { useEffect, useState } from "react";

import AuthModal from "@/app/components/AuthModal";
import { useLanguage } from "@/app/i18n/LanguageContext";

type LandingAuthButtonsProps = {
  isAuthenticated: boolean;
  authAction?: "signin" | "signup";
  authNext?: string;
};

export default function LandingAuthButtons({ isAuthenticated, authAction, authNext }: LandingAuthButtonsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<"signin" | "signup">("signin");
  const { t } = useLanguage();

  useEffect(() => {
    if (authAction) {
      setDefaultTab(authAction);
      setModalOpen(true);
    }
  }, [authAction]);

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
    <>
      <div className="flex items-center gap-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => { setDefaultTab("signin"); setModalOpen(true); }}
          className="cursor-pointer text-text-muted transition-colors duration-200 hover:text-primary"
        >
          {t.auth.tabSignIn}
        </button>
        <span className="text-border-card">|</span>
        <button
          type="button"
          onClick={() => { setDefaultTab("signup"); setModalOpen(true); }}
          className="cursor-pointer text-text-muted transition-colors duration-200 hover:text-primary"
        >
          {t.auth.tabSignUp}
        </button>
      </div>

      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultTab={defaultTab}
        nextPath={authNext}
      />
    </>
  );
}
