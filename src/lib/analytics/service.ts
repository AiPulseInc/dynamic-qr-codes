import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getOwnedQrCodeById } from "@/lib/qr/service";

type AnalyticsFilters = {
  from: Date;
  to: Date;
  qrCodeId: string | null;
  excludeBots: boolean;
};

function toWhereClause(userId: string, filters: AnalyticsFilters) {
  return {
    userId,
    scannedAt: {
      gte: filters.from,
      lte: filters.to,
    },
    ...(filters.qrCodeId ? { qrCodeId: filters.qrCodeId } : {}),
    ...(filters.excludeBots ? { isBot: false } : {}),
  };
}

async function assertFilterOwnership(userId: string, qrCodeId: string | null) {
  if (!qrCodeId) {
    return;
  }

  await getOwnedQrCodeById(userId, qrCodeId);
}

export async function listOwnedQrCodeOptions(userId: string) {
  return prisma.qrCode.findMany({
    where: {
      userId,
    },
    orderBy: {
      name: "asc",
    },
    take: 200,
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
    },
  });
}

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

function buildDailySeriesWithGaps(
  dbRows: { day: string; scans: number }[],
  from: Date,
  to: Date,
): DailyPoint[] {
  const points = new Map<string, number>();
  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const upper = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));

  while (cursor <= upper) {
    points.set(cursor.toISOString().slice(0, 10), 0);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  for (const row of dbRows) {
    points.set(row.day, row.scans);
  }

  return [...points.entries()].map(([day, scans]) => ({ day, scans }));
}

export async function getUserAnalyticsSnapshot(userId: string, filters: AnalyticsFilters): Promise<AnalyticsSummary> {
  await assertFilterOwnership(userId, filters.qrCodeId);

  const now = new Date();
  const last24hFloor = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const qrFilter = filters.qrCodeId
    ? Prisma.sql`AND se.qr_code_id = ${filters.qrCodeId}::uuid`
    : Prisma.empty;
  const botFilter = filters.excludeBots
    ? Prisma.sql`AND se.is_bot = false`
    : Prisma.empty;

  const [
    kpiRows,
    dailyRows,
    topQrRows,
    activeQrCodes,
  ] = await Promise.all([
    // KPIs: totalScans, uniqueScans, scansLast24Hours in one query
    prisma.$queryRaw<
      { total_scans: bigint; unique_scans: bigint; scans_24h: bigint }[]
    >(Prisma.sql`
      SELECT
        COUNT(*)::bigint AS total_scans,
        COUNT(DISTINCT ip_hash)::bigint AS unique_scans,
        COUNT(*) FILTER (WHERE se.scanned_at >= ${last24hFloor})::bigint AS scans_24h
      FROM scan_events se
      WHERE se.user_id = ${userId}::uuid
        AND se.scanned_at >= ${filters.from}
        AND se.scanned_at <= ${filters.to}
        ${qrFilter}
        ${botFilter}
    `),

    // Daily series
    prisma.$queryRaw<
      { day: string; scans: bigint }[]
    >(Prisma.sql`
      SELECT
        to_char(se.scanned_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
        COUNT(*)::bigint AS scans
      FROM scan_events se
      WHERE se.user_id = ${userId}::uuid
        AND se.scanned_at >= ${filters.from}
        AND se.scanned_at <= ${filters.to}
        ${qrFilter}
        ${botFilter}
      GROUP BY day
      ORDER BY day
    `),

    // Top QR codes
    prisma.$queryRaw<
      { qr_code_id: string; name: string; slug: string; scans: bigint }[]
    >(Prisma.sql`
      SELECT
        se.qr_code_id,
        qc.name,
        qc.slug,
        COUNT(*)::bigint AS scans
      FROM scan_events se
      JOIN qr_codes qc ON qc.id = se.qr_code_id
      WHERE se.user_id = ${userId}::uuid
        AND se.scanned_at >= ${filters.from}
        AND se.scanned_at <= ${filters.to}
        ${qrFilter}
        ${botFilter}
      GROUP BY se.qr_code_id, qc.name, qc.slug
      ORDER BY scans DESC, qc.name ASC
      LIMIT 5
    `),

    // Active QR codes count
    prisma.qrCode.count({
      where: {
        userId,
        isActive: true,
      },
    }),
  ]);

  const kpi = kpiRows[0] ?? { total_scans: BigInt(0), unique_scans: BigInt(0), scans_24h: BigInt(0) };

  return {
    kpis: {
      totalScans: Number(kpi.total_scans),
      uniqueScans: Number(kpi.unique_scans),
      activeQrCodes,
      scansLast24Hours: Number(kpi.scans_24h),
    },
    dailySeries: buildDailySeriesWithGaps(
      dailyRows.map((r) => ({ day: r.day, scans: Number(r.scans) })),
      filters.from,
      filters.to,
    ),
    topQrCodes: topQrRows.map((r) => ({
      qrCodeId: r.qr_code_id,
      name: r.name,
      slug: r.slug,
      scans: Number(r.scans),
    })),
  };
}

export type { AnalyticsSummary };

const CSV_EXPORT_MAX_ROWS = 50_000;

export async function getUserAnalyticsCsvRows(userId: string, filters: AnalyticsFilters) {
  await assertFilterOwnership(userId, filters.qrCodeId);
  const whereClause = toWhereClause(userId, filters);

  return prisma.scanEvent.findMany({
    where: whereClause,
    orderBy: {
      scannedAt: "desc",
    },
    take: CSV_EXPORT_MAX_ROWS,
    select: {
      scannedAt: true,
      ipHash: true,
      isBot: true,
      country: true,
      city: true,
      referrer: true,
      userAgent: true,
      qrCode: {
        select: {
          id: true,
          name: true,
          slug: true,
          destinationUrl: true,
        },
      },
    },
  });
}
