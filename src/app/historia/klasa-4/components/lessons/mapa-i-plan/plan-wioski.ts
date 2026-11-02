/**
 * Blok 4 — **Plan wioski z własną legendą** (`zadanie`) — czysty sędzia i narrator.
 *
 * Dziecko rozstawia na pustym planie swoje znaki (sześć neutralnych kształtów —
 * znaczenie nadaje im dopiero legenda), układa legendę i stawia strzałkę
 * północy. Nie ma klucza autora: sędzia sprawdza tylko spójność planu
 * z legendą (F-II.4-09) i strzałkę północy (F-II.4-03, F-II.4-19).
 * „Czytelnik” opowiada wioskę wyłącznie z planu i legendy — kierunki liczy
 * od strzałki dziecka, więc odwrócona strzałka odwraca opowieść.
 */

export type ShapeId = 'kolo' | 'trojkat' | 'kwadrat' | 'gwiazda' | 'krzyz' | 'romb';

export const SHAPES: { id: ShapeId; name: string; some: string; about: string }[] = [
  { id: 'kolo', name: 'kółko', some: 'jakieś kółko', about: 'o nim' },
  { id: 'trojkat', name: 'trójkąt', some: 'jakiś trójkąt', about: 'o nim' },
  { id: 'kwadrat', name: 'kwadrat', some: 'jakiś kwadrat', about: 'o nim' },
  { id: 'gwiazda', name: 'gwiazdka', some: 'jakaś gwiazdka', about: 'o niej' },
  { id: 'krzyz', name: 'krzyżyk', some: 'jakiś krzyżyk', about: 'o nim' },
  { id: 'romb', name: 'romb', some: 'jakiś romb', about: 'o nim' },
];

export type MeaningId = 'kosciol' | 'mlyn' | 'most' | 'szkola' | 'las' | 'studnia' | 'karczma';

export const MEANINGS: {
  id: MeaningId;
  name: string;
  /** „Na północy …” */ phrase: string;
  /** „obiecuje …, ale … nie widzę” */ acc: string;
  it: string;
}[] = [
  { id: 'kosciol', name: 'kościół', phrase: 'stoi kościół', acc: 'kościół', it: 'go' },
  { id: 'mlyn', name: 'młyn', phrase: 'stoi młyn', acc: 'młyn', it: 'go' },
  { id: 'most', name: 'most', phrase: 'jest most', acc: 'most', it: 'go' },
  { id: 'szkola', name: 'szkoła', phrase: 'stoi szkoła', acc: 'szkołę', it: 'jej' },
  { id: 'las', name: 'las', phrase: 'rośnie las', acc: 'las', it: 'go' },
  { id: 'studnia', name: 'studnia', phrase: 'jest studnia', acc: 'studnię', it: 'jej' },
  { id: 'karczma', name: 'karczma', phrase: 'stoi karczma', acc: 'karczmę', it: 'jej' },
];

export const PLAN_W = 600;
export const PLAN_H = 420;

export type P = readonly [number, number];

export const RIVER: P[] = [
  [0, 110],
  [110, 140],
  [210, 200],
  [300, 230],
  [400, 290],
  [500, 320],
  [600, 370],
];
export const ROAD: P[] = [
  [340, 0],
  [325, 110],
  [300, 230],
  [285, 330],
  [295, 420],
];

export interface Placed {
  key: number;
  shape: ShapeId;
  at: P;
}

export interface LegendRow {
  key: number;
  shape: ShapeId | null;
  meaning: MeaningId | null;
}

export interface VillageState {
  placed: Placed[];
  legend: LegendRow[];
  /** Strzałka północy: miejsce i obrót (0 = w górę ekranu, 90 = w prawo…) albo `null`. */
  north: { at: P; rot: 0 | 90 | 180 | 270 } | null;
}

export type CriterionId =
  | 'znaki'
  | 'kazdy-w-legendzie'
  | 'legenda-bez-nadmiaru'
  | 'jednoznacznie'
  | 'polnoc';

export interface VillageVerdict {
  ok: boolean;
  note?: string;
}

const shapeName = (id: ShapeId) => SHAPES.find((s) => s.id === id)!.name;
const meaningOf = (id: MeaningId) => MEANINGS.find((m) => m.id === id)!;

