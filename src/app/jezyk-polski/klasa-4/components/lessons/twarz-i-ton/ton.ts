import type { Ksztalt } from '../../twarz/twarz';
import type { ClipSpec } from '../../../lib/lektor/types';

/**
 * L4, blok 1 „No pięknie.” — twarz i ton przy tych samych słowach.
 *
 * „No pięknie.” to **prawdziwa dwuznaczność polszczyzny**: zachwyt albo
 * ironiczna złość — i tylko te dwa odczyty gra lekcja (uwaga autora kursu
 * z L1: jedno słowo bywa dwuznaczne, ale nie obsłuży wszystkich intencji —
 * blok 3 pokazuje, że w piśmie robią to słowa). Zuzia czyta twarz i ton
 * osobno, a potem razem: zgodne — rozumie; sprzeczne — jest zbita z tropu.
 */

export type Odczyt = 'radosc' | 'zlosc' | 'nijaki';
export type Ton = 'zachwyt' | 'zlosc' | 'obojetny';

export const TONY: { id: Ton; label: string }[] = [
  { id: 'zachwyt', label: 'z zachwytem' },
  { id: 'zlosc', label: 'ze złością' },
  { id: 'obojetny', label: 'obojętnie' },
];

/** Trzy nagrania tych samych słów (rejestr T-L4-1) — sprawdzić uchem. */
export const NO_PIEKNIE: Record<Ton, ClipSpec> = {
  zachwyt: { text: 'No pięknie!', style: 0.75, stability: 0.3 },
  zlosc: { text: 'No pięknie.', style: 0.7, stability: 0.3 },
  obojetny: { text: 'No pięknie.', style: 0, stability: 0.85 },
};

export interface Sytuacja {
  id: 'tecza' | 'sok';
  kto: 'ola' | 'tymek';
  imie: string;
  /** Rodzaj gramatyczny postaci — do odmiany „zła / zły”. */
  rodzaj: 'f' | 'm';
  opis: string;
  /** Co ma zrozumieć Zuzia. */
  intencja: Exclude<Odczyt, 'nijaki'>;
}

export const SYTUACJE: Sytuacja[] = [
  { id: 'tecza', kto: 'ola', imie: 'Ola', rodzaj: 'f', opis: 'Ola wychodzi na podwórko, a nad rzeką stoi wielka tęcza. Ola się zachwyca.', intencja: 'radosc' },
  { id: 'sok', kto: 'tymek', imie: 'Tymek', rodzaj: 'm', opis: 'Tymek wylał cały sok na nowy dywan. Jest na siebie wściekły.', intencja: 'zlosc' },
];

/** Co mówi sama twarz. Progi jawne w kodzie, nie w głowie autora. */
export function odczytTwarzy(k: Ksztalt): Odczyt {
  if (k.usta >= 0.35 && k.brwi > -0.3) return 'radosc';
  if (k.usta <= -0.25 && k.brwi <= -0.3) return 'zlosc';
  return 'nijaki';
}

export const odczytTonu = (t: Ton | null): Odczyt => (t === 'zachwyt' ? 'radosc' : t === 'zlosc' ? 'zlosc' : 'nijaki');

export interface Zrozumienie {
  odczyt: Odczyt | 'sprzeczny';
  mowi: string;
  /** `mowi` to opis sceny, nie kwestia Zuzi (nikt jeszcze nic nie powiedział). */
  scena?: true;
}

export function zuzia(s: Sytuacja, k: Ksztalt, t: Ton | null): Zrozumienie {
  const f = odczytTwarzy(k);
  const v = odczytTonu(t);
  const kto = s.imie;
  if (t === null) return { odczyt: 'nijaki', mowi: 'Zuzia czeka, aż ktoś coś powie.', scena: true };
  if (f !== 'nijaki' && v !== 'nijaki' && f !== v)
    return {
      odczyt: 'sprzeczny',
      mowi: f === 'radosc' ? `Uśmiechasz się, a mówisz tak groźnie… ${kto}, o co chodzi?` : `Mówisz radośnie, a minę masz groźną… Nie rozumiem.`,
    };
  const r = f !== 'nijaki' ? f : v;
  if (r === 'nijaki') return { odczyt: 'nijaki', mowi: '„No pięknie”? Ale co czujesz? Nic nie widać i nic nie słychać.' };
  const pewna = f !== 'nijaki' && v !== 'nijaki';
  if (r === 'radosc') return { odczyt: 'radosc', mowi: pewna ? `${kto} się cieszy!` : `Chyba… ${kto} się cieszy? Nie jestem pewna.` };
  const zly = s.rodzaj === 'f' ? 'zła' : 'zły';
  return { odczyt: 'zlosc', mowi: pewna ? `Ojej, ${kto} jest ${zly}. Lepiej się nie odzywać.` : `Chyba… ${kto} jest ${zly}? Nie jestem pewna.` };
}

/** Sukces: Zuzia zrozumiała intencję na pewno (twarz i ton zgodne). */
export const trafione = (s: Sytuacja, k: Ksztalt, t: Ton | null) => {
  const z = zuzia(s, k, t);
  return z.odczyt === s.intencja && odczytTwarzy(k) === s.intencja && odczytTonu(t) === s.intencja;
};
