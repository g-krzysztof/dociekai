'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const STAGE_H = 250;
const PIVOT_Y = 66;
const BEAM_W = 220;
const MAX_ANGLE = 15;
const STRING_LEN = 30;
const PAN_W = 156;
const PAN_MAX_H = 96;
const SPRING = { type: 'spring', stiffness: 90, damping: 14 } as const;

interface BalanceScaleProps {
  color: string;
  /** Masa na lewej szalce, w gramach — to, co trzeba zrównoważyć. */
  leftGrams: number;
  leftContent: ReactNode;
  /** Masa na prawej szalce, w gramach — suma tego, co dziecko tam położyło. */
  rightGrams: number;
  rightContent: ReactNode;
  /**
   * Różnica mas (w gramach), przy której belka osiąga pełne wychylenie.
   * Skaluje czułość wagi do rzędu wielkości danej rundy — patrz `balance-lab.tsx`.
   */
  maxDiffGrams: number;
}

/**
 * Waga szalkowa: ciągłe, fizyczne przechylanie belki — nie skok między
 * gotowymi klatkami jak `<RoundingMachine>`/`<CalculationCascade>`, tylko
 * spring reagujący na żywo na jedną liczbę (różnicę mas). Belka obraca się
 * wokół własnego środka (`rotate`, sprężyna framer-motion), a obie szalki
 * są odrębnymi elementami, które tylko **przesuwają się w pionie** o
 * `±(BEAM_W/2) · sin(kąt)` — dokładnie tyle, o ile w tej chwili opada/wznosi
 * się koniec belki. Dzięki temu zawartość szalki nigdy się nie obraca i
 * zostaje czytelna, a fizyka obu elementów (belki i szalek) wynika z tego
 * samego kąta, więc nie mogą się rozjechać. To pierwszy w kursie widget,
 * który pokazuje równość/nierówność jako ruch fizyczny, a nie tylko
 * porównanie liczb — zrównoważenie to naturalny stan „wygranej”, widoczny
 * gołym okiem, zanim jeszcze dziecko przeczyta liczby na szalkach.
 */
export function BalanceScale({
  color,
  leftGrams,
  leftContent,
  rightGrams,
  rightContent,
  maxDiffGrams,
}: BalanceScaleProps) {
  const diff = rightGrams - leftGrams;
  const angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, (diff / maxDiffGrams) * MAX_ANGLE));
  const angleRad = (angle * Math.PI) / 180;
  const halfBeam = BEAM_W / 2;
  const leftDrop = -halfBeam * Math.sin(angleRad);
  const rightDrop = halfBeam * Math.sin(angleRad);
  const balanced = leftGrams > 0 && rightGrams === leftGrams;

  return (
    <div className="space-y-2">
      <div className="relative mx-auto" style={{ width: '100%', maxWidth: 420, height: STAGE_H }}>
        {/* Stojak — statyczny słupek + podstawa */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{ top: PIVOT_Y, width: 6, height: STAGE_H - PIVOT_Y - 18, backgroundColor: color }}
          aria-hidden
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{ bottom: 0, width: 96, height: 8, backgroundColor: color }}
          aria-hidden
        />

        {/* Belka — jedyny element, który się obraca */}
        <motion.div
          className="absolute left-1/2 rounded-full"
          style={{
            top: PIVOT_Y,
            width: BEAM_W,
            height: 7,
            marginLeft: -halfBeam,
            marginTop: -3.5,
            backgroundColor: color,
          }}
          animate={{ rotate: angle }}
          transition={SPRING}
          aria-hidden
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full border-2 bg-white dark:bg-zinc-900"
          style={{ top: PIVOT_Y, width: 12, height: 12, marginTop: -6, borderColor: color }}
          aria-hidden
        />

        {/* Lewa szalka — cel do zrównoważenia, tylko przesuwa się w pionie */}
        <motion.div
          className="absolute flex flex-col items-center"
          style={{ left: '50%', marginLeft: -halfBeam - PAN_W / 2, top: PIVOT_Y }}
          animate={{ y: leftDrop }}
          transition={SPRING}
        >
          <div style={{ width: 2, height: STRING_LEN, backgroundColor: `${color}80` }} aria-hidden />
          <div
            className="flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed p-2 text-center"
            style={{ width: PAN_W, borderColor: color, backgroundColor: `${color}0a` }}
          >
            {leftContent}
          </div>
        </motion.div>

        {/* Prawa szalka — taca na odważniki dziecka */}
        <motion.div
          className="absolute flex flex-col items-center"
          style={{ left: '50%', marginLeft: halfBeam - PAN_W / 2, top: PIVOT_Y }}
          animate={{ y: rightDrop }}
          transition={SPRING}
        >
          <div style={{ width: 2, height: STRING_LEN, backgroundColor: `${color}80` }} aria-hidden />
          <div
            className="flex min-h-16 w-full flex-wrap content-start items-start justify-center gap-1 overflow-y-auto overflow-x-hidden rounded-md border-2 p-2"
            style={{ width: PAN_W, maxHeight: PAN_MAX_H, borderColor: color, backgroundColor: `${color}0a` }}
          >
            {rightContent}
          </div>
        </motion.div>
      </div>

      <p className="text-center text-sm">
        <span className="font-mono font-bold tabular-nums" style={{ color }}>
          {Math.round(leftGrams).toLocaleString('pl-PL')} g
        </span>
        <span className="mx-2 text-muted-foreground">na lewej ⚖️ na prawej</span>
        <span className="font-mono font-bold tabular-nums" style={{ color }}>
          {Math.round(rightGrams).toLocaleString('pl-PL')} g
        </span>
      </p>

      {balanced && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-1.5 text-center text-sm font-semibold"
          style={{ color }}
        >
          <Check className="h-4 w-4 shrink-0" aria-hidden />
          Zrównoważona!
        </motion.p>
      )}
    </div>
  );
}
