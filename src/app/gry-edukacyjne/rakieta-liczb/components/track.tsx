'use client';

import { useEffect } from 'react';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import { Portal, type PortalState } from './portal';
import { RocketSprite } from './rocket';
import { Starfield } from '../../components/starfield';

interface TrackProps {
  laneOptions: [number, number, number];
  correctLane: number;
  currentLane: number;
  travelDurationMs: number;
  phase: 'playing' | 'resolving';
  lastOutcome: 'correct' | 'wrong' | null;
  comboTier: number;
  color: string;
  roundKey: number;
  /** Rośnie o 1 przy każdej błędnej rundzie — jedyny sygnał do odtworzenia potrząśnięcia. */
  shakeNonce: number;
  onLaneChange: (lane: number) => void;
}

const LANE_LABELS = ['lewy', 'środkowy', 'prawy'];

/**
 * Spadek portalu (Portal, `travelDurationMs`) i zegar rozstrzygający rundę
 * w orchestratorze mierzą dokładnie ten sam czas — Track tylko odczytuje
 * stan (`phase`/`lastOutcome`), nigdy sam nie decyduje kto wygrał rundę.
 */
export function Track({
  laneOptions,
  correctLane,
  currentLane,
  travelDurationMs,
  phase,
  lastOutcome,
  comboTier,
  color,
  roundKey,
  shakeNonce,
  onLaneChange,
}: TrackProps) {
  const reducedMotion = useReducedMotion();
  const shakeControls = useAnimation();

  useEffect(() => {
    if (shakeNonce === 0) return;
    if (reducedMotion) {
      shakeControls.start({ opacity: [1, 0.85, 1], transition: { duration: 0.3 } });
      return;
    }
    shakeControls.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35, ease: 'easeInOut' } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shakeNonce]);

  const stateForLane = (lane: number): PortalState => {
    if (phase === 'playing') return 'falling';
    if (lane === correctLane) return lane === currentLane ? 'correct-hit' : 'correct-reveal';
    if (lane === currentLane) return 'wrong-hit';
    return 'neutral';
  };

  return (
    <motion.div
      animate={shakeControls}
      // Wysokość jest zawsze taka sama (nie liczona ze zmiennej szerokości)
      // — szerokość dopasowuje się do niej przez aspect-ratio. Dzięki temu
      // tor gry ma identyczny rozmiar w każdej rundzie i na każdej szerokości
      // ekranu, więc nic w tym miejscu nigdy "nie skacze".
      className="relative mx-auto h-[380px] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-[#0b1224] via-[#070b18] to-[#04060d] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] sm:h-[460px]"
      style={{ aspectRatio: '3 / 4' }}
      data-testid="track"
    >
      <Starfield count={60} />

      <div className="absolute inset-0 grid grid-cols-3">
        {[0, 1, 2].map((lane) => (
          <div key={lane} className="relative border-l border-white/[0.04] first:border-l-0">
            <Portal
              key={roundKey}
              laneIndex={lane}
              value={laneOptions[lane]}
              travelDurationMs={travelDurationMs}
              state={stateForLane(lane)}
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-white/15" style={{ top: '76%' }} aria-hidden />

      {/*
        pointer-events-none: framer-motion daje rakiecie `transform` (layout/scale/x),
        co tworzy nowy kontekst stackowania i sadza ją WIZUALNIE nad strefami dotykowymi
        poniżej mimo wcześniejszej pozycji w DOM — bez tego rakieta przechwytuje kliknięcie
        w pas, w którym akurat stoi (złapane przez Playwrighta: locator.click timeout,
        "intercepts pointer events" na ścieżce SVG rakiety).
      */}
      <div className="pointer-events-none absolute inset-x-0 grid grid-cols-3" style={{ top: '80%' }} aria-hidden>
        <div style={{ gridColumn: currentLane + 1 }}>
          <RocketSprite color={color} comboTier={comboTier} outcome={phase === 'resolving' ? lastOutcome : null} />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 grid grid-cols-3" style={{ height: '32%' }}>
        {[0, 1, 2].map((lane) => (
          <button
            key={lane}
            type="button"
            data-testid={`lane-${lane}`}
            aria-label={`Steruj na pas ${LANE_LABELS[lane]}`}
            aria-pressed={currentLane === lane}
            onClick={() => onLaneChange(lane)}
            className="h-full w-full transition-colors active:bg-white/[0.06]"
          />
        ))}
      </div>
    </motion.div>
  );
}
