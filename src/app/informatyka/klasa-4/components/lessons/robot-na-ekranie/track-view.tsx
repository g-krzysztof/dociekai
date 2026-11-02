'use client';

import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FIELD, FINISH_RADIUS, onTrack, sensor, type Bot, type Point, type Track } from './robot';

/**
 * Plansza robota — jeden rysunek dla wszystkich bloków lekcji 28.
 *
 * Trzy rzeczy, które ten widok musi umieć, bo bez każdej z nich jeden z bloków
 * przestaje mieć sens:
 *
 * 1. **Ukryć tor.** W haczyku dziecko prowadzi robota po torze, którego nie
 *    widzi — widzi wyłącznie swój własny ślad i jedną lampkę. To jest dokładnie
 *    tyle, ile o świecie wie robot.
 * 2. **Pokazać czujnik osobno od robota.** Czujnik jest **przed** robotem i to
 *    on decyduje; kropka w jego miejscu świeci albo gaśnie i dziecko widzi, co
 *    program w tej chwili czyta.
 * 3. **Zostawiać ślad.** Cała lekcja jest o porównywaniu tras: tej zamierzonej z
 *    tą przejechaną, i robota liczącego kroki z robotem patrzącym czujnikiem.
 *
 * Kadr ma sufit szerokości (`max-w-[340px]`) — ta sama pułapka, co przy scenie
 * Scratcha: makieta o stałych proporcjach puszczona na całą kolumnę urosłaby na
 * desktopie tak, że sterowanie wyjechałoby poza ekran.
 */

interface TrackViewProps {
  track?: Track;
  /** Tor istnieje, ale nie jest narysowany — robot i tak o nim nie wie. */
  hidden?: boolean;
  /** Blady tor pod spodem: „tak miało być”. */
  ghost?: Track;
  trail?: Point[];
  /** Drugi ślad, rysowany przerywaną kreską — do porównania dwóch przejazdów. */
  otherTrail?: Point[];
  bot?: Bot;
  /** Drugi robot, blady — „to samo polecenie, inne ciało”. */
  otherBot?: Bot;
  color: string;
  showFinish?: boolean;
  /** Cel inny niż koniec toru — pierścień w zadanym punkcie. */
  target?: Point;
  note?: string;
  onPointer?: (point: Point, phase: 'down' | 'move' | 'up') => void;
  children?: ReactNode;
  className?: string;
}

export function TrackView({
  track,
  hidden,
  ghost,
  trail,
  otherTrail,
  bot,
  otherBot,
  color,
  showFinish,
  target,
  note,
  onPointer,
  children,
  className,
}: TrackViewProps) {
  const finish = track?.points[track.points.length - 1];

  /**
   * **Wskaźnik przejmujemy na `pointerdown` i oddajemy na `pointerup`.** Bez tego
   * puszczenie palca poza płótnem nie dociera do SVG, widżet zostaje w trybie
   * rysowania i kreska ciągnie się dalej **za samym najechaniem myszą** — a to
   * już nie jest rysowanie, tylko pułapka. Przejęcie gwarantuje, że koniec
   * gestu przyjdzie zawsze, także gdy palec wyjedzie poza kadr.
   *
   * Punkt jest przy okazji **przycinany do planszy**: przy przejętym wskaźniku
   * ruch poza kadrem dalej dochodzi, a trasa narysowana poza boiskiem nie miałaby
   * sensu ani dla robota, ani dla oka.
   */
  const pointer = (phase: 'down' | 'move' | 'up') => (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!onPointer) return;
    const svg = event.currentTarget;
    try {
      if (phase === 'down') svg.setPointerCapture(event.pointerId);
      if (phase === 'up') svg.releasePointerCapture(event.pointerId);
    } catch {
      /* Starsza przeglądarka bez przejmowania wskaźnika — rysowanie dalej działa. */
    }
    const rect = svg.getBoundingClientRect();
    const clamp = (value: number, limit: number) => Math.max(0, Math.min(limit, value));
    onPointer(
      {
        x: clamp(((event.clientX - rect.left) / rect.width) * FIELD.width, FIELD.width),
        y: clamp(((event.clientY - rect.top) / rect.height) * FIELD.height, FIELD.height),
      },
      phase
    );
  };

  return (
    <div className={cn('mx-auto w-full max-w-[340px]', className)}>
      <svg
        viewBox={`0 0 ${FIELD.width} ${FIELD.height}`}
        className={cn('aspect-[4/3] w-full border bg-white dark:bg-zinc-950', onPointer && 'touch-none cursor-crosshair')}
        onPointerDown={pointer('down')}
        onPointerMove={pointer('move')}
        onPointerUp={pointer('up')}
        onPointerCancel={pointer('up')}
      >
        {ghost && <Line points={ghost.points} width={ghost.width} className="text-zinc-300 dark:text-zinc-700" />}
        {track && !hidden && <Line points={track.points} width={track.width} className="text-zinc-800 dark:text-zinc-300" />}

        {showFinish && finish && (
          <circle cx={finish.x} cy={finish.y} r={FINISH_RADIUS} fill="none" stroke={color} strokeWidth={3} strokeDasharray="6 4" />
        )}
        {target && (
          <circle cx={target.x} cy={target.y} r={FINISH_RADIUS} fill="none" stroke={color} strokeWidth={3} strokeDasharray="6 4" />
        )}

        {otherTrail && otherTrail.length > 1 && (
          <polyline
            points={otherTrail.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeDasharray="5 4"
            className="text-zinc-400"
          />
        )}
        {trail && trail.length > 1 && (
          <polyline
            points={trail.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
        )}

        {otherBot && <Rover bot={otherBot} color="#a1a1aa" track={track} faded />}
        {bot && <Rover bot={bot} color={color} track={track} />}
        {children}
      </svg>
      {note && (
        <p className="border border-t-0 px-2 py-1 text-center text-[11px] text-muted-foreground">{note}</p>
      )}
    </div>
  );
}

function Line({ points, width, className }: { points: Point[]; width: number; className: string }) {
  return (
    <polyline
      points={points.map((p) => `${p.x},${p.y}`).join(' ')}
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    />
  );
}

/** Robot: strzałka pokazująca kierunek i kropka czujnika wysunięta do przodu. */
function Rover({ bot, color, track, faded }: { bot: Bot; color: string; track?: Track; faded?: boolean }) {
  const eye = sensor(bot);
  const sees = track ? onTrack(eye, track) : false;

  return (
    <g opacity={faded ? 0.55 : 1}>
      <g transform={`translate(${bot.x} ${bot.y}) rotate(${bot.angle})`}>
        <path d="M -7 -6 L 8 0 L -7 6 Z" fill={color} />
      </g>
      <circle
        cx={eye.x}
        cy={eye.y}
        r={3.5}
        fill={sees ? '#111827' : '#ffffff'}
        stroke={color}
        strokeWidth={1.5}
      />
    </g>
  );
}
