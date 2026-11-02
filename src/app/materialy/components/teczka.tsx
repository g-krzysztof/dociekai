'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { track } from '@vercel/analytics';
import { Check, Download, FolderOpen, LoaderCircle, X } from 'lucide-react';
import { useAuth } from '@/components/auth-context';
import { usunZTeczki, useTeczka, ZDARZENIE_OTWORZ, type WpisTeczki } from '../lib/teczka';
import { KOMUNIKAT_BLEDU, PobranieError, pobierzPdf, type BladPobrania } from '../lib/pobierz';

const materialWord = (n: number) => (n === 1 ? 'materiał' : n < 5 ? 'materiały' : 'materiałów');

/**
 * Wnętrze teczki: lista odłożonych materiałów i jedna akcja — gość zakłada
 * konto (powrót z `?teczka=1`), zalogowany pobiera wszystko plik po pliku.
 * Używane w pływającej teczce działu i w kolumnie „do druku” stron modułów.
 */
export function TeczkaZawartosc({ naglowek }: { naglowek?: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const wpisy = useTeczka();
  const [postep, setPostep] = useState<{ zrobione: number; z: number } | null>(null);
  const [koniec, setKoniec] = useState<number | null>(null);
  const [blad, setBlad] = useState<BladPobrania | null>(null);
  const powrot = `${pathname}?teczka=1`;

  async function pobierzWszystko(lista: WpisTeczki[]) {
    setBlad(null);
    setKoniec(null);
    setPostep({ zrobione: 0, z: lista.length });
    let zrobione = 0;
    for (const w of lista) {
      try {
        await pobierzPdf(w.przedmiot, w.slug, w.wariant);
        usunZTeczki(w);
        zrobione += 1;
        setPostep({ zrobione, z: lista.length });
        // przeglądarki blokują serię pobrań wywołanych naraz
        await new Promise((r) => setTimeout(r, 700));
      } catch (e) {
        setBlad(e instanceof PobranieError ? e.rodzaj : 'siec');
        break;
      }
    }
    setPostep(null);
    if (zrobione === lista.length) setKoniec(zrobione);
  }

  if (koniec !== null && !wpisy.length) {
    return (
      <div>
        {naglowek}
        <p className="mt-2 flex items-start gap-2 text-sm leading-snug">
          <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
          {koniec} {materialWord(koniec)} w folderze Pobrane. Drukuj w skali 100%.
        </p>
      </div>
    );
  }

  if (!wpisy.length) {
    return (
      <div>
        {naglowek}
        <p className="mt-2 text-sm leading-snug">Teczka jest pusta.</p>
      </div>
    );
  }

  return (
    <div>
      {naglowek}
      <ul className="mt-3 divide-y divide-[color-mix(in_oklch,var(--teczka-tekst)_18%,transparent)]">
        {wpisy.map((w) => (
          <li key={`${w.przedmiot}-${w.slug}-${w.wariant}`} className="flex items-center justify-between gap-3 py-2.5">
            <span className="min-w-0 text-sm">
              <span className="block truncate font-bold">{w.tytul}</span>
              {w.wariant === 'skladane' && <span className="text-xs">wersja składana</span>}
            </span>
            {!postep && (
              <button
                type="button"
                onClick={() => usunZTeczki(w)}
                className="shrink-0 rounded px-2 py-1 text-xs font-semibold underline-offset-4 hover:underline"
              >
                Wyjmij
              </button>
            )}
          </li>
        ))}
      </ul>

      {isAuthenticated ? (
        <button
          type="button"
          onClick={() => pobierzWszystko(wpisy)}
          disabled={!!postep}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--teczka-tekst)] px-4 text-sm font-bold text-[var(--teczka)] transition-opacity disabled:opacity-80"
        >
          {postep ? (
            <>
              <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
              Pobieram {postep.zrobione + 1} z {postep.z}…
            </>
          ) : (
            <>
              <Download aria-hidden className="h-4 w-4" />
              {wpisy.length === 1 ? 'Pobierz PDF' : `Pobierz wszystkie (${wpisy.length})`}
            </>
          )}
        </button>
      ) : (
        <div className="mt-4">
          <p className="text-sm leading-snug">
            Pliki PDF pobierasz z darmowym kontem — dla siebie albo dla dziecka. Teczka poczeka.
          </p>
          <Link
            href={`/auth?mode=register&returnUrl=${encodeURIComponent(powrot)}`}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[var(--teczka-tekst)] px-4 text-sm font-bold text-[var(--teczka)]"
          >
            Załóż darmowe konto
          </Link>
          <p className="mt-2 text-center text-xs">
            Masz już konto?{' '}
            <Link
              href={`/auth?mode=login&returnUrl=${encodeURIComponent(powrot)}`}
              className="font-bold underline underline-offset-4"
            >
              Zaloguj się
            </Link>
          </p>
        </div>
      )}

      {blad && (
        <p role="alert" className="mt-3 text-xs font-semibold">
          {KOMUNIKAT_BLEDU[blad]}
        </p>
      )}
    </div>
  );
}

