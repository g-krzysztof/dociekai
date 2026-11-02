/**
 * L11 blok 5 — dwanaście gwiazd. Czyste dane, bez Reacta.
 *
 * Liczba państw Wspólnot / Unii (stan na koniec roku; europa.eu,
 * „Historia UE”): 1986 — 12 (Hiszpania i Portugalia), 1995 — 15, 2004 — 25
 * (z Polską, 1 maja), 2013 — 28 (Chorwacja), 2020 — 27 (wyjście Wielkiej
 * Brytanii). Flaga: Rada Europy 1955, Wspólnoty Europejskie 1985–1986;
 * gwiazd jest zawsze dwanaście — liczba oznacza pełnię i jedność, nie
 * liczbę państw (F-II.1-23). Hymn: melodia „Ody do radości” z IX symfonii
 * Beethovena, **bez oficjalnych słów** (errata bazy, F-II.1-24).
 *
 * Wymiary flagi według opisu urzędowego: proporcje 2 : 3, gwiazdy na
 * niewidzialnym kole o promieniu 1/3 wysokości, promień gwiazdy 1/18
 * wysokości, każda gwiazda jednym ramieniem do góry, jak godziny na tarczy.
 */

export const STARS = 12;
export const EU_BLUE = '#003399';
export const EU_YELLOW = '#FFCC00';

export interface Krok {
  year: number;
  members: number;
  note: string;
}

export const KROKI: Krok[] = [
  { year: 1986, members: 12, note: 'Do Wspólnot weszły Hiszpania i Portugalia. Państw jest dwanaście — i w tym samym roku Wspólnoty zaczęły używać flagi z dwunastoma gwiazdami.' },
  { year: 1995, members: 15, note: 'Doszły Austria, Finlandia i Szwecja.' },
  { year: 2004, members: 25, note: '1 maja dołączyło dziesięć państw — wśród nich Polska.' },
  { year: 2013, members: 28, note: 'Dołączyła Chorwacja. Najwięcej państw w historii Unii.' },
  { year: 2020, members: 27, note: 'Wielka Brytania wystąpiła z Unii.' },
];

export const PRED_MIN = 0;
export const PRED_MAX = 30;

/** Ostatnie pytanie: państwo nr 30. */
export const FINAL_MEMBERS = 30;

/** Punkty gwiazdy pięcioramiennej (ramię do góry) — zaokrąglone (hydracja). */
export function starPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  const inner = r * 0.382;
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

/** Środki gwiazd na kole „jak godziny na tarczy”, `n` sztuk (dla flagi zawsze 12). */
export function starCenters(cx: number, cy: number, R: number, n = STARS) {
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { x: Math.round((cx + R * Math.cos(a)) * 100) / 100, y: Math.round((cy + R * Math.sin(a)) * 100) / 100 };
  });
}

/** Pierwsze takty „Ody do radości” (domena publiczna) — nuty i długości w ćwierćnutach. */
export const ODA: [string, number][] = [
  ['E4', 1], ['E4', 1], ['F4', 1], ['G4', 1], ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 1],
  ['C4', 1], ['C4', 1], ['D4', 1], ['E4', 1], ['E4', 1.5], ['D4', 0.5], ['D4', 2],
];

const SEMI: Record<string, number> = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
export function noteFreq(n: string) {
  const semis = SEMI[n[0]] + (Number(n.slice(1)) - 4) * 12;
  return Math.round(440 * 2 ** (semis / 12) * 100) / 100;
}
