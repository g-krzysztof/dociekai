/**
 * L6 blok 1 — „Dzieje ludzkości w jedną dobę”. Czysta matematyka zegara, bez Reacta.
 *
 * 300 000 lat ludzi (`F-I.4-09`) = 24 godziny, liniowo: rok to ok. 0,29 s doby.
 * Godziny wydarzeń **liczy się z dat**, nie wpisuje — przy bieżącym roku pismo
 * (ok. 3400 p.n.e.) wypada o 23:34, założenie Rzymu o 23:47, Kolumb o 23:57,
 * a dziesięć lat życia dziecka to ostatnie 3 sekundy.
 *
 * Zegar ma trzy tarcze: cała doba, ostatnia godzina, ostatnia minuta. Na tarczy
 * doby wszystko z podręcznika ściska się w ostatniej godzinie — dlatego trzeba
 * ją przybliżyć, i to jest ta sama myśl co logarytmiczna oś „cała ludzkość”.
 */

import { toAstro } from '../../../lib/timeline/dating';

export const HUMAN_YEARS = 300_000;
export const DAY_SECONDS = 86_400;

export type DialId = 'doba' | 'godzina' | 'minuta';

export interface Dial {
  id: DialId;
  /** Sekunda doby na początku i końcu tarczy (pełny obrót = from → to). */
  from: number;
  to: number;
  title: string;
  /** Podpisy na tarczy: [sekunda doby, tekst]. */
  marks: [number, string][];
}

export const DIALS: Dial[] = [
  {
    id: 'doba',
    from: 0,
    to: DAY_SECONDS,
    title: 'Cała doba = 300 000 lat',
    marks: [
      [0, '0:00'],
      [6 * 3600, '6:00'],
      [12 * 3600, '12:00'],
      [18 * 3600, '18:00'],
    ],
  },
  {
    id: 'godzina',
    from: 23 * 3600,
    to: DAY_SECONDS,
    title: 'Ostatnia godzina = 12 500 lat',
    marks: [
      [23 * 3600, '23:00'],
      [23 * 3600 + 15 * 60, '23:15'],
      [23 * 3600 + 30 * 60, '23:30'],
      [23 * 3600 + 45 * 60, '23:45'],
    ],
  },
  {
    id: 'minuta',
    from: DAY_SECONDS - 60,
    to: DAY_SECONDS,
    title: 'Ostatnia minuta = ok. 208 lat',
    marks: [
      [DAY_SECONDS - 60, '23:59:00'],
      [DAY_SECONDS - 45, ':15'],
      [DAY_SECONDS - 30, ':30'],
      [DAY_SECONDS - 15, ':45'],
    ],
  },
];

/** Ile lat temu → sekunda doby (0 = pierwsi ludzie, 86 400 = dziś). */
export function agoToSecond(yearsAgo: number): number {
  return DAY_SECONDS * (1 - yearsAgo / HUMAN_YEARS);
}

