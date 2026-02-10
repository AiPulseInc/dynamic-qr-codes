"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { updateQrCode } from "@/app/dashboard/actions";
import { CornerBrackets } from "@/app/dashboard/components/QrPreview";
import { generateQrDataUrl } from "@/lib/qr/preview";
import type { QrCodeListItem } from "@/lib/qr/types";

type QrEditModalProps = {
  qrCode: QrCodeListItem;
  returnTo: string;
  shortLinkBaseUrl: string;
};

export function QrEditModal({ qrCode, returnTo, shortLinkBaseUrl }: QrEditModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [currentSlug, setCurrentSlug] = useState(qrCode.slug);

  const shortUrl = `${shortLinkBaseUrl.replace(/\/$/, "")}/r/${qrCode.slug}`;

  useEffect(() => {
    if (!isOpen || !currentSlug) {
      setQrDataUrl(null);
      return;
    }

    let cancelled = false;
    generateQrDataUrl(shortLinkBaseUrl, currentSlug).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });

    return () => { cancelled = true; };
  }, [isOpen, currentSlug, shortLinkBaseUrl]);

  function openModal() {
    setCurrentSlug(qrCode.slug);
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

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="rounded-lg border border-primary bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary hover:text-white"
      >
        Edit
      </button>

      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-border-card bg-surface-elevated p-0 shadow-2xl shadow-primary/20 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        {isOpen && (
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-heading">Edit QR Code</h2>
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

            {/* Live QR code preview */}
            <div className="mt-3 flex justify-center">
              <div className="relative p-2">
                <CornerBrackets />
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR code preview" className="h-32 w-32" />
                ) : (
                  <div className="h-32 w-32" />
                )}
              </div>
            </div>

            <div className="mt-2 text-center text-sm text-text-muted">
              <p>
                Dynamic URL:{" "}
                <Link className="text-primary-light underline transition-colors duration-200 hover:text-primary" href={shortUrl} target="_blank">
                  {shortUrl}
                </Link>
              </p>
            </div>

            <form action={updateQrCode} className="mt-4 grid gap-3">
              <input name="qrCodeId" type="hidden" value={qrCode.id} />
              <input name="returnTo" type="hidden" value={returnTo} />

              <label className="text-sm text-text-muted">
                Name
                <input
                  className="mt-1 w-full rounded-lg border border-border-card bg-surface-card px-3 py-2 text-sm text-text-heading transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  defaultValue={qrCode.name}
                  name="name"
                  required
                  type="text"
                />
              </label>

              <label className="text-sm text-text-muted">
                Slug
                <input
                  className="mt-1 w-full rounded-lg border border-border-card bg-surface-card px-3 py-2 text-sm text-text-heading transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  defaultValue={qrCode.slug}
                  name="slug"
                  required
                  type="text"
                  onInput={(e) => setCurrentSlug((e.target as HTMLInputElement).value.trim())}
                />
              </label>

              <label className="text-sm text-text-muted">
                Destination URL
                <input
                  className="mt-1 w-full rounded-lg border border-border-card bg-surface-card px-3 py-2 text-sm text-text-heading transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  defaultValue={qrCode.destinationUrl}
                  name="destinationUrl"
                  required
                  type="url"
                />
              </label>

              <label className="relative inline-flex cursor-pointer items-center gap-2">
                <input
                  defaultChecked={qrCode.isActive}
                  name="isActive"
                  type="checkbox"
                  value="true"
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-border-subtle transition-colors duration-200 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 peer-checked:bg-primary peer-checked:after:translate-x-4" />
                <span className="text-sm font-medium text-text-heading">Active</span>
              </label>

              <button
                className="rounded-lg bg-gradient-to-r from-primary to-primary-light px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/40"
                type="submit"
              >
                Save changes
              </button>
            </form>
          </div>
        )}
      </dialog>
    </>
  );
}