/** Wiersze legendy kompletne (znak + znaczenie). */
const fullRows = (legend: LegendRow[]) =>
  legend.filter(
    (r): r is LegendRow & { shape: ShapeId; meaning: MeaningId } => !!r.shape && !!r.meaning
  );

export const MIN_SHAPES = 4;

export function judgeVillage(state: VillageState): Record<CriterionId, VillageVerdict> {
  const used = [...new Set(state.placed.map((p) => p.shape))];
  const rows = fullRows(state.legend);
  const inLegend = new Set(rows.map((r) => r.shape));
  const unexplained = used.filter((s) => !inLegend.has(s));
  const extra = rows.filter((r) => !used.includes(r.shape));
  const halfRows = state.legend.filter((r) => !r.shape !== !r.meaning);

  const shapeTwice = [...new Set(rows.map((r) => r.shape))].filter(
    (s) => new Set(rows.filter((r) => r.shape === s).map((r) => r.meaning)).size > 1
  );
  const meaningTwice = [...new Set(rows.map((r) => r.meaning))].filter(
    (m) => new Set(rows.filter((r) => r.meaning === m).map((r) => r.shape)).size > 1
  );

  return {
    znaki:
      used.length >= MIN_SHAPES
        ? { ok: true }
        : {
            ok: false,
            note: `Na planie ${used.length === 0 ? 'nie ma jeszcze żadnego znaku' : used.length === 1 ? 'jest tylko jeden rodzaj znaku' : `są tylko ${used.length} różne znaki`} — wioska potrzebuje co najmniej ${MIN_SHAPES}.`,
          },
    'kazdy-w-legendzie':
      unexplained.length === 0 && halfRows.length === 0
        ? { ok: true }
        : unexplained.length > 0
          ? {
              ok: false,
              note: `Na planie ${unexplained.length === 1 ? 'stoi' : 'stoją'} ${unexplained.map(shapeName).join(', ')}, a legenda nie mówi, co ${unexplained.length === 1 ? 'to znaczy' : 'znaczą'}.`,
            }
          : {
              ok: false,
              note: 'W legendzie jest wiersz bez znaku albo bez znaczenia — dokończ go albo usuń.',
            },
    'legenda-bez-nadmiaru':
      extra.length === 0
        ? { ok: true }
        : {
            ok: false,
            note: `Legenda objaśnia ${extra.map((r) => `${shapeName(r.shape)} (${meaningOf(r.meaning).name})`).join(', ')}, ale na planie tego znaku nie ma.`,
          },
    jednoznacznie:
      shapeTwice.length === 0 && meaningTwice.length === 0
        ? { ok: true }
        : shapeTwice.length > 0
          ? {
              ok: false,
              note: `${capital(shapeName(shapeTwice[0]))} ma w legendzie dwa znaczenia — czytelnik nie będzie wiedział, które wybrać.`,
            }
          : {
              ok: false,
              note: `${capital(meaningOf(meaningTwice[0]).name)} ma w legendzie dwa różne znaki — jedna rzecz, jeden znak.`,
            },
    polnoc: state.north
      ? { ok: true }
      : {
          ok: false,
          note: 'Na planie nie ma strzałki północy — bez niej nie wiadomo, gdzie jest północ.',
        },
  };
}

// ─── Czytelnik ─────────────────────────────────────────────────────────────────

const DIRS = [
  'północy',
  'północnym wschodzie',
  'wschodzie',
  'południowym wschodzie',
  'południu',
  'południowym zachodzie',
  'zachodzie',
  'północnym zachodzie',
];

/** Kierunek świata punktu względem środka planu, liczony od strzałki północy. */
export function directionOf(at: P, northRot: number): string | null {
  const dx = at[0] - PLAN_W / 2;
  const dy = at[1] - PLAN_H / 2;
  if (Math.hypot(dx, dy) < 70) return null;
  const screen = (Math.atan2(dx, -dy) * 180) / Math.PI; // 0 = w górę ekranu, zgodnie z zegarem
  const bearing = (((screen - northRot) % 360) + 360) % 360;
  return DIRS[Math.round(bearing / 45) % 8];
}

