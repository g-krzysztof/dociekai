'use client';

import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { Flag } from 'lucide-react';
import { CheckBar, type ItemProps, type PartItem } from './test-frame';
import { TRACE_TASKS, runTrace, type Op, type TraceTask } from './trace';

/**
 * Część A testu — **algorytmy i Scratch**: „gdzie skończy kot?”. To ta sama
 * czynność, co przepowiednia w `GuessFirst` z lekcji o testowaniu: dziecko
 * czyta skrypt i **stawia** znacznik tam, gdzie kot się zatrzyma, zanim cokolwiek
 * się uruchomi. Sprawdzenie nie porównuje z listą odpowiedzi — wykonuje skrypt
 * (`runTrace`) i dopiero wtedy rysuje prawdziwą trasę pod znacznikiem dziecka.
 *
 * Trzy skrypty, trzy różne pułapki: pętla, która zamyka kwadrat (kot wraca na
 * start), pętla o jeden obrót za krótka (kot staje pod startem) i dwa różne
 * rodzaje skrętu w jednym skrypcie (lewo i prawo są różne).
 */

const GRID = 30;
const XMAX = 120;
const YMAX = 90;
const PAD = 26;
const VB_W = XMAX * 2 + PAD * 2;
const VB_H = YMAX * 2 + PAD * 2;

const sx = (x: number) => x + XMAX + PAD;
const sy = (y: number) => YMAX + PAD - y;

const snap = (value: number, limit: number) => Math.max(-limit, Math.min(limit, Math.round(value / GRID) * GRID));

const COLORS = { events: '#ffbf00', motion: '#4c97ff', control: '#ffab19' };

function Block({ color, children, dark }: { color: string; children: ReactNode; dark?: boolean }) {
  return (
    <div
      className="inline-block px-2.5 py-1 text-xs font-semibold leading-snug"
      style={{ backgroundColor: color, color: dark ? '#4d3a00' : 'white' }}
    >
      {children}
    </div>
  );
}

function renderOps(ops: Op[], depth = 0): ReactNode {
  return ops.map((op, index) => {
    if (op.t === 'go') return <div key={index}><Block color={COLORS.motion}>idź {op.n} kroków</Block></div>;
    if (op.t === 'turn') {
      return (
        <div key={index}>
          <Block color={COLORS.motion}>
            obróć {op.deg > 0 ? '↻' : '↺'} {Math.abs(op.deg)} stopni
          </Block>
        </div>
      );
    }
    return (
      <div key={index} className="my-0.5">
        <Block color={COLORS.control}>powtórz {op.n} razy</Block>
        <div className="ml-3 border-l-[10px] pl-1.5" style={{ borderColor: COLORS.control }}>
          {renderOps(op.body, depth + 1)}
        </div>
      </div>
    );
  });
}

