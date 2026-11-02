import type { Korpus } from '../../../lib/korpus/types';
import type { Ksztalt, MinaTwarzy, Postac } from '../../twarz/twarz';
import type { Skutek } from './skutki';

/**
 * L1, blok 2 „Co zrobiły słowa” po przeglądzie 2026-10-19 (R5): **gumka zamiast pary stuknięć**.
 * „Poranek przy Lipowej” to pięć kadrów — kwestia w dymku, a pod nią twarz i
 * reakcja odbiorcy (słowa i reakcje biorą się z fragmentów `u*`/`r*` w
 * `poranek.ts`, więc tekst żyje w jednym miejscu). Dziecko ściera słowa w
 * dymku; jeśli zetrze słowo, które **robi** skutek, reakcja się zmienia.
 *
 * `klucz` to słowa, bez których skutek znika. Tylko „przepraszam” i „dziękuję”
 * same są czynnością; obietnicę robi całe zdanie (kto, co i kiedy zrobi), a
 * bez „naprawię” nie wiadomo, co obiecano; żart stoi na „czyta” (kot, który
 * czyta — skreślenie kota zostawia czytanie gazety od końca, nadal śmieszne),
 * docinek na porównaniu do kurczaka. `wyjasnienie` mówi to
 * uczciwie po trafieniu — nie udaje, że jedno słowo zawsze robi wszystko
 * (raport testera 2026-10-19). Reakcja bez klucza (`bez`) mówi, co odbiorca
 * usłyszał zamiast tego — skutek, nie ocena.
 */

export interface Kadr {
  /** Id wypowiedzi w `poranek.ts` (`u1`…). */
  id: 'u1' | 'u2' | 'u3' | 'u4' | 'u5';
  /** Id reakcji w `poranek.ts`. */
  reakcja: string;
  kind: Skutek['kind'];
  mowi: Postac;
  slucha: Postac;
  podpis: string;
  /** Słowa (małe litery), bez których skutek znika — wystarczy zetrzeć jedno. */
  klucz: string[];
  twarz: { mina?: MinaTwarzy; ksztalt?: Ksztalt };
  bez: { reakcja: string; mina: MinaTwarzy };
  /** Po trafieniu: co naprawdę robiło skutek i jaką rolę grało starte słowo. */
  wyjasnienie: string;
}

