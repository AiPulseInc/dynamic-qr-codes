import crypto from "node:crypto";

type LogLevel = "INFO" | "WARN" | "ERROR";

export type RequestLogContext = {
  requestId: string;
  route: string;
  userId?: string;
};

function writeLog(level: LogLevel, event: string, context: RequestLogContext, data?: unknown): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    requestId: context.requestId,
    route: context.route,
    userId: context.userId,
    data: data ?? null,
  };

  if (level === "ERROR") {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === "WARN") {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.info(JSON.stringify(payload));
}

export function createRequestLogContext(params: {
  route: string;
  request: Request;
  userId?: string;
}): RequestLogContext {
  const incomingId =
    params.request.headers.get("x-request-id") ??
    params.request.headers.get("x-vercel-id") ??
    params.request.headers.get("cf-ray");

  return {
    requestId: incomingId || crypto.randomUUID(),
    route: params.route,
    userId: params.userId,
  };
}

export function logInfo(event: string, context: RequestLogContext, data?: unknown): void {
  writeLog("INFO", event, context, data);
}

export function logWarn(event: string, context: RequestLogContext, data?: unknown): void {
  writeLog("WARN", event, context, data);
}

export function logError(event: string, context: RequestLogContext, data?: unknown): void {
  writeLog("ERROR", event, context, data);
}
