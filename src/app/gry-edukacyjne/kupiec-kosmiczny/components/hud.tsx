'use client';

import { Heart, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HudProps {
  score: number;
  combo: number;
  shields: number;
  maxShields: number;
  muted: boolean;
  onToggleMute: () => void;
  color: string;
}

export function Hud({ score, combo, shields, maxShields, muted, onToggleMute, color }: HudProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 sm:gap-4 sm:px-4 sm:py-3">
      <div className="flex items-center gap-3 sm:gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/45 sm:text-xs">Wynik</p>
          <p className="font-mono text-lg font-bold tabular-nums text-white sm:text-xl" data-testid="score">
            {score}
          </p>
        </div>
        {combo >= 2 && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-white/45 sm:text-xs">Combo</p>
            <p className="font-mono text-lg font-bold tabular-nums sm:text-xl" style={{ color }} data-testid="combo">
              ×{combo}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: maxShields }).map((_, i) => (
            <Heart
              key={i}
              className={cn('h-4 w-4 sm:h-5 sm:w-5', i < shields ? 'fill-red-400 text-red-400' : 'text-white/20')}
            />
          ))}
          <span className="sr-only" data-testid="shields">
            {shields}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Włącz dźwięk' : 'Wycisz dźwięk'}
          className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          {muted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
        </button>
      </div>
    </div>
  );
}
