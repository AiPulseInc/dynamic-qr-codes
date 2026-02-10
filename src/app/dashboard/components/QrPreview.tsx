"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

type QrPreviewProps = {
  shortLinkBaseUrl: string;
};

const CORNER_CLASSES = "absolute h-5 w-5 border-primary/60";

function CornerBrackets() {
  return (
    <>
      <span className={`${CORNER_CLASSES} left-0 top-0 rounded-tl-lg border-l-2 border-t-2`} />
      <span className={`${CORNER_CLASSES} right-0 top-0 rounded-tr-lg border-r-2 border-t-2`} />
      <span className={`${CORNER_CLASSES} bottom-0 left-0 rounded-bl-lg border-b-2 border-l-2`} />
      <span className={`${CORNER_CLASSES} bottom-0 right-0 rounded-br-lg border-b-2 border-r-2`} />
    </>
  );
}

export function QrPreview({ shortLinkBaseUrl }: QrPreviewProps) {
  const [slug, setSlug] = useState("");
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
      <div className="relative p-3">
        <CornerBrackets />
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="QR code preview"
            className="h-32 w-32"
          />
        ) : (
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
