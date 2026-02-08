export type Locale = "en" | "pl";

export const translations = {
  en: {
    nav: {
      features: "Features",
      howItWorks: "How It Works",
      pricing: "Pricing",
      signIn: "Sign In",
      getStarted: "Get Started",
      dashboard: "Dashboard",
    },
    hero: {
      badge: "Now in Public Beta",
      titleStart: "QR Codes That ",
      titleHighlight: "Evolve",
      titleEnd: " With Your Business",
      description:
        "Create dynamic QR codes with editable destinations and real-time scan analytics. Change URLs on the fly — no reprinting, no hassle.",
      ctaPrimary: "Start for Free",
      ctaSecondary: "View Dashboard",
      ctaDashboard: "Go to Dashboard",
    },
    stats: {
      uptimeSla: "Uptime SLA",
      redirectLatency: "Redirect Latency",
      exportFormat: "Export Format",
      qrCodes: "QR Codes",
      unlimited: "Unlimited",
    },
    features: {
      title: "Everything You Need to Manage QR Codes",
      subtitle:
        "From creation to analytics, our platform gives you full control over your dynamic QR codes.",
      items: [
        {
          title: "Dynamic Destinations",
          description:
            "Change where your QR code points at any time — no need to reprint. Update URLs instantly from the dashboard.",
        },
        {
          title: "Real-Time Analytics",
          description:
            "Track total scans, unique visitors, daily trends, and top-performing codes with built-in analytics.",
        },
        {
          title: "One-Click Export",
          description:
            "Download QR code images for print or digital use, and export scan data to CSV for deeper analysis.",
        },
        {
          title: "Secure & Private",
          description:
            "Each user owns their QR codes. Supabase auth with email/password or Google sign-in keeps data safe.",
        },
        {
          title: "Geo & Device Insights",
          description:
            "See where scans originate — country, city, referrer, and user-agent data captured on every scan.",
        },
        {
          title: "Bulk Management",
          description:
            "Create, search, filter, enable, or disable QR codes in bulk from a single streamlined dashboard.",
        },
      ],
    },
    howItWorks: {
      title: "Up and Running in 3 Steps",
      subtitle:
        "No complex setup. Create your first dynamic QR code in under a minute.",
      steps: [
        {
          title: "Create a QR Code",
          description:
            "Give it a name, a unique slug, and a destination URL. Toggle it active or inactive.",
        },
        {
          title: "Share & Print",
          description:
            "Download the QR image and place it on flyers, packaging, menus, or digital channels.",
        },
        {
          title: "Track & Optimize",
          description:
            "Watch scans roll in on the analytics dashboard. Filter by date, QR code, or bot traffic.",
        },
      ],
      dynamicTitle: "What Makes a QR Code Dynamic?",
      dynamicDescription:
        "A traditional QR code encodes a fixed URL directly into its pattern — once printed, it can never change. A dynamic QR code is different: it points to a short redirect URL hosted on our servers (e.g. yoursite.com/r/promo). When someone scans it, our server redirects them to the actual destination you've configured in the dashboard. Because the QR pattern itself never changes, you can update the destination URL at any time — without reprinting a single code.",
      dynamicPoints: [
        "The QR image always stays the same — only the redirect target changes",
        "Update destinations instantly from the dashboard, even after printing",
        "Deactivate a code with one click if a campaign ends or a link expires",
        "One short URL per code means cleaner, smaller QR patterns that scan faster",
      ],
      trackingTitle: "How Scan Tracking Works",
      trackingDescription:
        "Every time someone scans your dynamic QR code, the request passes through our redirect server before reaching the final destination. In that brief moment, we capture anonymous scan metadata — no personal data, just the facts you need to measure performance:",
      trackingPoints: [
        "Timestamp — know exactly when each scan happened, down to the second",
        "Geo-location — country and city derived from the scanner's IP address",
        "Device & browser — user-agent string reveals OS, browser, and device type",
        "Referrer — see if the scan came from a camera app, social media, or a web browser",
        "Bot detection — automatically flag non-human traffic so your analytics stay clean",
        "Daily & cumulative trends — charts and tables update in real time on your dashboard",
      ],
    },
    dashboardPreview: {
      title: "A Dashboard Built for Clarity",
      subtitle:
        "See your scans, manage codes, and export reports — all from one place.",
    },
    pricing: {
      title: "Simple, Transparent Pricing",
      subtitle: "Start free and scale as you grow. No hidden fees.",
      mostPopular: "Most Popular",
      plans: [
        {
          name: "Starter",
          price: "Free",
          period: "",
          description: "For individuals getting started with dynamic QR codes.",
          features: [
            "Up to 10 QR codes",
            "Basic scan analytics",
            "QR image download",
            "Email support",
          ],
          cta: "Get Started Free",
        },
        {
          name: "Pro",
          price: "$19",
          period: "/month",
          description:
            "For growing teams that need advanced analytics and more codes.",
          features: [
            "Unlimited QR codes",
            "Advanced analytics & filtering",
            "CSV export",
            "Geo & device insights",
            "Bot filtering",
            "Priority support",
          ],
          cta: "Start Free Trial",
        },
        {
          name: "Enterprise",
          price: "Custom",
          period: "",
          description:
            "For organizations with custom needs, SLAs, and dedicated support.",
          features: [
            "Everything in Pro",
            "Custom integrations",
            "Dedicated account manager",
            "SSO / SAML",
            "99.99% uptime SLA",
            "On-premise option",
          ],
          cta: "Contact Sales",
        },
      ],
    },
    finalCta: {
      title: "Ready to Make Your QR Codes Smarter?",
      subtitle:
        "Join thousands of businesses using dynamic QR codes to drive engagement and track results.",
      button: "Get Started — It's Free",
    },
    footer: {
      rights: "powered by AiPulse Public beta v. 0.91",
    },
    auth: {
      welcomeTitle: "Welcome to DynamicQR",
      signInSubtitle: "Sign in to access your dashboard",
      signUpSubtitle: "Create an account to get started",
      continueWithGoogle: "Continue with Google",
      orContinueWithEmail: "or continue with email",
      tabSignIn: "Sign In",
      tabSignUp: "Sign Up",
      email: "Email",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passwordPlaceholderSignIn: "Your password",
      passwordPlaceholderSignUp: "Min. 8 characters",
      buttonSignIn: "Sign In",
      buttonSignUp: "Create Account",
      processing: "Processing...",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      signUp: "Sign up",
      signIn: "Sign in",
      errorGeneric: "Something went wrong. Please try again.",
      errorGoogle: "Unable to start Google sign-in.",
    },
    dashboard: {
      title: "Dashboard",
      signedInAs: "Signed in as",
      signOut: "Sign out",
      tabAnalytics: "Analytics",
      tabQrCodes: "QR Codes",
      from: "From",
      to: "To",
      qrCode: "QR code",
      botFilter: "Bot filter",
      allQrCodes: "All QR codes",
      excludeBots: "Exclude bots",
      refresh: "Refresh",
      exportCsv: "Export CSV",
      applyFilters: "Apply filters",
      totalScans: "TOTAL SCANS",
      uniqueScans: "UNIQUE SCANS",
      activeQrCodes: "ACTIVE QR CODES",
      scans24h: "SCANS (24H)",
      dailyScans: "Daily scans",
      day: "Day",
      scans: "Scans",
      topQrCodes: "Top QR codes",
      name: "Name",
      slug: "Slug",
      createQrCode: "Create QR Code",
      destinationUrl: "Destination URL",
      active: "Active",
      createQrCodeButton: "Create QR code",
      myQrCodes: "My QR Codes",
      total: "total",
      searchPlaceholder: "Search by name, slug, or destination",
      allStatuses: "All statuses",
      created: "Created",
      status: "Status",
      actions: "Actions",
      download: "Download",
      edit: "Edit",
      inactive: "Inactive",
    },
  },
  pl: {
    nav: {
      features: "Funkcje",
      howItWorks: "Jak to działa",
      pricing: "Cennik",
      signIn: "Zaloguj się",
      getStarted: "Rozpocznij",
      dashboard: "Panel",
    },
    hero: {
      badge: "Publiczna Beta",
      titleStart: "Kody QR, które ",
      titleHighlight: "ewoluują",
      titleEnd: " razem z Twoim biznesem",
      description:
        "Twórz dynamiczne kody QR z edytowalnymi adresami URL i analityką skanów w czasie rzeczywistym. Zmieniaj linki w locie — bez ponownego drukowania.",
      ctaPrimary: "Zacznij za darmo",
      ctaSecondary: "Zobacz panel",
      ctaDashboard: "Przejdź do panelu",
    },
    stats: {
      uptimeSla: "SLA dostępności",
      redirectLatency: "Opóźnienie przekierowania",
      exportFormat: "Format eksportu",
      qrCodes: "Kody QR",
      unlimited: "Bez limitu",
    },
    features: {
      title: "Wszystko, czego potrzebujesz do zarządzania kodami QR",
      subtitle:
        "Od tworzenia po analitykę — nasza platforma daje Ci pełną kontrolę nad dynamicznymi kodami QR.",
      items: [
        {
          title: "Dynamiczne przekierowania",
          description:
            "Zmień cel kodu QR w dowolnym momencie — bez konieczności ponownego druku. Aktualizuj adresy URL natychmiast z panelu.",
        },
        {
          title: "Analityka w czasie rzeczywistym",
          description:
            "Śledź łączną liczbę skanów, unikalnych odwiedzających, dzienne trendy i najlepsze kody dzięki wbudowanej analityce.",
        },
        {
          title: "Eksport jednym kliknięciem",
          description:
            "Pobieraj obrazy kodów QR do druku lub użytku cyfrowego i eksportuj dane skanów do CSV w celu głębszej analizy.",
        },
        {
          title: "Bezpieczeństwo i prywatność",
          description:
            "Każdy użytkownik jest właścicielem swoich kodów QR. Autoryzacja Supabase z e-mailem/hasłem lub logowaniem Google chroni dane.",
        },
        {
          title: "Dane geograficzne i o urządzeniach",
          description:
            "Zobacz, skąd pochodzą skany — kraj, miasto, źródło odesłania i dane user-agent rejestrowane przy każdym skanie.",
        },
        {
          title: "Zarządzanie masowe",
          description:
            "Twórz, wyszukuj, filtruj, włączaj lub wyłączaj kody QR masowo z jednego, usprawnionego panelu.",
        },
      ],
    },
    howItWorks: {
      title: "Gotowy w 3 krokach",
      subtitle:
        "Bez skomplikowanej konfiguracji. Stwórz swój pierwszy dynamiczny kod QR w mniej niż minutę.",
      steps: [
        {
          title: "Stwórz kod QR",
          description:
            "Nadaj mu nazwę, unikalny slug i docelowy URL. Przełącz na aktywny lub nieaktywny.",
        },
        {
          title: "Udostępnij i drukuj",
          description:
            "Pobierz obraz QR i umieść go na ulotkach, opakowaniach, menu lub kanałach cyfrowych.",
        },
        {
          title: "Śledź i optymalizuj",
          description:
            "Obserwuj napływające skany na panelu analitycznym. Filtruj po dacie, kodzie QR lub ruchu botów.",
        },
      ],
      dynamicTitle: "Co sprawia, że kod QR jest dynamiczny?",
      dynamicDescription:
        "Tradycyjny kod QR koduje stały URL bezpośrednio w swoim wzorze — po wydrukowaniu nie można go już zmienić. Dynamiczny kod QR działa inaczej: wskazuje na krótki adres przekierowania hostowany na naszych serwerach (np. yoursite.com/r/promo). Gdy ktoś go zeskanuje, nasz serwer przekierowuje go na właściwy adres docelowy skonfigurowany w panelu. Ponieważ sam wzór QR nigdy się nie zmienia, możesz aktualizować docelowy URL w dowolnym momencie — bez ponownego drukowania ani jednego kodu.",
      dynamicPoints: [
        "Obraz QR zawsze pozostaje taki sam — zmienia się tylko cel przekierowania",
        "Aktualizuj adresy docelowe natychmiast z panelu, nawet po wydrukowaniu",
        "Dezaktywuj kod jednym kliknięciem, gdy kampania się kończy lub link wygasa",
        "Jeden krótki URL na kod oznacza czystsze, mniejsze wzory QR, które skanują się szybciej",
      ],
      trackingTitle: "Jak działa śledzenie skanów",
      trackingDescription:
        "Za każdym razem, gdy ktoś skanuje Twój dynamiczny kod QR, żądanie przechodzi przez nasz serwer przekierowań, zanim dotrze do docelowej strony. W tym krótkim momencie przechwytujemy anonimowe metadane skanu — żadnych danych osobowych, tylko fakty potrzebne do mierzenia skuteczności:",
      trackingPoints: [
        "Znacznik czasu — dokładna informacja, kiedy nastąpił każdy skan, co do sekundy",
        "Geolokalizacja — kraj i miasto na podstawie adresu IP skanującego",
        "Urządzenie i przeglądarka — ciąg user-agent ujawnia system operacyjny, przeglądarkę i typ urządzenia",
        "Źródło odesłania — sprawdź, czy skan pochodzi z aplikacji aparatu, mediów społecznościowych czy przeglądarki",
        "Wykrywanie botów — automatyczne oznaczanie ruchu nieludzkiego, aby analityka była czysta",
        "Trendy dzienne i skumulowane — wykresy i tabele aktualizują się w czasie rzeczywistym w panelu",
      ],
    },
    dashboardPreview: {
      title: "Panel stworzony z myślą o przejrzystości",
      subtitle:
        "Przeglądaj skany, zarządzaj kodami i eksportuj raporty — wszystko w jednym miejscu.",
    },
    pricing: {
      title: "Prosty, przejrzysty cennik",
      subtitle:
        "Zacznij za darmo i skaluj w miarę rozwoju. Bez ukrytych opłat.",
      mostPopular: "Najpopularniejszy",
      plans: [
        {
          name: "Starter",
          price: "Za darmo",
          period: "",
          description:
            "Dla osób rozpoczynających przygodę z dynamicznymi kodami QR.",
          features: [
            "Do 10 kodów QR",
            "Podstawowa analityka skanów",
            "Pobieranie obrazów QR",
            "Wsparcie e-mail",
          ],
          cta: "Zacznij za darmo",
        },
        {
          name: "Pro",
          price: "$19",
          period: "/miesiąc",
          description:
            "Dla rozwijających się zespołów potrzebujących zaawansowanej analityki.",
          features: [
            "Nieograniczona liczba kodów QR",
            "Zaawansowana analityka i filtrowanie",
            "Eksport CSV",
            "Dane geograficzne i o urządzeniach",
            "Filtrowanie botów",
            "Priorytetowe wsparcie",
          ],
          cta: "Rozpocznij okres próbny",
        },
        {
          name: "Enterprise",
          price: "Indywidualnie",
          period: "",
          description:
            "Dla organizacji z indywidualnymi potrzebami, SLA i dedykowanym wsparciem.",
          features: [
            "Wszystko z planu Pro",
            "Niestandardowe integracje",
            "Dedykowany opiekun konta",
            "SSO / SAML",
            "SLA dostępności 99,99%",
            "Opcja on-premise",
          ],
          cta: "Skontaktuj się",
        },
      ],
    },
    finalCta: {
      title: "Gotowy, by Twoje kody QR były inteligentniejsze?",
      subtitle:
        "Dołącz do tysięcy firm używających dynamicznych kodów QR do zwiększania zaangażowania i śledzenia wyników.",
      button: "Zacznij za darmo",
    },
    footer: {
      rights: "powered by AiPulse Public beta v. 0.91",
    },
    auth: {
      welcomeTitle: "Witaj w DynamicQR",
      signInSubtitle: "Zaloguj się, aby uzyskać dostęp do panelu",
      signUpSubtitle: "Utwórz konto, aby rozpocząć",
      continueWithGoogle: "Kontynuuj z Google",
      orContinueWithEmail: "lub kontynuuj z e-mailem",
      tabSignIn: "Logowanie",
      tabSignUp: "Rejestracja",
      email: "E-mail",
      emailPlaceholder: "ty@przykład.com",
      password: "Hasło",
      passwordPlaceholderSignIn: "Twoje hasło",
      passwordPlaceholderSignUp: "Min. 8 znaków",
      buttonSignIn: "Zaloguj się",
      buttonSignUp: "Utwórz konto",
      processing: "Przetwarzanie...",
      noAccount: "Nie masz konta?",
      hasAccount: "Masz już konto?",
      signUp: "Zarejestruj się",
      signIn: "Zaloguj się",
      errorGeneric: "Coś poszło nie tak. Spróbuj ponownie.",
      errorGoogle: "Nie udało się rozpocząć logowania przez Google.",
    },
    dashboard: {
      title: "Panel",
      signedInAs: "Zalogowano jako",
      signOut: "Wyloguj się",
      tabAnalytics: "Analityka",
      tabQrCodes: "Kody QR",
      from: "Od",
      to: "Do",
      qrCode: "Kod QR",
      botFilter: "Filtr botów",
      allQrCodes: "Wszystkie kody QR",
      excludeBots: "Wyklucz boty",
      refresh: "Odśwież",
      exportCsv: "Eksport CSV",
      applyFilters: "Zastosuj filtry",
      totalScans: "ŁĄCZNE SKANY",
      uniqueScans: "UNIKALNE SKANY",
      activeQrCodes: "AKTYWNE KODY QR",
      scans24h: "SKANY (24H)",
      dailyScans: "Dzienne skany",
      day: "Dzień",
      scans: "Skany",
      topQrCodes: "Najlepsze kody QR",
      name: "Nazwa",
      slug: "Slug",
      createQrCode: "Stwórz kod QR",
      destinationUrl: "Docelowy URL",
      active: "Aktywny",
      createQrCodeButton: "Stwórz kod QR",
      myQrCodes: "Moje kody QR",
      total: "łącznie",
      searchPlaceholder: "Szukaj po nazwie, slugu lub adresie",
      allStatuses: "Wszystkie statusy",
      created: "Utworzono",
      status: "Status",
      actions: "Akcje",
      download: "Pobierz",
      edit: "Edytuj",
      inactive: "Nieaktywny",
    },
  },
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DeepString<T> = T extends string ? string : T extends readonly any[] ? Array<DeepString<T[number]>> : { [K in keyof T]: DeepString<T[K]> };

export type Translations = DeepString<(typeof translations)["en"]>;