function TraceItem({ task, color, onDone }: { task: TraceTask } & ItemProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pressed = useRef(false);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const [checked, setChecked] = useState(false);
  const trace = runTrace(task.ops, task.start);
  const ok = ghost !== null && ghost.x === trace.end.x && ghost.y === trace.end.y;

  const toStage = (event: PointerEvent<SVGSVGElement>) => {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: snap(point.x - XMAX - PAD, XMAX), y: snap(YMAX + PAD - point.y, YMAX) };
  };

  const place = (event: PointerEvent<SVGSVGElement>) => {
    if (checked) return;
    const point = toStage(event);
    if (point) setGhost(point);
  };

  const check = () => {
    setChecked(true);
    onDone(ok);
  };

  const startRad = (task.start.dir * Math.PI) / 180;
  const arrow = { x: Math.sin(startRad), y: -Math.cos(startRad) };

  const cells: ReactNode[] = [];
  for (let x = -XMAX; x <= XMAX; x += GRID) {
    cells.push(<line key={`v${x}`} x1={sx(x)} y1={sy(-YMAX)} x2={sx(x)} y2={sy(YMAX)} className={x === 0 ? 'stroke-slate-400' : 'stroke-slate-200 dark:stroke-zinc-700'} strokeWidth={x === 0 ? 1.5 : 1} />);
  }
  for (let y = -YMAX; y <= YMAX; y += GRID) {
    cells.push(<line key={`h${y}`} x1={sx(-XMAX)} y1={sy(y)} x2={sx(XMAX)} y2={sy(y)} className={y === 0 ? 'stroke-slate-400' : 'stroke-slate-200 dark:stroke-zinc-700'} strokeWidth={y === 0 ? 1.5 : 1} />);
  }

  return (
    <div>
      <p className="text-sm leading-relaxed sm:text-base">
        Przeczytaj skrypt i <strong>postaw znacznik</strong> tam, gdzie kot się zatrzyma. Stuknij albo przeciągnij po
        siatce — znacznik przeskakuje na najbliższy punkt.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
        <div className="space-y-0.5">
          <Block color={COLORS.events} dark>
            <span className="inline-flex items-center gap-1">
              kiedy kliknięto <Flag className="h-3 w-3" aria-hidden />
            </span>
          </Block>
          <div>
            <Block color={COLORS.motion}>
              idź do x: {task.start.x} y: {task.start.y}
            </Block>
          </div>
          <div>
            <Block color={COLORS.motion}>
              ustaw kierunek {task.start.dir}° {task.start.dir === 90 ? '(w prawo)' : ''}
            </Block>
          </div>
          {renderOps(task.ops)}
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="mx-auto block w-full max-w-[26rem] cursor-crosshair touch-none select-none border bg-white dark:bg-zinc-900"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            pressed.current = true;
            place(event);
          }}
          onPointerMove={(event) => pressed.current && place(event)}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            pressed.current = false;
          }}
          onPointerCancel={() => {
            pressed.current = false;
          }}
          role="img"
          aria-label="Scena z siatką co 30 kroków. Kot zaczyna w zaznaczonym punkcie."
        >
          {cells}
          {/* start */}
          <g transform={`translate(${sx(task.start.x)} ${sy(task.start.y)}) rotate(${task.start.dir - 90})`}>
            <path d="M-9 -8 L11 0 L-9 8 L-4 0 Z" fill="#f59e0b" stroke="#92400e" strokeWidth="1.5" strokeLinejoin="round" />
          </g>
          <text x={sx(task.start.x) + 8} y={sy(task.start.y) - 10} className="fill-slate-500 text-[9px]">
            start
          </text>
          <line x1={sx(task.start.x)} y1={sy(task.start.y)} x2={sx(task.start.x) + arrow.x * 22} y2={sy(task.start.y) + arrow.y * 22} stroke="#92400e" strokeWidth="1" strokeDasharray="2 2" />

          {checked && (
            <>
              <polyline
                points={trace.path.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2.5"
                strokeDasharray="5 4"
                strokeLinejoin="round"
              />
              <circle cx={sx(trace.end.x)} cy={sy(trace.end.y)} r="9" fill="none" stroke="#16a34a" strokeWidth="3" />
            </>
          )}
          {ghost && (
            <g>
              <circle cx={sx(ghost.x)} cy={sy(ghost.y)} r="11" fill={checked ? (ok ? '#16a34a22' : '#e11d4822') : `${color}22`} stroke={checked ? (ok ? '#16a34a' : '#e11d48') : color} strokeWidth="2.5" strokeDasharray={checked ? undefined : '3 3'} />
              <line x1={sx(ghost.x) - 6} y1={sy(ghost.y)} x2={sx(ghost.x) + 6} y2={sy(ghost.y)} stroke={checked ? (ok ? '#16a34a' : '#e11d48') : color} strokeWidth="2" />
              <line x1={sx(ghost.x)} y1={sy(ghost.y) - 6} x2={sx(ghost.x)} y2={sy(ghost.y) + 6} stroke={checked ? (ok ? '#16a34a' : '#e11d48') : color} strokeWidth="2" />
            </g>
          )}
        </svg>
      </div>

      <p className="mt-2 text-xs tabular-nums text-muted-foreground">
        {ghost ? `Twój znacznik: x = ${ghost.x}, y = ${ghost.y}` : 'Nie postawiłeś/aś jeszcze znacznika.'}
      </p>

      <CheckBar
        color={color}
        ready={ghost !== null}
        checked={checked}
        ok={ok}
        onCheck={check}
        readyHint="Najpierw postaw znacznik na siatce."
        explain={
          <>
            <p>
              Kot zatrzymał się w punkcie ({trace.end.x}, {trace.end.y}) — trasę widać niebieską kreską.
            </p>
            <p className="mt-1">{task.explain}</p>
          </>
        }
      />
    </div>
  );
}

export const ALGO_ITEMS: PartItem[] = TRACE_TASKS.map((task) => ({
  id: task.id,
  title: task.title,
  Item: (props: ItemProps) => <TraceItem task={task} {...props} />,
}));
