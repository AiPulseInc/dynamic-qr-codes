"use client";

import { useEffect, useState } from "react";

import { generateQrDataUrl } from "@/lib/qr/preview";

type QrPreviewProps = {
  shortLinkBaseUrl: string;
};

const CORNER = "absolute h-10 w-10 border-primary";

export function CornerBrackets() {
  return (
    <>
      <span className={`${CORNER} left-0 top-0 rounded-tl-lg border-l-[4px] border-t-[4px]`} />
      <span className={`${CORNER} right-0 top-0 rounded-tr-lg border-r-[4px] border-t-[4px]`} />
      <span className={`${CORNER} bottom-0 left-0 rounded-bl-lg border-b-[4px] border-l-[4px]`} />
      <span className={`${CORNER} bottom-0 right-0 rounded-br-lg border-b-[4px] border-r-[4px]`} />
    </>
  );
}

export function QrPreview({ shortLinkBaseUrl }: QrPreviewProps) {
  const [slug, setSlug] = useState("");
  const [destUrl, setDestUrl] = useState("");
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const slugEl = document.querySelector<HTMLInputElement>('form input[name="slug"]');
    const destEl = document.querySelector<HTMLInputElement>('form input[name="destinationUrl"]');

    const onSlug = () => setSlug(slugEl?.value.trim() ?? "");
    const onDest = () => setDestUrl(destEl?.value.trim() ?? "");

    slugEl?.addEventListener("input", onSlug);
    destEl?.addEventListener("input", onDest);
    onSlug();
    onDest();

    return () => {
      slugEl?.removeEventListener("input", onSlug);
      destEl?.removeEventListener("input", onDest);
    };
  }, []);

  useEffect(() => {
    if (!slug && !destUrl) {
      setDataUrl(null);
      return;
    }

    let cancelled = false;
    generateQrDataUrl(shortLinkBaseUrl, slug || "preview").then((url) => {
      if (!cancelled) setDataUrl(url);
    });

    return () => { cancelled = true; };
  }, [slug, destUrl, shortLinkBaseUrl]);

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
