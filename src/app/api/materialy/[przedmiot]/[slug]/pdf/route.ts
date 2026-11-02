import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { getMaterial, pdfFileName, wariantyPdf } from '@/app/materialy/data';
import type { WariantPdf } from '@/app/materialy/data/types';

export const runtime = 'nodejs';

const BACKEND = (process.env.STRAPI_API_URL || '').replace(/\/$/, '');

/**
 * GET /api/materialy/:przedmiot/:slug/pdf[?wariant=skladane]
 *
 * Treść materiału jest jawna na stronie, a PDF do druku wydajemy tylko
 * zalogowanym (dział „Pobierz”). Token sprawdza backend
 * auth — ten sam endpoint profilu co /api/auth/profile. Pliki leżą w
 * private/materialy/ (poza public/, bez publicznego adresu).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ przedmiot: string; slug: string }> },
) {
  const { przedmiot, slug } = await params;
  const material = getMaterial(przedmiot, slug);
  const wariant = (request.nextUrl.searchParams.get('wariant') ?? 'dwustronne') as WariantPdf;

  if (!material || !wariantyPdf(material).includes(wariant)) {
    return NextResponse.json({ error: 'Nie ma takiego materiału' }, { status: 404 });
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Plik pobierzesz po zalogowaniu' }, { status: 401 });
  }
  if (!BACKEND) {
    return NextResponse.json({ error: 'Backend API nie jest skonfigurowane' }, { status: 503 });
  }

  try {
    const profil = await fetch(`${BACKEND}/user-management/profile`, {
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (profil.status === 401 || profil.status === 403) {
      return NextResponse.json({ error: 'Sesja wygasła' }, { status: 401 });
    }
    if (!profil.ok) {
      return NextResponse.json({ error: 'Nie udało się sprawdzić konta' }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: 'Nie udało się sprawdzić konta' }, { status: 502 });
  }

  const plik = pdfFileName(material, wariant);
  let pdf: Buffer;
  try {
    pdf = await readFile(path.join(process.cwd(), 'private', 'materialy', material.przedmiot, plik));
  } catch {
    return NextResponse.json({ error: 'Plik jest w przygotowaniu' }, { status: 404 });
  }

  // Pomiar leadów: kto co pobrał. Do czasu kolekcji w Strapi po prostu się
  // nie zapisze — pobranie nigdy na tym nie czeka dłużej niż 2 s.
  await fetch(`${BACKEND}/material-downloads`, {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { przedmiot: material.przedmiot, slug: material.slug, wariant } }),
    signal: AbortSignal.timeout(2000),
  }).catch(() => null);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="dociekai-${plik}"`,
      'Content-Length': String(pdf.length),
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
