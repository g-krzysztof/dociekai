/**
 * Blok 1 — jeden dzień, trzy życia (F-V.2-01, F-V.2-02, F-V.1-05). Czysta logika.
 *
 * Dzień triumfu Cezara w 46 r. p.n.e. Rzymianie dzielili dzień (od wschodu do
 * zachodu słońca) na 12 godzin. Każda postać ma godziny zajęte z góry
 * (obowiązki, praca) — dziecko wkłada zajęcia tylko w wolne godziny. Pochód
 * triumfalny przechodzi w ustalonych godzinach (VI–VIII), więc kto wtedy
 * pracuje, ten go nie zobaczy. Postaci są wymyślone; warunki życia — wg
 * opisów Rzymu tego czasu (domus z atrium, insule, piekarnie; uczta Cezara
 * dla ludu i rozdawnictwo po triumfie — Swetoniusz, „Boski Juliusz” 38, 41).
 */

export const HOURS = 12;
export type PersonId = 'gajusz' | 'tulia' | 'dawos';
export type ActivityId = 'triumf' | 'termy' | 'zabawa' | 'uczta-ludu' | 'odpoczynek' | 'odejsc';

export interface Activity {
  id: ActivityId;
  name: string;
  /** Nazwa w środku zdania (z zachowaniem wielkiej litery w nazwach własnych). */
  lower: string;
  hours: number;
  /** Zajęcie ma stałą godzinę rozpoczęcia (1–12). */
  fixedStart?: number;
}

export interface Person {
  id: PersonId;
  name: string;
  who: string;
  sleeps: string;
  eats: string;
  /** Godziny zajęte z góry: [od, do] włącznie, z opisem. */
  busy: { from: number; to: number; what: string }[];
  activities: ActivityId[];
  /** Skąd ogląda triumf, jeśli w ogóle. */
  triumphView: string;
  /** Zajęcia, których ta osoba nie może wybrać — z powodem. */
  locked?: Partial<Record<ActivityId, string>>;
}

export const ACTIVITIES: Record<ActivityId, Activity> = {
  triumf: { id: 'triumf', name: 'Triumf Cezara', lower: 'triumf Cezara', hours: 3, fixedStart: 6 },
  termy: { id: 'termy', name: 'Termy (łaźnia)', lower: 'termy (łaźnia)', hours: 2 },
  zabawa: { id: 'zabawa', name: 'Zabawa', lower: 'zabawa', hours: 1 },
  'uczta-ludu': { id: 'uczta-ludu', name: 'Uczta Cezara dla ludu', lower: 'uczta Cezara dla ludu', hours: 2 },
  odpoczynek: { id: 'odpoczynek', name: 'Odpoczynek', lower: 'odpoczynek', hours: 1 },
  odejsc: { id: 'odejsc', name: 'Odejść z tego domu', lower: 'odejście z tego domu', hours: 1 },
};

export const PEOPLE: Person[] = [
  {
    id: 'gajusz',
    name: 'Gajusz',
    who: 'syn senatora, z rodu patrycjuszy, 10 lat',
    sleeps: 'w domu z atrium i ogrodem — ma własną sypialnię',
    eats: 'wieczorem uczta: ryby, mięso, owoce, miód',
    busy: [
      { from: 1, to: 3, what: 'lekcje z nauczycielem-Grekiem' },
      { from: 11, to: 12, what: 'uczta z gośćmi ojca' },
    ],
    activities: ['triumf', 'termy', 'zabawa', 'odpoczynek'],
    triumphView: 'z miejsca dla senatorskich rodzin, obok ojca',
  },
  {
    id: 'tulia',
    name: 'Tulia',
    who: 'córka piekarza, plebejka, 10 lat',
    sleeps: 'w jednej izbie na czwartym piętrze kamienicy (insuli) — bez kuchni i bez wody',
    eats: 'chleb z ojcowskiego pieca, ser, oliwki, polewka z soczewicy',
    busy: [
      { from: 1, to: 5, what: 'pomoc w piekarni: ugniatanie ciasta, sprzedaż chleba' },
      { from: 12, to: 12, what: 'noszenie wody z fontanny na czwarte piętro' },
    ],
    activities: ['triumf', 'termy', 'zabawa', 'uczta-ludu', 'odpoczynek'],
    triumphView: 'w tłumie przy drodze, na palcach',
  },
  {
    id: 'dawos',
    name: 'Dawos',
    who: 'niewolnik w domu bogacza, 12 lat',
    sleeps: 'na macie w kuchni albo w korytarzu',
    eats: 'resztki z kuchni, kiedy wszyscy już zjedzą',
    busy: [
      { from: 1, to: 6, what: 'noszenie wody, sprzątanie, zakupy na targu' },
      { from: 8, to: 12, what: 'przygotowanie i obsługa uczty — stoi przy stołach do nocy' },
    ],
    activities: ['triumf', 'termy', 'zabawa', 'odpoczynek', 'odejsc'],
    triumphView: '',
    locked: {
      odejsc: 'Dawos nie może odejść — w Rzymie niewolnik był własnością pana. Wolność mógł dostać tylko od niego.',
    },
  },
];

export type Plan = Partial<Record<ActivityId, number>>; // zajęcie → godzina rozpoczęcia

export function busyAt(p: Person, hour: number): string | null {
  return p.busy.find((b) => hour >= b.from && hour <= b.to)?.what ?? null;
}

export type PlaceResult = { ok: true; plan: Plan } | { ok: false; message: string };

/** Wkłada zajęcie `a` od godziny `start` — tylko w wolne godziny i nie na inne zajęcie. */
export function place(p: Person, plan: Plan, a: ActivityId, start: number): PlaceResult {
  const lock = p.locked?.[a];
  if (lock) return { ok: false, message: lock };
  const act = ACTIVITIES[a];
  // Pochód triumfalny idzie o swojej godzinie, gdziekolwiek dziecko upuści kartę.
  const from = act.fixedStart ?? start;
  const to = from + act.hours - 1;
  if (to > HOURS) return { ok: false, message: `${act.name} trwa ${act.hours} h — nie zmieści się przed zachodem słońca.` };
  for (let h = from; h <= to; h++) {
    const busy = busyAt(p, h);
    if (busy) {
      return {
        ok: false,
        message: act.fixedStart
          ? `Pochód idzie od godziny ${roman(from)} do ${roman(to)}, a wtedy ${p.name} ma: ${busy}. Nie zobaczy triumfu.`
          : `Nie mieści się — o godzinie ${roman(h)} ${p.name} ma: ${busy}.`,
      };
    }
    const other = (Object.keys(plan) as ActivityId[]).find((o) => o !== a && plan[o] !== undefined && h >= plan[o]! && h < plan[o]! + ACTIVITIES[o].hours);
    if (other) return { ok: false, message: `O godzinie ${roman(h)} jest już: ${ACTIVITIES[other].lower}.` };
  }
  return { ok: true, plan: { ...plan, [a]: from } };
}

export function freeHours(p: Person): number {
  let n = 0;
  for (let h = 1; h <= HOURS; h++) if (!busyAt(p, h)) n++;
  return n;
}

/** Czy triumf w ogóle mieści się w wolnych godzinach tej osoby. */
export function canSeeTriumph(p: Person): boolean {
  const t = ACTIVITIES.triumf;
  for (let h = t.fixedStart!; h < t.fixedStart! + t.hours; h++) if (busyAt(p, h)) return false;
  return true;
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
export const roman = (h: number) => ROMAN[h] ?? String(h);
