'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Starfield } from '../components/starfield';
import { Countdown } from './components/countdown';
import { Hud } from './components/hud';
import { LevelSelect } from './components/level-select';
import { OrderPanel } from './components/order-panel';
import { ResultsScreen } from './components/results-screen';
import { SpeedSelect } from './components/speed-select';
import { Till } from './components/till';
import { FEEDBACK_MS, MILESTONE_STEP, SHIELDS_START, getLevelById, type LevelConfig, type LevelId } from './data/levels';
import { generateOrder, type CustomerOrder } from './lib/order-generator';
import { isMuted, playCorrect, playGameOver, playMilestone, playWrong, toggleMuted } from './lib/sound';
import { writeRunResult, type LevelBest } from './lib/trader-progress';
import { readSpeed, writeSpeed, SPEED_MULTIPLIERS, type SpeedOption } from './lib/speed';

type Phase = 'menu' | 'countdown' | 'playing' | 'resolving' | 'gameover';

/**
 * Jedyne źródło prawdy dla całej zmiany. `*Ref` trzymają wartości do
 * synchronicznego odczytu wewnątrz `setTimeout`-owych callbacków (stan
 * Reacta jest asynchroniczny i domyka się jako "stary" w closure) — patrz
 * `roundIdRef`/`pickedRef` niżej. Odpowiedni `useState` obok każdego refa
 * istnieje wyłącznie do renderowania. Ten sam wzorzec co w Rakiecie Liczb.
 */
export function KupiecKosmicznyClient() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [levelId, setLevelId] = useState<LevelId | null>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
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

  const pickedRef = useRef<number[]>([]);
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

  function addCoin(value: number) {
    pickedRef.current = [...pickedRef.current, value];
    setPicked(pickedRef.current);
  }

  function undoCoin() {
    pickedRef.current = pickedRef.current.slice(0, -1);
    setPicked(pickedRef.current);
  }

  function clearTimers() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    roundIdRef.current += 1;
  }

  function startRound(activeLevel: LevelConfig, idx: number) {
    const nextOrder = generateOrder(activeLevel, idx, undefined, SPEED_MULTIPLIERS[speed]);
    const myRoundId = ++roundIdRef.current;
    pickedRef.current = [];
    setPicked([]);
    setRoundIndex(idx);
    setOrder(nextOrder);
    setLastOutcome(null);
    setPhase('playing');
    timeoutRef.current = setTimeout(() => resolveRound(myRoundId, activeLevel, idx, nextOrder), nextOrder.patienceMs);
  }

  function resolveRound(myRoundId: number, activeLevel: LevelConfig, idx: number, activeOrder: CustomerOrder) {
    if (roundIdRef.current !== myRoundId) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const total = pickedRef.current.reduce((sum, value) => sum + value, 0);
    const hit = total === activeOrder.changeGr;
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

  function handleSubmit() {
    if (phase !== 'playing' || !level || !order) return;
    resolveRound(roundIdRef.current, level, roundIndex, order);
  }

  function finishRun(activeLevel: LevelConfig, customersServed: number) {
    const result = writeRunResult(activeLevel.id, {
      score: scoreRef.current,
      combo: bestComboRef.current,
      rounds: customersServed,
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
    pickedRef.current = [];
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setShields(SHIELDS_START);
    setPicked([]);
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
    <div className="relative overflow-hidden bg-[#05070f]" data-testid="kupiec-kosmiczny">
      <Starfield count={160} className="pointer-events-none absolute inset-0 opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-25 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }}
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
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">Kupiec Kosmiczny</h1>
                  <p className="mt-1 text-sm text-white/50">
                    Gra edukacyjna do ćwiczenia liczenia pieniędzy i wydawania reszty
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

            {screen === 'playing' && level && order && (
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
                  className="mb-3 sm:mb-4"
                >
                  <OrderPanel
                    itemName={order.itemName}
                    priceGr={order.priceGr}
                    paidGr={order.paidGr}
                    patienceMs={order.patienceMs}
                    color={level.color}
                    roundKey={roundIndex}
                    phase={phase === 'resolving' ? 'resolving' : 'playing'}
                  />
                </motion.div>
                {lastOutcome && (
                  <p
                    className="mb-3 text-center text-sm font-semibold sm:mb-4"
                    style={{ color: lastOutcome === 'correct' ? '#4ade80' : '#f87171' }}
                    data-testid="outcome"
                  >
                    {lastOutcome === 'correct' ? 'Dokładna reszta! Klient odlatuje zadowolony.' : 'To nie ta kwota — klient odlatuje zawiedziony.'}
                  </p>
                )}
                <Till
                  denominations={level.tillDenominations}
                  picked={picked}
                  onAdd={addCoin}
                  onUndo={undoCoin}
                  onSubmit={handleSubmit}
                  color={level.color}
                  disabled={phase !== 'playing'}
                />
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
                  customers={roundIndex}
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
