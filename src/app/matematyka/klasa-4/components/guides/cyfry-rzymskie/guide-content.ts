import { toRoman, ROMAN_SYMBOLS, SUBTRACTIVE_PAIRS } from '../../../lib/roman';
import type { GuideActMeta } from '../guide-act';

/**
 * Wszystkie akty na `flow` (2026-08-12, druga tura). `otwarcie`/`kreski`/
 * `siedem-znakow`/`dodawanie` genuinely use `useActProgress`/`useActStep`
 * (odometer ticking, carved-letter build) and were initially kept on
 * `stage` as a justified exception — but będąc pierwszymi czterema aktami
 * z ośmiu, sprawiały, że połowa przewodnika wyglądała identycznie jak przed
 * poprawką (duże puste marginesy wokół stosunkowo skromnej treści, wciąż
 * wyśrodkowanej w pełnowysokościowym pudełku — patrz `guide-act.tsx`'s
 * `lg:items-center lg:h-[100svh]`). Bez `cinematic` te komponenty po prostu
 * pokazują stan końcowy natychmiast (ten sam fallback co na
 * mobile/reduced-motion) — nic się nie psuje, znika tylko samo tykanie/
 * wykuwanie. `odejmowanie` nigdy nie miało scrubu i poszło na `flow` jako
 * pierwsze, w pierwszej turze.
 */
export const ACTS: GuideActMeta[] = [
  { id: 'otwarcie', label: 'Napis', mode: 'flow' },
  { id: 'kreski', label: 'Dlaczego nie kreski', mode: 'flow' },
  { id: 'siedem-znakow', label: 'Siedem znaków', mode: 'flow' },
  { id: 'dodawanie', label: 'Dodawanie', mode: 'flow' },
  { id: 'powtorzenia', label: 'Najwyżej trzy', mode: 'flow' },
  { id: 'odejmowanie', label: 'Sześć par', mode: 'flow' },
  { id: 'tarcza', label: 'Pobaw się', mode: 'flow' },
  { id: 'wokol-ciebie', label: 'Wokół ciebie', mode: 'flow' },
];

export interface Inscription {
  value: number;
  symbols: string;
  label: string;
}

/** Napisy do „odblokowania” — zapis zawsze z `toRoman`, nigdy wpisany ręcznie. */
export const INSCRIPTIONS: Inscription[] = [
  { value: 2026, label: 'ten rok' },
  { value: 1918, label: 'rok odzyskania niepodległości' },
  { value: 3999, label: 'największa liczba, jaką tu zapiszesz' },
].map((item) => ({ ...item, symbols: toRoman(item.value) }));

/** Liczba kresek w akcie „kreski”: XXXVIII — czysto addytywna, bez odejmowania. */
export const TALLY_TARGET = 38;

export interface SymbolDetail {
  symbol: string;
  value: number;
  repeatable: boolean;
  /** Skąd bierze się następny symbol — zdanie prawdziwe definicyjnie. */
  note: string;
  /** Gdzie dziecko realnie może ten znak zobaczyć. */
  where: string;
}

const SYMBOL_NOTES: Record<string, { note: string; where: string }> = {
  I: { note: 'Pięć takich to już V.', where: 'godziny na tarczy zegara' },
  V: {
    note: 'Dwa razy V to X, dlatego V nigdy się nie powtarza.',
    where: 'godzina piąta na zegarze',
  },
  X: { note: 'Pięć razy X to L.', where: 'numery rozdziałów w książkach' },
  L: {
    note: 'Dwa razy L to C, dlatego L nigdy się nie powtarza.',
    where: 'daty na starych budynkach',
  },
  C: { note: 'Pięć razy C to D.', where: 'numery wieków, np. XIX' },
  D: { note: 'Dwa razy D to M, dlatego D nigdy się nie powtarza.', where: 'daty na pomnikach' },
  M: { note: 'Trzy M to 3000 — więcej się już nie da.', where: 'lata w napisach końcowych filmów' },
};

export const SYMBOL_DETAILS: SymbolDetail[] = ROMAN_SYMBOLS.map((item) => ({
  ...item,
  note: SYMBOL_NOTES[item.symbol].note,
  where: SYMBOL_NOTES[item.symbol].where,
}));

/**
 * Liczba czytana w akcie „dodawanie”. MUSI być zapisem czysto addytywnym —
 * naiwne sumowanie wartości liter jest poprawne wyłącznie wtedy. Nie podmieniaj
 * jej na coś z odejmowaniem (np. MCMXCIV), bo licznik zacznie kłamać.
 */
export const ADDITIVE_READING = 2026;

/** Kandydaci do pytania „czy tak wolno?” — trzy legalne pary i pięć nielegalnych. */
export interface PairCandidate {
  symbols: string;
  legal: boolean;
  explanation: string;
}

const legalExplanation = (symbols: string): string => {
  const pair = SUBTRACTIVE_PAIRS.find((item) => item.symbols === symbols)!;
  return `Tak. ${pair.minus} przed ${pair.from} odejmuje: ${pair.symbols} = ${pair.value}.`;
};

export const PAIR_CANDIDATES: PairCandidate[] = [
  { symbols: 'IV', legal: true, explanation: legalExplanation('IV') },
  {
    symbols: 'IL',
    legal: false,
    explanation: 'Nie. I odejmuje się tylko przed V i X. 49 zapiszesz jako XLIX.',
  },
  { symbols: 'XC', legal: true, explanation: legalExplanation('XC') },
  {
    symbols: 'VX',
    legal: false,
    explanation: 'Nie. V nigdy nie odejmuje — odejmują tylko I, X i C.',
  },
  { symbols: 'CM', legal: true, explanation: legalExplanation('CM') },
  {
    symbols: 'IC',
    legal: false,
    explanation: 'Nie. I odejmuje się tylko przed V i X. 99 zapiszesz jako XCIX.',
  },
  {
    symbols: 'LC',
    legal: false,
    explanation: 'Nie. L nigdy nie odejmuje — odejmują tylko I, X i C.',
  },
  {
    symbols: 'XD',
    legal: false,
    explanation: 'Nie. X odejmuje się tylko przed L i C. 490 zapiszesz jako CDXC.',
  },
];

/** Wieki do mini-widgetu „wokół ciebie” — zakres wyliczany, nie wpisywany. */
export const CENTURIES = [18, 19, 20, 21].map((century) => ({
  century,
  symbols: toRoman(century),
  from: (century - 1) * 100 + 1,
  to: century * 100,
}));
