import type { GuideActMeta } from '../guide-act';

/**
 * Wszystkie akty na `flow` — ten przewodnik nie ma ani jednego elementu ze
 * scrubowaną, ciągłą animacją (`useActProgress`/`useActStep`); każde
 * odsłonięcie to `<Beat>` albo klik w `<PrefixLadder>`, a oba działają
 * identycznie w `flow` (przez `whileInView`), bez kosztu przypinania.
 * `stage` był tu domyślnym wyborem bez pokrycia w realnej animacji — stąd
 * puste, przyklejone ekrany przy przewijaniu. Poprawka 2026-08-12.
 */
export const ACTS: GuideActMeta[] = [
  { id: 'otwarcie', label: 'Dziewięć słów?', mode: 'flow' },
  { id: 'przedrostki', label: 'Jedna zasada', mode: 'flow' },
  { id: 'dlugosc', label: 'Drabinka długości', mode: 'flow' },
  { id: 'masa', label: 'Drabinka masy', mode: 'flow' },
  { id: 'wokol-ciebie', label: 'Wokół ciebie', mode: 'flow' },
];

export interface PrefixRung {
  id: 'mili' | 'centy' | 'decy' | 'baza' | 'deka' | 'kilo';
  prefixLabel: string;
  factorLabel: string;
  /** Etykieta w polu szczebla — brak = szczebel wygaszony (istnieje w systemie, ale nieużywany dla tej jednostki w tym kursie). */
  code?: string;
  /** Odsłaniany po kliknięciu — tylko gdy `code` jest ustawiony. */
  fact?: string;
}

/** Akt „Przedrostki" — abstrakcyjna drabinka, wszystkie sześć szczebli aktywne naraz. */
export const ABSTRACT_RUNGS: PrefixRung[] = [
  {
    id: 'mili',
    prefixLabel: 'mili-',
    factorLabel: '÷ 1000',
    code: 'mili',
    fact: 'Mili- zawsze znaczy jedną tysięczną, niezależnie od tego, do jakiej jednostki go doczepisz — mili-metr, mili-gram, mili-litr.',
  },
  {
    id: 'centy',
    prefixLabel: 'centy-',
    factorLabel: '÷ 100',
    code: 'centy',
    fact: 'Centy- zawsze znaczy jedną setną. Najlepiej znasz go z centymetra — sto centymetrów w metrze.',
  },
  {
    id: 'decy',
    prefixLabel: 'decy-',
    factorLabel: '÷ 10',
    code: 'decy',
    fact: 'Decy- zawsze znaczy jedną dziesiątą — jak w decymetrze.',
  },
  {
    id: 'baza',
    prefixLabel: '(baza)',
    factorLabel: '—',
    code: 'BAZA',
    fact: 'Jednostka bazowa nie ma żadnego przedrostka — to ona jest punktem odniesienia dla całej reszty.',
  },
  {
    id: 'deka',
    prefixLabel: 'deka-',
    factorLabel: '× 10',
    code: 'deka',
    fact: 'Deka- zawsze znaczy dziesięć razy więcej — jak w dekagramie.',
  },
  {
    id: 'kilo',
    prefixLabel: 'kilo-',
    factorLabel: '× 1000',
    code: 'kilo',
    fact: 'Kilo- zawsze znaczy tysiąc razy więcej — kilogram, kilometr, a nawet kilobajt w komputerze.',
  },
];

/** Akt „Długość" — baza: metr. Deka- wygaszone, bo „dekametr" nie jest w tym kursie używany. */
export const LENGTH_RUNGS: PrefixRung[] = [
  {
    id: 'mili',
    prefixLabel: 'mili-',
    factorLabel: '÷ 1000',
    code: 'mm',
    fact: '1 m = 1000 mm — milimetrem mierzysz grubość monety.',
  },
  {
    id: 'centy',
    prefixLabel: 'centy-',
    factorLabel: '÷ 100',
    code: 'cm',
    fact: '1 m = 100 cm — centymetrem mierzysz długość ołówka.',
  },
  {
    id: 'decy',
    prefixLabel: 'decy-',
    factorLabel: '÷ 10',
    code: 'dm',
    fact: '1 m = 10 dm — decymetr rzadko pada w rozmowie, ale to wygodny krok pośredni przy zamianie m na cm.',
  },
  {
    id: 'baza',
    prefixLabel: '(baza)',
    factorLabel: '—',
    code: 'm',
    fact: 'Metr to jednostka bazowa długości — wysokość klamki od podłogi to mniej więcej 1 m.',
  },
  { id: 'deka', prefixLabel: 'deka-', factorLabel: '× 10' },
  {
    id: 'kilo',
    prefixLabel: 'kilo-',
    factorLabel: '× 1000',
    code: 'km',
    fact: '1 km = 1000 m — tyle, ile trasa niedalekiego spaceru.',
  },
];

/** Akt „Masa" — baza: gram. Mili-/centy-/decy- wygaszone, bo w tym kursie się ich nie używa. */
export const MASS_RUNGS: PrefixRung[] = [
  { id: 'mili', prefixLabel: 'mili-', factorLabel: '÷ 1000' },
  { id: 'centy', prefixLabel: 'centy-', factorLabel: '÷ 100' },
  { id: 'decy', prefixLabel: 'decy-', factorLabel: '÷ 10' },
  {
    id: 'baza',
    prefixLabel: '(baza)',
    factorLabel: '—',
    code: 'g',
    fact: 'Gram to jednostka bazowa masy — spinka do włosów waży około 1 g.',
  },
  {
    id: 'deka',
    prefixLabel: 'deka-',
    factorLabel: '× 10',
    code: 'dag',
    fact: '1 dag = 10 g — kostka masła w sklepie to zwykle 20 dag.',
  },
  {
    id: 'kilo',
    prefixLabel: 'kilo-',
    factorLabel: '× 1000',
    code: 'kg',
    fact: '1 kg = 1000 g — tyle waży mniej więcej bochenek chleba.',
  },
];

export const REAL_LIFE_EXAMPLES: string[] = [
  'Etykieta na maśle: „200 g" albo „20 dag" — dwa zapisy tej samej masy.',
  'Znak drogowy: odległość do miasta w km, a szerokość pasa ruchu w m.',
  'Przepis kulinarny: mąka w dekagramach, mleko w mililitrach — tę drugą jednostkę poznasz w module o bryłach.',
  'Śrubka w warsztacie mierzona w milimetrach — centymetr byłby za dużą jednostką na taką dokładność.',
];

export const PREFIX_RULES: string[] = [
  'Każdy przedrostek ma zawsze tę samą wartość, niezależnie od tego, do jakiej jednostki go doczepisz: kilo- to zawsze ×1000, mili- to zawsze ÷1000.',
  'Długość używa czterech przedrostków: mili- (mm), centy- (cm), decy- (dm) i kilo- (km) — deka- pomijamy.',
  'Masa używa tylko dwóch: deka- (dag) i kilo- (kg) — mili-, centy- i decy- w praktyce się nie stosuje.',
  'Tona to nie przedrostek doczepiony do „gram" — to osobne słowo na 1000 kg, czyli milion gramów.',
  'Zamieniając na mniejszą jednostkę — mnożysz. Zamieniając na większą — dzielisz.',
  'Ta sama zasada wróci jeszcze nie raz: mililitr i litr w module o bryłach działają dokładnie tak samo.',
];
