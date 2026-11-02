const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'prod';

const STRAPI_URL = (process.env.STRAPI_API_URL || '').replace(/\/$/, '');

/**
 * Daty ostatniej zmiany artykułów bloga, prosto ze Strapi (`updatedAt`).
 *
 * Pobierane raz na cały przebieg — `transform` woła się dla każdego URL-a,
 * a to jest jedyne miejsce w serwisie, które zna PRAWDZIWĄ datę zmiany treści.
 * Błąd sieci albo brak `STRAPI_API_URL` daje pustą mapę, czyli po prostu brak
 * `lastmod` — nigdy datę zmyśloną.
 *
 * @returns {Promise<{ bySlug: Map<string, string>, newest?: string }>}
 */
let articleDatesPromise;
function loadArticleDates() {
  articleDatesPromise ??= (async () => {
    const bySlug = new Map();
    if (!STRAPI_URL) {
      console.warn('[sitemap] STRAPI_API_URL nie jest ustawione — artykuły bez lastmod');
      return { bySlug };
    }

    try {
      // Timeout jest tu obowiązkowy: to leci w `postbuild`, więc wiszący fetch
      // zawiesiłby deploy. Lepiej sitemapa bez dat niż build stojący w miejscu.
      const res = await fetch(`${STRAPI_URL}/blog-articles?pagination[limit]=200`, {
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Strapi zwraca raz gołą tablicę, raz `{ data: [...] }` — ta sama
      // normalizacja co w src/lib/build-time-data.ts.
      const items = Array.isArray(json) ? json : (json?.data ?? []);

      for (const item of items) {
        const attrs = item?.attributes ?? item ?? {};
        const date = attrs.updatedAt || attrs.publishedAt;
        if (attrs.slug && date) bySlug.set(attrs.slug, new Date(date).toISOString());
      }
    } catch (error) {
      console.warn('[sitemap] nie udało się pobrać dat artykułów:', error.message);
      return { bySlug };
    }

    const newest = [...bySlug.values()].sort().pop();
    return { bySlug, newest };
  })();

  return articleDatesPromise;
}

/**
 * `lastmod` tylko tam, gdzie znamy prawdziwą datę ostatniej zmiany treści.
 *
 * Wcześniej KAŻDY URL dostawał tu `new Date()`, czyli znacznik czasu builda —
 * po każdym deployu cała mapa serwisu twierdziła, że zmieniło się wszystko.
 * Google albo ufa `lastmod`, albo ignoruje go w całości, a wartość niepoprawna
 * na wszystkich stronach naraz gwarantuje to drugie (Illyes, 07.2026:
 * „probably better off without the lastmods"). Dokumentacja Google wprost
 * dopuszcza pominięcie znacznika tam, gdzie nie znamy daty — i to robimy dla
 * stron, których treść siedzi w repo (o ich zmianie wie git, nie build, a
 * shallow clone na CI i tak nie pozwala tego wiarygodnie odczytać).
 *
 * @returns {Promise<string | undefined>} data ISO albo `undefined` (= brak taga)
 */
async function contentLastmod(path) {
  const { bySlug, newest } = await loadArticleDates();

  // Lista artykułów zmienia się dokładnie wtedy, gdy zmienia się najnowszy z nich.
  if (path === '/blog') return newest;

  if (path.startsWith('/blog/')) return bySlug.get(path.slice('/blog/'.length));

  return undefined;
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://dociekai.pl',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  // Domyślne `lastmod` = czas builda; datę podajemy sami w `transform`.
  autoLastmod: false,

  // Exclude routes that should never be indexed
  exclude: [
    '/icon.svg',

    // Auth routes - utility pages, no SEO value
    '/auth',
    '/auth/*',

    // User account pages - personal/protected
    '/profil',
    '/profil/*',

    // Internal/admin tools
    '/blog-gen',
    '/blog-gen/*',
    '/image-gen',
    '/image-gen/*',
    '/dev',
    '/dev/*',
    '/facebook',
    '/facebook/*',

    // App tool pages (interactive tools, not content pages)
    '/fishcards',

    // Empty/stub pages
    '/przedmioty',
    '/przedmioty/*',

    // Legal/utility pages (low SEO value, waste crawl budget)
    '/cookies',

    // Wersje do druku materiałów — tylko dla generatora PDF
    '/materialy/druk',
    '/materialy/druk/*',
  ],

  robotsTxtOptions: {
    // Środowiska inne niż produkcja (staging, preview) nie mogą być indeksowane
    policies: isProd
      ? [
          {
            userAgent: '*',
            allow: '/',
            disallow: [
              '/auth',
              '/auth/',
              '/profil',
              '/profil/',
              '/blog-gen',
              '/blog-gen/',
              '/image-gen',
              '/image-gen/',
              '/dev',
              '/dev/',
              '/facebook',
              '/facebook/',
              '/api/',
            ],
          },
        ]
      : [
          {
            userAgent: '*',
            disallow: '/',
          },
        ],
  },

  // Priorytet i changefreq per typ trasy. Google ignoruje oba, ale `lastmod`
  // już nie — patrz `contentLastmod` wyżej: podajemy go wyłącznie tam, gdzie
  // znamy prawdziwą datę zmiany treści.
  transform: async (config, path) => {
    const lastmod = await contentLastmod(path);

    // Homepage — highest priority
    if (path === '/') {
      return { loc: path, changefreq: 'daily', priority: 1.0, lastmod };
    }

    // Blog index — updated often
    if (path === '/blog') {
      return { loc: path, changefreq: 'daily', priority: 0.9, lastmod };
    }

    // Individual blog articles — core content
    if (path.startsWith('/blog/')) {
      return { loc: path, changefreq: 'monthly', priority: 0.8, lastmod };
    }

    // Educational games section — core feature
    if (path === '/gry-edukacyjne') {
      return { loc: path, changefreq: 'weekly', priority: 0.8, lastmod };
    }

    // Coding course landing — key landing page
    if (path === '/coding-course') {
      return { loc: path, changefreq: 'weekly', priority: 0.7, lastmod };
    }

    // Courses index and individual course pages
    if (path === '/kursy' || path.startsWith('/kursy/')) {
      return { loc: path, changefreq: 'weekly', priority: 0.7, lastmod };
    }

    // Contact page — low but present
    if (path === '/kontakt') {
      return { loc: path, changefreq: 'monthly', priority: 0.4, lastmod };
    }

    // Default fallback for any other discovered static pages
    return { loc: path, changefreq: 'monthly', priority: 0.5, lastmod };
  },

  additionalPaths: async (config) => {
    return [
      await config.transform(config, '/'),
      await config.transform(config, '/blog'),
      await config.transform(config, '/gry-edukacyjne'),
      await config.transform(config, '/coding-course'),
      await config.transform(config, '/kontakt'),
    ];
  },
};
