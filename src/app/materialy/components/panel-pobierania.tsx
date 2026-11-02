'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { track } from '@vercel/analytics';
import { ArrowRight, Check, Download, FolderOpen, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/components/auth-context';
import type { Przedmiot, RodzajMaterialu, WariantPdf } from '../data/types';
import { czyWTeczce, dodajDoTeczki, useTeczka } from '../lib/teczka';
import { KOMUNIKAT_BLEDU, PobranieError, pobierzPdf, type BladPobrania } from '../lib/pobierz';

export interface PanelPobieraniaProps {
  przedmiot: Przedmiot;
  slug: string;
  tytul: string;
  rodzaj: RodzajMaterialu;
  /** Numer zlecenia na bilecie, np. „M4-05-S”. */
  numer: string;
  strony: Record<WariantPdf, number>;
  karty?: number;
  aktualizacja: string;
  modulHref: string;
}

const WARIANTY: { id: WariantPdf; nazwa: string; opis: string }[] = [
  { id: 'dwustronne', nazwa: 'Dwustronne', opis: 'Pytanie z przodu, odpowiedź z tyłu. Drukarka z drukiem dwustronnym.' },
  { id: 'skladane', nazwa: 'Składane na pół', opis: 'Każda drukarka. Złóż kartkę wzdłuż linii, potem tnij.' },
];

const stronWord = (n: number) => (n === 1 ? 'strona' : n < 5 ? 'strony' : 'stron');

/** Bilet „zlecenia druku” obok materiału: dane pliku i jedna akcja. */
export function PanelPobierania(props: PanelPobieraniaProps) {
  const { przedmiot, slug, tytul, rodzaj, numer, strony, karty, aktualizacja, modulHref } = props;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const teczka = useTeczka();
  const [wariant, setWariant] = useState<WariantPdf>('dwustronne');
  const [stan, setStan] = useState<'gotowy' | 'pobieram' | 'pobrane'>('gotowy');
  const [blad, setBlad] = useState<BladPobrania | null>(null);

  const wpis = { przedmiot, slug, wariant, tytul };
  const wTeczce = czyWTeczce(teczka, wpis);
  const rejestracja = `/auth?mode=register&returnUrl=${encodeURIComponent(`${pathname}?teczka=1`)}`;
  const logowanie = `/auth?mode=login&returnUrl=${encodeURIComponent(`${pathname}?teczka=1`)}`;

  async function pobierz() {
    setBlad(null);
    if (!isAuthenticated) {
      dodajDoTeczki(wpis);
      track('materialy_teczka_dodaj', { przedmiot, slug, wariant });
      return;
    }
    setStan('pobieram');
    try {
      await pobierzPdf(przedmiot, slug, wariant);
      setStan('pobrane');
    } catch (e) {
      setStan('gotowy');
      setBlad(e instanceof PobranieError ? e.rodzaj : 'siec');
    }
  }

  const n = strony[wariant];

  return (
    <aside className="bilet cien-kartki px-6 pb-7 pt-8 sm:px-7" aria-labelledby="bilet-tytul">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="bilet-tytul" className="text-lg font-extrabold tracking-tight">
          Zlecenie druku
        </h2>
        <span className="font-mono text-xs tabular-nums text-[var(--bilet-cichy)]">№ {numer}</span>
      </div>

      <dl className="mt-5">
        <dt>Format</dt>
        <dd>A4, pionowo</dd>
        <dt>Plik</dt>
        <dd>
          PDF · {n} {stronWord(n)}
        </dd>
        {karty !== undefined && (
          <>
            <dt>Karty</dt>
            <dd>{karty} fiszek, 95 × 70 mm</dd>
          </>
        )}
        <dt>Druk</dt>
        <dd>kolorowy albo czarno-biały</dd>
        <dt>Wydanie</dt>
        <dd>{aktualizacja.split('-').reverse().join('.')}</dd>
      </dl>

      {rodzaj === 'fiszki' && (
        <fieldset className="mt-6">
          <legend className="mb-2 text-[0.8125rem] font-semibold text-[var(--bilet-cichy)]">Jak drukujesz?</legend>
          <div className="przelacznik-wariantu">
            {WARIANTY.map((w) => (
              <button
                key={w.id}
                type="button"
                aria-pressed={wariant === w.id}
                onClick={() => {
                  setWariant(w.id);
                  setStan('gotowy');
                }}
              >
                {w.nazwa}
              </button>
            ))}
          </div>
          <p className="mt-2 min-h-[2.6em] text-[0.8125rem] leading-snug text-[var(--bilet-cichy)]">
            {WARIANTY.find((w) => w.id === wariant)?.opis}
          </p>
        </fieldset>
      )}

      <hr className="bilet-linia my-6" />

      {stan === 'pobrane' ? (
        <div className="flex items-center justify-between gap-4">
          <span className="pieczatka text-[oklch(0.5_0.14_150)]" data-swieza="true">
            <Check aria-hidden className="h-4 w-4" strokeWidth={3} />
            Pobrane
          </span>
          <button type="button" onClick={pobierz} className="text-sm font-semibold underline underline-offset-4">
            Pobierz jeszcze raz
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="przycisk-druku"
          onClick={pobierz}
          disabled={stan === 'pobieram' || authLoading}
          aria-describedby="bilet-dopisek"
        >
          {stan === 'pobieram' ? (
            <LoaderCircle aria-hidden className="h-5 w-5 animate-spin" />
          ) : !isAuthenticated && wTeczce ? (
            <FolderOpen aria-hidden className="h-5 w-5" />
          ) : (
            <Download aria-hidden className="h-5 w-5" />
          )}
          {stan === 'pobieram'
            ? 'Przygotowuję plik…'
            : !isAuthenticated && wTeczce
              ? 'Leży w teczce'
              : 'Pobierz PDF'}
        </button>
      )}

      <div id="bilet-dopisek" className="mt-3 text-[0.8125rem] leading-snug text-[var(--bilet-cichy)]">
        {isAuthenticated ? (
          'Plik zapisze się w folderze Pobrane.'
        ) : wTeczce ? (
          <p>
            <Link href={rejestracja} className="font-bold text-[var(--bilet-tekst)] underline underline-offset-4">
              Załóż darmowe konto
            </Link>{' '}
            albo{' '}
            <Link href={logowanie} className="font-semibold underline underline-offset-4">
              zaloguj się
            </Link>
            , a pobierzesz wszystko z teczki.
          </p>
        ) : (
          'Treść czytasz tu bez konta. Plik PDF pobierasz z darmowym kontem.'
        )}
      </div>

      {blad && (
        <p role="alert" className="mt-3 rounded-md bg-[oklch(0.95_0.04_30)] px-3 py-2 text-[0.8125rem] font-medium text-[oklch(0.42_0.14_30)]">
          {KOMUNIKAT_BLEDU[blad]}{' '}
          {blad === 'konto' && (
            <Link href={logowanie} className="font-bold underline underline-offset-4">
              Zaloguj się
            </Link>
          )}
        </p>
      )}

      <Link
        href={modulHref}
        className="group mt-6 flex items-center justify-between gap-3 border-t border-[color-mix(in_oklch,var(--bilet-cichy)_25%,transparent)] pt-4 text-sm font-semibold"
      >
        Ćwicz ten moduł w darmowych lekcjach
        <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </aside>
  );
}
