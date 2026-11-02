'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FuelTank } from './fuel-tank';
import type { FractionRound, RoundAnswer } from '../lib/fraction-generator';

type Phase = 'playing' | 'resolving';
type ChoiceState = 'idle' | 'correct' | 'wrong';

interface StationProps {
  round: FractionRound;
  phase: Phase;
  pickedAnswer: RoundAnswer | null;
  correctAnswerText: string;
  outcome: 'correct' | 'wrong' | null;
  travelDurationMs: number;
  color: string;
  roundKey: number;
  onAnswer: (answer: RoundAnswer) => void;
}

/**
 * Pasek czasu jedzie na czystym CSS/framer-motion (jak Scanner w Strażnikach
 * Konstelacji) zamiast ręcznie synchronizowanego canvasa — nie ma szans się
 * rozjechać z faktycznym timeoutem w kliencie. Wszystkie trzy warianty
 * (liters/numerator/compare) to zestaw przycisków do wyboru, tak jak dok w
 * Strażnikach czy pas w Rakiecie Liczb — bez ręcznego wpisywania.
 */
export function Station({
  round,
  phase,
  pickedAnswer,
  correctAnswerText,
  outcome,
  travelDurationMs,
  color,
  roundKey,
  onAnswer,
}: StationProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-[#0b1224] via-[#070b18] to-[#04060d] p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] sm:p-6"
      data-testid="station"
    >
      <div className="relative mb-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          key={roundKey}
          className="h-full origin-left rounded-full"
          style={{ backgroundColor: color }}
          initial={{ scaleX: 1 }}
          animate={phase === 'playing' ? { scaleX: 0 } : undefined}
          transition={{ duration: travelDurationMs / 1000, ease: 'linear' }}
        />
      </div>

      {round.kind === 'liters' && (
        <LitersStation
          key={roundKey}
          round={round}
          phase={phase}
          pickedAnswer={typeof pickedAnswer === 'number' ? pickedAnswer : null}
          color={color}
          onAnswer={onAnswer}
        />
      )}
      {round.kind === 'numerator' && (
        <NumeratorStation
          key={roundKey}
          round={round}
          phase={phase}
          pickedAnswer={typeof pickedAnswer === 'number' ? pickedAnswer : null}
          color={color}
          onAnswer={onAnswer}
        />
      )}
      {round.kind === 'compare' && (
        <CompareStation
          key={roundKey}
          round={round}
          phase={phase}
          pickedAnswer={pickedAnswer === 'A' || pickedAnswer === 'B' || pickedAnswer === 'equal' ? pickedAnswer : null}
          color={color}
          onAnswer={onAnswer}
        />
      )}

      {phase === 'resolving' && (
        <div
          className={cn(
            'relative mt-4 rounded-lg border px-3 py-2 text-center text-sm font-semibold',
            outcome === 'correct'
              ? 'border-emerald-300 bg-emerald-400/15 text-emerald-200'
              : 'border-red-400 bg-red-500/15 text-red-200',
          )}
          data-testid="round-feedback"
        >
          {outcome === 'correct' ? '✓ Dobrze!' : `✗ Poprawna odpowiedź: ${correctAnswerText}`}
        </div>
      )}
    </div>
  );
}

const CHOICE_STYLES: Record<ChoiceState, string> = {
  idle: 'border-white/15 bg-white/[0.03] text-white/80 hover:bg-white/[0.08]',
  correct: 'border-emerald-300 bg-emerald-400/20 text-white shadow-[0_0_22px_rgba(52,211,153,0.5)]',
  wrong: 'border-red-400 bg-red-500/20 text-white shadow-[0_0_22px_rgba(248,113,113,0.45)]',
};

function ChoiceGrid({
  values,
  format,
  correct,
  picked,
  phase,
  color,
  hovered,
  onHover,
  onPick,
}: {
  values: number[];
  format: (v: number) => string;
  correct: number;
  picked: number | null;
  phase: Phase;
  color: string;
  hovered: number | null;
  onHover: (v: number | null) => void;
  onPick: (v: number) => void;
}) {
  function stateFor(v: number): ChoiceState {
    if (phase !== 'resolving') return 'idle';
    if (v === correct) return 'correct';
    if (v === picked) return 'wrong';
    return 'idle';
  }

  return (
    <div
      className={cn(
        'grid w-full gap-2 sm:gap-3',
        values.length <= 4 ? 'grid-cols-2' : values.length <= 6 ? 'grid-cols-3' : 'grid-cols-4',
      )}
    >
      {values.map((v) => (
        <button
          key={v}
          type="button"
          disabled={phase !== 'playing'}
          onMouseEnter={() => onHover(v)}
          onMouseLeave={() => onHover(null)}
          onFocus={() => onHover(v)}
          onBlur={() => onHover(null)}
          onClick={() => onPick(v)}
          className={cn(
            'flex min-h-14 items-center justify-center rounded-lg border-2 px-2 py-2 text-center font-mono text-lg font-bold leading-tight transition-colors disabled:cursor-not-allowed',
            hovered === v && phase === 'playing' ? 'bg-white/[0.1]' : '',
            CHOICE_STYLES[stateFor(v)],
          )}
          style={stateFor(v) === 'idle' ? { borderColor: `${color}40` } : undefined}
        >
          {format(v)}
        </button>
      ))}
    </div>
  );
}

