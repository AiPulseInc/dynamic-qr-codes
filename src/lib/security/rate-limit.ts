type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type Bucket = {
  count: number;
  windowStartMs: number;
};

const rateLimitState = globalThis as typeof globalThis & {
  __dynamicQrRateLimitBuckets?: Map<string, Bucket>;
};

function getBuckets(): Map<string, Bucket> {
  if (!rateLimitState.__dynamicQrRateLimitBuckets) {
    rateLimitState.__dynamicQrRateLimitBuckets = new Map<string, Bucket>();
  }

  return rateLimitState.__dynamicQrRateLimitBuckets;
}

export function consumeRateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
  nowMs?: number;
}): RateLimitResult {
  const now = params.nowMs ?? Date.now();
  const buckets = getBuckets();
  const existing = buckets.get(params.key);

  if (!existing || now - existing.windowStartMs >= params.windowMs) {
    buckets.set(params.key, {
      count: 1,
      windowStartMs: now,
    });

    return {
      allowed: true,
      remaining: Math.max(0, params.limit - 1),
      retryAfterSeconds: Math.ceil(params.windowMs / 1000),
    };
  }

  if (existing.count >= params.limit) {
    const retryAfterMs = params.windowMs - (now - existing.windowStartMs);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  existing.count += 1;
  buckets.set(params.key, existing);

  return {
    allowed: true,
    remaining: Math.max(0, params.limit - existing.count),
    retryAfterSeconds: Math.ceil((params.windowMs - (now - existing.windowStartMs)) / 1000),
  };
}

export function resetRateLimitState(): void {
  getBuckets().clear();
}
