'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { solveBarModel, type BarModelSpec } from '../lib/word-problem-model';

interface BarModelProps {
  spec: BarModelSpec;
  color: string;
  /** `sm` w kartach ćwiczeń/przykładów, `md` (domyślny) w pełnym pokazie. */
  size?: 'sm' | 'md';
}

const PULSE = { opacity: [0.55, 1, 0.55] };
const PULSE_TRANSITION = { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const };

/**
 * Schemat belkowy — wizualizacja struktury zadania tekstowego (część-całość
 * dla dodawania/odejmowania, równe grupy dla mnożenia/dzielenia). Czysto
 * prezentacyjny, jak `<NumberLine>`/`<ArrayGrid>`: cała logika w
 * `lib/word-problem-model.ts`. Nieznana wartość (`null` w `spec`) renderuje
 * się jako przerywany, pulsujący segment z „?” — to on odpowiada na pytanie
 * zadania. Promowany z `lessons/zadania-tekstowe/` do współdzielonego
 * `components/` 2026-08-19, gdy lekcja `zadania-tekstowe-pisemne` stała się
 * drugim konsumentem — ten sam precedens co `ColumnGrid`/`FactTriangle`.
 */
export function BarModel({ spec, color, size = 'md' }: BarModelProps) {
  const height = size === 'sm' ? 'h-12' : 'h-16';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm sm:text-base';
  const labelColor = `color-mix(in oklch, ${color} 88%, black)`;

  if (spec.type === 'part-whole') {
    const solvedWhole = spec.wholeValue ?? solveBarModel(spec);
    const fallbackWidth = Math.max(solvedWhole / Math.max(spec.parts.length, 1), 1);

    return (
      <div className="mx-auto w-full max-w-md">
        <div className="mb-1 flex justify-center">
          <span
            className={cn(
              'border-x-2 border-t-2 px-3 pb-1 pt-1 font-mono font-bold tabular-nums',
              textSize
            )}
            style={{ borderColor: color, color: labelColor }}
          >
            {spec.wholeLabel}: {spec.wholeValue ?? '?'}
          </span>
        </div>
        <div
          className={cn('flex w-full overflow-hidden border-2', height)}
          style={{ borderColor: color }}
        >
          {spec.parts.map((part) => {
            const unknown = part.value === null;
            return (
              <motion.div
                key={part.label}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center border-r-2 px-1 text-center last:border-r-0',
                  unknown && 'border-dashed'
                )}
                style={{
                  flexGrow: part.value ?? fallbackWidth,
                  borderColor: color,
                  backgroundColor: unknown ? 'transparent' : `${color}22`,
                }}
                animate={unknown ? PULSE : undefined}
                transition={unknown ? PULSE_TRANSITION : undefined}
              >
                <span
                  className={cn('font-mono font-bold tabular-nums', textSize)}
                  style={{ color: unknown ? color : undefined }}
                >
                  {unknown ? '?' : part.value}
                </span>
                <span className="text-[10px] leading-tight text-muted-foreground sm:text-xs">
                  {part.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  const unknownField: 'groups' | 'perGroup' | 'total' =
    spec.groups === null ? 'groups' : spec.perGroup === null ? 'perGroup' : 'total';
  const solvedTotal = spec.total ?? (spec.groups ?? 0) * (spec.perGroup ?? 0);
  const groupsCount =
    spec.groups ?? (spec.perGroup ? Math.round((spec.total ?? 0) / spec.perGroup) : 0);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-1 flex justify-center">
        <span
          className={cn(
            'border-x-2 border-t-2 px-3 pb-1 pt-1 font-mono font-bold tabular-nums',
            textSize
          )}
          style={{ borderColor: color, color: labelColor }}
        >
          {spec.unitLabel}: {unknownField === 'total' ? '?' : solvedTotal}
        </span>
      </div>
      <div className={cn('flex w-full gap-0.5 overflow-hidden', height)}>
        {Array.from({ length: groupsCount }).map((_, i) => {
          const unknown = unknownField === 'perGroup';
          return (
            <motion.div
              key={i}
              className={cn(
                'flex flex-1 flex-col items-center justify-center border-2 px-1 text-center',
                unknown && 'border-dashed'
              )}
              style={{
                borderColor: color,
                backgroundColor: unknown ? 'transparent' : `${color}22`,
              }}
              animate={unknown ? PULSE : undefined}
              transition={unknown ? PULSE_TRANSITION : undefined}
            >
              <span
                className={cn('font-mono font-bold tabular-nums', textSize)}
                style={{ color: unknown ? color : undefined }}
              >
                {unknown ? '?' : spec.perGroup}
              </span>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-1 text-center text-[10px] text-muted-foreground sm:text-xs">
        {unknownField === 'groups'
          ? `liczba „${spec.groupLabel}” (po ${spec.perGroup}) jest nieznana`
          : `${groupsCount} × ${spec.groupLabel}`}
      </p>
    </div>
  );
}
