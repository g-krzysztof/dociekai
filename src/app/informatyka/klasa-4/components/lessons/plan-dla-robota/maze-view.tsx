'use client';

import { cn } from '@/lib/utils';
import { DIRS, SIZE, key, type Maze, type Pose, type Status } from './robot';

/**
 * Plansza robota — wspólna dla `RobotPlan` i `BugHunt`.
 *
 * Rysowana w SVG w układzie współrzędnych pól (jedno pole = jedna jednostka),
 * więc pozycja robota nie wymaga żadnego przeliczania na piksele. Robot jest
 * strzałką, bo **kierunek jest w tym module pełnoprawną częścią stanu** — bez
 * niego „idź naprzód” nie znaczy nic.
 */
interface MazeViewProps {
  maze: Maze;
  pose: Pose;
  status: Status;
  color: string;
  /** Ślad przebytej trasy — pokazywany przy wykonywaniu programu. */
  trail?: Pose[];
  className?: string;
}

export function MazeView({ maze, pose, status, color, trail = [], className }: MazeViewProps) {
  const cells = Array.from({ length: SIZE * SIZE }, (_, i) => ({
    x: i % SIZE,
    y: Math.floor(i / SIZE),
  }));

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={cn('block h-auto w-full border-2 bg-white', className)}
      style={{ borderColor: `${color}55` }}
      role="img"
      aria-label={`Plansza robota. Robot stoi na polu ${pose.x + 1}, ${pose.y + 1} i patrzy ${DIRS[pose.dir].label}. Cel na polu ${maze.goal.x + 1}, ${maze.goal.y + 1}.`}
    >
      {cells.map((cell) => {
        const rock = maze.rocks.has(key(cell.x, cell.y));
        return (
          <rect
            key={`${cell.x}-${cell.y}`}
            x={cell.x}
            y={cell.y}
            width={1}
            height={1}
            fill={rock ? '#57534e' : '#fbfaf9'}
            stroke="#e7e5e4"
            strokeWidth={0.02}
          />
        );
      })}

      {/* Ślad, którym robot już przejechał. */}
      {trail.map((p, i) => (
        <circle key={i} cx={p.x + 0.5} cy={p.y + 0.5} r={0.09} fill={color} opacity={0.35} />
      ))}

      {/* Cel */}
      <rect
        x={maze.goal.x + 0.12}
        y={maze.goal.y + 0.12}
        width={0.76}
        height={0.76}
        fill="none"
        stroke={color}
        strokeWidth={0.09}
        strokeDasharray="0.22 0.14"
      />

      {/* Robot: strzałka obracana wokół środka pola. */}
      <g
        transform={`translate(${pose.x + 0.5} ${pose.y + 0.5}) rotate(${pose.dir * 90})`}
        style={{ transition: 'transform 260ms ease' }}
      >
        <circle r={0.36} fill={status === 'cel' ? color : status === 'idzie' ? '#1f2937' : '#d97706'} />
        <path d="M 0 -0.24 L 0.17 0.16 L 0 0.06 L -0.17 0.16 Z" fill="#ffffff" />
      </g>
    </svg>
  );
}
