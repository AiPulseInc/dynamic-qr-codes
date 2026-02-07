"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { updateQrCode } from "@/app/dashboard/actions";

type QrCode = {
  id: string;
  name: string;
  slug: string;
  destinationUrl: string;
  isActive: boolean;
  createdAt: Date;
};

type QrEditModalProps = {
  qrCode: QrCode;
  returnTo: string;
  shortLinkBaseUrl: string;
};

export function QrEditModal({ qrCode, returnTo, shortLinkBaseUrl }: QrEditModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const shortUrl = `${shortLinkBaseUrl.replace(/\/$/, "")}/r/${qrCode.slug}`;

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

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="rounded border border-border-card bg-surface-card px-2.5 py-1 text-xs text-text-heading transition-colors duration-200 hover:border-primary hover:text-primary"
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

            <div className="mt-2 text-sm text-text-muted">
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

              <label className="flex items-center gap-2 text-sm text-text-heading">
                <input
                  defaultChecked={qrCode.isActive}
                  name="isActive"
                  type="checkbox"
                  value="true"
                  className="accent-primary"
                />
                Active
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
