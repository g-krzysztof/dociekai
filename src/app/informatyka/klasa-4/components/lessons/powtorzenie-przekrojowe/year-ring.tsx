'use client';

import type { KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CENTER_MODULE, RING, RING_MODULES, nodePos, r2, spokePath, type YearModule } from './year';

/**
 * Pierścień ośmiu działów roku z „Tobą” pośrodku — rysunek bloku „Twoja mapa
 * roku”. Komponent niczego nie ocenia: rysuje znaki, które dostał (`badges`), i
 * zgłasza jedno stuknięcie w dział (`onTapNode`).
 */

export type NodeState = 'idle' | 'anchor';
export type NodeBadge = 'ok' | 'shaky';

interface YearRingProps {
  nodeState?: Partial<Record<number, NodeState>>;
  badges?: Partial<Record<number, NodeBadge>>;
  /** Numer działu (1–8) podświetlony jako wybrany. */
  selected?: number | null;
  onTapNode?: (n: number) => void;
  /** Złote szprychy od działów do środka: zdanie roku, które łączy wszystkie działy. */
  goldSpokes?: boolean;
  goldColor?: string;
  centerLabel?: string;
  className?: string;
  ariaLabel: string;
}

export function YearRing({
  nodeState = {},
  badges = {},
  selected = null,
  onTapNode,
  goldSpokes = false,
  goldColor = '#ca8a04',
  centerLabel = 'Ty',
  className,
  ariaLabel,
}: YearRingProps) {
  return (
    <svg
      viewBox={`0 0 ${RING.w} ${RING.h}`}
      className={cn('mx-auto block w-full max-w-[520px] select-none', className)}
      role="group"
      aria-label={ariaLabel}
    >
      <circle
        cx={RING.cx}
        cy={RING.cy}
        r={RING.radius}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.12}
        strokeDasharray="3 6"
      />

      {goldSpokes &&
        RING_MODULES.map((mod, index) => (
          <motion.path
            key={`spoke-${mod.n}`}
            d={spokePath(mod.n)}
            fill="none"
            stroke={goldColor}
            strokeWidth={3.5}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
          />
        ))}

      <CenterNode mod={CENTER_MODULE} label={centerLabel} gold={goldSpokes} goldColor={goldColor} />

      {RING_MODULES.map((mod) => (
        <Node
          key={mod.n}
          mod={mod}
          state={nodeState[mod.n] ?? 'idle'}
          badge={badges[mod.n]}
          selected={selected === mod.n}
          interactive={Boolean(onTapNode)}
          onTap={() => onTapNode?.(mod.n)}
        />
      ))}
    </svg>
  );
}

function CenterNode({
  mod,
  label,
  gold,
  goldColor,
}: {
  mod: YearModule;
  label: string;
  gold: boolean;
  goldColor: string;
}) {
  const Icon = mod.icon;
  return (
    <g pointerEvents="none">
      {gold && (
        <motion.circle
          cx={RING.cx}
          cy={RING.cy}
          fill={goldColor}
          fillOpacity={0.16}
          initial={{ r: RING.center }}
          animate={{ r: RING.center + 14 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
      <circle
        cx={RING.cx}
        cy={RING.cy}
        r={RING.center}
        className="fill-white dark:fill-zinc-900"
        stroke={gold ? goldColor : mod.color}
        strokeWidth={3}
      />
      <Icon
        x={RING.cx - 9}
        y={RING.cy - 20}
        width={18}
        height={18}
        color={gold ? goldColor : mod.color}
        strokeWidth={2.2}
      />
      <text x={RING.cx} y={RING.cy + 15} textAnchor="middle" className="fill-foreground text-[12px] font-bold">
        {label}
      </text>
    </g>
  );
}

function Node({
  mod,
  state,
  badge,
  selected,
  interactive,
  onTap,
}: {
  mod: YearModule;
  state: NodeState;
  badge?: NodeBadge;
  selected: boolean;
  interactive: boolean;
  onTap: () => void;
}) {
  const pos = nodePos(mod.n);
  const Icon = mod.icon;
  const angle = ((mod.n - 1) * 45 - 90) * (Math.PI / 180);
  const ox = Math.cos(angle);
  const oy = Math.sin(angle);
  const lx = r2(pos.x + ox * (RING.node + 7));
  const ly = r2(pos.y + oy * (RING.node + 7) + (oy > 0.3 ? 9 : oy < -0.3 ? -3 : 4));
  const anchor = ox > 0.3 ? 'start' : ox < -0.3 ? 'end' : 'middle';

  const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTap();
    }
  };

  return (
    <g
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={`Dział ${mod.n}: ${mod.title}`}
      onClick={interactive ? onTap : undefined}
      onKeyDown={interactive ? onKeyDown : undefined}
      className={cn('outline-none focus-visible:[&>circle:first-of-type]:stroke-[4]', interactive && 'cursor-pointer')}
    >
      {/* Większa, przezroczysta strefa dotyku — sam węzeł ma 48 px średnicy w układzie rysunku. */}
      <circle cx={pos.x} cy={pos.y} r={RING.node + 10} fill="transparent" />
      {state === 'anchor' && (
        <motion.circle
          cx={pos.x}
          cy={pos.y}
          fill="none"
          stroke={mod.color}
          strokeWidth={3}
          initial={{ r: RING.node + 3, opacity: 0.9 }}
          animate={{ r: RING.node + 12, opacity: 0.15 }}
          transition={{ duration: 0.9, repeat: Infinity }}
          pointerEvents="none"
        />
      )}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={RING.node}
        className="fill-white dark:fill-zinc-900"
        stroke={mod.color}
        strokeWidth={selected || state === 'anchor' ? 5 : 3}
      />
      <Icon
        x={pos.x - 11}
        y={pos.y - 11}
        width={22}
        height={22}
        color={mod.color}
        strokeWidth={2.2}
        pointerEvents="none"
      />
      <text
        x={lx}
        y={ly}
        textAnchor={anchor}
        className={cn('fill-foreground text-[14px]', selected ? 'font-bold' : 'font-medium')}
        pointerEvents="none"
      >
        {mod.short}
      </text>
      {badge && (
        <g pointerEvents="none" transform={`translate(${r2(pos.x + 15)} ${r2(pos.y - 19)})`}>
          <circle r={9} fill={badge === 'ok' ? '#16a34a' : '#f59e0b'} stroke="white" strokeWidth={2} />
          {badge === 'ok' ? (
            <Check x={-5.5} y={-5.5} width={11} height={11} color="white" strokeWidth={3.5} />
          ) : (
            <TriangleAlert x={-5.5} y={-5.5} width={11} height={11} color="white" strokeWidth={3} />
          )}
        </g>
      )}
    </g>
  );
}
