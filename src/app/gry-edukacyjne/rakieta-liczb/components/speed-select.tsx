'use client';

import { cn } from '@/lib/utils';
import { SPEED_LABELS, type SpeedOption } from '../lib/speed';

interface SpeedSelectProps {
  speed: SpeedOption;
  onChange: (speed: SpeedOption) => void;
}

const OPTIONS: SpeedOption[] = ['relaxed', 'normal', 'fast'];

export function SpeedSelect({ speed, onChange }: SpeedSelectProps) {
  return (
    <div className="mx-auto mb-6 flex max-w-xs flex-col items-center gap-2 sm:mb-8">
      <p className="text-xs text-white/45">Tempo gry — ile czasu na odpowiedź</p>
      <div className="flex w-full items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={speed === option}
            className={cn(
              'flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm',
              speed === option ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/80',
            )}
          >
            {SPEED_LABELS[option]}
          </button>
        ))}
      </div>
    </div>
  );
}
