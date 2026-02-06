import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-16">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">MVP Sprint 1</p>
        <h1 className="mt-3 text-4xl font-semibold text-zinc-900">Dynamic QR Codes Platform</h1>
        <p className="mt-4 max-w-2xl text-base text-zinc-600">
          Authentication, user isolation, and database foundation are now scaffolded. Continue
          with dashboard and redirect work in the next sprint tasks.
        </p>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          className="rounded-xl border border-zinc-200 p-5 hover:bg-zinc-50"
          href="/login"
        >
          <h2 className="text-lg font-medium text-zinc-900">Authentication</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Sign in with email/password or Google provider.
          </p>
        </Link>

        <Link
          className="rounded-xl border border-zinc-200 p-5 hover:bg-zinc-50"
          href="/dashboard"
        >
          <h2 className="text-lg font-medium text-zinc-900">Dashboard</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Protected route for user-owned data and upcoming QR management.
          </p>
        </Link>
      </section>

      <section className="mt-10 rounded-xl border border-zinc-200 p-5">
        <h2 className="text-lg font-medium text-zinc-900">Health checks</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-600">
          <li>
            <code>/api/health</code> for service status
          </li>
          <li>
            <code>/api/health/db</code> for database connectivity
          </li>
        </ul>
      </section>
    </main>
  );
}
