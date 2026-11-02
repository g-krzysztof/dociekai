import type { StrapiTag } from '@/types/tag';
import type { BlogPost } from '@/lib/blog';

// Funkcje do pobierania danych podczas build time
export async function getBuildTimeTags(): Promise<StrapiTag[]> {
  const base = process.env.STRAPI_API_URL || '';
  if (!base) {
    console.warn('STRAPI_API_URL not set, returning empty tags array');
    return [];
  }

  const url = `${base.replace(/\/$/, '')}/tags`;

  try {
    const res = await fetch(url, {
      cache: 'force-cache',
      next: { revalidate: 0 }, // 1 hour
    });
    if (!res.ok) {
      console.error(`Failed to fetch tags: HTTP ${res.status}`);
      return [];
    }
    const json = await res.json();
    const data: StrapiTag[] = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
        ? json.data
        : [];
    return data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

export type BlogArticle = Record<string, unknown>;

export async function getBuildTimeBlogArticles(): Promise<BlogArticle[]> {
  const base = process.env.STRAPI_API_URL || '';
  if (!base) {
    console.warn('STRAPI_API_URL not set, returning empty articles array');
    return [];
  }

  const url = `${base.replace(/\/$/, '')}/blog-articles?pagination[limit]=200`;

  try {
    const res = await fetch(url, {
      cache: 'force-cache',
      next: { revalidate: 0 }, // 1 hour
    });
    if (!res.ok) {
      console.error(`Failed to fetch blog articles: HTTP ${res.status}`);
      return [];
    }
    const json = await res.json();
    const data: BlogArticle[] = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
        ? json.data
        : [];
    // Artykuły przekierowane (redirectEnabled) mają obsłużyć next.config.ts -> redirects(),
    // więc nie powinny pojawiać się na liście, w chmurze tagów ani wśród powiązanych artykułów
    return data.filter((item) => !isRedirectArticle(item));
  } catch (error) {
    console.error('Error fetching blog articles:', error);
    return [];
  }
}

// Artykuły oznaczone w Strapi jako przekierowane (redirectEnabled) nie powinny
// mieć własnej statycznej strony — patrz next.config.ts -> redirects()
export function isRedirectArticle(item: BlogArticle): boolean {
  const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
  const attrs = isObj(item.attributes) ? (item.attributes as Record<string, unknown>) : item;
  return Boolean(attrs['redirectEnabled']);
}

// Funkcja pomocnicza do normalizowania artykułów
export function normalizeArticle(item: BlogArticle): BlogPost {
  const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

  const pickStr = (obj: Record<string, unknown>, key: string, fallback = '') => {
    const v = obj[key];
    return typeof v === 'string' ? v : fallback;
  };

  const hasAttributes = isObj(item.attributes ?? undefined);
  const attrs = hasAttributes ? (item.attributes as Record<string, unknown>) : item;
  const idRaw = item.documentId ?? item.id ?? Math.random().toString(36).slice(2);
  const id = typeof idRaw === 'string' ? idRaw : String(idRaw);
  const title = pickStr(attrs, 'title');
  const slug = pickStr(attrs, 'slug') || (title ? title.toLowerCase().replace(/\s+/g, '-') : id);
  const excerpt = pickStr(attrs, 'excerpt') || pickStr(attrs, 'summary');
  const content = pickStr(attrs, 'content');
  const author = pickStr(attrs, 'author') || pickStr(attrs, 'authorName', 'Dociekai');
  const publishedAt =
    pickStr(attrs, 'publishedAt') || pickStr(attrs, 'createdAt', new Date().toISOString());
  const readTime = pickStr(attrs, 'readTime') || estimateReadTime(content);
  const featured = Boolean(attrs['featured'] as unknown);

  // Image handling
  let image = pickStr(attrs, 'imageUrl');
  let imageAlt = pickStr(attrs, 'imageAlt') || title;
  if (!image && isObj(attrs['image'] as unknown)) {
    const img = attrs['image'] as Record<string, unknown>;
    const rootUrl = pickStr(img, 'url');
    const formats = isObj(img['formats'] as unknown)
      ? (img['formats'] as Record<string, unknown>)
      : undefined;
    const pickFromFormats = (key: string) => {
      if (!formats) return '';
      const f = formats[key];
      if (isObj(f)) return pickStr(f as Record<string, unknown>, 'url');
      return '';
    };
    // Oryginał ma pierwszeństwo przed derywatami Strapi: rozmiar dobiera teraz
    // loader przez `w_<width>` na Cloudinary (src/lib/media/loader.ts), a `medium`
    // (750 px) sztucznie zaniżałby sufit ostrości dla obrazów na całą szerokość.
    image =
      rootUrl ||
      pickFromFormats('large') ||
      pickFromFormats('medium') ||
      pickFromFormats('small') ||
      pickFromFormats('thumbnail');
    imageAlt = pickStr(img, 'alternativeText') || imageAlt;
  } else if (!image) {
    image = pickStr(attrs, 'image');
  }

  // Tags
  let postTags: string[] = [];
  const rawTags = attrs['tags'];
  if (Array.isArray(rawTags)) {
    postTags = rawTags
      .map((t: unknown) =>
        typeof t === 'string'
          ? t
          : isObj(t)
            ? typeof t.name === 'string'
              ? t.name
              : typeof t.slug === 'string'
                ? t.slug
                : ''
            : ''
      )
      .filter((s): s is string => Boolean(s));
  }

  const category = pickStr(attrs, 'category');
  const metaTitle = pickStr(attrs, 'metaTitle').trim() || undefined;
  const metaDescription = pickStr(attrs, 'metaDescription').trim() || undefined;
  const tables = isObj(attrs['tables'] as unknown)
    ? (attrs['tables'] as BlogPost['tables'])
    : undefined;

  return {
    id,
    title,
    slug,
    excerpt,
    content,
    author,
    publishedAt,
    readTime,
    featured,
    image,
    imageAlt,
    tags: postTags,
    category,
    metaTitle,
    metaDescription,
    tables,
  };
}

function estimateReadTime(content: string): string {
  const words = (content || '').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}
