'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LEVELS, type LevelId } from '../data/levels';
import { readLevelBest } from '../lib/fuel-progress';

interface LevelSelectProps {
  onPick: (id: LevelId) => void;
}

export function LevelSelect({ onPick }: LevelSelectProps) {
  const [bests, setBests] = useState<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, number> = {};
    for (const level of LEVELS) map[level.id] = readLevelBest(level.id).bestScore;
    setBests(map);
  }, []);

  return (
    <div>
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Wybierz poziom</h2>
        <p className="mx-auto mt-2 max-w-xxl text-sm text-white/60 sm:text-base">
          Wszystkie poziomy są odblokowane — zacznij tam, gdzie czujesz się pewnie.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {LEVELS.map((level, i) => {
          const Icon = level.icon;
          const best = bests[level.id] ?? 0;
          return (
            <motion.button
              key={level.id}
              type="button"
              onClick={() => onPick(level.id)}
              data-testid={`level-card-${level.index}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="group relative cursor-pointer overflow-hidden rounded-xl border bg-white/[0.03] p-5 text-left backdrop-blur-sm transition-shadow focus-visible:outline-none focus-visible:ring-2"
              style={{ borderColor: `${level.color}40`, boxShadow: `0 0 0 rgba(0,0,0,0)` }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-3 -top-8 font-mono text-8xl font-bold leading-none opacity-[0.12] transition-opacity duration-300 group-hover:opacity-20"
                style={{ color: level.color }}
              >
                {level.index}
              </span>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ boxShadow: `inset 0 0 40px ${level.color}25` }}
              />

              <div className="relative flex items-start gap-3">
                <Icon className="h-9 w-9 flex-shrink-0" style={{ color: level.color }} strokeWidth={2} />
                <div>
                  <p className="text-lg font-bold text-white">{level.title}</p>
                  <p className="text-sm text-white/55">{level.subtitle}</p>
                </div>
              </div>
              <p className="relative mt-3 text-sm leading-relaxed text-white/70">{level.description}</p>
              <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-xs text-white/50">
                  {best > 0 ? `Twój rekord: ${best} pkt` : 'Zagraj pierwszy raz!'}
                </span>
                <span className="text-sm font-semibold" style={{ color: level.color }}>
                  Start →
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
