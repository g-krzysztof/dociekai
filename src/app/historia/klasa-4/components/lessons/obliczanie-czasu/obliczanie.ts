/**
 * L8 — logika i sędziowie lekcji „Ile lat minęło?”. Czyste funkcje, bez Reacta.
 *
 * Wszystko stoi na **piechurze**, który idzie po osi rok po roku: liczba jego
 * kroków to prawda, z którą porównujemy przewidywanie dziecka (blok 1) i
 * działanie ustawione na liczydle lat (blok 2). Roku zero nie ma, więc między
 * 1 r. p.n.e. a 1 r. n.e. piechur robi jeden krok (`yearsBetween` z silnika osi).
 * Sędziowie nie mają klucza autora: przyjmują każde działanie, które daje tyle,
 * ile kroków zrobił piechur, a odrzucenie podaje obie liczby.
 *
 * Fakty: baza `F-I.5-01…05`, `F-I.5-12…14`, `F-I.T1-01…12`.
 */

import { plural } from '@/lib/plural';
import { yearsBetween } from '../../../lib/timeline/dating';

export interface Verdict {
  ok: boolean;
  message: string;
}

export const formatYear = (year: number) => (year < 0 ? `${-year} p.n.e.` : `${year} n.e.`);

const krokow = (n: number) => plural(n, { one: 'krok', few: 'kroki', many: 'kroków' });
const lat = (n: number) => plural(n, { one: 'rok', few: 'lata', many: 'lat' });

/* ─────────────── piechur ─────────────── */

/** Lata, na które piechur kolejno staje: od `from` do `to` włącznie, z pominięciem zera. */
export function walkYears(from: number, to: number): number[] {
  const out: number[] = [];
  for (let y = from; y <= to; y++) if (y !== 0) out.push(y);
  return out;
}

/** Ile kroków robi piechur od `from` do `to` — tyle lat minęło. */
export const stepsBetween = (from: number, to: number) => yearsBetween(from, to);

/* ─────────────── blok 1 — Oktawian August ─────────────── */

export const AUGUST = { born: -63, died: 14 } as const;

/**
 * Przewidywanie kontra licznik piechura. Werdykt zawsze „ok” (to haczyk —
 * nie ma tu błędu do poprawienia), ale treść zależy od tego, czy dziecko
 * wpadło w pułapkę 63 + 14.
 */
export function judgePrediction(prediction: number, steps: number): Verdict {
  if (prediction === steps) {
    return {
      ok: true,
      message: `Przewidziałeś/łaś ${prediction} — i piechur zrobił dokładnie ${steps} ${krokow(steps)}. Większość ludzi mówi 77. Zobacz niżej, dlaczego się mylą.`,
    };
  }
  const diff = prediction - steps;
  const where =
    diff === 1
      ? 'Piechur zrobił o jeden krok mniej. Gdzie go zgubił? Przy szczelinie: po roku 1 p.n.e. stanął od razu na roku 1 n.e. Roku zero nie było.'
      : `Różnica to ${Math.abs(diff)} ${lat(Math.abs(diff))}. Policz jeszcze raz: od 63 p.n.e. do szczeliny i od szczeliny do 14 n.e.`;
  return { ok: true, message: `Przewidziałeś/łaś ${prediction}, a piechur zrobił ${steps} ${krokow(steps)}. ${where}` };
}

/* ─────────────── blok 2 — trzy drogi na liczydle lat ─────────────── */

export interface Road {
  id: 'kazimierz' | 'kleopatra' | 'august';
  who: string;
  /** Rok historyczny bez zera. */
  from: number;
  to: number;
  /** Czego dotyczy pomiar — jedna linijka. */
  what: string;
}

/** Kolejność celowo: obie n.e. → obie p.n.e. → dwie ery. */
export const ROADS: Road[] = [
  { id: 'kazimierz', who: 'Kazimierz Wielki', from: 1310, to: 1370, what: 'urodził się 1310, zmarł 1370' },
  { id: 'kleopatra', who: 'Kleopatra VII', from: -69, to: -30, what: 'urodziła się 69 p.n.e., zmarła 30 p.n.e.' },
  { id: 'august', who: 'Oktawian August', from: -63, to: 14, what: 'urodził się 63 p.n.e., zmarł 14 n.e.' },
];

