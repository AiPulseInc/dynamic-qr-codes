"use client";

import { useState } from "react";

import { useLanguage } from "@/app/i18n/LanguageContext";
import {
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
} from "@/app/login/actions";

function IconX({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconGoogle({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function IconMail({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup";
  nextPath?: string;
};

export default function AuthModal({ isOpen, onClose, defaultTab = "signin", nextPath = "/dashboard" }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  if (!isOpen) return null;

  function isRedirectError(error: unknown): boolean {
    return (
      error instanceof Error &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    );
  }

  async function handleEmailSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      if (tab === "signin") {
        await signInWithPassword(formData);
      } else {
        await signUpWithPassword(formData);
      }
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError(t.auth.errorGeneric);
      setLoading(false);
    }
  }

  async function handleGoogleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle(formData);
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError(t.auth.errorGoogle);
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 pb-20 sm:items-center sm:pb-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[101] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-[102] w-full max-w-md animate-fade-in-up rounded-2xl border border-border-card bg-surface-card shadow-2xl shadow-primary/20">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer rounded-lg p-1.5 text-text-muted transition-colors duration-200 hover:bg-surface-elevated hover:text-text-heading"
          aria-label="Close"
        >
          <IconX className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
              <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="8" height="8" rx="1" />
                <rect x="14" y="2" width="8" height="8" rx="1" />
                <rect x="2" y="14" width="8" height="8" rx="1" />
                <path d="M14 14h2v2h-2zM20 14h2v2h-2zM14 20h2v2h-2zM20 20h2v2h-2zM17 17h2v2h-2z" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-text-heading">
              {t.auth.welcomeTitle}
            </h2>
            <p className="mt-1.5 text-sm text-text-muted">
              {tab === "signin" ? t.auth.signInSubtitle : t.auth.signUpSubtitle}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Google sign-in */}
          <form action={handleGoogleSubmit} className="mt-6">
            <input type="hidden" name="next" value={nextPath} />
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-border-card bg-surface-elevated px-4 py-3 text-sm font-medium text-text-heading transition-all duration-200 hover:border-primary/40 hover:bg-surface-elevated/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconGoogle className="h-5 w-5" />
              {t.auth.continueWithGoogle}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-card px-3 text-text-muted">{t.auth.orContinueWithEmail}</span>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="mb-5 flex rounded-lg border border-border-subtle bg-surface-elevated p-1">
            <button
              type="button"
              onClick={() => { setTab("signin"); setError(null); }}
              className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                tab === "signin"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text-heading"
              }`}
            >
              {t.auth.tabSignIn}
            </button>
            <button
              type="button"
              onClick={() => { setTab("signup"); setError(null); }}
              className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                tab === "signup"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text-heading"
              }`}
            >
              {t.auth.tabSignUp}
            </button>
          </div>

          {/* Email/Password form */}
          <form action={handleEmailSubmit} className="space-y-4">
            <input type="hidden" name="next" value={nextPath} />

            <div>
              <label htmlFor="auth-email" className="mb-1.5 block text-sm font-medium text-text-muted">
                {t.auth.email}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <IconMail className="h-4 w-4 text-text-muted" />
                </div>
                <input
                  id="auth-email"
                  type="email"
                  name="email"
                  required
                  placeholder={t.auth.emailPlaceholder}
                  className="w-full rounded-lg border border-border-card bg-surface-elevated py-2.5 pl-10 pr-3 text-sm text-text-heading placeholder-text-muted/50 transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="mb-1.5 block text-sm font-medium text-text-muted">
                {t.auth.password}
              </label>
              <input
                id="auth-password"
                type="password"
                name="password"
                required
                minLength={tab === "signup" ? 8 : undefined}
                placeholder={tab === "signup" ? t.auth.passwordPlaceholderSignUp : t.auth.passwordPlaceholderSignIn}
                className="w-full rounded-lg border border-border-card bg-surface-elevated px-3 py-2.5 text-sm text-text-heading placeholder-text-muted/50 transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-lg bg-gradient-to-r from-primary to-primary-light px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.auth.processing}
                </span>
              ) : tab === "signin" ? (
                t.auth.buttonSignIn
              ) : (
                t.auth.buttonSignUp
              )}
            </button>
          </form>

          {/* Footer text */}
          <p className="mt-5 text-center text-xs text-text-muted">
            {tab === "signin" ? (
              <>
                {t.auth.noAccount}{" "}
                <button
                  type="button"
                  onClick={() => { setTab("signup"); setError(null); }}
                  className="cursor-pointer text-primary transition-colors duration-200 hover:text-primary-light"
                >
                  {t.auth.signUp}
                </button>
              </>
            ) : (
              <>
                {t.auth.hasAccount}{" "}
                <button
                  type="button"
                  onClick={() => { setTab("signin"); setError(null); }}
                  className="cursor-pointer text-primary transition-colors duration-200 hover:text-primary-light"
                >
                  {t.auth.signIn}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
