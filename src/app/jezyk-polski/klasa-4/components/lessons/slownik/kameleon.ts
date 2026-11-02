/**
 * L10 blok 2 — „Słowo-kameleon” (dane i sędzia; teksty T-L10-2 napisane dla kursu).
 *
 * Każde zdanie ma hasło (`{#haslo}`) i słowa z własnym id. Przy słowie stoi
 * lista znaczeń hasła, z którymi to słowo **da się pogodzić** (`pasuje`).
 * Słowo pasujące do jednego znaczenia to **kotwica** — ono przesądza; słowo
 * bez wpisu pasuje do każdego. Sędzia nie zna „naszej” odpowiedzi poza tą
 * listą: kotwicę dziecko może sprawdzić samo, podstawiając inne znaczenie.
 */

import { buildKorpus, type Korpus } from '../../../lib/korpus';

export interface ZdanieKameleon {
  id: string;
  haslo: 'zamek' | 'klucz';
  /** Numer znaczenia (od 1). */
  znaczenie: number;
  body: string;
  /** id słowa → numery znaczeń, z którymi słowo się godzi. Brak wpisu = każde. */
  pasuje: Record<string, number[]>;
  /** Co wyszłoby przy złym numerze (numer → zdanie skutku). */
  absurd: Record<number, string>;
}

export const ZDANIA: ZdanieKameleon[] = [
  {
    id: 'z1',
    haslo: 'zamek',
    znaczenie: 1,
    body: 'Rycerze{#rycerze} wrócili{#wrocili} do zamku{#haslo} na wzgórzu{#wzgorzu}.',
    pasuje: { rycerze: [1], wzgorzu: [1] },
    absurd: {
      2: 'Rycerze wracają do zamka w drzwiach? Musieliby być mniejsi od klucza.',
      3: 'Rycerze wracają do zamka błyskawicznego? Przecież nie zmieszczą się w kurtce.',
    },
  },
  {
    id: 'z2',
    haslo: 'zamek',
    znaczenie: 2,
    body: 'Klucz{#klucz} utknął{#utknal} w zamku{#haslo} od piwnicy{#piwnicy}.',
    pasuje: { klucz: [2], piwnicy: [2] },
    absurd: {
      1: 'Cały zamek z wieżami w drzwiach piwnicy? Piwnica jest dużo mniejsza od zamku.',
      3: 'Klucz w zamku błyskawicznym? Zamek błyskawiczny nie ma dziurki od klucza.',
    },
  },
  {
    id: 'z3',
    haslo: 'zamek',
    znaczenie: 3,
    body: 'Zamek{#haslo} w kurtce{#kurtce} znów{#znow} się zaciął{#zacial}.',
    pasuje: { kurtce: [3], zacial: [2, 3] },
    absurd: {
      1: 'Budowla z wieżami w kurtce? Taka kurtka ważyłaby więcej niż dom.',
      2: 'Zamek na klucz w kurtce? Kurtki nie zamyka się na klucz.',
    },
  },
  {
    id: 'k1',
    haslo: 'klucz',
    znaczenie: 1,
    body: 'Sąsiadka{#sasiadka} zostawiła{#zostawila} klucz{#haslo} pod wycieraczką{#wycieraczka}.',
    pasuje: { wycieraczka: [1] },
    absurd: {
      2: 'Znak z pięciolinii pod wycieraczką? Wycieraczka leży przed drzwiami, a tam przydaje się coś innego.',
      3: 'Stado gęsi pod wycieraczką? Tam nie zmieści się nawet jedna.',
    },
  },
  {
    id: 'k2',
    haslo: 'klucz',
    znaczenie: 2,
    body: 'Na pięciolinii{#pieciolinii} przed pierwszą{#pierwsza} nutą{#nuta} Ola narysowała{#narysowala} klucz{#haslo}.',
    pasuje: { pieciolinii: [2], nuta: [2] },
    absurd: {
      1: 'Klucz do drzwi na pięciolinii? Przed nutą stoi znak, a nie coś, czym otwiera się zamek.',
      3: 'Klucz gęsi przed pierwszą nutą? Ptaki nie siadają na pięciolinii.',
    },
  },
  {
    id: 'k3',
    haslo: 'klucz',
    znaczenie: 3,
    body: 'Nad{#nad} jeziorem{#jeziorem} przeleciał{#przelecial} klucz{#haslo} dzikich{#dzikich} gęsi{#gesi}.',
    pasuje: { przelecial: [1, 3], dzikich: [3], gesi: [3] },
    absurd: {
      1: 'Klucz do drzwi „dzikich gęsi”? Gęsi nie mają drzwi.',
      2: 'Znak z pięciolinii zrobiony z gęsi? Gęsi lecą, a nie stoją przed nutą.',
    },
  },
];

export const KORPUSY: Record<string, Korpus> = Object.fromEntries(
  ZDANIA.map((z) => [z.id, buildKorpus({ id: `l10-${z.id}`, layout: 'prose', body: z.body })])
);

export type OcenaSlowa =
  | { rodzaj: 'kotwica'; znaczenie: number }
  | { rodzaj: 'haslo' }
  | { rodzaj: 'kilka'; znaczenia: number[] }
  | { rodzaj: 'kazde' };

export function ocenSlowo(z: ZdanieKameleon, tokenId: string): OcenaSlowa {
  if (tokenId === 'haslo') return { rodzaj: 'haslo' };
  const p = z.pasuje[tokenId];
  if (!p) return { rodzaj: 'kazde' };
  if (p.length === 1) return { rodzaj: 'kotwica', znaczenie: p[0] };
  return { rodzaj: 'kilka', znaczenia: [...p].sort((a, b) => a - b) };
}

/** Kotwice zdania (słowa pasujące do jednego znaczenia — zawsze do tego właściwego). */
export function kotwice(z: ZdanieKameleon): string[] {
  return Object.entries(z.pasuje)
    .filter(([, p]) => p.length === 1)
    .map(([id]) => id);
}

function lista(n: number[]): string {
  return n.length === 2 ? `${n[0]} i ${n[1]}` : `${n.slice(0, -1).join(', ')} i ${n[n.length - 1]}`;
}

/** Komunikat dla dziecka po stuknięciu słowa `forma` (forma z tekstu). */
export function tekstOceny(o: OcenaSlowa, forma: string, haslo: string, nazwy: string[]): string {
  switch (o.rodzaj) {
    case 'kotwica':
      return `Tak — „${forma}” pasuje tylko do znaczenia ${o.znaczenie}: ${nazwy[o.znaczenie - 1]}. To ono przesądza.`;
    case 'haslo':
      return `To sam ${haslo}. Szukasz słowa obok niego, które mówi, o który ${haslo} chodzi.`;
    case 'kilka':
      return `„${forma}” pasuje do znaczeń ${lista(o.znaczenia)} — samo nie rozstrzyga.`;
    case 'kazde':
      return `„${forma}” pasuje do każdego znaczenia — nie mówi, o który ${haslo} chodzi.`;
  }
}
