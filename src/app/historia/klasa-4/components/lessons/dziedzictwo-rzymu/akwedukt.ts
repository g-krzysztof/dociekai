/**
 * Blok 1 — akwedukt (F-V.3-03, F-V.T1-04). Czysta logika, bez Reacta.
 *
 * Profil trasy: źródło w górach (80 m), wzgórze (105 m), głęboka dolina
 * z rzeką (5 m) i miasto (30 m). Dziecko ustawia wysokość kanału w sześciu
 * punktach. Woda płynie tylko wtedy, gdy kanał **ani razu nie idzie pod górę**.
 * Gdzie kanał jest nad ziemią — stoi most na łukach; gdzie pod ziemią — tunel.
 * Najwyższy most rzymskiego akweduktu, Pont du Gard, ma ok. 49 m — przyjmujemy
 * 50 m jako granicę tego, co Rzymianie umieli zbudować. Wymiary trasy są wymyślone.
 */

export const NODES = 8;
export const SPRING = 80;
export const CITY = 30;
export const MAX_BRIDGE = 50;
export const LENGTH_KM = 50;

const TERRAIN: [number, number][] = [
  [0, 80],
  [0.3, 105],
  [0.45, 70],
  [0.6, 5],
  [0.72, 40],
  [0.85, 45],
  [1, 30],
];

export function terrainAt(x: number): number {
  for (let i = 1; i < TERRAIN.length; i++) {
    const [x0, y0] = TERRAIN[i - 1];
    const [x1, y1] = TERRAIN[i];
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return TERRAIN[TERRAIN.length - 1][1];
}

export const nodeX = (i: number) => i / (NODES - 1);

/** Startowe wysokości: kanał prowadzony po ziemi (tak, jak kopie się rów). */
export function startHeights(): number[] {
  return Array.from({ length: NODES }, (_, i) => (i === 0 ? SPRING : i === NODES - 1 ? CITY : Math.round(terrainAt(nodeX(i)))));
}

export type FlowResult =
  | { ok: true; maxBridge: number; tunnelKm: number; bridgeKm: number }
  | { ok: false; stopAt: number; reason: 'pod-gore' | 'za-wysoki-most'; message: string };

/** Próbkuje trasę i sprawdza, czy woda dopłynie do miasta. `stopAt` = indeks odcinka, na którym staje. */
export function flow(h: number[]): FlowResult {
  let maxBridge = 0;
  let tunnel = 0;
  let bridge = 0;
  const SAMPLES = 20;
  for (let i = 0; i < NODES - 1; i++) {
    if (h[i + 1] > h[i]) {
      return {
        ok: false,
        stopAt: i,
        reason: 'pod-gore',
        message: `Na odcinku ${i + 1} kanał idzie pod górę: z ${h[i]} m na ${h[i + 1]} m. Woda nie popłynie w górę — staje.`,
      };
    }
    for (let s = 0; s < SAMPLES; s++) {
      const t = (s + 0.5) / SAMPLES;
      const x = nodeX(i) + t / (NODES - 1);
      const c = h[i] + (h[i + 1] - h[i]) * t;
      const g = terrainAt(x);
      const seg = LENGTH_KM / (NODES - 1) / SAMPLES;
      if (c - g > MAX_BRIDGE) {
        return {
          ok: false,
          stopAt: i,
          reason: 'za-wysoki-most',
          message: `Na odcinku ${i + 1} most musiałby mieć ${Math.round(c - g)} m. Najwyższy most rzymskiego akweduktu ma ok. 49 m — taki by się zawalił. Obniż kanał przed doliną.`,
        };
      }
      if (c > g + 1) bridge += seg;
      if (c < g - 1) tunnel += seg;
      maxBridge = Math.max(maxBridge, c - g);
    }
  }
  return { ok: true, maxBridge: Math.round(maxBridge), tunnelKm: Math.round(tunnel), bridgeKm: Math.round(bridge) };
}
