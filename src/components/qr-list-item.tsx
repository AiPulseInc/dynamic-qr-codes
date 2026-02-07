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
    <tr className="border-t border-zinc-100">
      <td className="px-2 py-1 text-zinc-900">{qrCode.name}</td>
      <td className="px-2 py-1">
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-700">{qrCode.slug}</code>
      </td>
      <td className="px-2 py-1 text-zinc-600">{formatDate(qrCode.createdAt)}</td>
      <td className="px-2 py-1">
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
      <td className="px-2 py-1">
        <div className="flex items-center gap-1">
          <Link
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
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