/**
 * Powrót z rejestracji (`?teczka=1`): mierzy konwersję i czyści parametr.
 * Zwraca true, gdy teczka powinna się otworzyć.
 */
export function usePowrotZTeczka(): boolean {
  const { isAuthenticated, loading } = useAuth();
  const wpisy = useTeczka();
  const [otworz, setOtworz] = useState(false);

  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('teczka') !== '1') return;
    if (wpisy.length) {
      setOtworz(true);
      if (isAuthenticated) track('materialy_rejestracja_z_teczki', { liczba: wpisy.length });
    }
    params.delete('teczka');
    const q = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${q ? `?${q}` : ''}${window.location.hash}`);
    // jednorazowo po ustaleniu stanu logowania
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return otworz;
}

/**
 * Teczka przy lewej krawędzi ekranu (tylko w dziale /materialy). Gość
 * odkłada do niej materiały, zanim założy konto; po powrocie z rejestracji
 * otwiera się sama.
 */
export function Teczka() {
  const pathname = usePathname();
  const wpisy = useTeczka();
  const powrot = usePowrotZTeczka();
  const [otwarta, setOtwarta] = useState(false);
  const [podskok, setPodskok] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const poprzednia = useRef(wpisy.length);

  useEffect(() => {
    if (powrot) setOtwarta(true);
  }, [powrot]);

  useEffect(() => {
    const otworz = () => setOtwarta(true);
    window.addEventListener(ZDARZENIE_OTWORZ, otworz);
    return () => window.removeEventListener(ZDARZENIE_OTWORZ, otworz);
  }, []);

  useEffect(() => {
    if (wpisy.length > poprzednia.current) {
      setPodskok(true);
      const t = setTimeout(() => setPodskok(false), 600);
      poprzednia.current = wpisy.length;
      return () => clearTimeout(t);
    }
    poprzednia.current = wpisy.length;
  }, [wpisy.length]);

  useEffect(() => {
    if (!otwarta) return;
    const klawisz = (e: KeyboardEvent) => e.key === 'Escape' && setOtwarta(false);
    const klik = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOtwarta(false);
    };
    window.addEventListener('keydown', klawisz);
    window.addEventListener('pointerdown', klik);
    return () => {
      window.removeEventListener('keydown', klawisz);
      window.removeEventListener('pointerdown', klik);
    };
  }, [otwarta]);

  if (pathname.startsWith('/materialy/druk')) return null;
  // Po pobraniu całej teczki zostaje otwarta z potwierdzeniem, dopóki jej nie zamkniesz.
  if (!wpisy.length && !otwarta) return null;

  return (
    <div ref={ref} className="fixed bottom-4 left-4 z-40 md:bottom-6 md:left-6">
      {otwarta && (
        <section
          id="teczka-panel"
          aria-label="Twoja teczka"
          className="teczka-panel absolute bottom-full left-0 mb-3 w-[min(22rem,calc(100vw-2rem))] p-5"
        >
          <TeczkaZawartosc
            naglowek={
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-extrabold tracking-tight">Twoja teczka</h2>
                <button
                  type="button"
                  onClick={() => setOtwarta(false)}
                  className="-m-1 rounded p-1 hover:bg-black/10"
                  aria-label="Zamknij teczkę"
                >
                  <X aria-hidden className="h-4 w-4" />
                </button>
              </div>
            }
          />
        </section>
      )}

      <button
        type="button"
        className="teczka-zakladka"
        data-podskok={podskok}
        aria-expanded={otwarta}
        aria-controls="teczka-panel"
        onClick={() => setOtwarta((o) => !o)}
      >
        <FolderOpen aria-hidden className="h-4 w-4" />
        Teczka
        <span className="teczka-licznik" aria-label={`${wpisy.length} ${materialWord(wpisy.length)}`}>
          {wpisy.length}
        </span>
      </button>
    </div>
  );
}
