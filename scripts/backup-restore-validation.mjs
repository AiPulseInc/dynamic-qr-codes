#!/usr/bin/env node

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const runId = Date.now();
  const profileId = "00000000-0000-0000-0000-00000000b501";
  const slug = `backup-restore-${runId}`;
  const scanReferrer = `https://validation.local/${runId}`;
  const backupBundle = {};

  try {
    await prisma.$executeRaw`
      INSERT INTO profiles (id, email)
      VALUES (${profileId}::uuid, ${"backup-restore-validation@local.test"})
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
    `;

    const qrCode = await prisma.qrCode.create({
      data: {
        userId: profileId,
        name: "Backup Restore Validation",
        slug,
        destinationUrl: "https://example.com/backup-restore-validation",
        isActive: true,
      },
    });

    const scanEvent = await prisma.scanEvent.create({
      data: {
        qrCodeId: qrCode.id,
        userId: profileId,
        ipHash: "backup-validation-ip",
        userAgent: "backup-validation-agent",
        referrer: scanReferrer,
        country: "DE",
        city: "Berlin",
        isBot: false,
      },
    });

    backupBundle.profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });
    backupBundle.qrCode = qrCode;
    backupBundle.scanEvent = scanEvent;

    await prisma.scanEvent.delete({
      where: { id: scanEvent.id },
    });
    await prisma.qrCode.delete({
      where: { id: qrCode.id },
    });

    await prisma.qrCode.create({
      data: {
        id: backupBundle.qrCode.id,
        userId: backupBundle.qrCode.userId,
        name: backupBundle.qrCode.name,
        slug: backupBundle.qrCode.slug,
        destinationUrl: backupBundle.qrCode.destinationUrl,
        isActive: backupBundle.qrCode.isActive,
        createdAt: backupBundle.qrCode.createdAt,
        updatedAt: backupBundle.qrCode.updatedAt,
      },
    });

    await prisma.scanEvent.create({
      data: {
        id: backupBundle.scanEvent.id,
        qrCodeId: backupBundle.scanEvent.qrCodeId,
        userId: backupBundle.scanEvent.userId,
        scannedAt: backupBundle.scanEvent.scannedAt,
        ipHash: backupBundle.scanEvent.ipHash,
        userAgent: backupBundle.scanEvent.userAgent,
        referrer: backupBundle.scanEvent.referrer,
        country: backupBundle.scanEvent.country,
        city: backupBundle.scanEvent.city,
        isBot: backupBundle.scanEvent.isBot,
      },
    });

    const restoredQr = await prisma.qrCode.findUnique({
      where: { id: backupBundle.qrCode.id },
    });
    const restoredScan = await prisma.scanEvent.findUnique({
      where: { id: backupBundle.scanEvent.id },
    });

    const success =
      Boolean(restoredQr) &&
      Boolean(restoredScan) &&
      restoredQr.slug === backupBundle.qrCode.slug &&
      restoredScan.referrer === scanReferrer;

    console.log(
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          runId,
          success,
          restoredQrId: restoredQr?.id ?? null,
          restoredScanId: restoredScan?.id ?? null,
          restoredReferrer: restoredScan?.referrer ?? null,
        },
        null,
        2,
      ),
    );

    if (!success) {
      process.exit(1);
    }
  } finally {
    if (backupBundle.scanEvent?.id) {
      await prisma.scanEvent
        .delete({
          where: { id: backupBundle.scanEvent.id },
        })
        .catch(() => {});
    }
    if (backupBundle.qrCode?.id) {
      await prisma.qrCode
        .delete({
          where: { id: backupBundle.qrCode.id },
        })
        .catch(() => {});
    }
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
