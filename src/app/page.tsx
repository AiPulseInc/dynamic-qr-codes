import Link from "next/link";

import { getAuthenticatedUser } from "@/lib/auth/user";

export default async function HomePage() {
  const user = await getAuthenticatedUser();

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-16">
      <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm">
        {user ? (
          <>
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="text-zinc-700">{user.email}</span>
          </>
        ) : (
          <>
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-zinc-500">Anonymous</span>
          </>
        )}
      </div>

      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Dynamic QR Codes</p>
        <h1 className="mt-3 text-4xl font-semibold text-zinc-900">Dynamic QR Codes Platform</h1>
        <p className="mt-4 max-w-2xl text-base text-zinc-600">
          Create and manage dynamic QR codes with editable destination URLs and real-time scan analytics.
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
