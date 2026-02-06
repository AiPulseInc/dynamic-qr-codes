export type AnalyticsFilters = {
  from: Date;
  to: Date;
  qrCodeId: string | null;
  excludeBots: boolean;
};

export type AnalyticsFilterParams = {
  fromInput: string;
  toInput: string;
  qrCodeId: string | null;
  excludeBots: boolean;
};

function toDateInputValue(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function parseDate(raw: string | null): Date | null {
  if (!raw) {
    return null;
  }

  const date = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function parseEndDate(raw: string | null): Date | null {
  if (!raw) {
    return null;
  }

  const date = new Date(`${raw}T23:59:59.999Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function parseAnalyticsFilters(raw: {
  from?: string;
  to?: string;
  qr?: string;
  bots?: string;
}): AnalyticsFilters & AnalyticsFilterParams {
  const now = new Date();
  const fallbackFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const parsedFrom = parseDate(raw.from ?? null) ?? fallbackFrom;
  const parsedTo = parseEndDate(raw.to ?? null) ?? now;
  const from = parsedFrom <= parsedTo ? parsedFrom : parsedTo;
  const to = parsedFrom <= parsedTo ? parsedTo : parsedFrom;

  const trimmedQrId = raw.qr?.trim() ?? "";
  const qrCodeId = trimmedQrId.length > 0 ? trimmedQrId : null;
  const excludeBots = raw.bots === "0" ? false : true;

  return {
    from,
    to,
    qrCodeId,
    excludeBots,
    fromInput: toDateInputValue(from),
    toInput: toDateInputValue(to),
  };
}
