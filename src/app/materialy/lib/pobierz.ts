'use client';

import { track } from '@vercel/analytics';
import type { Przedmiot, WariantPdf } from '../data/types';
import { getAuthToken } from '@/lib/auth-token';

export type BladPobrania = 'konto' | 'brak-pliku' | 'siec';

export class PobranieError extends Error {
  constructor(public rodzaj: BladPobrania) {
    super(rodzaj);
  }
}

/**
 * Pobiera PDF materiału. JWT leży w localStorage, więc zwykły link <a href>
 * by go nie wysłał — pobieramy przez fetch z nagłówkiem i oddajemy Blob.
 */
export async function pobierzPdf(przedmiot: Przedmiot, slug: string, wariant: WariantPdf) {
  let token: string | null = null;
  try {
    token = getAuthToken();
  } catch {
    token = null;
  }
  if (!token) throw new PobranieError('konto');

  let res: Response;
  try {
    const q = wariant === 'skladane' ? '?wariant=skladane' : '';
    res = await fetch(`/api/materialy/${przedmiot}/${slug}/pdf${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new PobranieError('siec');
  }

  if (res.status === 401) throw new PobranieError('konto');
  if (res.status === 404) throw new PobranieError('brak-pliku');
  if (!res.ok) throw new PobranieError('siec');

  const blob = await res.blob();
  const nazwa =
    /filename="([^"]+)"/.exec(res.headers.get('content-disposition') ?? '')?.[1] ??
    `dociekai-${slug}.pdf`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nazwa;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);

  track('materialy_pobrano', { przedmiot, slug, wariant });
}

export const KOMUNIKAT_BLEDU: Record<BladPobrania, string> = {
  konto: 'Sesja wygasła. Zaloguj się ponownie, a plik pobierze się od razu.',
  'brak-pliku': 'Ten plik jest właśnie aktualizowany. Spróbuj za kilka minut.',
  siec: 'Nie udało się pobrać pliku. Sprawdź połączenie i spróbuj jeszcze raz.',
};
