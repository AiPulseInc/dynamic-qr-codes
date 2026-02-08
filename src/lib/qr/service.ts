import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { assertOwnership, QrOwnershipError } from "@/lib/qr/ownership";
export { QrOwnershipError } from "@/lib/qr/ownership";

export class QrValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QrValidationError";
  }
}

export class QrDuplicateSlugError extends Error {
  constructor() {
    super("Slug already exists. Please choose another slug.");
    this.name = "QrDuplicateSlugError";
  }
}

type QrFilters = {
  search: string;
  status: "all" | "active" | "inactive";
  page: number;
  pageSize: number;
};

type QrMutationInput = {
  name: string;
  slug: string;
  destinationUrl: string;
  isActive: boolean;
};

function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw new QrDuplicateSlugError();
  }

  throw error;
}

export async function listOwnedQrCodes(userId: string, filters: QrFilters) {
  const whereClause: Prisma.QrCodeWhereInput = {
    userId,
  };

  if (filters.search) {
    whereClause.OR = [
      {
        name: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        slug: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        destinationUrl: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (filters.status === "active") {
    whereClause.isActive = true;
  } else if (filters.status === "inactive") {
    whereClause.isActive = false;
  }

  const skip = (filters.page - 1) * filters.pageSize;

  const [items, totalCount] = await Promise.all([
    prisma.qrCode.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      take: filters.pageSize,
      skip,
      select: {
        id: true,
        name: true,
        slug: true,
        destinationUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.qrCode.count({
      where: whereClause,
    }),
  ]);

  return {
    items,
    totalCount,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.ceil(totalCount / filters.pageSize),
  };
}

export async function createOwnedQrCode(userId: string, input: QrMutationInput) {
  try {
    return await prisma.qrCode.create({
      data: {
        userId,
        name: input.name,
        slug: input.slug,
        destinationUrl: input.destinationUrl,
        isActive: input.isActive,
      },
    });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getOwnedQrCodeById(userId: string, qrCodeId: string) {
  const qrCode = await prisma.qrCode.findUnique({
    where: {
      id: qrCodeId,
    },
  });

  if (!qrCode) {
    throw new QrOwnershipError();
  }

  assertOwnership(qrCode.userId, userId);
  return qrCode;
}

export async function getOwnedQrCodeBySlug(userId: string, slug: string) {
  const qrCode = await prisma.qrCode.findUnique({
    where: {
      slug,
    },
  });

  if (!qrCode) {
    throw new QrOwnershipError();
  }

  assertOwnership(qrCode.userId, userId);
  return qrCode;
}

export async function updateOwnedQrCode(
  userId: string,
  qrCodeId: string,
  input: QrMutationInput,
) {
  await getOwnedQrCodeById(userId, qrCodeId);

  try {
    return await prisma.qrCode.update({
      where: {
        id: qrCodeId,
      },
      data: {
        name: input.name,
        slug: input.slug,
        destinationUrl: input.destinationUrl,
        isActive: input.isActive,
      },
    });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function setOwnedQrCodeStatus(userId: string, qrCodeId: string, isActive: boolean) {
  const qrCode = await getOwnedQrCodeById(userId, qrCodeId);

  if (qrCode.isActive === isActive) {
    throw new QrValidationError("Status is already set to the requested value.");
  }

  return prisma.qrCode.update({
    where: {
      id: qrCodeId,
    },
    data: {
      isActive,
    },
  });
}
