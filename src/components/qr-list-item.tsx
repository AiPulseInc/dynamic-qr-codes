"use client";

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
  return (
    <tr className="border-t border-zinc-100">
      <td className="px-3 py-2 text-zinc-900">{qrCode.name}</td>
      <td className="px-3 py-2">
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-700">{qrCode.slug}</code>
      </td>
      <td className="px-3 py-2 text-zinc-600">{formatDate(qrCode.createdAt)}</td>
      <td className="px-3 py-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            qrCode.isActive
              ? "bg-emerald-100 text-emerald-800"
              : "bg-zinc-200 text-zinc-700"
          }`}
        >
          {qrCode.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-3 py-2">
        <QrEditModal
          qrCode={qrCode}
          returnTo={returnTo}
          shortLinkBaseUrl={shortLinkBaseUrl}
        />
      </td>
    </tr>
  );
}