export const KADRY: Kadr[] = [
  {
    id: 'u1',
    reakcja: 'r1',
    kind: 'przeprosiny',
    mowi: 'tymek',
    slucha: 'halina',
    podpis: 'Tymek do pani Haliny',
    klucz: ['przepraszam'],
    twarz: { mina: 'usmiech' },
    bez: { reakcja: 'Pani Halina marszczy brwi: „No i co ja mam teraz zrobić z tą doniczką?”', mina: 'grymas' },
    wyjasnienie:
      'Bez „Przepraszam” zostaje sama wiadomość o stłuczonej doniczce. To słowo samo jest czynnością: mówisz je i już przepraszasz. Reszta zdania mówi, za co.',
  },
  {
    id: 'u2',
    reakcja: 'r2',
    kind: 'zranienie',
    mowi: 'tymek',
    slucha: 'zuzia',
    podpis: 'Tymek do Zuzi',
    klucz: ['kurczak'],
    twarz: { ksztalt: { brwi: 0.5, oczy: -0.5, usta: -0.8 } },
    bez: { reakcja: 'Zuzia patrzy zdziwiona: „Jak co?”', mina: 'zdziwienie' },
    wyjasnienie:
      'Docinek robi porównanie: Zuzia jest jak kurczak. Bez „kurczak” nie ma porównania, więc nie ma czym jej dokuczyć.',
  },
  {
    id: 'u3',
    reakcja: 'r3',
    kind: 'rozsmieszenie',
    mowi: 'bogdan',
    slucha: 'halina',
    podpis: 'Pan Bogdan do pani Haliny',
    klucz: ['czyta'],
    twarz: { mina: 'smiech' },
    bez: { reakcja: 'Pani Halina patrzy pytająco: „Mruczek znowu co?”', mina: 'zdziwienie' },
    wyjasnienie:
      'Śmieszne jest to, że kot czyta gazetę — i to zawsze od końca. Bez „czyta” zostaje kot i gazeta, a z tego nikt się nie śmieje.',
  },
  {
    id: 'u4',
    reakcja: 'r4',
    kind: 'obietnica',
    mowi: 'tymek',
    slucha: 'zuzia',
    podpis: 'Tymek do Zuzi',
    klucz: ['naprawię'],
    twarz: { mina: 'usmiech' },
    bez: { reakcja: 'Zuzia pyta: „Jutro… co jutro?”', mina: 'zdziwienie' },
    wyjasnienie:
      'Obietnicę robi całe zdanie: kto, co i kiedy zrobi, a „słowo” dodaje mu powagi. Bez „naprawię” nie wiadomo, co Tymek obiecuje — więc obietnicy nie ma.',
  },
  {
    id: 'u5',
    reakcja: 'r5',
    kind: 'podziekowanie',
    mowi: 'halina',
    slucha: 'ola',
    podpis: 'Pani Halina do Oli',
    klucz: ['dziękuję'],
    twarz: { mina: 'usmiech' },
    bez: { reakcja: 'Ola kiwa głową: „Pelargonie już w nowej doniczce”.', mina: 'spokoj' },
    wyjasnienie:
      'Bez „Dziękuję” zostaje tylko opis tego, co zrobiła Ola. To słowo, jak „przepraszam”, samo jest czynnością.',
  },
];

/** „Bez »przepraszam« nie ma …” — czego brakuje, kiedy znika klucz. */
export const BEZ_CZEGO: Record<Skutek['kind'], string> = {
  przeprosiny: 'przeprosin',
  rozsmieszenie: 'żartu',
  zranienie: 'docinka',
  obietnica: 'obietnicy',
  podziekowanie: 'podziękowania',
};

/** Najwięcej słów startych naraz, żeby trafienie się liczyło — gumka po całym dymku niczego nie dowodzi. */
export const MAX_STARTYCH = 3;

export type WynikGumki =
  | { wynik: 'trafione'; kadr: Kadr; klucz: string[] }
  | { wynik: 'inny-skutek'; kadr: Kadr }
  | { wynik: 'za-duzo'; kadr: Kadr }
  | { wynik: 'zostal'; kadr: Kadr };

/** Czy po starciu tych słów (formy, dowolna wielkość liter) skutek kadru znika. */
export function skutekZnika(kadr: Kadr, starte: string[]): boolean {
  const low = starte.map((s) => s.toLowerCase());
  return kadr.klucz.some((k) => low.includes(k));
}

/** Sędzia jednego pociągnięcia gumką: w którym kadrze, które słowa, czego szukamy. */
export function ocenGumke(kadrId: Kadr['id'], starte: string[], szukany: Skutek['kind']): WynikGumki {
  const kadr = KADRY.find((k) => k.id === kadrId)!;
  if (!skutekZnika(kadr, starte)) return { wynik: 'zostal', kadr };
  if (kadr.kind !== szukany) return { wynik: 'inny-skutek', kadr };
  if (starte.length > MAX_STARTYCH) return { wynik: 'za-duzo', kadr };
  const low = starte.map((s) => s.toLowerCase());
  return { wynik: 'trafione', kadr, klucz: kadr.klucz.filter((k) => low.includes(k)) };
}

/** Tekst fragmentu bez myślnika dialogowego na początku. */
export function tekstFragmentu(k: Korpus, id: string): string {
  const ids = k.spans[id]?.tokenIds ?? [];
  return ids
    .map((t, i) => k.tokenById[t].form + (i < ids.length - 1 ? k.tokenById[t].after : ''))
    .join('')
    .replace(/^—\s*/, '');
}
