type QrInfo = {
  id: string;
  name: string;
  slug: string;
  destinationUrl: string;
  isActive: boolean;
};

type ScanEventForSummary = {
  id: string;
  scannedAt: Date;
  ipHash: string | null;
  isBot: boolean;
  qrCode: QrInfo;
};

type DailyPoint = {
  day: string;
  scans: number;
};

type TopQrRow = {
  qrCodeId: string;
  name: string;
  slug: string;
  scans: number;
};

type AnalyticsSummary = {
  kpis: {
    totalScans: number;
    uniqueScans: number;
    activeQrCodes: number;
    scansLast24Hours: number;
  };
  dailySeries: DailyPoint[];
  topQrCodes: TopQrRow[];
};

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getUniqueScanCount(events: ScanEventForSummary[]): number {
  const keySet = new Set<string>();

  events.forEach((event) => {
    keySet.add(event.ipHash ?? `event:${event.id}`);
  });

  return keySet.size;
}

function getDailySeries(events: ScanEventForSummary[], from: Date, to: Date): DailyPoint[] {
  const points = new Map<string, number>();

  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const upper = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));

  while (cursor <= upper) {
    points.set(dayKey(cursor), 0);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  events.forEach((event) => {
    const key = dayKey(event.scannedAt);
    points.set(key, (points.get(key) ?? 0) + 1);
  });

  return [...points.entries()].map(([day, scans]) => ({ day, scans }));
}

function getTopQrCodes(events: ScanEventForSummary[]): TopQrRow[] {
  const grouped = new Map<string, TopQrRow>();

  events.forEach((event) => {
    const previous = grouped.get(event.qrCode.id);
    if (!previous) {
      grouped.set(event.qrCode.id, {
        qrCodeId: event.qrCode.id,
        name: event.qrCode.name,
        slug: event.qrCode.slug,
        scans: 1,
      });
      return;
    }

    previous.scans += 1;
  });

  return [...grouped.values()]
    .sort((left, right) => right.scans - left.scans || left.name.localeCompare(right.name))
    .slice(0, 5);
}

export function buildAnalyticsSummary(params: {
  events: ScanEventForSummary[];
  activeQrCodes: number;
  from: Date;
  to: Date;
  now: Date;
}): AnalyticsSummary {
  const { events, activeQrCodes, from, to, now } = params;
  const last24hFloor = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const scansLast24Hours = events.filter((event) => event.scannedAt >= last24hFloor).length;

  return {
    kpis: {
      totalScans: events.length,
      uniqueScans: getUniqueScanCount(events),
      activeQrCodes,
      scansLast24Hours,
    },
    dailySeries: getDailySeries(events, from, to),
    topQrCodes: getTopQrCodes(events),
  };
}

export type { AnalyticsSummary, ScanEventForSummary };
