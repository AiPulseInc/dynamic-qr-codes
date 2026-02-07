"use client";

import { useLanguage } from "@/app/i18n/LanguageContext";
import type { Locale } from "@/app/i18n/translations";

const locales: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "pl", label: "PL" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center rounded-lg border border-border-card bg-surface-elevated p-0.5">
      {locales.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLocale(l.code)}
          className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-all duration-200 ${
            locale === l.code
              ? "bg-primary text-white shadow-sm"
              : "text-text-muted hover:text-text-heading"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
