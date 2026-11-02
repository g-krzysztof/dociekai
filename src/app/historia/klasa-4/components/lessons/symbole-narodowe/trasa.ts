/**
 * L10 blok 3 — trasa legionów z pieśni Wybickiego. Geometria i sędzia, bez Reacta.
 *
 * Dziecko prowadzi palcem znacznik z Reggio nell'Emilia (tam w lipcu 1797 r.
 * powstała pieśń — F-II.1-15, F-II.1-17) przez Alpy na ziemie polskie.
 * Kolejność wynika z tekstu źródła: „z ziemi włoskiej do Polski” (najpierw
 * trzeba opuścić Włochy), „przejdziem Wisłę, przejdziem Wartę” (najpierw
 * Wisła). Rzeki z Natural Earth (`geo-legiony.ts`), przecięcie liczone
 * odcinek po odcinku.
 */
import { GEO_PROJ, GEO_RIVERS } from '../../hist-map/geo-legiony';

export type P = [number, number];

export function proj(lon: number, lat: number): P {
  return [
    Math.round((lon - GEO_PROJ.lon0) * GEO_PROJ.kx * 10) / 10,
    Math.round((GEO_PROJ.lat1 - lat) * GEO_PROJ.ky * 10) / 10,
  ];
}

export const START = proj(10.63, 44.7); // Reggio nell'Emilia

export const CITIES: { name: string; p: P; dx?: number; dy?: number }[] = [
  { name: "Reggio nell'Emilia", p: START, dx: -60, dy: 26 },
  { name: 'Wiedeń', p: proj(16.37, 48.21) },
  { name: 'Kraków', p: proj(19.94, 50.06) },
  { name: 'Warszawa', p: proj(21.01, 52.23), dx: -40, dy: 24 },
  { name: 'Poznań', p: proj(16.93, 52.41) },
];

/** Łuk Alp w przybliżeniu (lon/lat) — tylko rysunek i podpis, nie sędzia. */
export const ALPS: P[] = (
  [
    [7.7, 44.2], [7.7, 45.9], [8.6, 46.5], [10.2, 47.2], [12.4, 47.6], [14.6, 47.7],
    [15.9, 47.6], [16.0, 47.0], [15.0, 46.5], [13.6, 46.3], [12.2, 46.1], [10.6, 45.9],
    [9.2, 45.9], [8.2, 45.4], [8.0, 44.6],
  ] as P[]
).map(([lon, lat]) => proj(lon, lat));

/** Na północ od Alp — tu kończą się Włochy w tej opowieści. */
export const NORTH_OF_ALPS_Y = proj(0, 47.9)[1];

function parseSegments(d: string): [P, P][] {
  const segs: [P, P][] = [];
  for (const part of d.split('M').filter(Boolean)) {
    const pts = part
      .trim()
      .split(/\s+/)
      .map((xy) => xy.split(',').map(Number) as P);
    for (let i = 1; i < pts.length; i++) segs.push([pts[i - 1], pts[i]]);
  }
  return segs;
}

export const RIVER_SEGMENTS: Record<'Wisła' | 'Warta', [P, P][]> = {
  Wisła: parseSegments(GEO_RIVERS.find((r) => r.name === 'Wisła')?.d ?? ''),
  Warta: parseSegments(GEO_RIVERS.find((r) => r.name === 'Warta')?.d ?? ''),
};

function cross(o: P, a: P, b: P) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

export function segmentsIntersect(p1: P, p2: P, q1: P, q2: P): boolean {
  const d1 = cross(q1, q2, p1);
  const d2 = cross(q1, q2, p2);
  const d3 = cross(p1, p2, q1);
  const d4 = cross(p1, p2, q2);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

export type RouteEvent = 'wlochy' | 'wisla' | 'warta';

/**
 * Zdarzenia na drodze w kolejności, każde raz (pierwsze wystąpienie):
 * `wlochy` — znacznik przeszedł na północ od Alp; `wisla`/`warta` — odcinek
 * drogi przeciął rzekę.
 */
export function routeEvents(path: P[]): RouteEvent[] {
  const out: RouteEvent[] = [];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    if (!out.includes('wlochy') && b[1] < NORTH_OF_ALPS_Y) out.push('wlochy');
    for (const [name, ev] of [
      ['Wisła', 'wisla'],
      ['Warta', 'warta'],
    ] as const) {
      if (out.includes(ev)) continue;
      if (RIVER_SEGMENTS[name].some(([q1, q2]) => segmentsIntersect(a, b, q1, q2))) out.push(ev);
    }
  }
  return out;
}

export type RouteVerdict =
  | { ok: true }
  | { ok: false; kind: 'w-drodze' | 'kolejnosc'; message: string };

export function judgeRoute(events: RouteEvent[]): RouteVerdict {
  const wi = events.indexOf('wisla');
  const wa = events.indexOf('warta');
  if (wa >= 0 && (wi < 0 || wa < wi)) {
    return {
      ok: false,
      kind: 'kolejnosc',
      message:
        'Twoje legiony przeszły najpierw Wartę. A pieśń śpiewa: „Przejdziem Wisłę, przejdziem Wartę” — najpierw Wisła. Zacznij od nowa i poprowadź je tak, jak w tekście.',
    };
  }
  if (events.includes('wlochy') && wi >= 0 && wa > wi) return { ok: true };
  const missing = !events.includes('wlochy')
    ? 'Najpierw trzeba wyjść z Włoch — przez Alpy na północ.'
    : wi < 0
      ? 'Prowadź dalej — przed tobą Wisła.'
      : 'Jeszcze Warta.';
  return { ok: false, kind: 'w-drodze', message: missing };
}
