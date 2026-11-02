'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Eraser, Move, Paintbrush, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { at, PAPER, PictureView, toPixel, type Picture } from '../../picture-view';
import { COLORS, EMPTY, SIZE, shift } from './sprite-pic';

/**
 * Pole do rysowania duszka: pędzel, gumka, „przesuń cały rysunek”, kolory i krzyżyk środka.
 *
 * Wyciągnięte z pracowni bloku 3 (`SpriteStudio`), gdy w tej samej lekcji zadanie Z-7 zaczęło
 * potrzebować tego samego pola (drugi konsument). **Rysunek jest stanem lekcji**, nie pola:
 * to samo `pic` rysuje się w bloku 3 i w zadaniu, więc duszek narysowany raz idzie dalej.
 *
 * To ten sam edytor obrazka co w module o grafice (`picture-view.tsx`) — nowy jest wyłącznie
 * krzyżyk i to, co robi: duszek obraca się wokół krzyżyka, nie wokół siebie.
 */

type Tool = 'pedzel' | 'gumka' | 'przesun';

interface SpritePadProps {
  pic: Picture;
  onChange: (pic: Picture) => void;
  /** Ile razy kratka ma się obrócić — pracownia pokazuje tak orbitę rysunku leżącego poza krzyżykiem. */
  spins?: number;
  /** Wołane po wyczyszczeniu kratki, obok `onChange(EMPTY)` — pracownia zeruje wtedy własne liczniki. */
  onClear?: () => void;
}

export function SpritePad({ pic, onChange, spins = 0, onClear }: SpritePadProps) {
  const [tool, setTool] = useState<Tool>('pedzel');
  const [ink, setInk] = useState(COLORS[0]);

  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ from: { x: number; y: number }; base: Picture } | null>(null);
  /* Szybki ruch palca potrafi wyprzedzić przerysowanie, więc pędzel czyta kratkę z refu. */
  const picRef = useRef(pic);
  picRef.current = pic;

  const publish = (next: Picture) => {
    picRef.current = next;
    onChange(next);
  };

  const paint = (point: { x: number; y: number }, next: Picture): Picture => {
    const index = at(SIZE, point.x, point.y);
    const value = tool === 'gumka' ? PAPER : ink;
    if (next.cells[index] === value) return next;
    const cells = [...next.cells];
    cells[index] = value;
    return { ...next, cells };
  };

  const down = (event: ReactPointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = toPixel(event, svg.current, picRef.current);
    if (tool === 'przesun') {
      drag.current = { from: point, base: picRef.current };
      return;
    }
    publish(paint(point, picRef.current));
  };

  const move = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const point = toPixel(event, svg.current, picRef.current);
    if (tool === 'przesun') {
      const held = drag.current;
      if (!held) return;
      publish(shift(held.base, point.x - held.from.x, point.y - held.from.y));
      return;
    }
    publish(paint(point, picRef.current));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 border border-b-0 bg-zinc-100 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
        <ToolButton active={tool === 'pedzel'} onClick={() => setTool('pedzel')} label="Pędzel">
          <Paintbrush className="h-4 w-4" aria-hidden />
        </ToolButton>
        <ToolButton active={tool === 'gumka'} onClick={() => setTool('gumka')} label="Gumka">
          <Eraser className="h-4 w-4" aria-hidden />
        </ToolButton>
        <ToolButton
          active={tool === 'przesun'}
          onClick={() => setTool('przesun')}
          label="Przesuń cały rysunek"
        >
          <Move className="h-4 w-4" aria-hidden />
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-zinc-300 dark:bg-zinc-600" aria-hidden />
        {COLORS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setInk(item);
              setTool('pedzel');
            }}
            aria-label={`Kolor ${item}`}
            aria-pressed={ink === item && tool === 'pedzel'}
            className={cn(
              'h-5 w-5 cursor-pointer border transition',
              ink === item ? 'border-foreground' : 'border-black/10'
            )}
            style={{ backgroundColor: item }}
          />
        ))}
        <button
          type="button"
          onClick={() => {
            publish(EMPTY);
            onClear?.();
          }}
          aria-label="Wyczyść kratkę"
          className="ml-auto cursor-pointer p-1 text-zinc-500 transition hover:text-foreground"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="relative border bg-white dark:border-zinc-700">
        <motion.div animate={{ rotate: spins * 360 }} transition={{ duration: 1.5, ease: 'easeInOut' }}>
          <PictureView
            ref={svg}
            pic={pic}
            label="Kratka kostiumu — twój duszek"
            className={cn(tool === 'przesun' ? 'cursor-move' : 'cursor-crosshair', 'touch-none')}
            onPointerDown={down}
            onPointerMove={move}
          />
        </motion.div>
        {/* Krzyżyk stoi NAD obracającą się kratką — w Scratchu też się nie kręci. */}
        <Crosshair />
      </div>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        'cursor-pointer border p-1 transition',
        active ? 'border-foreground bg-white dark:bg-zinc-900' : 'border-transparent text-zinc-500'
      )}
    >
      {children}
    </button>
  );
}

/** Krzyżyk środka kostiumu — dokładnie taki jak w edytorze kostiumów Scratcha. */
function Crosshair() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <line x1={50} y1={41} x2={50} y2={59} stroke="#9aa5b1" strokeWidth={0.8} />
      <line x1={41} y1={50} x2={59} y2={50} stroke="#9aa5b1" strokeWidth={0.8} />
      <circle cx={50} cy={50} r={2.6} fill="none" stroke="#9aa5b1" strokeWidth={0.8} />
    </svg>
  );
}
