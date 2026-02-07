import LandingContent from "@/app/components/LandingContent";
import { LanguageProvider } from "@/app/i18n/LanguageContext";
import { getAuthenticatedUser } from "@/lib/auth/user";

type HomePageProps = {
  searchParams: Promise<{
    auth?: string;
    next?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const [user, params] = await Promise.all([getAuthenticatedUser(), searchParams]);
  const authAction = params.auth === "signin" || params.auth === "signup" ? params.auth : undefined;
  const authNext = params.next && params.next.startsWith("/") ? params.next : undefined;

  return (
    <LanguageProvider>
      <LandingContent
        isAuthenticated={!!user}
        authAction={authAction}
        authNext={authNext}
      />
    </LanguageProvider>
  );
}
