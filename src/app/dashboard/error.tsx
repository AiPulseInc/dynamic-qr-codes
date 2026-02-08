"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center bg-background px-4 py-6">
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <h2 className="text-lg font-semibold text-red-400">Something went wrong</h2>
        <p className="mt-2 text-sm text-text-muted">
          {error.digest ? `Error ID: ${error.digest}` : "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary hover:text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
