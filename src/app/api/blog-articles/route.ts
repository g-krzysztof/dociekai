import { NextResponse, NextRequest } from 'next/server';

// Minimal shape for Strapi blog article; expand as needed
type StrapiBlogArticle = Record<string, unknown>;

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function GET(request: NextRequest) {
  const base = process.env.STRAPI_API_URL || '';
  if (!base) {
    return NextResponse.json({
      data: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    } as PaginatedResponse<StrapiBlogArticle>);
  }

  // Pobierz parametry z query string
  const searchParams = request.nextUrl.searchParams;
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const tagParam = searchParams.get('tag');

  const page = Math.max(1, parseInt(pageParam || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(limitParam || '12', 10))); // Max 100, default 12

  const url = `${base.replace(/\/$/, '')}/blog-articles?pagination[limit]=200`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      } as PaginatedResponse<StrapiBlogArticle>);
    }

    const json = await res.json();
    let allArticles: StrapiBlogArticle[] = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
        ? json.data
        : [];

    // Artykuły przekierowane (redirectEnabled) obsługuje next.config.ts -> redirects(),
    // więc nie powinny pojawiać się w wynikach API (listing, wyszukiwanie, kontekst globalny)
    allArticles = allArticles.filter((article) => {
      const attrs = isObj(article.attributes) ? article.attributes : article;
      return !attrs.redirectEnabled;
    });

    // Filter by tag if provided
    if (tagParam) {
      allArticles = allArticles.filter((article) => {
        const attrs = isObj(article.attributes) ? article.attributes : article;
        const tags = attrs.tags;
        if (Array.isArray(tags)) {
          return tags.some((t) => {
            if (typeof t === 'string') return t === tagParam;
            if (isObj(t)) {
              return (
                t.name === tagParam || t.slug === tagParam || t.id === tagParam
              );
            }
            return false;
          });
        }
        return false;
      });
    }

    // Sort by publishedAt (descending)
    allArticles.sort((a, b) => {
      const getPublishedAt = (article: StrapiBlogArticle) => {
        const attrs = isObj(article.attributes) ? article.attributes : article;
        const publishedAt = attrs.publishedAt || attrs.createdAt;
        return typeof publishedAt === 'string' ? publishedAt : '1970-01-01';
      };
      return getPublishedAt(b).localeCompare(getPublishedAt(a));
    });

    // Calculate pagination
    const total = allArticles.length;
    const totalPages = Math.ceil(total / limit);
    const validPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (validPage - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedData = allArticles.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedData,
      pagination: {
        page: validPage,
        limit,
        total,
        totalPages,
      },
    } as PaginatedResponse<StrapiBlogArticle>);
  } catch {
    return NextResponse.json({
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    } as PaginatedResponse<StrapiBlogArticle>);
  }
}

// Helper function
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}
