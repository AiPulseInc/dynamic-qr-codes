import { redirect } from "next/navigation";

import { signOut } from "@/app/dashboard/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  let user = null;

  try {
    const {
      data: { user: resolvedUser },
    } = await supabase.auth.getUser();
    user = resolvedUser;
  } catch {
    user = null;
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Signed in as <span className="font-medium">{user.email}</span>
          </p>
        </div>

        <form action={signOut}>
          <button
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </header>

      <section className="mt-10 rounded-xl border border-dashed border-zinc-300 p-6">
        <h2 className="text-xl font-medium text-zinc-900">Sprint 1 baseline ready</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Next sprint tasks will add QR CRUD, redirect endpoints, and scan analytics.
        </p>
      </section>
    </main>
  );
}
