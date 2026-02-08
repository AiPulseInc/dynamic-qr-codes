type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type Bucket = {
  count: number;
  windowStartMs: number;
};

const MAX_BUCKETS = 10_000;
const CLEANUP_INTERVAL_MS = 60_000;

const rateLimitState = globalThis as typeof globalThis & {
  __dynamicQrRateLimitBuckets?: Map<string, Bucket>;
  __dynamicQrRateLimitLastCleanup?: number;
};

function getBuckets(): Map<string, Bucket> {
  if (!rateLimitState.__dynamicQrRateLimitBuckets) {
    rateLimitState.__dynamicQrRateLimitBuckets = new Map<string, Bucket>();
  }

  return rateLimitState.__dynamicQrRateLimitBuckets;
}

function evictExpired(buckets: Map<string, Bucket>, now: number, maxWindowMs: number): void {
  const lastCleanup = rateLimitState.__dynamicQrRateLimitLastCleanup ?? 0;
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }

  rateLimitState.__dynamicQrRateLimitLastCleanup = now;

  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStartMs >= maxWindowMs) {
      buckets.delete(key);
    }
  }
}

function evictOldest(buckets: Map<string, Bucket>): void {
  if (buckets.size <= MAX_BUCKETS) {
    return;
  }

  const deleteCount = buckets.size - MAX_BUCKETS;
  const iterator = buckets.keys();
  for (let i = 0; i < deleteCount; i++) {
    const next = iterator.next();
    if (next.done) break;
    buckets.delete(next.value);
  }
}

export function consumeRateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
  nowMs?: number;
}): RateLimitResult {
  const now = params.nowMs ?? Date.now();
  const buckets = getBuckets();

  evictExpired(buckets, now, params.windowMs);

  const existing = buckets.get(params.key);

  if (!existing || now - existing.windowStartMs >= params.windowMs) {
    buckets.delete(params.key);
    buckets.set(params.key, {
      count: 1,
      windowStartMs: now,
    });

    evictOldest(buckets);

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
  buckets.delete(params.key);
  buckets.set(params.key, existing);

  return {
    allowed: true,
    remaining: Math.max(0, params.limit - existing.count),
    retryAfterSeconds: Math.ceil((params.windowMs - (now - existing.windowStartMs)) / 1000),
  };
}

export function resetRateLimitState(): void {
  getBuckets().clear();
  rateLimitState.__dynamicQrRateLimitLastCleanup = 0;
}
