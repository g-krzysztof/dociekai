/**
 * L21 blok `mierniczy` — odtwarzanie granic pola po wylewie.
 *
 * Herodot (Dzieje II 109, omówienie): każdy dostał równe pole i płacił od
 * niego podatek; gdy rzeka zabrała część pola, król wysyłał ludzi, którzy
 * mierzyli, o ile pole się zmniejszyło — i podatek malał w tej samej mierze.
 * Stąd, pisze Herodot, Grecy nauczyli się geometrii („mierzenia ziemi”).
 *
 * Teren to kratka sznurów: jedna kratka = jeden odcinek sznura między
 * węzłami. Liczby (pole 10 × 6, 1 worek od 10 kratek) są nasze, do zabawy.
 */

import { plural } from '@/lib/plural';

const SZNUR = { one: 'sznur', few: 'sznury', many: 'sznurów' };
const WOREK = { one: 'worek', few: 'worki', many: 'worków' };
const KRATKA = { one: 'kratki', few: 'kratek', many: 'kratek' };

export const GRID_W = 12;
export const GRID_H = 9;

export interface Pt {
  x: number;
  y: number;
}

export interface FieldCase {
  id: string;
  owner: string;
  /** Pole z zapisu pisarza przed wylewem (szerokość × głębokość w sznurach). */
  before: { w: number; h: number };
  /** Kamienie graniczne, które przetrwały wylew (rogi od strony pustyni). */
  stones: Pt[];
  /** Brzeg rzeki po wylewie: wszystko o y > bank to woda. */
  bank: number;
  /** Prawdziwe rogi pola dziś (do sędziego). */
  corners: Pt[];
}

/** Podatek: 1 worek od każdych 10 kratek pola. */
export const SQUARES_PER_SACK = 10;

export const FIELD: FieldCase = {
  id: 'ipi',
  owner: 'Ipi',
  before: { w: 10, h: 6 },
  stones: [
    { x: 1, y: 1 },
    { x: 11, y: 1 },
  ],
  bank: 5,
  corners: [
    { x: 1, y: 1 },
    { x: 11, y: 1 },
    { x: 11, y: 5 },
    { x: 1, y: 5 },
  ],
};

export const taxFor = (area: number) => Math.round(area / SQUARES_PER_SACK);

export function clampStake(p: Pt): Pt {
  return {
    x: Math.max(0, Math.min(GRID_W, Math.round(p.x))),
    y: Math.max(0, Math.min(GRID_H, Math.round(p.y))),
  };
}

/** Kolejność palików po obwodzie (wokół środka), żeby sznur nie robił ósemki. */
export function ringOrder(stakes: Pt[]): Pt[] {
  if (stakes.length < 3) return stakes;
  const cx = stakes.reduce((a, p) => a + p.x, 0) / stakes.length;
  const cy = stakes.reduce((a, p) => a + p.y, 0) / stakes.length;
  return [...stakes].sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
}

/** Liczba odcinków sznura między dwoma palikami (tylko po prostej w pionie/poziomie — inaczej null). */
export function knots(a: Pt, b: Pt): number | null {
  if (a.x === b.x) return Math.abs(a.y - b.y);
  if (a.y === b.y) return Math.abs(a.x - b.x);
  return null;
}

export type StakeVerdict =
  | { ok: true; w: number; h: number; area: number }
  | {
      ok: false;
      kind: 'za-malo' | 'w-wodzie' | 'krzywo' | 'kamien' | 'brzeg' | 'zdublowany';
      /** Indeks palika w tablicy `stakes`, którego dotyczy odrzut (jeśli jeden). */
      stake?: number;
      text: string;
    };

const key = (p: Pt) => `${p.x},${p.y}`;

/**
 * Sędzia palików. Kolejność sprawdzeń prowadzi dziecko od najprostszej
 * przyczyny: mało palików → palik w wodzie → sznur nie jest prostokątem →
 * pole nie zaczyna się od kamieni → pole nie sięga brzegu.
 */
export function judgeStakes(stakes: Pt[], field: FieldCase = FIELD): StakeVerdict {
  if (stakes.length < 4) {
    return { ok: false, kind: 'za-malo', text: `Pole ma cztery rogi — wbito dopiero ${stakes.length}.` };
  }
  const seen = new Set<string>();
  for (let i = 0; i < stakes.length; i++) {
    if (seen.has(key(stakes[i]))) {
      return { ok: false, kind: 'zdublowany', stake: i, text: 'Dwa paliki stoją w tym samym miejscu.' };
    }
    seen.add(key(stakes[i]));
  }
  const wet = stakes.findIndex((p) => p.y > field.bank);
  if (wet >= 0) {
    return {
      ok: false,
      kind: 'w-wodzie',
      stake: wet,
      text: 'Ten palik stoi w rzece. Tę część pola Nil zabrał — jej już nie ma.',
    };
  }
  const xs = [...new Set(stakes.map((p) => p.x))];
  const ys = [...new Set(stakes.map((p) => p.y))];
  if (xs.length !== 2 || ys.length !== 2) {
    return {
      ok: false,
      kind: 'krzywo',
      text: 'Sznur nie tworzy prostokąta: naprzeciwległe paliki muszą stać w jednej linii, a sznur iść prosto — wzdłuż kratek.',
    };
  }
  const [x0, x1] = xs.sort((a, b) => a - b);
  const [y0, y1] = ys.sort((a, b) => a - b);
  const stoneMiss = field.stones.find((s) => !stakes.some((p) => p.x === s.x && p.y === s.y));
  if (stoneMiss) {
    const near = stakes
      .map((p, i) => ({ i, d: Math.abs(p.x - stoneMiss.x) + Math.abs(p.y - stoneMiss.y) }))
      .sort((a, b) => a.d - b.d)[0];
    return {
      ok: false,
      kind: 'kamien',
      stake: near.i,
      text: `Kamień graniczny przetrwał wylew — a najbliższy palik stoi ${near.d} ${plural(near.d, SZNUR)} od niego. Róg pola jest dokładnie przy kamieniu.`,
    };
  }
  if (y1 < field.bank) {
    const gap = field.bank - y1;
    return {
      ok: false,
      kind: 'brzeg',
      text: `Między sznurem a wodą został pas ziemi szeroki na ${gap} ${plural(gap, SZNUR)}. Pole Ipiego sięga do samej rzeki — ten pas też jest jego.`,
    };
  }
  const w = x1 - x0;
  const h = y1 - y0;
  return { ok: true, w, h, area: w * h };
}

export type TaxVerdict = { ok: true } | { ok: false; text: string };

export function judgeTax(area: number, sacks: number): TaxVerdict {
  const want = taxFor(area);
  if (sacks === 0) return { ok: false, text: 'Zero worków? Na polu wciąż rośnie zboże — od niego płaci się podatek.' };
  if (sacks === want) return { ok: true };
  const pays = sacks * SQUARES_PER_SACK;
  return {
    ok: false,
    text:
      sacks > want
        ? `${sacks} ${plural(sacks, WOREK)} to podatek od ${pays} ${plural(pays, KRATKA)} — a pole ma ich teraz ${area}. Ipi zapłaciłby za ziemię, którą zabrała rzeka.`
        : `${sacks} ${plural(sacks, WOREK)} to podatek od ${pays} ${plural(pays, KRATKA)} — a pole ma ich ${area}. Faraon straciłby zboże z ziemi, która wciąż jest.`,
  };
}
