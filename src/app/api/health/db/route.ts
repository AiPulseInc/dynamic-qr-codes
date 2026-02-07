import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "reachable",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check DB error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        status: "error",
        database: "unreachable",
      },
      { status: 500 },
    );
  }
}
