import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug must be at least 3 characters.")
  .max(80, "Slug must be at most 80 characters.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may contain lowercase letters, numbers, and hyphens.");

const destinationUrlSchema = z
  .string()
  .trim()
  .url("Destination must be a valid URL.")
  .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
    message: "Destination URL must start with http:// or https://.",
  });

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters.")
  .max(120, "Name must be at most 120 characters.");

export const qrCodeInputSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  destinationUrl: destinationUrlSchema,
  isActive: z.boolean(),
});

const formLikeSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  destinationUrl: z.string().optional(),
  isActive: z.string().optional(),
});

function isEnabledFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return value === "on" || value === "true" || value === "1";
}

export function parseQrCodeFormInput(raw: Record<string, FormDataEntryValue | null>) {
  const parsedForm = formLikeSchema.parse({
    name: raw.name?.toString(),
    slug: raw.slug?.toString(),
    destinationUrl: raw.destinationUrl?.toString(),
    isActive: raw.isActive?.toString(),
  });

  return qrCodeInputSchema.parse({
    name: parsedForm.name ?? "",
    slug: parsedForm.slug ?? "",
    destinationUrl: parsedForm.destinationUrl ?? "",
    isActive: isEnabledFlag(parsedForm.isActive),
  });
}

export function parseQrCodeJsonInput(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    throw new z.ZodError([
      {
        code: "custom",
        path: [],
        message: "JSON body is required.",
      },
    ]);
  }

  const value = payload as Partial<{
    name: string;
    slug: string;
    destinationUrl: string;
    isActive: boolean;
  }>;

  return qrCodeInputSchema.parse({
    name: value.name ?? "",
    slug: value.slug ?? "",
    destinationUrl: value.destinationUrl ?? "",
    isActive: Boolean(value.isActive),
  });
}

export function parseQrStatusFilter(rawStatus: string | null): "all" | "active" | "inactive" {
  if (rawStatus === "active" || rawStatus === "inactive") {
    return rawStatus;
  }

  return "all";
}

export function parseQrSearchTerm(rawSearch: string | null): string {
  if (!rawSearch) {
    return "";
  }

  return rawSearch.trim();
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function parseQrPage(rawPage: string | null): number {
  if (!rawPage) {
    return 1;
  }

  const parsed = parseInt(rawPage, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export function parseQrPageSize(rawPageSize: string | null): number {
  if (!rawPageSize) {
    return DEFAULT_PAGE_SIZE;
  }

  const parsed = parseInt(rawPageSize, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(parsed, MAX_PAGE_SIZE);
}
