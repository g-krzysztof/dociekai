import { NextResponse } from 'next/server';
import type { StrapiTag } from '@/types/tag';

export async function GET() {
  const base = process.env.STRAPI_API_URL || '';
  if (!base) {
    return NextResponse.json([] satisfies StrapiTag[]);
  }
  const url = `${base.replace(/\/$/, '')}/tags`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return NextResponse.json([] satisfies StrapiTag[]);
    const json = await res.json();
    const data: StrapiTag[] = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
        ? json.data
        : [];
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([] satisfies StrapiTag[]);
  }
}
