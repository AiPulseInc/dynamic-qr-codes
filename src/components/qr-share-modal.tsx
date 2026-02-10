"use client";

import { useEffect, useRef, useState } from "react";

import { CornerBrackets } from "@/app/dashboard/components/QrPreview";
import { generateQrDataUrl } from "@/lib/qr/preview";

type ErrorCorrectionLevel = "L" | "M" | "H";
type QrSize = 150 | 200 | 300;

const ECL_OPTIONS: { value: ErrorCorrectionLevel; label: string }[] = [
  { value: "L", label: "Low 7%" },
  { value: "M", label: "Medium 15%" },
  { value: "H", label: "High 30%" },
];

const SIZE_OPTIONS: { value: QrSize; label: string }[] = [
  { value: 150, label: "Small 150px" },
  { value: 200, label: "Medium 200px" },
  { value: 300, label: "Large 300px" },
];

type QrShareModalProps = {
  slug: string;
  shortLinkBaseUrl: string;
};

export function QrShareModal({ slug, shortLinkBaseUrl }: QrShareModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [ecl, setEcl] = useState<ErrorCorrectionLevel>("M");
  const [size, setSize] = useState<QrSize>(200);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    generateQrDataUrl(shortLinkBaseUrl, slug).then((url) => {
      if (!cancelled) setPreviewUrl(url);
    });

    return () => { cancelled = true; };
  }, [isOpen, slug, shortLinkBaseUrl]);

  function openModal() {
    setIsOpen(true);
    dialogRef.current?.showModal();
  }

  function closeModal() {
    setIsOpen(false);
    dialogRef.current?.close();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      closeModal();
    }
  }

  function getApiUrl(download: boolean): string {
    const params = new URLSearchParams({
      ecl,
      width: String(size),
    });
    if (download) params.set("download", "1");
    return `/api/qr/${encodeURIComponent(slug)}?${params.toString()}`;
  }

  async function handleCopyToClipboard() {
    try {
      const res = await fetch(getApiUrl(false));
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      const url = `${window.location.origin}${getApiUrl(false)}`;
      await navigator.clipboard.writeText(url);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}${getApiUrl(false)}`;
    if (navigator.share) {
      try {
        const res = await fetch(getApiUrl(false));
        const blob = await res.blob();
        const file = new File([blob], `${slug}.png`, { type: "image/png" });
        await navigator.share({
          title: `QR Code: ${slug}`,
          files: [file],
        });
      } catch {
        // User cancelled or share failed — fall back to clipboard
        await navigator.clipboard.writeText(url);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  }

  function handleSave() {
    const a = document.createElement("a");
    a.href = getApiUrl(true);
    a.download = `${slug}.png`;
    a.click();
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="rounded-lg bg-gradient-to-r from-primary to-accent-teal px-2.5 py-1 text-xs font-medium text-white shadow-sm shadow-primary/20 transition-all duration-200 hover:shadow-md hover:shadow-primary/30"
      >
        Share
      </button>

      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-border-card bg-surface-elevated p-0 shadow-2xl shadow-primary/20 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        {isOpen && (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-heading">Share QR Code</h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-text-muted transition-colors duration-200 hover:bg-surface-card hover:text-text-heading"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* QR Preview */}
            <div className="mt-4 flex justify-center">
              <div className="relative p-2">
                <CornerBrackets />
                {previewUrl ? (
                  <img src={previewUrl} alt="QR code preview" className="h-48 w-48" />
                ) : (
                  <div className="h-48 w-48" />
                )}
              </div>
            </div>

            {/* Error correction */}
            <div className="mt-5">
              <p className="text-sm font-medium text-text-heading">Error correction</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {ECL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEcl(opt.value)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                      ecl === opt.value
                        ? "border-primary bg-primary/15 text-primary-light shadow-sm shadow-primary/20"
                        : "border-border-card bg-surface-card text-text-muted hover:border-primary/50 hover:text-text-heading"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* QR code size */}
            <div className="mt-4">
              <p className="text-sm font-medium text-text-heading">QR code size</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSize(opt.value)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                      size === opt.value
                        ? "border-primary bg-primary/15 text-primary-light shadow-sm shadow-primary/20"
                        : "border-border-card bg-surface-card text-text-muted hover:border-primary/50 hover:text-text-heading"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary/10 px-3 py-2.5 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copyFeedback ? "Copied!" : "Copy to clipboard"}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary/10 px-3 py-2.5 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary/10 px-3 py-2.5 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Save
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
