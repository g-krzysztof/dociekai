/**
 * Wędrówki ludzi (L15, blok 3) — czysta logika. Grupa wychodzi z Afryki
 * i przechodzi między kontynentami po drogach. Dwie drogi istnieją tylko
 * wtedy, gdy morze opadło: w epoce lodowej woda zamarza w lodowcach, morze
 * opada o ponad 100 m i szelf (morze płytsze niż ok. 200 m) staje się lądem —
 * Beringia między Azją a Ameryką, Sunda w Azji Południowo-Wschodniej (do
 * Australii i tak trzeba było przepłynąć kawałek głębokiego morza).
 *
 * Daty (przybliżone, „ok.”): człowiek rozumny w Afryce ok. 300 tys. lat temu,
 * Ameryka ostatnia ok. 15 tys. lat temu — baza F-III.1-02, F-III.1-03,
 * F-III.1-05. Azja ok. 60 tys., Australia ok. 50 tys., Europa ok. 45 tys. —
 * Wikipedia „Early human migrations” (szacunki zaokrąglone w dół, do pełnych
 * dziesiątek tysięcy, tak jak podają je przeglądy).
 */

export type RegionId = 'afryka' | 'azja' | 'europa' | 'australia' | 'ameryka';

export interface Region {
  id: RegionId;
  name: string;
  /** Dopełniacz: „do Azji”. */
  toName: string;
  lon: number;
  lat: number;
  /** Ile tysięcy lat temu dotarli tu ludzie (Afryka — skąd pochodzą). */
  kya: number;
}

export const REGIONS: Region[] = [
  { id: 'afryka', name: 'Afryka', toName: 'do Afryki', lon: 36, lat: 2, kya: 300 },
  { id: 'azja', name: 'Azja', toName: 'do Azji', lon: 78, lat: 38, kya: 60 },
  { id: 'australia', name: 'Australia', toName: 'do Australii', lon: 134, lat: -24, kya: 50 },
  { id: 'europa', name: 'Europa', toName: 'do Europy', lon: 14, lat: 50, kya: 45 },
  { id: 'ameryka', name: 'Ameryka', toName: 'do Ameryki', lon: -100, lat: 42, kya: 15 },
];

export function getRegion(id: RegionId): Region {
  return REGIONS.find((r) => r.id === id)!;
}

export interface Route {
  a: RegionId;
  b: RegionId;
  /** Gdy ustawione — droga istnieje tylko, gdy morze jest niżej niż tyle metrów. */
  needsSeaBelow?: number;
  /** Nazwa przejścia do komunikatów. */
  via: string;
  /** Punkty pośrednie (lon, lat), żeby linia szła po lądzie, a nie przez ocean. */
  through?: [number, number][];
}

/** Morze opada do −120 m (szczyt ostatniej epoki lodowej). */
export const SEA_MIN = -120;
/** Cieśnina Beringa ma ok. 50 m głębokości — odsłania się, gdy morze opadnie o więcej. */
export const BRIDGE_AT = -60;

export const ROUTES: Route[] = [
  { a: 'afryka', b: 'azja', via: 'przesmyk Synaj', through: [[34, 30], [45, 33]] },
  { a: 'azja', b: 'europa', via: 'stepy nad Morzem Czarnym', through: [[42, 42]] },
  { a: 'azja', b: 'australia', needsSeaBelow: BRIDGE_AT, via: 'Sunda — ląd na miejscu dzisiejszych wysp', through: [[100, 14], [110, -2], [122, -8]] },
  { a: 'azja', b: 'ameryka', needsSeaBelow: BRIDGE_AT, via: 'Beringia — most lądowy między Azją a Ameryką', through: [[130, 60], [170, 66], [-168, 66], [-150, 64], [-125, 55]] },
];

export function routeBetween(a: RegionId, b: RegionId): Route | undefined {
  return ROUTES.find((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a));
}

export function isOpen(route: Route, sea: number): boolean {
  return route.needsSeaBelow === undefined || sea <= route.needsSeaBelow;
}

export type MoveResult =
  | { ok: true; to: RegionId; route: Route }
  | { ok: false; reason: 'ten-sam' | 'brak-drogi' | 'morze'; text: string };

/**
 * Sędzia przejścia: z `from` do `to` przy poziomie morza `sea`. Odrzut nazywa
 * przeszkodę (morze nad mostem, brak drogi bez przejścia przez inny ląd).
 */
export function judgeMove(from: RegionId, to: RegionId, sea: number): MoveResult {
  if (from === to) return { ok: false, reason: 'ten-sam', text: 'Grupa już tu jest.' };
  const route = routeBetween(from, to);
  const target = getRegion(to);
  if (!route) {
    return {
      ok: false,
      reason: 'brak-drogi',
      text: `Z ${genitive(from)} nie da się dojść prosto ${target.toName} — po drodze jest morze albo ocean. Idź przez Azję.`,
    };
  }
  if (!isOpen(route, sea)) {
    const level = sea === 0 ? 'Morze stoi tak wysoko jak dziś' : `Morze opadło tylko o ${Math.abs(sea)} m`;
    return {
      ok: false,
      reason: 'morze',
      text: `${level} — ${route.via.split(' — ')[0]} jest pod wodą. Opuść morze o więcej niż ${Math.abs(route.needsSeaBelow!)} m.`,
    };
  }
  return { ok: true, to, route };
}

function genitive(id: RegionId): string {
  return { afryka: 'Afryki', azja: 'Azji', europa: 'Europy', australia: 'Australii', ameryka: 'Ameryki' }[id];
}

/** Kontynent zasiedlony jako ostatni — z dat, które dziecko zebrało po drodze. */
export function lastSettled(reached: readonly RegionId[]): RegionId | null {
  const list = reached.map(getRegion).filter((r) => r.id !== 'afryka');
  if (!list.length) return null;
  return list.reduce((a, b) => (b.kya < a.kya ? b : a)).id;
}

export function judgeLast(reached: readonly RegionId[], tapped: RegionId): { ok: boolean; text: string } {
  const last = lastSettled(reached);
  const t = getRegion(tapped);
  if (!last) return { ok: false, text: 'Najpierw dojdź gdzieś z Afryki.' };
  if (tapped === last) {
    return { ok: true, text: `Tak — ${t.name}: ok. ${t.kya} tys. lat temu. Mniej tysięcy lat temu = później.` };
  }
  if (tapped === 'afryka') {
    return { ok: false, text: 'W Afryce ludzie byli od początku — ok. 300 tys. lat temu. Szukasz miejsca, do którego doszli najpóźniej.' };
  }
  const l = getRegion(last);
  return {
    ok: false,
    text: `${t.name}: ok. ${t.kya} tys. lat temu. Ale ${l.name}: ok. ${l.kya} tys. — to mniej lat temu, więc później.`,
  };
}
