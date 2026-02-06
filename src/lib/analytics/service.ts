import { prisma } from "@/lib/prisma";
import { buildAnalyticsSummary } from "@/lib/analytics/summary";
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
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
    },
  });
}

export async function getUserAnalyticsSnapshot(userId: string, filters: AnalyticsFilters) {
  await assertFilterOwnership(userId, filters.qrCodeId);
  const whereClause = toWhereClause(userId, filters);

  const [events, activeQrCodes] = await Promise.all([
    prisma.scanEvent.findMany({
      where: whereClause,
      orderBy: {
        scannedAt: "asc",
      },
      select: {
        id: true,
        scannedAt: true,
        ipHash: true,
        isBot: true,
        qrCode: {
          select: {
            id: true,
            name: true,
            slug: true,
            destinationUrl: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.qrCode.count({
      where: {
        userId,
        isActive: true,
      },
    }),
  ]);

  return buildAnalyticsSummary({
    events,
    activeQrCodes,
    from: filters.from,
    to: filters.to,
    now: new Date(),
  });
}

export async function getUserAnalyticsCsvRows(userId: string, filters: AnalyticsFilters) {
  await assertFilterOwnership(userId, filters.qrCodeId);
  const whereClause = toWhereClause(userId, filters);

  return prisma.scanEvent.findMany({
    where: whereClause,
    orderBy: {
      scannedAt: "desc",
    },
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
