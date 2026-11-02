'use client';

import { useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RotateCcw } from 'lucide-react';
import { plural } from '@/lib/plural';
import {
  deadEnds,
  distances,
  makeMaze,
  MAZE_SEED,
  MAZE_SIZE,
  neighbor,
  startWalk,
  visibleCells,
  walkTo,
  walkToward,
  xy,
  type Dir,
  type Walk,
} from './labirynt';

const CELL = 44;
const PAD = 8;
const THREAD = '#c2410c';

/**
 * Blok 2 — **Labirynt i nić Ariadny**. Gest: dziecko prowadzi Tezeusza
 * palcem przez ciemny labirynt, a za nim **rozwija się nić**. Widać tylko
 * kawałek korytarza wokół Tezeusza; nić widać zawsze. Po spotkaniu
 * z Minotaurem trzeba wrócić — krok po własnej nici zwija ją z powrotem.
 * Werdykt liczy kroki tam (z błądzeniem) i z powrotem (tyle, ile nici).
 */
export function LabiryntWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const maze = useMemo(() => makeMaze(MAZE_SIZE, MAZE_SIZE, MAZE_SEED), []);
  const ends = useMemo(() => deadEnds(maze), [maze]);
  const shortest = useMemo(() => distances(maze, maze.entrance)[maze.center], [maze]);
  const [walk, setWalk] = useState<Walk>(() => startWalk(maze));
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  /** Bieżący stan także między renderami — pointermove potrafi przyjść dwa razy przed odświeżeniem. */
  const walkRef = useRef(walk);

  const { thread, phase, stepsIn, stepsOut } = walk;
  const visited = useMemo(() => new Set(walk.visited), [walk.visited]);
  const at = thread[thread.length - 1];
  const seen = useMemo(() => (phase === 'done' ? null : visibleCells(maze, at, 2)), [maze, at, phase]);

  const commit = (make: (w: Walk) => Walk) => {
    const prev = walkRef.current;
    const next = make(prev);
    if (next === prev) return;
    walkRef.current = next;
    setWalk(next);
    if (next.phase === 'done' && prev.phase !== 'done') onDone();
  };

  const cellAt = (clientX: number, clientY: number): number | null => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    const x = Math.floor((p.x - PAD) / CELL);
    const y = Math.floor((p.y - PAD) / CELL);
    if (x < 0 || y < 0 || x >= maze.w || y >= maze.h) return null;
    return y * maze.w + x;
  };

  /** Idzie w stronę komórki pod palcem — kilka kroków na jedno zdarzenie, zawsze korytarzem. */
  const follow = (clientX: number, clientY: number) => {
    const target = cellAt(clientX, clientY);
    if (target !== null) commit((w) => walkToward(maze, w, target));
  };

  const arrow = (d: Dir) => {
    commit((w) => {
      const n = neighbor(maze, w.thread[w.thread.length - 1], d);
      return n === null ? w : walkTo(maze, w, n);
    });
  };

  const reset = () => {
    walkRef.current = startWalk(maze);
    setWalk(walkRef.current);
  };

  const size = maze.w * CELL + PAD * 2;
  const height = maze.h * CELL + PAD * 2 + 26;
  const cx = (i: number) => PAD + xy(maze, i).x * CELL + CELL / 2;
  const cy = (i: number) => PAD + xy(maze, i).y * CELL + CELL / 2;
  const entranceOut = { x: cx(maze.entrance), y: PAD + maze.h * CELL + 18 };
  const threadPoints = [`${entranceOut.x},${entranceOut.y}`, ...thread.map((i) => `${cx(i)},${cy(i)}`)].join(' ');
  const visitedEnds = ends.filter((e) => visited.has(e)).length;

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        {phase === 'in' && (
          <>
            Prowadź Tezeusza palcem (albo strzałkami) do środka labiryntu, gdzie czeka Minotaur. W środku jest ciemno —
            widzisz tylko kawałek korytarza. Za Tezeuszem rozwija się nić od Ariadny.
          </>
        )}
        {phase === 'out' && (
          <>
            <strong>Tezeusz pokonał Minotaura!</strong> Teraz trzeba wyjść z ciemności. Idź po nici — każdy krok po
            niej zwija ją z powrotem do kłębka.
          </>
        )}
        {phase === 'done' && <strong>Tezeusz wyszedł z labiryntu. Ariadna zwija kłębek.</strong>}
      </p>

      <div className="mx-auto w-full max-w-[420px] border bg-[#efe6d2] dark:bg-zinc-900">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size} ${height}`}
          className="block h-auto w-full touch-none cursor-move select-none"
          role="application"
          aria-label="Labirynt Minotaura. Strzałki przesuwają Tezeusza."
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            follow(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (dragging.current) follow(e.clientX, e.clientY);
          }}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          tabIndex={0}
          onKeyDown={(e) => {
            const map: Record<string, Dir> = { ArrowUp: 'N', ArrowDown: 'S', ArrowLeft: 'W', ArrowRight: 'E' };
            if (map[e.key]) {
              e.preventDefault();
              arrow(map[e.key]);
            }
          }}
        >
          {/* Podłoga: odwiedzone komórki jaśniejsze, zaułki zaznaczone po wyjściu. */}
          {maze.open.map((_, i) => {
            const { x, y } = xy(maze, i);
            const isEnd = phase === 'done' && ends.includes(i) && visited.has(i);
            return (
              <rect
                key={`f${i}`}
                x={PAD + x * CELL}
                y={PAD + y * CELL}
                width={CELL}
                height={CELL}
                fill={isEnd ? '#f3c9a8' : visited.has(i) ? '#f7f0df' : '#e6dcc4'}
              />
            );
          })}

          {/* Ściany. */}
          <g stroke="#5b4a36" strokeWidth={4} strokeLinecap="round">
            {maze.open.map((o, i) => {
              const { x, y } = xy(maze, i);
              const x0 = PAD + x * CELL;
              const y0 = PAD + y * CELL;
              const lines = [];
              if (!(o & 1)) lines.push(<line key="n" x1={x0} y1={y0} x2={x0 + CELL} y2={y0} />);
              if (!(o & 8)) lines.push(<line key="w" x1={x0} y1={y0} x2={x0} y2={y0 + CELL} />);
              if (x === maze.w - 1 && !(o & 2)) lines.push(<line key="e" x1={x0 + CELL} y1={y0} x2={x0 + CELL} y2={y0 + CELL} />);
              if (y === maze.h - 1 && i !== maze.entrance) lines.push(<line key="s" x1={x0} y1={y0 + CELL} x2={x0 + CELL} y2={y0 + CELL} />);
              return <g key={`w${i}`}>{lines}</g>;
            })}
          </g>

          {/* Ciemność. */}
          {seen &&
            maze.open.map((_, i) => {
              if (seen.has(i)) return null;
              const { x, y } = xy(maze, i);
              return <rect key={`d${i}`} x={PAD + x * CELL - 1} y={PAD + y * CELL - 1} width={CELL + 2} height={CELL + 2} fill="#1c1917" />;
            })}

          {/* Minotaur w środku — widać go dopiero z bliska. */}
          {(phase !== 'in' || seen?.has(maze.center)) && (
            <g transform={`translate(${cx(maze.center)} ${cy(maze.center)})`} opacity={phase === 'in' ? 1 : 0.35}>
              <ellipse rx={11} ry={10} fill="#7c2d12" />
              <path d="M-9 -6 C-16 -10 -15 -17 -11 -19 M9 -6 C16 -10 15 -17 11 -19" stroke="#f5f5f4" strokeWidth={3} fill="none" strokeLinecap="round" />
              <circle cx={-4} cy={-2} r={1.6} fill="#fde68a" />
              <circle cx={4} cy={-2} r={1.6} fill="#fde68a" />
            </g>
          )}

          {/* Nić — widać ją zawsze, także w ciemności. */}
          <polyline points={threadPoints} fill="none" stroke={THREAD} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />

          {/* Ariadna z kłębkiem przy wejściu. */}
          <g transform={`translate(${entranceOut.x} ${entranceOut.y})`}>
            <circle r={6} fill={THREAD} />
            <path d="M-4 -2 C0 2 2 -3 4 1" stroke="#fff" strokeWidth={1} fill="none" />
          </g>

          {/* Tezeusz. */}
          <g transform={`translate(${cx(at)} ${cy(at)})`}>
            <circle r={13} fill={color} stroke="#fff" strokeWidth={3} />
            <text y={4.5} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">
              T
            </text>
          </g>
        </svg>
      </div>

      {phase !== 'done' && (
        <div className="flex items-center justify-center gap-2" aria-label="Strzałki">
          <button type="button" onClick={() => arrow('W')} className="border p-2" aria-label="W lewo">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => arrow('N')} className="border p-2" aria-label="W górę">
              <ArrowUp className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => arrow('S')} className="border p-2" aria-label="W dół">
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
          <button type="button" onClick={() => arrow('E')} className="border p-2" aria-label="W prawo">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div aria-live="polite" className="text-sm leading-relaxed">
        {phase === 'out' && (
          <p className="text-muted-foreground">
            Na ziemi leży {thread.length - 1} {plural(thread.length - 1, { one: 'odcinek', few: 'odcinki', many: 'odcinków' })}{' '}
            nici. Do środka Tezeusz zrobił {stepsIn} {plural(stepsIn, { one: 'krok', few: 'kroki', many: 'kroków' })}.
          </p>
        )}
        {phase === 'done' && (
          <div className="space-y-2 border-2 p-3" style={{ borderColor: color }}>
            <p>
              Do środka: <strong>{stepsIn} {plural(stepsIn, { one: 'krok', few: 'kroki', many: 'kroków' })}</strong>
              {visitedEnds > 0 && (
                <>
                  {' '}
                  — po drodze Tezeusz zajrzał do {visitedEnds}{' '}
                  {plural(visitedEnds, { one: 'ślepego zaułka', few: 'ślepych zaułków', many: 'ślepych zaułków' })} (na
                  pomarańczowo)
                </>
              )}
              . Z powrotem: <strong>{stepsOut} {plural(stepsOut, { one: 'krok', few: 'kroki', many: 'kroków' })}</strong>
              {stepsOut === shortest ? ' — najkrótszą drogą, jaka istnieje.' : '.'}
            </p>
            <p>
              Nić pamiętała drogę za Tezeusza: zwinęła się z każdego zaułka, z którego zawrócił, więc na powrót zostało
              tylko to, co prowadzi do wyjścia. Bez nici w ciemności powrót byłby zgadywaniem — od nowa przy każdym
              rozwidleniu.
            </p>
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-xs underline underline-offset-2">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Jeszcze raz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
