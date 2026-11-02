import { NextResponse } from 'next/server';

interface TagWithCount {
  id: number;
  name: string;
  slug: string;
  color: string;
  count: number;
}

interface TagsApiResponse {
  tags: TagWithCount[];
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export async function GET() {
  const base = process.env.STRAPI_API_URL || '';

  if (!base) {
    return NextResponse.json(
      { tags: [] },
      { status: 500 }
    );
  }

  try {
    const [tagsRes, articlesRes] = await Promise.all([
      fetch(`${base.replace(/\/$/, '')}/blog-tags`, { cache: 'no-store' }),
      fetch(`${base.replace(/\/$/, '')}/blog-articles?pagination[limit]=200`, { cache: 'no-store' }),
    ]);

    if (!tagsRes.ok) {
      return NextResponse.json(
        { tags: [], error: `Backend returned ${tagsRes.status}` },
        { status: tagsRes.status }
      );
    }

    const tagsJson = await tagsRes.json();
    const tagsMeta: TagWithCount[] = Array.isArray(tagsJson?.tags) ? tagsJson.tags : [];

    // Strapi's own /blog-tags counts include artykuły oznaczone jako redirectEnabled,
    // które nie pojawiają się już na blogu (patrz next.config.ts -> redirects()).
    // Liczymy więc tagi sami, na podstawie tej samej, przefiltrowanej listy artykułów.
    const articlesJson = articlesRes.ok ? await articlesRes.json() : null;
    const articles: Record<string, unknown>[] = Array.isArray(articlesJson)
      ? articlesJson
      : Array.isArray(articlesJson?.data)
        ? articlesJson.data
        : [];

    const counts = new Map<number, number>();
    for (const article of articles) {
      const attrs = isObj(article.attributes) ? article.attributes : article;
      if (attrs.redirectEnabled) continue;
      const articleTags = Array.isArray(attrs.tags) ? attrs.tags : [];
      for (const t of articleTags) {
        if (isObj(t) && typeof t.id === 'number') {
          counts.set(t.id, (counts.get(t.id) || 0) + 1);
        }
      }
    }

    const data: TagsApiResponse = {
      tags: tagsMeta
        .map((tag) => ({ ...tag, count: counts.get(tag.id) || 0 }))
        .filter((tag) => tag.count > 0)
        .sort((a, b) => b.count - a.count),
    };

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { tags: [], error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
