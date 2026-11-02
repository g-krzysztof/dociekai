/**
 * Blok 2 — labirynt Minotaura. Czysta logika, bez Reacta.
 *
 * Labirynt jest „doskonały” (z każdej komórki do każdej prowadzi dokładnie
 * jedna droga), generowany z ziarna — ten sam na serwerze i w przeglądarce.
 * Nić Ariadny to **stos komórek** od wejścia do Tezeusza: krok naprzód ją
 * rozwija, krok wstecz po własnej nici — zwija. Dlatego po spotkaniu
 * z Minotaurem nić leży dokładnie po jedynej drodze do wyjścia, bez
 * zaułków, w które Tezeusz wcześniej zabłądził.
 */

export type Dir = 'N' | 'E' | 'S' | 'W';
export const DIRS: Record<Dir, { dx: number; dy: number; bit: number; back: Dir }> = {
  N: { dx: 0, dy: -1, bit: 1, back: 'S' },
  E: { dx: 1, dy: 0, bit: 2, back: 'W' },
  S: { dx: 0, dy: 1, bit: 4, back: 'N' },
  W: { dx: -1, dy: 0, bit: 8, back: 'E' },
};

export interface Maze {
  w: number;
  h: number;
  /** Bitmaska otwartych boków każdej komórki (N=1, E=2, S=4, W=8), indeks y*w+x. */
  open: number[];
  entrance: number;
  center: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const xy = (m: Maze, i: number) => ({ x: i % m.w, y: Math.floor(i / m.w) });

export function makeMaze(w: number, h: number, seed: number): Maze {
  const rand = mulberry32(seed);
  const open = new Array<number>(w * h).fill(0);
  const seen = new Array<boolean>(w * h).fill(false);
  const start = Math.floor(h / 2) * w + Math.floor(w / 2);
  const stack = [start];
  seen[start] = true;
  while (stack.length) {
    const cur = stack[stack.length - 1];
    const x = cur % w;
    const y = Math.floor(cur / w);
    const options = (Object.keys(DIRS) as Dir[]).filter((d) => {
      const nx = x + DIRS[d].dx;
      const ny = y + DIRS[d].dy;
      return nx >= 0 && ny >= 0 && nx < w && ny < h && !seen[ny * w + nx];
    });
    if (!options.length) {
      stack.pop();
      continue;
    }
    const d = options[Math.floor(rand() * options.length)];
    const next = (y + DIRS[d].dy) * w + x + DIRS[d].dx;
    open[cur] |= DIRS[d].bit;
    open[next] |= DIRS[DIRS[d].back].bit;
    seen[next] = true;
    stack.push(next);
  }
  return { w, h, open, entrance: (h - 1) * w + Math.floor(w / 2), center: start };
}

/** Sąsiad w kierunku `d`, jeśli nie dzieli ich ściana; inaczej `null`. */
export function neighbor(m: Maze, i: number, d: Dir): number | null {
  if (!(m.open[i] & DIRS[d].bit)) return null;
  const { x, y } = xy(m, i);
  return (y + DIRS[d].dy) * m.w + x + DIRS[d].dx;
}

/** Odległości (w krokach) od komórki `from` do wszystkich pozostałych. */
export function distances(m: Maze, from: number): number[] {
  const dist = new Array<number>(m.w * m.h).fill(-1);
  dist[from] = 0;
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const d of Object.keys(DIRS) as Dir[]) {
      const n = neighbor(m, cur, d);
      if (n !== null && dist[n] < 0) {
        dist[n] = dist[cur] + 1;
        queue.push(n);
      }
    }
  }
  return dist;
}

/** Komórki widoczne w ciemności: najwyżej `reach` kroków korytarzem od Tezeusza. */
export function visibleCells(m: Maze, at: number, reach = 2): Set<number> {
  const dist = distances(m, at);
  return new Set(dist.flatMap((d, i) => (d >= 0 && d <= reach ? [i] : [])));
}

/** Ślepy zaułek: jedno wyjście, nie wejście i nie środek. */
export function deadEnds(m: Maze): number[] {
  return m.open.flatMap((o, i) => {
    const exits = [1, 2, 4, 8].filter((b) => o & b).length;
    return exits === 1 && i !== m.entrance && i !== m.center ? [i] : [];
  });
}

/** Krok Tezeusza: cofnięcie na poprzednią komórkę nici zwija ją, każdy inny krok rozwija. */
export function stepThread(thread: number[], to: number): number[] {
  if (thread.length >= 2 && thread[thread.length - 2] === to) return thread.slice(0, -1);
  return [...thread, to];
}

/**
 * Kierunek pierwszego kroku w stronę komórki `target` (pod palcem): najpierw
 * oś z większą różnicą, potem druga; ściana na obu — brak ruchu.
 */
export function stepToward(m: Maze, from: number, target: number): number | null {
  const a = xy(m, from);
  const b = xy(m, target);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) return null;
  const horiz: Dir | null = dx > 0 ? 'E' : dx < 0 ? 'W' : null;
  const vert: Dir | null = dy > 0 ? 'S' : dy < 0 ? 'N' : null;
  const order = Math.abs(dx) >= Math.abs(dy) ? [horiz, vert] : [vert, horiz];
  for (const d of order) {
    if (!d) continue;
    const n = neighbor(m, from, d);
    if (n !== null) return n;
  }
  return null;
}

export type Phase = 'in' | 'out' | 'done';

export interface Walk {
  thread: number[];
  phase: Phase;
  visited: number[];
  stepsIn: number;
  stepsOut: number;
}

export const startWalk = (m: Maze): Walk => ({ thread: [m.entrance], phase: 'in', visited: [m.entrance], stepsIn: 0, stepsOut: 0 });

/** Jeden krok Tezeusza do sąsiedniej komórki (zakłada brak ściany). Do środka → faza powrotu, do wejścia w powrocie → koniec. */
export function walkTo(m: Maze, w: Walk, next: number): Walk {
  if (w.phase === 'done') return w;
  const thread = stepThread(w.thread, next);
  const visited = w.visited.includes(next) ? w.visited : [...w.visited, next];
  if (w.phase === 'in') {
    return { ...w, thread, visited, stepsIn: w.stepsIn + 1, phase: next === m.center ? 'out' : 'in' };
  }
  return { ...w, thread, visited, stepsOut: w.stepsOut + 1, phase: next === m.entrance ? 'done' : 'out' };
}

/** Idzie w stronę komórki `target` najwyżej `max` krokami, zawsze korytarzem; staje na środku i na wyjściu. */
export function walkToward(m: Maze, w: Walk, target: number, max = 3): Walk {
  let cur = w;
  for (let i = 0; i < max && cur.phase !== 'done'; i++) {
    const from = cur.thread[cur.thread.length - 1];
    const next = stepToward(m, from, target);
    if (next === null) break;
    const before = cur.phase;
    cur = walkTo(m, cur, next);
    if (cur.phase !== before) break;
  }
  return cur;
}

/** Ziarno wybrane tak, żeby droga do środka była długa i miała dużo zaułków (sprawdza selftest). */
export const MAZE_SEED = 48;
export const MAZE_SIZE = 7;
