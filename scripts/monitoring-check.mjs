#!/usr/bin/env node

const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
const timeoutMs = Number(process.env.MONITOR_TIMEOUT_MS ?? "5000");

function withTimeout(promise, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs),
    ),
  ]);
}

async function checkEndpoint(path, expectedStatus = 200) {
  const started = performance.now();
  const response = await withTimeout(fetch(`${baseUrl}${path}`), path);
  const elapsedMs = performance.now() - started;

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return {
    path,
    status: response.status,
    ok: response.status === expectedStatus,
    elapsedMs: Number(elapsedMs.toFixed(2)),
    body,
  };
}

async function main() {
  const checks = await Promise.all([
    checkEndpoint("/api/health", 200),
    checkEndpoint("/api/health/db", 200),
  ]);

  const failed = checks.filter((check) => !check.ok);
  console.log(
    JSON.stringify(
      {
        baseUrl,
        timestamp: new Date().toISOString(),
        checks,
      },
      null,
      2,
    ),
  );

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        baseUrl,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
