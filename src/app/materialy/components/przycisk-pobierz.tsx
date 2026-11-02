'use client';

import { useState } from 'react';
import { track } from '@vercel/analytics';
import { Check, Download, FolderOpen, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/components/auth-context';
import type { Przedmiot } from '../data/types';
import { czyWTeczce, dodajDoTeczki, useTeczka } from '../lib/teczka';
import { pobierzPdf } from '../lib/pobierz';

/**
 * Mały przycisk pod miniaturą na hubie. Zalogowany pobiera od razu (wersja
 * dwustronna), gość odkłada materiał do teczki. Błąd odsyła na stronę
 * materiału, gdzie panel pokazuje pełny komunikat.
 */
export function PrzyciskPobierz({
  przedmiot,
  slug,
  tytul,
  href,
  wyglad = 'mata',
}: {
  przedmiot: Przedmiot;
  slug: string;
  tytul: string;
  href: string;
  /** `mata` — na ciemnej macie działu; `jasny` — na stronie modułu kursu. */
  wyglad?: 'mata' | 'jasny';
}) {
  const { isAuthenticated, loading } = useAuth();
  const teczka = useTeczka();
  const [stan, setStan] = useState<'gotowy' | 'pobieram' | 'pobrane'>('gotowy');
  const wpis = { przedmiot, slug, wariant: 'dwustronne' as const, tytul };
  const wTeczce = !isAuthenticated && czyWTeczce(teczka, wpis);

  async function klik() {
    if (!isAuthenticated) {
      dodajDoTeczki(wpis);
      track('materialy_teczka_dodaj', { przedmiot, slug, wariant: 'dwustronne', z: wyglad === 'mata' ? 'hub' : 'modul' });
      return;
    }
    setStan('pobieram');
    try {
      await pobierzPdf(przedmiot, slug, 'dwustronne');
      setStan('pobrane');
    } catch {
      window.location.assign(href);
    }
  }

  const Ikona =
    stan === 'pobieram' ? LoaderCircle : stan === 'pobrane' ? Check : wTeczce ? FolderOpen : Download;

  return (
    <button
      type="button"
      onClick={klik}
      disabled={loading || stan === 'pobieram'}
      className={
        wyglad === 'mata'
          ? 'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md bg-[var(--mata-tekst)] px-3.5 text-sm font-bold text-[var(--mata-gleboka)] transition-[background-color,translate] hover:-translate-y-px hover:bg-[var(--teczka)] disabled:opacity-80'
          : 'inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground/40 hover:bg-muted/50 disabled:opacity-80'
      }
      aria-label={`${wTeczce ? 'W teczce' : 'Pobierz PDF'}: ${tytul}`}
    >
      <Ikona aria-hidden className={`h-4 w-4 ${stan === 'pobieram' ? 'animate-spin' : ''}`} />
      {stan === 'pobrane' ? 'Pobrane' : wTeczce ? 'W teczce' : wyglad === 'jasny' ? 'PDF' : 'Pobierz PDF'}
    </button>
  );
}
