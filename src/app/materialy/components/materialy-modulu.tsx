import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { materialHref, MATERIALY } from '../data';
import { kartkaFont } from '../font';
import { Miniatura } from './miniatura';
import { PrzyciskPobierz } from './przycisk-pobierz';
import { TeczkaKolumna } from './teczka-kolumna';
import '../materialy.css';

const UKLAD_KARTEK = [
  'left-[7%] top-[13%] -rotate-[5deg]',
  'right-[7%] top-[20%] rotate-[4deg]',
];

/**
 * Kolumna „do druku” obok listy tematów na stronie modułu kursu: kartki
 * modułu leżące na macie, pobieranie i teczka. Moduł bez materiałów
 * zostawia stronę dokładnie taką, jaka była.
 *
 * Owija `<section>` z tematami i `<nav>` między modułami (bezpośrednie
 * dzieci): na desktopie kolumna stoi obok nich, na telefonie wchodzi
 * między listę a nawigację.
 */
export function ModulZMaterialami({ modulHref, children }: { modulHref: string; children: React.ReactNode }) {
  const materialy = MATERIALY.filter((m) => m.modul.href === modulHref);
  if (!materialy.length) return <>{children}</>;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,56rem)_17.5rem] lg:justify-between lg:gap-x-12 [&>nav]:order-3 [&>section]:order-1 lg:[&>nav]:col-start-1 lg:[&>nav]:row-start-2 lg:[&>section]:col-start-1 lg:[&>section]:row-start-1">
      {children}

      <aside
        aria-labelledby="do-druku"
        className={`materialy-akcent ${kartkaFont.variable} order-2 mb-16 lg:col-start-2 lg:row-span-2 lg:row-start-1`}
      >
        <div className="lg:sticky lg:top-24">
          <h2 id="do-druku" className="text-lg font-bold tracking-tight">
            Ściąga i fiszki do druku
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Cały moduł na kartkach A4 — do zeszytu i na powtórkę.</p>

          <div className="mata relative mt-4 h-52 overflow-hidden rounded-sm">
            {materialy.slice(0, 2).map((m, i) => (
              <Link
                key={m.slug}
                href={materialHref(m)}
                aria-label={`Zobacz: ${m.tytul}`}
                className={`cien-kartki absolute w-[44%] transition-[translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 focus-visible:-translate-y-2 ${UKLAD_KARTEK[i]}`}
              >
                <Miniatura material={m} />
              </Link>
            ))}
          </div>

          <ul className="mt-4 divide-y border-y">
            {materialy.map((m) => (
              <li key={m.slug} className="flex items-center justify-between gap-3 py-3">
                <Link href={materialHref(m)} className="group min-w-0">
                  <span className="block text-sm font-semibold group-hover:underline group-hover:underline-offset-4">
                    {m.rodzaj === 'sciaga' ? 'Ściąga' : 'Fiszki'}
                  </span>
                  <span className="block text-xs tabular-nums text-muted-foreground">
                    {m.rodzaj === 'sciaga' ? '1 strona A4' : `${m.karty.length} fiszek do wycięcia`}
                  </span>
                </Link>
                <PrzyciskPobierz
                  przedmiot={m.przedmiot}
                  slug={m.slug}
                  tytul={m.tytul}
                  href={materialHref(m)}
                  wyglad="jasny"
                />
              </li>
            ))}
          </ul>

          <TeczkaKolumna />

          <Link
            href="/materialy"
            className="group mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Wszystkie materiały do druku
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
