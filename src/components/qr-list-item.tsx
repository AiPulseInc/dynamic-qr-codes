"use client";

import Link from "next/link";

import { QrEditModal } from "@/components/qr-edit-modal";

type QrCode = {
  id: string;
  name: string;
  slug: string;
  destinationUrl: string;
  isActive: boolean;
  createdAt: Date;
};

type QrListItemProps = {
  qrCode: QrCode;
  returnTo: string;
  shortLinkBaseUrl: string;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(value);
}

export function QrListItem({ qrCode, returnTo, shortLinkBaseUrl }: QrListItemProps) {
  const downloadHref = `/api/qr/${encodeURIComponent(qrCode.slug)}?download=1`;

  return (
    <tr className="border-b border-border-subtle/50 last:border-0">
      <td className="px-3 py-2.5 text-text-heading">{qrCode.name}</td>
      <td className="px-3 py-2.5">
        <span className="rounded bg-surface-card px-2 py-0.5 font-mono text-xs text-text-muted">{qrCode.slug}</span>
      </td>
      <td className="px-3 py-2.5 text-text-muted">{formatDate(qrCode.createdAt)}</td>
      <td className="px-3 py-2.5">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            qrCode.isActive
              ? "bg-primary/15 text-primary-light"
              : "bg-border-subtle text-text-muted"
          }`}
        >
          {qrCode.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <Link
            className="rounded border border-border-card bg-surface-card px-2.5 py-1 text-xs text-text-heading transition-colors duration-200 hover:border-primary hover:text-primary"
            href={downloadHref}
            prefetch={false}
          >
            Download
          </Link>
          <QrEditModal
            qrCode={qrCode}
            returnTo={returnTo}
            shortLinkBaseUrl={shortLinkBaseUrl}
          />
        </div>
      </td>
    </tr>
  );
}