export type Op = '-' | '+';

export interface AbacusSetup {
  /** Liczby w okienkach liczydła — tak, jak dziecko je ułożyło (bez „p.n.e.”). */
  left: number | null;
  right: number | null;
  op: Op;
  minusOne: boolean;
}

export function evaluate(setup: AbacusSetup): number | null {
  if (setup.left === null || setup.right === null) return null;
  const base = setup.op === '-' ? setup.left - setup.right : setup.left + setup.right;
  return base - (setup.minusOne ? 1 : 0);
}

export function describe(setup: AbacusSetup): string {
  if (setup.left === null || setup.right === null) return '…';
  return `${setup.left} ${setup.op === '-' ? '−' : '+'} ${setup.right}${setup.minusOne ? ' − 1' : ''}`;
}

/** Liczby, które dziecko kładzie na liczydło: same wartości dat, bez er. */
export const roadNumbers = (road: Road) => [Math.abs(road.from), Math.abs(road.to)];

/**
 * Sędzia liczydła: dobrze, gdy działanie daje tyle, ile kroków zrobił piechur.
 * Odrzucenie podaje obie liczby i jeden konkret — co piechur widział po drodze.
 */
export function judgeAbacus(road: Road, setup: AbacusSetup): Verdict {
  const value = evaluate(setup);
  const steps = stepsBetween(road.from, road.to);
  if (value === null) return { ok: false, message: 'Połóż obie liczby na liczydle.' };
  if (value === steps) {
    return {
      ok: true,
      message: `${describe(setup)} = ${value}. Piechur też zrobił ${steps} ${krokow(steps)} — ${road.who} żył${road.id === 'kleopatra' ? 'a' : ''} ${steps} ${lat(steps)}.`,
    };
  }
  const head = `Liczydło mówi ${value}, a piechur zrobił ${steps} ${krokow(steps)}.`;
  if (value < 0) return { ok: false, message: `${head} Lat nie może ubyć poniżej zera — zamień liczby w okienkach miejscami.` };
  const crosses = road.from < 0 && road.to > 0;
  if (crosses && value === steps + 1) {
    return {
      ok: false,
      message: `${head} O jeden krok za dużo — piechur przy szczelinie przeskoczył z 1 p.n.e. prosto na 1 n.e. Liczydło musi ten krok zabrać.`,
    };
  }
  if (crosses) {
    return {
      ok: false,
      message: `${head} Ta droga przechodzi przez szczelinę: piechur najpierw idzie ${-road.from} lat do niej, potem ${road.to} lat za nią.`,
    };
  }
  if (road.from < 0) {
    return {
      ok: false,
      message: `${head} Obie daty leżą przed szczeliną roku zero — piechur nie dochodzi do niej. Lata p.n.e. maleją w stronę naszej ery: z ${-road.from} schodzi do ${-road.to}.`,
    };
  }
  return {
    ok: false,
    message: `${head} Piechur idzie tylko od ${road.from} do ${road.to} — nie liczy lat sprzed roku ${road.from}.`,
  };
}

/* ─────────────── blok 3 — cień patyka ─────────────── */

/** Pozycja słońca 0 (wschód) … 1 (zachód); południe = 0,5. */
export const NOON = 0.5;
export const NOON_TOLERANCE = 0.035;
/** Najwyższe słońce latem w Polsce — ok. 60° nad horyzontem. */
const MAX_ELEVATION = 60;
const MIN_ELEVATION = 7;

export const sunElevation = (t: number) => MIN_ELEVATION + (MAX_ELEVATION - MIN_ELEVATION) * Math.sin(Math.PI * t);

/** Długość cienia patyka o wysokości `stick` (ta sama jednostka). */
export function shadowLength(t: number, stick: number): number {
  return stick / Math.tan((sunElevation(t) * Math.PI) / 180);
}

/**
 * Kierunek cienia na ziemi (patrzymy na południe: wschód po lewej). Słońce
 * idzie ze wschodu przez południe na zachód, cień — zawsze na przeciwną stronę.
 * Zwraca wektor jednostkowy: `x` w prawo, `y` w stronę patrzącego.
 */
