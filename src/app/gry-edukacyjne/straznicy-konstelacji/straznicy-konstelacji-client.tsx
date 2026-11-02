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
import { Scanner } from './components/scanner';
import { SpeedSelect } from './components/speed-select';
import { FEEDBACK_MS, MILESTONE_STEP, SHIELDS_START, getLevelById, type LevelConfig, type LevelId } from './data/levels';
import { generateRound, type CrystalRound } from './lib/crystal-generator';
import { isMuted, playCorrect, playGameOver, playMilestone, playWrong, toggleMuted } from './lib/sound';
import { writeRunResult, type LevelBest } from './lib/guardian-progress';
import { readSpeed, writeSpeed, SPEED_MULTIPLIERS, type SpeedOption } from './lib/speed';

type Phase = 'menu' | 'countdown' | 'playing' | 'resolving' | 'gameover';

/**
 * Jedyne źródło prawdy dla całego patrolu. `*Ref` trzymają wartości do
 * synchronicznego odczytu wewnątrz `setTimeout`-owych callbacków (stan
 * Reacta jest asynchroniczny i domyka się jako "stary" w closure) — patrz
 * `roundIdRef` niżej. Odpowiedni `useState` obok każdego refa istnieje
 * wyłącznie do renderowania. Ten sam wzorzec co w Kupcu Kosmicznym i Rakiecie
 * Liczb — kryształ rozstrzyga się od razu po kliknięciu doku (jak "Wydaj
 * resztę" w Kupcu), a nie po dotarciu do dołu (jak pas w Rakiecie).
 */
export function StraznicyKonstelacjiClient() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [levelId, setLevelId] = useState<LevelId | null>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState<CrystalRound | null>(null);
  const [pickedBayId, setPickedBayId] = useState<string | null>(null);
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
  // co przy przełączaniu robiłoby "skok" obrazu. Zamiast zgadywać piksele,
  // mierzymy realną wysokość tego, co akurat jest zamontowane, i trzymamy
  // narastające maksimum — kontener sceny nigdy się nie kurczy.
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
    const nextRound = generateRound(activeLevel, idx, undefined, SPEED_MULTIPLIERS[speed]);
    const myRoundId = ++roundIdRef.current;
    setRoundIndex(idx);
    setRound(nextRound);
    setPickedBayId(null);
    setLastOutcome(null);
    setPhase('playing');
    timeoutRef.current = setTimeout(
      () => resolveRound(myRoundId, activeLevel, idx, nextRound, null),
      nextRound.travelDurationMs,
    );
  }

  function resolveRound(myRoundId: number, activeLevel: LevelConfig, idx: number, activeRound: CrystalRound, bayId: string | null) {
    if (roundIdRef.current !== myRoundId) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const hit = bayId === activeRound.correctBayId;
    setPickedBayId(bayId);
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

  function handleBayPick(bayId: string) {
    if (phase !== 'playing' || !level || !round) return;
    resolveRound(roundIdRef.current, level, roundIndex, round, bayId);
  }

  function finishRun(activeLevel: LevelConfig, roundsSorted: number) {
    const result = writeRunResult(activeLevel.id, {
      score: scoreRef.current,
      combo: bestComboRef.current,
      rounds: roundsSorted,
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
    <div className="relative overflow-hidden bg-[#05070f]" data-testid="straznicy-konstelacji">
      <Starfield count={160} className="pointer-events-none absolute inset-0 opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-25 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)' }}
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
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">Strażnicy Konstelacji</h1>
                  <p className="mt-1 text-sm text-white/50">
                    Gra edukacyjna do ćwiczenia rozpoznawania kształtów, liczenia boków, kątów i symetrii
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
                  <Scanner
                    visual={round.visual}
                    bays={round.bays}
                    correctBayId={round.correctBayId}
                    pickedBayId={pickedBayId}
                    travelDurationMs={round.travelDurationMs}
                    phase={phase === 'resolving' ? 'resolving' : 'playing'}
                    color={level.color}
                    roundKey={roundIndex}
                    onPick={handleBayPick}
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
                  sorted={roundIndex}
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
