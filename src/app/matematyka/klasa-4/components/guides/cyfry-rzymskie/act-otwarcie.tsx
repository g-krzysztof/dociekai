'use client';

import Image from 'next/image';
import { motion, useTransform } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Beat, GuideAct, useActProgress } from '../guide-act';
import { INSCRIPTIONS, type Inscription } from './guide-content';
import { img } from '@/lib/media';

const OPENING = INSCRIPTIONS[0];

interface ActOtwarcieProps {
  color: string;
  chosen: Inscription;
  onChoose: (inscription: Inscription) => void;
}

/** Pojedyncza litera z rysującą się pod nią kreską „dłuta”. */
function CarvedLetter({
  char,
  index,
  total,
  color,
}: {
  char: string;
  index: number;
  total: number;
  color: string;
}) {
  const progress = useActProgress();
  const at = 0.05 + (index / total) * 0.35;
  const opacity = useTransform(progress, [at, at + 0.06], [0, 1]);
  const y = useTransform(progress, [at, at + 0.06], [18, 0]);
  // pathLength ma bezpieczny odpowiednik w SVG (w odróżnieniu od x/y), więc
  // można je animować bez ryzyka podwójnej transformacji.
  const draw = useTransform(progress, [at + 0.04, at + 0.12], [0, 1]);

  return (
    <motion.span className="inline-flex flex-col items-center" style={{ opacity, y }}>
      <span
        className="font-mono text-5xl font-black leading-none sm:text-7xl lg:text-8xl"
        style={{ color }}
      >
        {char}
      </span>
      <svg viewBox="0 0 40 6" className="mt-2 h-1.5 w-full" aria-hidden>
        <motion.line
          x1={2}
          y1={3}
          x2={38}
          y2={3}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={1}
          style={{ pathLength: draw }}
        />
      </svg>
    </motion.span>
  );
}

export function ActOtwarcie({ color, chosen, onChoose }: ActOtwarcieProps) {
  const letters = OPENING.symbols.split('');

  return (
    <GuideAct id="otwarcie" mode="flow">
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_260px]">
        <div>
          <h2 className="mb-6 text-2xl font-bold leading-snug sm:text-3xl">
            Napis, którego jeszcze nie umiesz przeczytać
          </h2>

          <div className="mb-8 flex flex-wrap items-end justify-center gap-x-2 gap-y-4 sm:justify-start">
            {letters.map((char, i) => (
              <CarvedLetter key={i} char={char} index={i} total={letters.length} color={color} />
            ))}
          </div>

          <Beat at={0.55} className="mb-6">
            <p className="max-w-xl text-base leading-relaxed sm:text-lg">
              To rok <strong>{OPENING.value}</strong>. Sześć liter zamiast czterech cyfr. Zanim
              dojedziesz do końca tej strony, przeczytasz taki napis sam — i będziesz wiedzieć,
              dlaczego wygląda właśnie tak.
            </p>
          </Beat>

          <Beat at={0.72}>
            <p
              className="mb-3 text-xs font-bold uppercase tracking-[0.15em]"
              style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
            >
              Wybierz napis, który odblokujesz na końcu
            </p>
            <div className="flex flex-wrap gap-2">
              {INSCRIPTIONS.map((item) => {
                const active = item.value === chosen.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onChoose(item)}
                    aria-pressed={active}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 border px-4 py-2.5 text-left transition-all',
                      !active && 'hover:-translate-y-0.5 hover:shadow-md',
                      active && 'shadow-sm'
                    )}
                    style={
                      active
                        ? { borderColor: color, backgroundColor: `${color}14` }
                        : { borderColor: `${color}59` }
                    }
                  >
                    {active && <Check className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />}
                    <span>
                      <span
                        className="block font-mono text-base font-bold tabular-nums"
                        style={{ color }}
                      >
                        {item.value}
                      </span>
                      <span className="block text-xs text-muted-foreground">{item.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Beat>
        </div>

        <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[260px] lg:block">
          <Image
            src={img('/images/matematyka/przewodniki/cyfry-rzymskie/dluto-i-mlotek.jpg')}
            alt="Dłuto i drewniany młotek leżące na gładkiej kamiennej płycie"
            width={260}
            height={195}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>
      </div>
    </GuideAct>
  );
}
