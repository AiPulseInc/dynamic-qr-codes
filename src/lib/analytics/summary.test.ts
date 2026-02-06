import { describe, expect, it } from "vitest";

import { buildAnalyticsSummary } from "@/lib/analytics/summary";

function makeEvent(params: {
  id: string;
  scannedAt: string;
  ipHash: string | null;
  isBot?: boolean;
  qrCodeId: string;
  qrName: string;
  qrSlug: string;
}) {
  return {
    id: params.id,
    scannedAt: new Date(params.scannedAt),
    ipHash: params.ipHash,
    isBot: params.isBot ?? false,
    qrCode: {
      id: params.qrCodeId,
      name: params.qrName,
      slug: params.qrSlug,
      destinationUrl: "https://example.com",
      isActive: true,
    },
  };
}

describe("buildAnalyticsSummary", () => {
  it("computes KPI counts, daily points, and top QR rows", () => {
    const summary = buildAnalyticsSummary({
      events: [
        makeEvent({
          id: "e1",
          scannedAt: "2026-02-04T10:00:00.000Z",
          ipHash: "h1",
          qrCodeId: "q1",
          qrName: "A",
          qrSlug: "a",
        }),
        makeEvent({
          id: "e2",
          scannedAt: "2026-02-04T12:00:00.000Z",
          ipHash: "h1",
          qrCodeId: "q1",
          qrName: "A",
          qrSlug: "a",
        }),
        makeEvent({
          id: "e3",
          scannedAt: "2026-02-05T09:00:00.000Z",
          ipHash: null,
          qrCodeId: "q2",
          qrName: "B",
          qrSlug: "b",
        }),
      ],
      activeQrCodes: 4,
      from: new Date("2026-02-04T00:00:00.000Z"),
      to: new Date("2026-02-06T23:59:59.999Z"),
      now: new Date("2026-02-06T12:00:00.000Z"),
    });

    expect(summary.kpis.totalScans).toBe(3);
    expect(summary.kpis.uniqueScans).toBe(2);
    expect(summary.kpis.activeQrCodes).toBe(4);
    expect(summary.kpis.scansLast24Hours).toBe(0);

    expect(summary.dailySeries).toEqual([
      { day: "2026-02-04", scans: 2 },
      { day: "2026-02-05", scans: 1 },
      { day: "2026-02-06", scans: 0 },
    ]);

    expect(summary.topQrCodes).toEqual([
      { qrCodeId: "q1", name: "A", slug: "a", scans: 2 },
      { qrCodeId: "q2", name: "B", slug: "b", scans: 1 },
    ]);
  });

  it("returns empty-friendly structures", () => {
    const summary = buildAnalyticsSummary({
      events: [],
      activeQrCodes: 0,
      from: new Date("2026-02-01T00:00:00.000Z"),
      to: new Date("2026-02-02T23:59:59.999Z"),
      now: new Date("2026-02-02T12:00:00.000Z"),
    });

    expect(summary.kpis.totalScans).toBe(0);
    expect(summary.kpis.uniqueScans).toBe(0);
    expect(summary.topQrCodes).toEqual([]);
    expect(summary.dailySeries).toEqual([
      { day: "2026-02-01", scans: 0 },
      { day: "2026-02-02", scans: 0 },
    ]);
  });
});
