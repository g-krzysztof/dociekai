import { Printer, Scissors } from 'lucide-react';
import type { Fiszka as FiszkaData, WariantPdf, ZestawFiszek } from '../data/types';
import { PRZEDMIOTY } from '../data';
import { Schemat } from './schemat';
import { Tresc } from './tresc';

/** Jedna strona karty. Wymiary w cqw karty (na wydruku 95 × 70 mm). */
export function Fiszka({
  zestaw,
  fiszka,
  numer,
  strona,
}: {
  zestaw: ZestawFiszek;
  fiszka: FiszkaData;
  numer: number;
  strona: 'awers' | 'rewers';
}) {
  const licznik = `${numer}/${zestaw.karty.length}`;

  if (strona === 'awers') {
    return (
      <div className="fiszka" data-strona="awers">
        <div className="fiszka-wnetrze">
          <p className="fiszka-metka">
            <span>{zestaw.modul.tytul}</span>
            <span>{licznik}</span>
          </p>
          <div className="fiszka-tresc">
            <p className="fiszka-pytanie">
              <Tresc tekst={fiszka.awers.pytanie} />
            </p>
            {fiszka.awers.schemat && (
              <div className="fiszka-schemat">
                <Schemat schemat={fiszka.awers.schemat} />
              </div>
            )}
          </div>
          <p className="fiszka-stopka">
            <span>dociekai.pl</span>
            <span>pytanie</span>
          </p>
        </div>
      </div>
    );
  }

  const { odpowiedz, wyjasnienie, schemat } = fiszka.rewers;
  return (
    <div className="fiszka" data-strona="rewers">
      <div className="fiszka-wnetrze">
        <p className="fiszka-metka">
          <span>Odpowiedź</span>
          <span>{licznik}</span>
        </p>
        <div className="fiszka-tresc">
          <p className="fiszka-odpowiedz" data-dluga={odpowiedz.length > 26}>
            <Tresc tekst={odpowiedz} />
          </p>
          {schemat && (
            <div className="fiszka-schemat">
              <Schemat schemat={schemat} />
            </div>
          )}
          {wyjasnienie && (
            <p className="fiszka-wyjasnienie">
              <Tresc tekst={wyjasnienie} />
            </p>
          )}
        </div>
        <p className="fiszka-stopka">
          <span>
            {PRZEDMIOTY[zestaw.przedmiot].nazwa.toLowerCase()} · klasa {zestaw.klasa}
          </span>
          <span>odpowiedź</span>
        </p>
      </div>
    </div>
  );
}

type Pozycja = { indeks: number; strona: 'awers' | 'rewers' } | null;

export interface StronaArkusza {
  pozycje: Pozycja[];
  opis: string;
}

/**
 * Rozkład kart na strony A4 (8 pól: 2 kolumny × 4 rzędy, czytane wierszami).
 *
 * - dwustronne: strona z awersami, po niej rewersy w lustrzanym układzie
 *   kolumn — przy obracaniu wzdłuż dłuższej krawędzi lewa kolumna awersu
 *   trafia na prawą kolumnę rewersu.
 * - składane: w każdym rzędzie awers po lewej i rewers po prawej tej samej
 *   karty; składasz kartkę wzdłuż pionowej linii i tniesz rzędy.
 */
export function rozlozArkusze(zestaw: ZestawFiszek, wariant: WariantPdf): StronaArkusza[] {
  const n = zestaw.karty.length;

  if (wariant === 'skladane') {
    const stron = Math.ceil(n / 4);
    return Array.from({ length: stron }, (_, s) => ({
      opis: `Arkusz ${s + 1}/${stron}`,
      pozycje: Array.from({ length: 8 }, (_, pole) => {
        const indeks = s * 4 + Math.floor(pole / 2);
        if (indeks >= n) return null;
        return { indeks, strona: pole % 2 === 0 ? 'awers' : 'rewers' } as const;
      }),
    }));
  }

  const arkuszy = Math.ceil(n / 8);
  return Array.from({ length: arkuszy }, (_, a) => {
    const awers = Array.from({ length: 8 }, (_, pole): Pozycja => {
      const indeks = a * 8 + pole;
      return indeks < n ? { indeks, strona: 'awers' } : null;
    });
    const rewers = Array.from({ length: 8 }, (_, pole): Pozycja => {
      const rzad = Math.floor(pole / 2);
      const kolumna = pole % 2;
      const indeks = a * 8 + rzad * 2 + (1 - kolumna);
      return indeks < n ? { indeks, strona: 'rewers' } : null;
    });
    return [
      { opis: `Arkusz ${a + 1}/${arkuszy} · awers`, pozycje: awers },
      { opis: `Arkusz ${a + 1}/${arkuszy} · rewers`, pozycje: rewers },
    ];
  }).flat();
}

// Linie siatki w cqw strony — te same co `.arkusz-fiszek` w materialy.css.
const X = [4.76, 50, 95.24];
const Y = [0, 1, 2, 3, 4].map((k) => 4.4 + k * ((141.42 - 8.8) / 4));

/** Strona A4 z ośmioma polami na karty. */
export function StronaFiszek({
  zestaw,
  strona,
  wariant,
}: {
  zestaw: ZestawFiszek;
  strona: StronaArkusza;
  wariant: WariantPdf;
}) {
  const instrukcja =
    wariant === 'skladane'
      ? 'Złóż wzdłuż kropkowanej linii, potem tnij po przerywanych'
      : 'Druk dwustronny, obracanie wzdłuż dłuższej krawędzi, skala 100%';

  return (
    <article className="kartka" data-przedmiot={zestaw.przedmiot}>
      {X.map((x) => (
        <span key={`g${x}`}>
          <span className="arkusz-znacznik" style={{ left: `${x}cqw`, top: '1.2cqw', width: '0.12cqw', height: '2.4cqw' }} />
          <span className="arkusz-znacznik" style={{ left: `${x}cqw`, bottom: '1.2cqw', width: '0.12cqw', height: '2.4cqw' }} />
        </span>
      ))}
      {Y.map((y) => (
        <span key={`p${y}`}>
          <span className="arkusz-znacznik" style={{ top: `${y}cqw`, left: '1.4cqw', height: '0.12cqw', width: '2.4cqw' }} />
          <span className="arkusz-znacznik" style={{ top: `${y}cqw`, right: '1.4cqw', height: '0.12cqw', width: '2.4cqw' }} />
        </span>
      ))}

      <div className="arkusz-fiszek" data-wariant={wariant}>
        {strona.pozycje.map((p, pole) =>
          p ? (
            <Fiszka
              key={pole}
              zestaw={zestaw}
              fiszka={zestaw.karty[p.indeks]}
              numer={p.indeks + 1}
              strona={p.strona}
            />
          ) : (
            <div key={pole} className="fiszka" />
          ),
        )}
      </div>

      <p className="arkusz-instrukcja">
        <span>
          {wariant === 'skladane' ? <Scissors aria-hidden /> : <Printer aria-hidden />}
          {instrukcja}
        </span>
        <span>
          {zestaw.tytul} · {strona.opis}
        </span>
      </p>
    </article>
  );
}
