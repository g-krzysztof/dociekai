import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Material, Przedmiot } from '../data/types';
import { liczbaStron, materialHref, materialyPrzedmiotu, PRZEDMIOTY } from '../data';
import { Miniatura } from './miniatura';
import { PrzyciskPobierz } from './przycisk-pobierz';

const stronWord = (n: number) => (n === 1 ? 'strona' : n < 5 ? 'strony' : 'stron');

export const opisPliku = (m: Material) => {
  const n = liczbaStron(m);
  return m.rodzaj === 'sciaga'
    ? `Ściąga · ${n} ${stronWord(n)} A4`
    : `${m.karty.length} fiszek · ${n} ${stronWord(n)} A4`;
};

/** Kartka leżąca na macie + podpis i akcja. */
export function PozycjaMaterialu({
  material,
  naglowek = 'h4',
  kompaktowa = false,
}: {
  material: Material;
  naglowek?: 'h3' | 'h4';
  /** Wąska kolumna (dwie kartki obok siebie): podpis i przycisk jeden pod drugim. */
  kompaktowa?: boolean;
}) {
  const href = materialHref(material);
  const Naglowek = naglowek;
  return (
    <article data-rodzaj={material.rodzaj} className="group/poz">
      <Link href={href} className="block rounded-[2px]" aria-label={`Otwórz: ${material.tytul}`}>
        <div className="znaczniki-ciecia">
          <div className="cien-kartki transition-[translate,rotate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/poz:-translate-y-1.5 group-hover/poz:-rotate-[0.8deg]">
            <Miniatura material={material} />
          </div>
        </div>
      </Link>
      <div
        className={
          kompaktowa
            ? 'mt-5 flex flex-col items-start gap-3'
            : 'mt-6 flex items-start justify-between gap-4'
        }
      >
        <div className="min-w-0">
          <Naglowek
            className={`${kompaktowa ? 'text-base sm:text-lg' : 'text-lg'} font-bold leading-tight tracking-tight text-[var(--mata-tekst)]`}
          >
            <Link href={href} className="underline-offset-4 hover:underline">
              {material.tytul}
            </Link>
          </Naglowek>
          <p className="mt-1 text-sm tabular-nums text-[var(--mata-tekst-cichy)]">{opisPliku(material)}</p>
        </div>
        <PrzyciskPobierz przedmiot={material.przedmiot} slug={material.slug} tytul={material.tytul} href={href} />
      </div>
    </article>
  );
}

/** Materiały jednego kursu, pogrupowane po modułach w kolejności kursu. */
export function ModulyPrzedmiotu({ przedmiot, poziom = 'h3' }: { przedmiot: Przedmiot; poziom?: 'h2' | 'h3' }) {
  const materialy = materialyPrzedmiotu(przedmiot);
  const moduly = [...new Map(materialy.map((m) => [m.modul.numer, m.modul])).values()].sort(
    (a, b) => a.numer - b.numer,
  );
  const Naglowek = poziom;

  return (
    <div className="grid gap-x-14 gap-y-16 lg:grid-cols-2">
      {/* subgrid: nagłówki modułów w jednym rzędzie mają wspólną wysokość, więc kartki obu modułów startują równo */}
      {moduly.map((modul) => (
        <section
          key={modul.numer}
          aria-labelledby={`modul-${przedmiot}-${modul.numer}`}
          className="row-span-2 grid grid-rows-subgrid gap-y-8"
        >
          <div className="flex flex-col justify-end gap-y-2 border-b border-[var(--mata-linia-mocna)] pb-3">
            <Naglowek
              id={`modul-${przedmiot}-${modul.numer}`}
              className="text-xl font-bold tracking-tight text-[var(--mata-tekst)] sm:text-2xl"
            >
              <span className="mr-3 font-mono text-base font-medium tabular-nums text-[var(--mata-tekst-cichy)]">
                Moduł {modul.numer}
              </span>
              {modul.tytul}
            </Naglowek>
            <Link
              href={modul.href}
              className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[var(--mata-tekst-cichy)] underline-offset-4 hover:text-[var(--mata-tekst)] hover:underline"
            >
              Lekcje modułu w kursie {PRZEDMIOTY[przedmiot].nazwa.toLowerCase()}
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:gap-x-10">
            {materialy
              .filter((m) => m.modul.numer === modul.numer)
              .map((m) => (
                <PozycjaMaterialu
                  key={m.slug}
                  material={m}
                  naglowek={poziom === 'h2' ? 'h3' : 'h4'}
                  kompaktowa
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** Linijka wzdłuż górnej krawędzi maty. */
export function Linijka() {
  return (
    <div className="mata-linijka" aria-hidden>
      {Array.from({ length: 16 }, (_, i) => (
        <span key={i}>{i * 5}</span>
      ))}
    </div>
  );
}
