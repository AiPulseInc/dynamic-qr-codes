"use client";

import { useEffect } from "react";

import { useLanguage } from "@/app/i18n/LanguageContext";

export default function HtmlLangSync() {
  const { locale } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
