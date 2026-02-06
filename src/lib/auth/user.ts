import type { User } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function fallbackEmail(user: User): string {
  return `${user.id}@local.dynamic-qr.invalid`;
}

export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function getAuthenticatedProfile() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  const email = user.email ?? fallbackEmail(user);

  const profile = await prisma.profile.upsert({
    where: {
      id: user.id,
    },
    update: {
      email,
    },
    create: {
      id: user.id,
      email,
    },
  });

  return {
    id: profile.id,
    email: profile.email,
  };
}
