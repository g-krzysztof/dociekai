'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Starfield } from '../components/starfield';
import { Countdown } from './components/countdown';
import { Hud } from './components/hud';
import { LevelSelect } from './components/level-select';
import { ResultsScreen } from './components/results-screen';
import { SpeedSelect } from './components/speed-select';
import { Station } from './components/station';
import { FEEDBACK_MS, MILESTONE_STEP, SHIELDS_START, getLevelById, type LevelConfig, type LevelId } from './data/levels';
import {
  checkAnswer,
  generateRound,
  getCorrectAnswerText,
  travelDurationForRound,
  type FractionRound,
  type RoundAnswer,
} from './lib/fraction-generator';
import { isMuted, playCorrect, playGameOver, playMilestone, playWrong, toggleMuted } from './lib/sound';
import { writeRunResult, type LevelBest } from './lib/fuel-progress';
import { readSpeed, writeSpeed, SPEED_MULTIPLIERS, type SpeedOption } from './lib/speed';

type Phase = 'menu' | 'countdown' | 'playing' | 'resolving' | 'gameover';

/**
 * Ten sam wzorzec co Strażnicy Konstelacji / Kupiec Kosmiczny / Rakieta Liczb:
 * `*Ref` trzymają wartości do synchronicznego odczytu wewnątrz `setTimeout`-owych
 * callbacków (stan Reacta jest asynchroniczny i domyka się jako "stary" w
 * closure), odpowiedni `useState` obok każdego refa istnieje wyłącznie do
 * renderowania. `roundIdRef` chroni przed tym, żeby spóźniony timeout z
 * poprzedniej rundy rozstrzygnął rundę, która już się zmieniła.
 */
