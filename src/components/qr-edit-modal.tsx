"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import {
  disableQrCode,
  enableQrCode,
  updateQrCode,
} from "@/app/dashboard/actions";

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
  const downloadHref = `/api/qr/${encodeURIComponent(qrCode.slug)}?download=1`;

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
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
      >
        Edit
      </button>

      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        className="w-full max-w-lg rounded-xl border border-zinc-200 p-0 backdrop:bg-black/50"
      >
        {isOpen && (
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-zinc-900">Edit QR Code</h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-zinc-500 hover:text-zinc-700"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 text-sm text-zinc-600">
              <p>
                Dynamic URL:{" "}
                <Link className="underline" href={shortUrl} target="_blank">
                  {shortUrl}
                </Link>
              </p>
            </div>

            <form action={updateQrCode} className="mt-4 grid gap-4">
              <input name="qrCodeId" type="hidden" value={qrCode.id} />
              <input name="returnTo" type="hidden" value={returnTo} />

              <label className="text-sm text-zinc-700">
                Name
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  defaultValue={qrCode.name}
                  name="name"
                  required
                  type="text"
                />
              </label>

              <label className="text-sm text-zinc-700">
                Slug
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  defaultValue={qrCode.slug}
                  name="slug"
                  required
                  type="text"
                />
              </label>

              <label className="text-sm text-zinc-700">
                Destination URL
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  defaultValue={qrCode.destinationUrl}
                  name="destinationUrl"
                  required
                  type="url"
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  defaultChecked={qrCode.isActive}
                  name="isActive"
                  type="checkbox"
                  value="true"
                />
                Active
              </label>

              <button
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                type="submit"
              >
                Save changes
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-4">
              {qrCode.isActive ? (
                <form action={disableQrCode}>
                  <input name="qrCodeId" type="hidden" value={qrCode.id} />
                  <input name="returnTo" type="hidden" value={returnTo} />
                  <button
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
                    type="submit"
                  >
                    Disable
                  </button>
                </form>
              ) : (
                <form action={enableQrCode}>
                  <input name="qrCodeId" type="hidden" value={qrCode.id} />
                  <input name="returnTo" type="hidden" value={returnTo} />
                  <button
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
                    type="submit"
                  >
                    Enable
                  </button>
                </form>
              )}

              <Link
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                href={downloadHref}
                prefetch={false}
              >
                Download QR PNG
              </Link>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
