'use client';

import { motion } from 'framer-motion';
import { LayoutGrid, RotateCcw, Trophy } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';
import type { LevelConfig } from '../data/levels';

interface ResultsScreenProps {
  level: LevelConfig;
  score: number;
  rounds: number;
  bestCombo: number;
  isNewHighScore: boolean;
  onRetry: () => void;
  onChangeLevel: () => void;
}

export function ResultsScreen({
  level,
  score,
  rounds,
  bestCombo,
  isNewHighScore,
  onRetry,
  onChangeLevel,
}: ResultsScreenProps) {
  return (
    <div className="mx-auto max-w-md text-center" data-testid="results-screen">
      {isNewHighScore && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
          style={{ borderColor: `${level.color}80`, color: level.color }}
        >
          <Trophy className="h-3.5 w-3.5" /> Nowy rekord!
        </motion.div>
      )}
      <h2 className="text-2xl font-bold text-white sm:text-3xl">Koniec zmiany</h2>
      <p className="mt-1 text-sm text-white/60">Poziom: {level.title}</p>

      <div className="mt-6 font-mono text-6xl font-bold tabular-nums text-white sm:text-7xl" data-testid="final-score">
        {score}
      </div>
      <p className="mt-1 text-sm text-white/50">punktów</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <p className="text-2xl font-bold tabular-nums text-white">{rounds}</p>
          <p className="text-xs text-white/50">statków obsłużonych</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <p className="text-2xl font-bold tabular-nums" style={{ color: level.color }}>
            ×{bestCombo}
          </p>
          <p className="text-xs text-white/50">najlepsze combo</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <AnimatedButton
          animation="shimmer-border-glow"
          glowColor={level.color}
          shimmerColor={level.color}
          glowRadius={6}
          className="gap-2 px-6 py-3 text-sm font-semibold text-white"
          onClick={onRetry}
        >
          <RotateCcw className="h-4 w-4" /> Zagraj ponownie
        </AnimatedButton>
        <AnimatedButton
          animation="none"
          className="gap-2 border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 hover:text-white"
          onClick={onChangeLevel}
        >
          <LayoutGrid className="h-4 w-4" /> Zmień poziom
        </AnimatedButton>
      </div>
    </div>
  );
}
