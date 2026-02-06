type AnalyticsCsvRow = {
  scannedAt: Date;
  ipHash: string | null;
  isBot: boolean;
  country: string | null;
  city: string | null;
  referrer: string | null;
  userAgent: string | null;
  qrCode: {
    id: string;
    name: string;
    slug: string;
    destinationUrl: string;
  };
};

function escapeCsvCell(value: string): string {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }

  return value;
}

export function formatAnalyticsCsv(rows: AnalyticsCsvRow[]): string {
  const header = [
    "scanned_at",
    "qr_code_id",
    "qr_name",
    "qr_slug",
    "destination_url",
    "ip_hash",
    "is_bot",
    "country",
    "city",
    "referrer",
    "user_agent",
  ];

  const body = rows.map((row) =>
    [
      row.scannedAt.toISOString(),
      row.qrCode.id,
      row.qrCode.name,
      row.qrCode.slug,
      row.qrCode.destinationUrl,
      row.ipHash ?? "",
      String(row.isBot),
      row.country ?? "",
      row.city ?? "",
      row.referrer ?? "",
      row.userAgent ?? "",
    ]
      .map((cell) => escapeCsvCell(cell))
      .join(","),
  );

  return [header.join(","), ...body].join("\n");
}
