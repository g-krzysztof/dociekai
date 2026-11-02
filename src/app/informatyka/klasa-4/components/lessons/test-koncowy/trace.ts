/**
 * Ślad kota po scenie — czysta funkcja wykonująca krótki skrypt: krok, skręt i
 * pętla. Konwencja jak w Scratchu: kierunek 90 to prawo, 0 to góra, a skręt
 * „↻” dodaje stopnie (zgodnie z ruchem wskazówek zegara). Wszystkie liczby
 * w zadaniach są wielokrotnościami trzydziestu, więc zaokrąglenie do całości
 * po każdym kroku daje wynik dokładny i identyczny na serwerze i w przeglądarce.
 */

export type Op =
  | { t: 'go'; n: number }
  | { t: 'turn'; deg: number }
  | { t: 'repeat'; n: number; body: Op[] };

export interface Pose {
  x: number;
  y: number;
  dir: number;
}

export interface Trace {
  end: Pose;
  /** Punkty, w których kot był po kolejnych krokach — do narysowania trasy. */
  path: { x: number; y: number }[];
}

const norm = (deg: number) => ((deg % 360) + 360) % 360;

export function runTrace(ops: Op[], start: Pose): Trace {
  let pose: Pose = { ...start, dir: norm(start.dir) };
  const path = [{ x: pose.x, y: pose.y }];

  const exec = (list: Op[]) => {
    for (const op of list) {
      if (op.t === 'go') {
        const rad = (pose.dir * Math.PI) / 180;
        pose = {
          x: Math.round(pose.x + op.n * Math.sin(rad)),
          y: Math.round(pose.y + op.n * Math.cos(rad)),
          dir: pose.dir,
        };
        path.push({ x: pose.x, y: pose.y });
      } else if (op.t === 'turn') {
        pose = { ...pose, dir: norm(pose.dir + op.deg) };
      } else {
        for (let i = 0; i < op.n; i += 1) exec(op.body);
      }
    }
  };
  exec(ops);
  return { end: pose, path };
}

export interface TraceTask {
  id: string;
  title: string;
  start: Pose;
  ops: Op[];
  explain: string;
}

export const TRACE_TASKS: TraceTask[] = [
  {
    id: 'kwadrat',
    title: 'Cztery razy: krok i skręt',
    start: { x: 0, y: 0, dir: 90 },
    ops: [
      {
        t: 'repeat',
        n: 4,
        body: [
          { t: 'go', n: 60 },
          { t: 'turn', deg: 90 },
        ],
      },
    ],
    explain:
      'Cztery razy krok i skręt o 90° to kwadrat. Cztery skręty po 90° dają pełny obrót, więc kot wraca dokładnie tam, skąd wyszedł.',
  },
  {
    id: 'trzy',
    title: 'Trzy razy: krok i skręt',
    start: { x: 0, y: 0, dir: 90 },
    ops: [
      {
        t: 'repeat',
        n: 3,
        body: [
          { t: 'go', n: 60 },
          { t: 'turn', deg: 90 },
        ],
      },
    ],
    explain:
      'To trzy boki kwadratu, nie cztery. Kot idzie w prawo, w dół i w lewo — a potem się zatrzymuje pod punktem startu, nie na nim.',
  },
  {
    id: 'dwie',
    title: 'Krok, a potem dwa razy skręt w lewo i krok',
    start: { x: -60, y: 0, dir: 90 },
    ops: [
      { t: 'go', n: 60 },
      {
        t: 'repeat',
        n: 2,
        body: [
          { t: 'turn', deg: -90 },
          { t: 'go', n: 30 },
        ],
      },
    ],
    explain:
      'Najpierw jeden krok w prawo, na środek. Potem dwa razy „skręć w lewo i idź”: pierwszy skręt kieruje kota w górę, drugi w lewo — i kot staje w punkcie (−30, 30).',
  },
];