export function UlamkowaStacjaClient() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [levelId, setLevelId] = useState<LevelId | null>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState<FractionRound | null>(null);
  const [pickedAnswer, setPickedAnswer] = useState<RoundAnswer | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [shields, setShields] = useState(SHIELDS_START);
  const [lastOutcome, setLastOutcome] = useState<'correct' | 'wrong' | null>(null);
  const [shakeNonce, setShakeNonce] = useState(0);
  const [muted, setMutedState] = useState(false);
  const [speed, setSpeedState] = useState<SpeedOption>('normal');
  const [highScore, setHighScore] = useState<{ best: LevelBest; isNewHighScore: boolean } | null>(null);

  // Ekrany (menu / odliczanie / gra / wyniki) mają różną naturalną wysokość,
  // co przy przełączaniu robiłoby "skok" obrazu. Mierzymy realną wysokość
  // tego, co akurat jest zamontowane, i trzymamy narastające maksimum.
  const [stageHeight, setStageHeight] = useState(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    resizeObserverRef.current?.disconnect();
    if (!node) return;
    const measure = () => setStageHeight((h) => Math.max(h, node.offsetHeight));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    resizeObserverRef.current = observer;
  }, []);

  const comboRef = useRef(0);
  const bestComboRef = useRef(0);
  const scoreRef = useRef(0);
  const shieldsRef = useRef(SHIELDS_START);
  const roundIdRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMutedState(isMuted());
    setSpeedState(readSpeed());
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      resizeObserverRef.current?.disconnect();
    };
  }, []);

  const level = levelId ? getLevelById(levelId) : null;

  function clearTimers() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    roundIdRef.current += 1;
  }

  function startRound(activeLevel: LevelConfig, idx: number) {
    const nextRound = generateRound(activeLevel);
    const myRoundId = ++roundIdRef.current;
    const duration = travelDurationForRound(activeLevel, idx) * SPEED_MULTIPLIERS[speed];
    setRoundIndex(idx);
    setRound(nextRound);
    setPickedAnswer(null);
    setLastOutcome(null);
    setPhase('playing');
    timeoutRef.current = setTimeout(
      () => resolveRound(myRoundId, activeLevel, idx, nextRound, null),
      duration,
    );
  }

  function resolveRound(
    myRoundId: number,
    activeLevel: LevelConfig,
    idx: number,
    activeRound: FractionRound,
    answer: RoundAnswer | null,
  ) {
    if (roundIdRef.current !== myRoundId) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const hit = answer !== null && checkAnswer(activeRound, answer);
    setPickedAnswer(answer);
    setPhase('resolving');
    setLastOutcome(hit ? 'correct' : 'wrong');

    let shieldsAfter = shieldsRef.current;
    if (hit) {
      const newCombo = comboRef.current + 1;
      comboRef.current = newCombo;
      setCombo(newCombo);
      bestComboRef.current = Math.max(bestComboRef.current, newCombo);
      setBestCombo(bestComboRef.current);
      const tier = Math.floor(newCombo / MILESTONE_STEP);
      scoreRef.current += 10 * (1 + tier);
      setScore(scoreRef.current);
      if (newCombo % MILESTONE_STEP === 0) playMilestone();
      else playCorrect();
    } else {
      comboRef.current = 0;
      setCombo(0);
      shieldsAfter = shieldsRef.current - 1;
      shieldsRef.current = shieldsAfter;
      setShields(shieldsAfter);
      setShakeNonce((n) => n + 1);
      playWrong();
    }

    timeoutRef.current = setTimeout(() => {
      if (roundIdRef.current !== myRoundId) return;
      if (!hit && shieldsAfter <= 0) {
        finishRun(activeLevel, idx);
      } else {
        startRound(activeLevel, idx + 1);
      }
    }, FEEDBACK_MS);
  }

  function handleAnswer(answer: RoundAnswer) {
    if (phase !== 'playing' || !level || !round) return;
    resolveRound(roundIdRef.current, level, roundIndex, round, answer);
  }

  function finishRun(activeLevel: LevelConfig, roundsCompleted: number) {
    const result = writeRunResult(activeLevel.id, {
      score: scoreRef.current,
      combo: bestComboRef.current,
      rounds: roundsCompleted,
    });
    setHighScore(result);
    playGameOver();
    setPhase('gameover');
  }

  function beginCountdown(id: LevelId) {
    clearTimers();
    scoreRef.current = 0;
    comboRef.current = 0;
    bestComboRef.current = 0;
    shieldsRef.current = SHIELDS_START;
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setShields(SHIELDS_START);
    setRoundIndex(0);
    setHighScore(null);
    setLevelId(id);
    setPhase('countdown');
  }

  function handleCountdownDone() {
    if (!level) return;
    startRound(level, 0);
  }

  function handleRetry() {
    if (!levelId) return;
    beginCountdown(levelId);
  }

  function handleChangeLevel() {
    clearTimers();
    setPhase('menu');
    setLevelId(null);
  }

  function handleToggleMute() {
    setMutedState(toggleMuted());
  }

  function handleChangeSpeed(next: SpeedOption) {
    setSpeedState(next);
    writeSpeed(next);
  }

  const screen = phase === 'playing' || phase === 'resolving' ? 'playing' : phase;

  return (
    <div className="relative overflow-hidden bg-[#05070f]" data-testid="ulamkowa-stacja">
      <Starfield count={160} className="pointer-events-none absolute inset-0 opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-25 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #ec4899, transparent 70%)' }}
      />

      <div className="relative container mx-auto max-w-3xl px-3 py-8 sm:px-4 sm:py-12">
        <Link
          href="/gry-edukacyjne"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white sm:mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Galaktyka Gier
        </Link>
        <div
          className="relative min-h-[max(480px,var(--measured-h,0px))] sm:min-h-[max(628px,var(--measured-h,0px))]"
          style={{ ['--measured-h' as string]: stageHeight ? `${stageHeight}px` : '0px' } as CSSProperties}
        >
          <AnimatePresence mode="wait">
            {screen === 'menu' && (
              <motion.div
                key="menu"
                ref={measureRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-6 text-center sm:mb-8">
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">Ułamkowa Stacja Paliw</h1>
                  <p className="mt-1 text-sm text-white/50">
                    Gra edukacyjna do ćwiczenia ułamków: części całości, rozszerzanie, porównywanie i dodawanie
                  </p>
                </div>
                <SpeedSelect speed={speed} onChange={handleChangeSpeed} />
                <LevelSelect onPick={beginCountdown} />
              </motion.div>
            )}

            {screen === 'countdown' && level && (
              <motion.div
                key="countdown"
                ref={measureRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex h-full min-h-[380px] flex-col justify-center"
              >
                <Countdown color={level.color} onDone={handleCountdownDone} />
              </motion.div>
            )}

            {screen === 'playing' && level && round && (
              <motion.div
                key="playing"
                ref={measureRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-3 sm:mb-4">
                  <Hud
                    prompt={round.prompt}
                    score={score}
                    combo={combo}
                    shields={shields}
                    maxShields={SHIELDS_START}
                    muted={muted}
                    onToggleMute={handleToggleMute}
                    color={level.color}
                  />
                </div>
                <motion.div
                  key={shakeNonce}
                  animate={lastOutcome === 'wrong' ? { x: [0, -8, 8, -6, 6, 0] } : undefined}
                  transition={{ duration: 0.4 }}
                >
                  <Station
                    round={round}
                    phase={phase === 'resolving' ? 'resolving' : 'playing'}
                    pickedAnswer={pickedAnswer}
                    correctAnswerText={getCorrectAnswerText(round)}
                    outcome={lastOutcome}
                    travelDurationMs={travelDurationForRound(level, roundIndex) * SPEED_MULTIPLIERS[speed]}
                    color={level.color}
                    roundKey={roundIndex}
                    onAnswer={handleAnswer}
                  />
                </motion.div>
              </motion.div>
            )}

            {screen === 'gameover' && level && (
              <motion.div
                key="gameover"
                ref={measureRef}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-full min-h-[380px] flex-col justify-center"
              >
                <ResultsScreen
                  level={level}
                  score={score}
                  rounds={roundIndex}
                  bestCombo={bestCombo}
                  isNewHighScore={highScore?.isNewHighScore ?? false}
                  onRetry={handleRetry}
                  onChangeLevel={handleChangeLevel}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
