export default function DashboardLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col bg-background px-4 py-6">
      <header className="flex items-center justify-between">
        <div>
          <div className="h-7 w-40 animate-pulse rounded bg-surface-elevated" />
          <div className="mt-1 h-4 w-56 animate-pulse rounded bg-surface-elevated" />
        </div>
        <div className="h-9 w-24 animate-pulse rounded-lg bg-surface-elevated" />
      </header>

      <nav className="mt-4 flex gap-1 border-b border-border-subtle">
        <div className="h-9 w-24 animate-pulse rounded bg-surface-elevated" />
        <div className="h-9 w-24 animate-pulse rounded bg-surface-elevated" />
      </nav>

      <div className="mt-4 space-y-4">
        <div className="h-32 animate-pulse rounded-xl border border-border-card bg-surface-elevated" />
        <div className="h-48 animate-pulse rounded-xl border border-border-card bg-surface-elevated" />
      </div>
    </main>
  );
}
