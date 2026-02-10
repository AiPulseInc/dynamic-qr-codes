"use client";

import { useEffect, useState } from "react";

import { generateQrDataUrl } from "@/lib/qr/preview";

type QrPreviewProps = {
  shortLinkBaseUrl: string;
  initialSlug?: string;
};

const CORNER = "absolute h-8 w-8 border-primary";

function CornerBrackets() {
  return (
    <>
      <span className={`${CORNER} left-0 top-0 rounded-tl-lg border-l-[3px] border-t-[3px]`} />
      <span className={`${CORNER} right-0 top-0 rounded-tr-lg border-r-[3px] border-t-[3px]`} />
      <span className={`${CORNER} bottom-0 left-0 rounded-bl-lg border-b-[3px] border-l-[3px]`} />
      <span className={`${CORNER} bottom-0 right-0 rounded-br-lg border-b-[3px] border-r-[3px]`} />
    </>
  );
}

export function QrPreview({ shortLinkBaseUrl, initialSlug = "" }: QrPreviewProps) {
  const [slug, setSlug] = useState(initialSlug);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const el = document.querySelector<HTMLInputElement>(
      'form input[name="slug"]',
    );
    if (!el) return;

    const handler = () => setSlug(el.value.trim());
    el.addEventListener("input", handler);
    handler();

    return () => el.removeEventListener("input", handler);
  }, []);

  useEffect(() => {
    if (!slug) {
      setDataUrl(null);
      return;
    }

    let cancelled = false;
    generateQrDataUrl(shortLinkBaseUrl, slug).then((url) => {
      if (!cancelled) setDataUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [slug, shortLinkBaseUrl]);

  return (
    <div className="flex shrink-0 items-center justify-center">
      <div className="relative p-2">
        <CornerBrackets />
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="QR code preview"
            className="h-36 w-36"
          />
        ) : (
          <div className="grid h-36 w-36 grid-cols-7 grid-rows-7 gap-0.5 p-3">
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
                  className={`rounded-[1px] ${filled ? "bg-gradient-to-br from-primary/30 to-accent-teal/30" : "bg-transparent"}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
