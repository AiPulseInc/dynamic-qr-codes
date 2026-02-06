import Link from "next/link";

import {
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
} from "@/app/login/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/dashboard";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 py-12">
      <div className="w-full rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-zinc-900">Sign in to Dynamic QR</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Use email/password or Google to access your dashboard.
        </p>

        {params.error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.error}
          </p>
        ) : null}

        {params.message ? (
          <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {params.message}
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <form action={signInWithPassword} className="space-y-3 rounded-xl border border-zinc-200 p-4">
            <h2 className="text-lg font-medium text-zinc-900">Sign in</h2>
            <input type="hidden" name="next" value={nextPath} />
            <label className="block text-sm text-zinc-700">
              Email
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                type="email"
                name="email"
                required
              />
            </label>
            <label className="block text-sm text-zinc-700">
              Password
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                type="password"
                name="password"
                required
              />
            </label>
            <button
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
              type="submit"
            >
              Sign in
            </button>
          </form>

          <form action={signUpWithPassword} className="space-y-3 rounded-xl border border-zinc-200 p-4">
            <h2 className="text-lg font-medium text-zinc-900">Sign up</h2>
            <input type="hidden" name="next" value={nextPath} />
            <label className="block text-sm text-zinc-700">
              Email
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                type="email"
                name="email"
                required
              />
            </label>
            <label className="block text-sm text-zinc-700">
              Password
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                type="password"
                name="password"
                minLength={8}
                required
              />
            </label>
            <button
              className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
              type="submit"
            >
              Create account
            </button>
          </form>
        </div>

        <form action={signInWithGoogle} className="mt-4">
          <input type="hidden" name="next" value={nextPath} />
          <button
            className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
            type="submit"
          >
            Continue with Google
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-600">
          Back to <Link href="/" className="underline">home</Link>.
        </p>
      </div>
    </main>
  );
}
