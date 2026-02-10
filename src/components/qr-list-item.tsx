"use client";

import { QrEditModal } from "@/components/qr-edit-modal";
import { QrExportModal } from "@/components/qr-share-modal";
import type { QrCodeListItem } from "@/lib/qr/types";

type QrListItemProps = {
  qrCode: QrCodeListItem;
  returnTo: string;
  shortLinkBaseUrl: string;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(value);
}

export function QrListItem({ qrCode, returnTo, shortLinkBaseUrl }: QrListItemProps) {
  return (
    <tr className="border-b border-border-subtle/50 last:border-0">
      <td className="px-3 py-2.5 text-text-heading">{qrCode.name}</td>
      <td className="px-3 py-2.5 text-center">
        <span className="rounded bg-surface-card px-2 py-0.5 font-mono text-xs text-text-muted">{qrCode.slug}</span>
      </td>
      <td className="px-3 py-2.5 text-center text-text-muted">{formatDate(qrCode.createdAt)}</td>
      <td className="px-3 py-2.5 text-center">
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
        <div className="flex items-center justify-center gap-1.5">
          <QrExportModal
            slug={qrCode.slug}
            shortLinkBaseUrl={shortLinkBaseUrl}
          />
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
