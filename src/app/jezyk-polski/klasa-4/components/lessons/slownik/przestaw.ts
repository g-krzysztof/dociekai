/**
 * L10 blok 3 — „Przestaw znaczenie” (dane i sędzia; zdania T-L10-2, napisane
 * dla kursu). Rama zdania ma jedno miejsce na kafelek tuż przy „zamku”; każdy
 * kafelek składa się z ramą gramatycznie, a wybiera jedno znaczenie (`zn`
 * 1–3) albo żadne (`zn: 0` — słowo, które znaczenia nie rozstrzyga).
 */

export interface Kafelek {
  id: string;
  tekst: string;
  zn: 0 | 1 | 2 | 3;
}

export interface Rama {
  id: string;
  przed: string;
  po: string;
  kafelki: Kafelek[];
  /** Kafelek, który stoi w zdaniu na początku. */
  start: string;
}

export const RAMY: Rama[] = [
  {
    id: 'r1',
    przed: 'Ola długo oglądała zamek',
    po: '.',
    start: 'r1-wzgorze',
    kafelki: [
      { id: 'r1-wzgorze', tekst: 'na wzgórzu', zn: 1 },
      { id: 'r1-piwnica', tekst: 'w drzwiach piwnicy', zn: 2 },
      { id: 'r1-bliska', tekst: 'z bliska', zn: 0 },
      { id: 'r1-kurtka', tekst: 'w nowej kurtce', zn: 3 },
    ],
  },
  {
    id: 'r2',
    przed: 'Tomek narysował zamek',
    po: '.',
    start: 'r2-dziurka',
    kafelki: [
      { id: 'r2-kredki', tekst: 'kredkami', zn: 0 },
      { id: 'r2-suwak', tekst: 'z suwakiem', zn: 3 },
      { id: 'r2-dziurka', tekst: 'z dziurką od klucza', zn: 2 },
      { id: 'r2-wieze', tekst: 'z dwiema wieżami', zn: 1 },
    ],
  },
  {
    id: 'r3',
    przed: 'Zuzia pierwszy raz zobaczyła zamek',
    po: '.',
    start: 'r3-spiwor',
    kafelki: [
      { id: 'r3-strych', tekst: 'w drzwiach na strych', zn: 2 },
      { id: 'r3-jezioro', tekst: 'nad jeziorem', zn: 1 },
      { id: 'r3-spiwor', tekst: 'w śpiworze', zn: 3 },
      { id: 'r3-dzis', tekst: 'dzisiaj', zn: 0 },
    ],
  },
];

export function kafelek(r: Rama, id: string): Kafelek {
  const k = r.kafelki.find((x) => x.id === id);
  if (!k) throw new Error(`L10: brak kafelka ${id} w ${r.id}`);
  return k;
}

/** Znaczenia, do których dziecko doprowadziło zdanie (0 się nie liczy). */
export function odwiedz(odwiedzone: number[], zn: number): number[] {
  return zn === 0 || odwiedzone.includes(zn) ? odwiedzone : [...odwiedzone, zn].sort((a, b) => a - b);
}

export function ramaGotowa(odwiedzone: number[]): boolean {
  return [1, 2, 3].every((n) => odwiedzone.includes(n));
}
