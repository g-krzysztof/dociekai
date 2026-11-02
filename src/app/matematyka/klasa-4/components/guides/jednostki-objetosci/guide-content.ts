import type { GuideActMeta } from '../guide-act';

/**
 * Wszystkie akty na `flow` — nic nie scrubuje scrollem, całe odkrywanie dzieje
 * się ruchem uchwytu i klikiem (`mode: 'stage'` to świadomy
 * wyjątek, nie domyślna opcja).
 */
export const ACTS: GuideActMeta[] = [
  { id: 'otwarcie', label: 'Czym mierzy się objętość?', mode: 'flow' },
  { id: 'bok-a-objetosc', label: 'Bok ×10, objętość ×1000', mode: 'flow' },
  { id: 'litr-i-decymetr', label: 'Litr i decymetr sześcienny', mode: 'flow' },
  { id: 'drabina', label: 'Drabinka jednostek', mode: 'flow' },
  { id: 'wokol-ciebie', label: 'Wokół ciebie', mode: 'flow' },
];

/**
 * Trzy równości, które łączą oba słowniki. Świadomie tylko trzy — reszta
 * przewodnika wyprowadza się z nich w pamięci, a nie z kolejnej tabelki.
 */
export interface TwinRule {
  id: string;
  capacity: string;
  volume: string;
  why: string;
}

export const TWIN_RULES: TwinRule[] = [
  {
    id: 'ml',
    capacity: '1 ml',
    volume: '1 cm³',
    why: 'Mililitr to dokładnie tyle, ile mieści kostka o boku 1 cm. Miarka „5 ml” na butelce syropu to pięć takich kostek.',
  },
  {
    id: 'l',
    capacity: '1 l',
    volume: '1 dm³',
    why: 'Litr to sześcian o boku 10 cm. Dlatego karton mleka jest mniej więcej takim sześcianem — tylko rozciągniętym w wyższy prostopadłościan.',
  },
  {
    id: 'm3',
    capacity: '1000 l',
    volume: '1 m³',
    why: 'Sześcian o boku 1 metra mieści tysiąc kartonów mleka. Tak liczy się wodę w rachunku i beton na budowie.',
  },
];

/** Dobieranie jednostki do sytuacji — jedna wygodna, reszta prawdziwa, ale nieporęczna. */
export type { UnitPick } from '../unit-pick-board';
import type { UnitPick } from '../unit-pick-board';

export const UNIT_PICKS: UnitPick[] = [
  {
    id: 'kostka-cukru',
    thing: 'kostka cukru',
    options: ['mm³', 'cm³', 'dm³', 'm³'],
    correct: 'cm³',
    why: 'Kostka cukru ma kilka centymetrów sześciennych. W milimetrach sześciennych wyszłyby tysiące, a w decymetrach — ułamek.',
  },
  {
    id: 'lekarstwo',
    thing: 'porcja syropu odmierzana miarką',
    options: ['l', 'dm³', 'ml', 'm³'],
    correct: 'ml',
    why: 'Lekarstwa odmierza się w mililitrach — typowa porcja to 5 albo 10 ml. W litrach byłoby to 0,005 l, czyli liczba nie do wymówienia.',
  },
  {
    id: 'wanna',
    thing: 'woda w wannie',
    options: ['ml', 'cm³', 'm³', 'l'],
    correct: 'l',
    why: 'Wanna mieści około 150 litrów. W mililitrach to 150 000, a w metrach sześciennych 0,15 — obie liczby prawdziwe, ale niewygodne.',
  },
  {
    id: 'beton',
    thing: 'beton wylany na fundament domu',
    options: ['m³', 'l', 'ml', 'dm³'],
    correct: 'm³',
    why: 'Beton zamawia się w metrach sześciennych — „potrzeba 12 m³”. W litrach byłoby to 12 000.',
  },
];

export const REAL_LIFE_EXAMPLES: string[] = [
  'Butelka wody: „1,5 l” to dokładnie to samo, co 1,5 dm³.',
  'Syrop na kaszel: miarka „5 ml” mieści tyle, co 5 kostek o boku 1 cm.',
  'Karton mleka to równo 1 litr, czyli 1 dm³ — sześcian o boku 10 cm.',
  'Silnik samochodu: „pojemność 1,6 litra” podaje się też jako 1600 cm³.',
  'Rachunek za wodę liczy zużycie w metrach sześciennych; 1 m³ to 1000 litrów.',
  'Ciężarówka z betonem: „12 m³” to 12 sześcianów o boku jednego metra.',
];
