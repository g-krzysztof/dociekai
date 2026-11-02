import type { NextConfig } from 'next';
import { MATH_MODULES } from './src/app/matematyka/klasa-4/data/curriculum';
import { getPublishedLessons } from './src/app/matematyka/klasa-4/data/lessons';

const nextConfig: NextConfig = {
  images: {
    // Obrazy nie przechodzą przez optymalizator Vercela (rozliczany per transformacja,
    // 5 tys./mies. na Hobby, a cache obrazów lokalnych i tak wygasa po <=31 dniach).
    // Loader z src/lib/media/loader.ts przepisuje URL-e Cloudinary na
    // `f_auto,q_auto,c_limit,w_<width>`, a pliki z public/ przepuszcza bez zmian.
    // Uwaga: przy custom loaderze `formats`, `minimumCacheTTL`, `dangerouslyAllowSVG`
    // i `remotePatterns` przestają cokolwiek robić — negocjacja formatu i jakości
    // dzieje się po stronie Cloudinary.
    loader: 'custom',
    loaderFile: './src/lib/media/loader.ts',
    // Przycięta drabinka szerokości. Domyślna ma 15 pozycji (32...3840) i dla
    // `sizes` bez jednostki `vw` Next wypluwa je wszystkie do srcset. Zestaw
    // poniżej pokrywa realne sloty w serwisie: ilustracje kursu (112-260 px),
    // karty bloga (33/50/100vw) i pełnoekranowe tła.
    imageSizes: [128, 256, 384],
    deviceSizes: [640, 828, 1080, 1920],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Optimalizacje dla statycznych stron
  experimental: {
    optimizePackageImports: ['@radix-ui/react-label', '@radix-ui/react-slot', 'lucide-react'],
  },
  // Ustawienia wydajności
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Kompresja
  compress: true,
  // PDF-y materiałów do druku leżą poza public/ (pobranie tylko z kontem),
  // więc trzeba je dołączyć do funkcji, która je wydaje.
  outputFileTracingIncludes: {
    '/api/materialy/[przedmiot]/[slug]/pdf': ['./private/materialy/**/*'],
  },
  // Przekierowania 301 dla artykułów bloga oznaczonych w Strapi (redirectEnabled + redirectUrl)
  async redirects() {
    // Kurs matematyki dla klasy 4 przeniósł się poziom głębiej (/matematyka jest
    // teraz katalogiem kursów, patrz /matematyka/klasa-4) — stare, zaindeksowane
    // adresy modułów/lekcji muszą przekierować, żeby nie stracić SEO. Budowane z
    // tych samych danych co generateStaticParams, więc lista nie może wyjść z synchronizacji.
    const mathRedirects = [
      ...MATH_MODULES.map((mathModule) => ({
        source: `/matematyka/${mathModule.slug}`,
        destination: `/matematyka/klasa-4/${mathModule.slug}`,
        permanent: true,
      })),
      ...getPublishedLessons().map((lesson) => ({
        source: `/matematyka/${lesson.moduleSlug}/${lesson.slug}`,
        destination: `/matematyka/klasa-4/${lesson.moduleSlug}/${lesson.slug}`,
        permanent: true,
      })),
      // Krótki, przyjazny adres ściągi PDF (plik leży w public/sciagi/). Tymczasowe
      // przekierowanie, żeby kolejną wersję ściągi dało się podpiąć bez zmiany linku.
      {
        source: '/sciaga',
        destination: '/sciagi/matematyka-klasa-4.pdf',
        permanent: false,
      },
    ];

    const base = process.env.STRAPI_API_URL || '';
    if (!base) return mathRedirects;

    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/blog-articles?pagination[limit]=200`);
      if (!res.ok) {
        console.error(`Failed to fetch blog articles for redirects: HTTP ${res.status}`);
        return mathRedirects;
      }
      const json = await res.json();
      const items: Record<string, unknown>[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
          ? json.data
          : [];

      const blogRedirects = items
        .map((item) => {
          const attrs = (item.attributes ?? item) as Record<string, unknown>;
          return {
            slug: typeof attrs.slug === 'string' ? attrs.slug : '',
            redirectEnabled: Boolean(attrs.redirectEnabled),
            redirectUrl: typeof attrs.redirectUrl === 'string' ? attrs.redirectUrl : '',
          };
        })
        .filter((a) => a.slug && a.redirectEnabled && a.redirectUrl)
        .map((a) => ({
          source: `/blog/${a.slug}`,
          destination: a.redirectUrl,
          permanent: true,
        }));

      return [...mathRedirects, ...blogRedirects];
    } catch (error) {
      console.error('Error fetching blog redirects from Strapi:', error);
      return mathRedirects;
    }
  },
  // Headers dla cache i WASM
  async headers() {
    const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'prod';
    // W `next dev` obrazki z /images/* iterujemy w miejscu (skill `/replace` nadpisuje
    // plik pod tą samą nazwą), więc `immutable` sprawiłby, że przeglądarka nigdy nie
    // pobierze nowej wersji. Na dev serwujemy je bez cache; build/prod bez zmian.
    const isDev = process.env.NODE_ENV === 'development';

    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev
              ? 'no-store, must-revalidate'
              : 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: "/:path*.wasm",
        headers: [
          {
            key: "Content-Type",
            value: "application/wasm",
          },
        ],
      },
      // Noindex dla lekcji kursu kodowania (paywall content)
      // :slug matches /coding-course/lessonXX but NOT /coding-course (landing page)
      {
        source: '/coding-course/:slug',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      // Blokada indeksacji na wszystkich środowiskach innych niż produkcja
      // (staging, preview, itp.) - NEXT_PUBLIC_ENVIRONMENT musi być ustawione na "prod"
      ...(isProd
        ? []
        : [
            {
              source: '/:path*',
              headers: [
                {
                  key: 'X-Robots-Tag',
                  value: 'noindex, nofollow',
                },
              ],
            },
          ]),
    ];
  },
};

export default nextConfig;