function distToPolyline(p: P, line: readonly P[]): number {
  let best = Infinity;
  for (let i = 1; i < line.length; i++) {
    const [ax, ay] = line[i - 1];
    const [bx, by] = line[i];
    const vx = bx - ax;
    const vy = by - ay;
    const t = Math.max(0, Math.min(1, ((p[0] - ax) * vx + (p[1] - ay) * vy) / (vx * vx + vy * vy)));
    best = Math.min(best, Math.hypot(p[0] - (ax + vx * t), p[1] - (ay + vy * t)));
  }
  return best;
}

export const NEAR_RIVER = 32;
export const ON_RIVER = 16;
export const NEAR_ROAD = 26;

/**
 * Opowieść Czytelnika — zdania po kolei. `lost: true` przy zdaniach, w których
 * się gubi (znak bez legendy, legenda bez znaku, dwa znaczenia, brak północy).
 */
export function readVillage(state: VillageState): { text: string; lost?: boolean }[] {
  const lines: { text: string; lost?: boolean }[] = [];
  const rows = fullRows(state.legend);
  const meaningsOf = (s: ShapeId) => [
    ...new Set(rows.filter((r) => r.shape === s).map((r) => r.meaning)),
  ];

  if (state.placed.length === 0)
    return [{ text: 'Widzę rzekę i drogę. Nic więcej — pusta okolica.', lost: true }];

  if (!state.north)
    lines.push({
      text: 'Hm, nie ma strzałki północy. Nie powiem „na północy” ani „na południu” — będę mówić „tu” i „tam”.',
      lost: true,
    });
  else lines.push({ text: 'Strzałka pokazuje północ. Czytam plan według legendy.' });

  const sorted = [...state.placed].sort((a, b) => a.at[1] - b.at[1] || a.at[0] - b.at[0]);
  const told = new Set<string>();
  for (const p of sorted) {
    const where = state.north ? directionOf(p.at, state.north.rot) : null;
    const place = where ? `Na ${where} wioski` : state.north ? 'W środku wioski' : 'Tu';
    const ms = meaningsOf(p.shape);
    const shape = SHAPES.find((s) => s.id === p.shape)!;
    if (ms.length === 0) {
      if (told.has(`?${p.shape}`)) continue;
      told.add(`?${p.shape}`);
      lines.push({
        text: `${place} jest ${shape.some}… Legenda nic ${shape.about} nie mówi. Gubię się — co to jest?`,
        lost: true,
      });
      continue;
    }
    if (ms.length > 1) {
      if (told.has(`!${p.shape}`)) continue;
      told.add(`!${p.shape}`);
      lines.push({
        text: `${capital(shape.name)} raz to ${meaningOf(ms[0]).name}, raz ${meaningOf(ms[1]).name}? Nie wiem, co wybrać.`,
        lost: true,
      });
      continue;
    }
    const m = meaningOf(ms[0]);
    const onRiver = distToPolyline(p.at, RIVER) <= ON_RIVER;
    const nearRiver = distToPolyline(p.at, RIVER) <= NEAR_RIVER;
    const nearRoad = distToPolyline(p.at, ROAD) <= NEAR_ROAD;
    if (m.id === 'most') {
      lines.push(
        onRiver
          ? { text: `${place} droga przechodzi mostem przez rzekę.` }
          : { text: `${place} ${m.phrase} — ale nie nad rzeką. Dziwny most, nad niczym!` }
      );
      continue;
    }
    const extra =
      m.id === 'mlyn' && nearRiver
        ? ', nad samą rzeką — woda kręci kołem'
        : nearRiver
          ? ', nad rzeką'
          : nearRoad
            ? ', przy drodze'
            : '';
    lines.push({ text: `${place} ${m.phrase}${extra}.` });
  }

  const used = new Set(state.placed.map((p) => p.shape));
  for (const r of rows) {
    if (!used.has(r.shape))
      lines.push({
        text: `Legenda obiecuje ${meaningOf(r.meaning).acc}, ale nigdzie na planie ${meaningOf(r.meaning).it} nie widzę.`,
        lost: true,
      });
  }
  return lines;
}

function capital(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
