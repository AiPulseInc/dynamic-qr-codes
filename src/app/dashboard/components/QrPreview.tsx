"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

type QrPreviewProps = {
  shortLinkBaseUrl: string;
};

export function QrPreview({ shortLinkBaseUrl }: QrPreviewProps) {
  const [slug, setSlug] = useState("");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) {
      // Walk up from the component to find the parent form
      return;
    }
  }, []);

  // Find the parent form on mount to listen to the slug input
  useEffect(() => {
    // We use a small trick: find the slug input by name in the closest form
    const el = document.querySelector<HTMLInputElement>(
      'form input[name="slug"]',
    );
    if (!el) return;

    const handler = () => setSlug(el.value.trim());
    el.addEventListener("input", handler);
    // Set initial value
    handler();

    return () => el.removeEventListener("input", handler);
  }, []);

  useEffect(() => {
    if (!slug) {
      setDataUrl(null);
      return;
    }

    const baseUrl = shortLinkBaseUrl.replace(/\/$/, "");
    const redirectUrl = `${baseUrl}/r/${slug}`;

    let cancelled = false;
    QRCode.toDataURL(redirectUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: "#10B981",
        light: "#00000000",
      },
    }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [slug, shortLinkBaseUrl]);

  return (
    <div className="flex shrink-0 items-center justify-center">
      <div className="rounded-xl border-2 border-primary/40 bg-surface-card p-2 shadow-lg shadow-primary/10">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="QR code preview"
            className="h-32 w-32 rounded-lg"
          />
        ) : (
          /* Decorative placeholder when no slug is entered */
          <div className="grid h-32 w-32 grid-cols-7 grid-rows-7 gap-0.5 p-2">
            {Array.from({ length: 49 }).map((_, i) => {
              const row = Math.floor(i / 7);
              const col = i % 7;
              const isCorner =
                (row < 3 && col < 3) ||
                (row < 3 && col > 3) ||
                (row > 3 && col < 3);
              const isCenter = row === 3 && col === 3;
              const filled =
                isCorner ||
                isCenter ||
                [10, 12, 17, 24, 31, 36, 38].includes(i);
              return (
                <div
                  key={i}
                  className={`rounded-[1px] ${filled ? "bg-gradient-to-br from-primary/40 to-accent-teal/40" : "bg-transparent"}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
