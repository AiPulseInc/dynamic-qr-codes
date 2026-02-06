import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoUserId = "00000000-0000-0000-0000-000000000001";

async function main() {
  await prisma.profile.upsert({
    where: { id: demoUserId },
    update: {},
    create: {
      id: demoUserId,
      email: "demo@dynamic-qr.local",
    },
  });

  await prisma.qrCode.upsert({
    where: { slug: "welcome-qr" },
    update: {
      destinationUrl: "https://example.com/welcome",
      isActive: true,
    },
    create: {
      userId: demoUserId,
      name: "Welcome QR",
      slug: "welcome-qr",
      destinationUrl: "https://example.com/welcome",
      isActive: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
