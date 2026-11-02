'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Beat, GuideAct } from '../guide-act';

interface ShapeCardProps {
  color: string;
  heading: string;
  fill: boolean;
  explanation: string;
}

function ShapeCard({ color, heading, fill, explanation }: ShapeCardProps) {
  const [revealed, setRevealed] = useState(false);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      disabled={revealed}
      className={cn(
        'flex cursor-pointer flex-col items-center gap-3 border p-5 text-center transition-all disabled:cursor-default sm:p-6',
        !revealed && 'hover:-translate-y-0.5 hover:shadow-md'
      )}
      style={{ borderColor: revealed ? color : `${color}40`, backgroundColor: revealed ? `${color}0c` : undefined }}
    >
      <svg viewBox="0 0 100 100" width={88} height={88} role="img" aria-label={heading}>
        <circle cx={50} cy={50} r={38} fill={fill ? `${color}33` : 'none'} stroke={color} strokeWidth={4} />
      </svg>
      <span className="text-lg font-bold" style={{ color: revealed ? textColor : undefined }}>
        {heading}
      </span>
      {revealed ? (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm leading-relaxed"
        >
          {explanation}
        </motion.p>
      ) : (
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Kliknij, żeby sprawdzić
        </span>
      )}
    </button>
  );
}

export function ActKoloIOkrag({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <GuideAct id="kolo-i-okrag" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Koło czy okrąg?</h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        To nie jest jedno słowo na dwa sposoby — koło i okrąg to dwie różne figury. Kliknij każdą
        z nich.
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <ShapeCard
          color={color}
          heading="Okrąg"
          fill={false}
          explanation="Tylko linia — brzeg, zamknięta krzywa. Każdy jej punkt leży w tej samej odległości od środka."
        />
        <ShapeCard
          color={color}
          heading="Koło"
          fill
          explanation="Cała powierzchnia — okrąg razem z tym, co jest w jego wnętrzu."
        />
      </div>

      <Beat at={0.4}>
        <div
          className="border-l-4 p-4 sm:p-5"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <p className="text-sm leading-relaxed sm:text-base">
            Dlatego mówimy „<strong style={{ color: textColor }}>narysuj okrąg</strong>” (rysujesz
            linię), ale „<strong style={{ color: textColor }}>pole koła</strong>” (liczysz
            powierzchnię) — nigdy odwrotnie.
          </p>
        </div>
      </Beat>
    </GuideAct>
  );
}
