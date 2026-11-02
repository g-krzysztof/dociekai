import type { GuideActMeta } from '../guide-act';

/**
 * Wszystkie akty na `flow` — nic nie scrubuje scrollem, całe odkrywanie dzieje
 * się ruchem uchwytu i klikiem (`mode: 'stage'` to świadomy
 * wyjątek, nie domyślna opcja).
 */
export const ACTS: GuideActMeta[] = [
  { id: 'otwarcie', label: 'Czym mierzy się pole?', mode: 'flow' },
  { id: 'bok-a-pole', label: 'Bok ×10, pole ×100', mode: 'flow' },
  { id: 'drabina', label: 'Drabinka jednostek', mode: 'flow' },
  { id: 'ar-i-hektar', label: 'Ar i hektar', mode: 'flow' },
  { id: 'wokol-ciebie', label: 'Wokół ciebie', mode: 'flow' },
];

/** Duże jednostki rozpisane na to, co dziecko realnie zna. */
export interface BigUnitFact {
  code: string;
  side: string;
  inMeters: string;
  reference: string;
}

export const BIG_UNITS: BigUnitFact[] = [
  {
    code: 'ar',
    side: 'kwadrat o boku 10 m',
    inMeters: '100 m²',
    reference:
      'Tyle mniej więcej ma niewielki ogródek działkowy albo duży pokój dzienny razem z kuchnią. Dawniej mówiło się na to „ara”.',
  },
  {
    code: 'hektar',
    side: 'kwadrat o boku 100 m',
    inMeters: '10 000 m², czyli 100 arów',
    reference:
      'Boisko piłkarskie razem z wybiegami to około 0,7 hektara. Hektarami mierzy się pola uprawne, lasy i duże działki.',
  },
  {
    code: 'km²',
    side: 'kwadrat o boku 1000 m',
    inMeters: '1 000 000 m², czyli 100 hektarów',
    reference:
      'Kilometrami kwadratowymi podaje się powierzchnię miast, jezior i państw. Warszawa ma około 517 km².',
  },
];

/** Typ `UnitPick` mieszka przy współdzielonym widżecie — ten przewodnik był
 *  jego pierwszym, ale nie jedynym konsumentem (patrz `przewodnik-jednostki-objetosci`). */
export type { UnitPick } from '../unit-pick-board';
import type { UnitPick } from '../unit-pick-board';

export const UNIT_PICKS: UnitPick[] = [
  {
    id: 'znaczek',
    thing: 'znaczek pocztowy',
    options: ['mm²', 'cm²', 'm²', 'ha'],
    correct: 'cm²',
    why: 'Znaczek ma kilka centymetrów kwadratowych. W milimetrach kwadratowych wyszłyby setki, a to niewygodne.',
  },
  {
    id: 'pokoj',
    thing: 'podłoga w twoim pokoju',
    options: ['cm²', 'dm²', 'm²', 'km²'],
    correct: 'm²',
    why: 'Pokoje mierzy się w metrach kwadratowych — typowy dziecięcy pokój ma ich kilkanaście.',
  },
  {
    id: 'boisko',
    thing: 'boisko do piłki nożnej',
    options: ['m²', 'ha', 'km²', 'dm²'],
    correct: 'ha',
    why: 'Boisko ma około 0,7 hektara. W metrach kwadratowych to ponad siedem tysięcy — liczba prawdziwa, ale nieporęczna.',
  },
  {
    id: 'miasto',
    thing: 'powierzchnia Warszawy',
    options: ['ha', 'km²', 'm²', 'a'],
    correct: 'km²',
    why: 'Miasta i państwa podaje się w kilometrach kwadratowych. Warszawa ma ich około 517.',
  },
];

export const REAL_LIFE_EXAMPLES: string[] = [
  'Metraż mieszkania w ogłoszeniu: „54 m²” to pole podłogi wszystkich pokoi razem.',
  'Puszka farby: „wystarczy na 12 m²” — tyle ściany zamalujesz jedną puszką.',
  'Działka w ogłoszeniu: „8 arów”, czyli 800 m².',
  'Gospodarstwo rolne: „15 hektarów pola” — 150 000 m².',
  'Kartka A4 ma około 6 dm², czyli 600 cm².',
  'Powierzchnia Polski to 312 700 km².',
];
