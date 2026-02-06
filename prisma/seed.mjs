import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoUserId = "00000000-0000-0000-0000-000000000001";
const demoSlug = "welcome-qr";

async function main() {
  await prisma.$executeRaw`
    INSERT INTO profiles (id, email)
    VALUES (${demoUserId}::uuid, ${"demo@dynamic-qr.local"})
    ON CONFLICT (id)
    DO UPDATE SET email = EXCLUDED.email
  `;

  await prisma.$executeRaw`
    INSERT INTO qr_codes (user_id, name, slug, destination_url, is_active)
    VALUES (${demoUserId}::uuid, ${"Welcome QR"}, ${demoSlug}, ${"https://example.com/welcome"}, true)
    ON CONFLICT (slug)
    DO UPDATE
      SET destination_url = EXCLUDED.destination_url,
          is_active = EXCLUDED.is_active
  `;
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