export function shadowDirection(t: number): { x: number; y: number } {
  const az = (t - 0.5) * Math.PI; // −90° wschód … +90° zachód
  return { x: -Math.sin(az), y: Math.cos(az) };
}

export function judgeNoon(t: number, stick: number): Verdict {
  if (Math.abs(t - NOON) <= NOON_TOLERANCE) {
    return {
      ok: true,
      message: 'Południe: słońce stoi najwyżej, a cień jest najkrótszy i wskazuje dokładnie na północ.',
    };
  }
  const now = Math.round(shadowLength(t, stick));
  const best = Math.round(shadowLength(NOON, stick));
  return {
    ok: false,
    message: `Cień ma teraz ${now} cm, a może być krótszy — nawet ${best} cm. ${t < NOON ? 'Słońce jeszcze się wspina.' : 'Słońce już zaczęło schodzić.'}`,
  };
}

/* ─────────────── blok 3 — kalendarz księżycowy ─────────────── */

/** Rok księżycowy: 12 miesięcy po ok. 29,5 dnia. */
export const LUNAR_YEAR = 354;
export const SOLAR_YEAR = 365;
/** Święto żniw w pierwszym roku — 15 sierpnia (227. dzień roku). */
export const HARVEST_START = 227;

/** Na który dzień roku słonecznego wypada święto po `years` latach. */
export function festivalDay(years: number, calendar: 'ksiezycowy' | 'sloneczny'): number {
  const drift = calendar === 'ksiezycowy' ? SOLAR_YEAR - LUNAR_YEAR : 0;
  return ((((HARVEST_START - drift * years - 1) % SOLAR_YEAR) + SOLAR_YEAR) % SOLAR_YEAR) + 1;
}

export type Season = 'zima' | 'wiosna' | 'lato' | 'jesien';

/** Pora roku dnia 1…365 (astronomicznie, z grubsza). */
export function seasonOf(day: number): Season {
  if (day < 80 || day >= 356) return 'zima';
  if (day < 172) return 'wiosna';
  if (day < 266) return 'lato';
  return 'jesien';
}

const MONTHS = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function formatDay(day: number): string {
  let d = day;
  for (let m = 0; m < 12; m++) {
    if (d <= MONTH_DAYS[m]) return `${d} ${MONTHS[m]}`;
    d -= MONTH_DAYS[m];
  }
  return `${day}`;
}

/* ─────────────── blok 4 — październik 1582 ─────────────── */

export interface CalendarPage {
  day: number;
  weekday: string;
}

/** Kartki zdzieranego kalendarza: po czwartku 4 października od razu piątek 15. */
export const OCTOBER_1582: CalendarPage[] = [
  { day: 1, weekday: 'poniedziałek' },
  { day: 2, weekday: 'wtorek' },
  { day: 3, weekday: 'środa' },
  { day: 4, weekday: 'czwartek' },
  { day: 15, weekday: 'piątek' },
];

export const VANISHED_DAYS = Array.from({ length: 10 }, (_, i) => 5 + i);

export function judgeVanished(answer: number): Verdict {
  if (answer === VANISHED_DAYS.length) {
    return {
      ok: true,
      message: 'Dziesięć dni: od 5 do 14 października 1582 roku — tych dni w kalendarzu po prostu nie było.',
    };
  }
  if (answer === 11) {
    return {
      ok: false,
      message: '15 − 4 = 11, ale to odległość między kartkami. Zniknęły dni między nimi: od 5 do 14. Policz je na palcach.',
    };
  }
  return {
    ok: false,
    message: `Po czwartku 4 nastał piątek 15. Brakuje dni od 5 do 14 — to nie ${answer}. Policz je jeszcze raz.`,
  };
}

/* ─────────────── D — 29 lutego ─────────────── */

/** O ile godzin kalendarz 365-dniowy wyprzedza Słońce po `years` latach (rok słoneczny ≈ 365 dni i 6 godzin). */
export function driftHours(years: number, leap: boolean): number {
  const hours = years * 6;
  return leap ? hours % 24 : hours;
}
