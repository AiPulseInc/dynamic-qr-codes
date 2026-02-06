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