function LitersStation({
  round,
  phase,
  pickedAnswer,
  color,
  onAnswer,
}: {
  round: Extract<FractionRound, { kind: 'liters' }>;
  phase: Phase;
  pickedAnswer: number | null;
  color: string;
  onAnswer: (answer: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const previewLiters = phase === 'resolving' ? (pickedAnswer ?? 0) : (hovered ?? 0);
  const isCorrect = phase === 'resolving' ? pickedAnswer === round.answer : false;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-center">
      <FuelTank
        capacity={round.tankCapacity}
        currentLiters={previewLiters}
        targetLiters={phase === 'resolving' ? round.answer : 0}
        targetFraction={phase === 'resolving' ? round.hintFraction : undefined}
        animated
        error={phase === 'resolving' && !isCorrect}
        success={phase === 'resolving' && isCorrect}
        width={90}
        height={220}
      />
      <div className="w-full max-w-xs">
        <ChoiceGrid
          values={round.options}
          format={(v) => `${v} L`}
          correct={round.answer}
          picked={pickedAnswer}
          phase={phase}
          color={color}
          hovered={hovered}
          onHover={setHovered}
          onPick={onAnswer}
        />
      </div>
    </div>
  );
}

function NumeratorStation({
  round,
  phase,
  pickedAnswer,
  color,
  onAnswer,
}: {
  round: Extract<FractionRound, { kind: 'numerator' }>;
  phase: Phase;
  pickedAnswer: number | null;
  color: string;
  onAnswer: (answer: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const previewNumerator = phase === 'resolving' ? (pickedAnswer ?? 0) : (hovered ?? 0);
  const isCorrect = phase === 'resolving' ? pickedAnswer === round.answer : false;
  const hintKey: 'extend' | 'complete' = round.taskType;
  const hint =
    hintKey === 'extend'
      ? 'Pomnóż licznik i mianownik przez tę samą liczbę.'
      : 'Obie części razem muszą dać pełny zbiornik — mianownik się nie zmienia.';

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex flex-col items-center gap-1">
          <FuelTank
            capacity={round.baseDen}
            currentLiters={round.baseNum}
            targetLiters={0}
            showDivisions
            animated={false}
            showLitersLabel={false}
            unit=""
            width={70}
            height={180}
          />
          <span className="text-xs text-white/50">{round.baseNum}/{round.baseDen}</span>
        </div>
        <span className="text-2xl font-bold text-white/40">=</span>
        <div className="flex flex-col items-center gap-1">
          <FuelTank
            capacity={round.targetDen}
            currentLiters={previewNumerator}
            targetLiters={phase === 'resolving' ? round.answer : 0}
            showDivisions
            animated
            error={phase === 'resolving' && !isCorrect}
            success={phase === 'resolving' && isCorrect}
            showLitersLabel={false}
            unit=""
            width={70}
            height={180}
          />
          <span className="text-xs text-white/50">?/{round.targetDen}</span>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <ChoiceGrid
          values={round.options}
          format={(v) => `${v}`}
          correct={round.answer}
          picked={pickedAnswer}
          phase={phase}
          color={color}
          hovered={hovered}
          onHover={setHovered}
          onPick={onAnswer}
        />
      </div>
      <p className="max-w-xs text-center text-xs text-white/40">{hint}</p>
    </div>
  );
}

const SIDE_STYLES: Record<ChoiceState, string> = CHOICE_STYLES;

function CompareStation({
  round,
  phase,
  pickedAnswer,
  color,
  onAnswer,
}: {
  round: Extract<FractionRound, { kind: 'compare' }>;
  phase: Phase;
  pickedAnswer: 'A' | 'B' | 'equal' | null;
  color: string;
  onAnswer: (answer: 'A' | 'B' | 'equal') => void;
}) {
  const disabled = phase !== 'playing';

  function stateFor(side: 'A' | 'B' | 'equal'): ChoiceState {
    if (phase !== 'resolving') return 'idle';
    if (side === round.answer) return 'correct';
    if (side === pickedAnswer) return 'wrong';
    return 'idle';
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-6 sm:gap-10">
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-semibold text-white/70">Zbiornik A</span>
          <FuelTank
            capacity={round.fractionA.den}
            currentLiters={round.fractionA.num}
            targetLiters={0}
            animated={false}
            showLitersLabel={false}
            unit=""
            width={70}
            height={180}
          />
          <span className="text-xs text-white/50">{round.fractionA.num}/{round.fractionA.den}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-semibold text-white/70">Zbiornik B</span>
          <FuelTank
            capacity={round.fractionB.den}
            currentLiters={round.fractionB.num}
            targetLiters={0}
            animated={false}
            showLitersLabel={false}
            unit=""
            width={70}
            height={180}
          />
          <span className="text-xs text-white/50">{round.fractionB.num}/{round.fractionB.den}</span>
        </div>
      </div>

      <div className="grid w-full max-w-sm grid-cols-3 gap-2 sm:gap-3">
        {(
          [
            { side: 'A' as const, label: 'A więcej' },
            { side: 'equal' as const, label: 'Remis' },
            { side: 'B' as const, label: 'B więcej' },
          ]
        ).map(({ side, label }) => (
          <button
            key={side}
            type="button"
            data-testid={`compare-${side}`}
            disabled={disabled}
            onClick={() => onAnswer(side)}
            className={cn(
              'flex min-h-14 items-center justify-center rounded-lg border-2 px-2 py-2 text-center text-sm font-semibold leading-tight transition-colors disabled:cursor-not-allowed',
              SIDE_STYLES[stateFor(side)],
            )}
            style={stateFor(side) === 'idle' ? { borderColor: `${color}40` } : undefined}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