/** Rok historyczny (bez zera) → ile lat temu, względem `now`. */
export function yearsAgo(year: number, now: number): number {
  return toAstro(now) - toAstro(year);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** „23:34” albo — gdy `withSeconds` — „23:59:57”. Zaokrągla do najbliższej minuty / sekundy. */
export function formatClock(second: number, withSeconds = false): string {
  if (withSeconds) {
    const s = Math.min(DAY_SECONDS, Math.round(second));
    if (s >= DAY_SECONDS) return '24:00:00';
    return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }
  const m = Math.min(24 * 60, Math.round(second / 60));
  if (m >= 24 * 60) return '24:00';
  return `${Math.floor(m / 60)}:${pad(m % 60)}`;
}

export type HorizonIcon = 'ognisko' | 'pole' | 'pismo' | 'piramida' | 'kolumna' | 'ruiny' | 'statek' | 'flaga' | 'rakieta' | 'ty';

export interface DayEvent {
  id: string;
  label: string;
  /** Data po polsku, jak w podręczniku. */
  when: string;
  icon: HorizonIcon;
  /** Rok historyczny albo „lat temu”. */
  at: { year: number } | { ago: number };
}

/**
 * Wydarzenia na zegarze. Daty: `F-I.4-09` (300 000 lat), `F-I.4-10` (pismo),
 * `F-I.4-12…15` (476, 1492, 1918); rolnictwo ok. 10 000 p.n.e. i piramidy w Gizie
 * ok. 2500 p.n.e. — jak pinezki rdzenia (`pins.ts`); założenie Rzymu 753 p.n.e.
 * (legenda, karta L26); lot Gagarina 12 kwietnia 1961 (Wikipedia, „Wostok 1”).
 */
export const DAY_EVENTS: DayEvent[] = [
  { id: 'ludzie', label: 'pierwsi ludzie', when: 'ok. 300 000 lat temu', icon: 'ognisko', at: { ago: HUMAN_YEARS } },
  { id: 'rolnicy', label: 'pierwsi rolnicy', when: 'ok. 10 000 p.n.e.', icon: 'pole', at: { year: -10_000 } },
  { id: 'pismo', label: 'pismo', when: 'ok. 3400 p.n.e.', icon: 'pismo', at: { year: -3400 } },
  { id: 'piramidy', label: 'piramidy w Gizie', when: 'ok. 2500 p.n.e.', icon: 'piramida', at: { year: -2500 } },
  { id: 'rzym', label: 'założenie Rzymu', when: '753 p.n.e.', icon: 'kolumna', at: { year: -753 } },
  { id: 'upadek', label: 'upadek Rzymu', when: '476', icon: 'ruiny', at: { year: 476 } },
  { id: 'kolumb', label: 'Kolumb w Ameryce', when: '1492', icon: 'statek', at: { year: 1492 } },
  { id: 'niepodleglosc', label: 'Polska znów niepodległa', when: '1918', icon: 'flaga', at: { year: 1918 } },
  { id: 'kosmos', label: 'pierwszy człowiek w kosmosie', when: '1961', icon: 'rakieta', at: { year: 1961 } },
];

export interface PlacedDayEvent extends DayEvent {
  second: number;
  /** Najwęższa tarcza, na której wydarzenie da się odróżnić od sąsiadów. */
  dial: DialId;
}

/** Na której tarczy pokazać wydarzenie: ostatnia minuta > ostatnia godzina > doba. */
export function dialFor(second: number): DialId {
  if (second >= DIALS[2].from) return 'minuta';
  if (second >= DIALS[1].from) return 'godzina';
  return 'doba';
}

/**
 * Wydarzenia z policzoną godziną. `birthYear` — rok urodzenia dziecka (pinezka
 * osobista z L1); bez niego bierzemy „10 lat temu” i tak to podpisujemy.
 */
export function placeEvents(now: number, birthYear?: number | null): PlacedDayEvent[] {
  const base = DAY_EVENTS.map((event) => {
    const ago = 'ago' in event.at ? event.at.ago : yearsAgo(event.at.year, now);
    const second = agoToSecond(ago);
    return { ...event, second, dial: dialFor(second) };
  });
  const valid = !!birthYear && birthYear <= now && birthYear > now - 20;
  const birth = valid ? birthYear : now - 10;
  const lifeAgo = Math.max(1, now - birth);
  const second = agoToSecond(lifeAgo);
  base.push({
    id: 'ty',
    label: valid ? 'twoje urodziny' : 'ktoś w twoim wieku się rodzi',
    when: String(birth),
    icon: 'ty',
    at: { year: birth },
    second,
    dial: dialFor(second),
  });
  return base.sort((a, b) => a.second - b.second);
}

/** Ile sekund doby zajmuje `years` lat — do podsumowania („twoje życie to ostatnie 3 sekundy”). */
export function secondsForYears(years: number): number {
  return (years / HUMAN_YEARS) * DAY_SECONDS;
}

/** Kąt wskazówki na tarczy (stopnie od godziny 12, zgodnie z ruchem wskazówek). */
export function secondToAngle(second: number, dial: Dial): number {
  const t = (second - dial.from) / (dial.to - dial.from);
  return Math.min(1, Math.max(0, t)) * 360;
}

/**
 * Obrót wskazówki palcem: nowy kąt z położenia palca, ale **tylko do przodu**
 * i najwyżej o `maxStep` stopni naraz (bez przeskoku przez 0 na skróty).
 * Zwraca nowy postęp na tarczy w stopniach 0–360.
 */
export function advanceAngle(current: number, pointerAngle: number, maxStep = 45): number {
  const currentMod = ((current % 360) + 360) % 360;
  let delta = pointerAngle - currentMod;
  if (delta < -180) delta += 360;
  if (delta > 180) delta -= 360;
  if (delta <= 0 || delta > maxStep) return current;
  return Math.min(360, current + delta);
}

/** Kąt palca względem środka tarczy (0 = godzina 12, zgodnie z ruchem wskazówek). */
export function pointerAngle(dx: number, dy: number): number {
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return (deg + 360) % 360;
}

/** Współrzędna punktu na tarczy, zaokrąglona (SSR i klient muszą dać ten sam SVG). */
export function polar(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.round((cx + r * Math.sin(rad)) * 100) / 100,
    y: Math.round((cy - r * Math.cos(rad)) * 100) / 100,
  };
}
