'use client';

import { Beat, GuideAct } from '../guide-act';
import { PrefixLadder } from './prefix-ladder';
import { LENGTH_RUNGS } from './guide-content';

export function ActDlugosc({ color }: { color: string }) {
  return (
    <GuideAct id="dlugosc" mode="flow">
      <DlugoscBody color={color} />
    </GuideAct>
  );
}

function DlugoscBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">
        Ta sama drabinka, z metrem jako bazą
      </h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Znasz już to z lekcji o długości — teraz zobaczysz, skąd biorą się te litery.
      </p>

      <Beat at={0.15} className="mb-8">
        <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
          <PrefixLadder color={color} rungs={LENGTH_RUNGS} baseLabel="metr" />
        </div>
      </Beat>

      <Beat at={0.55}>
        <div
          className="border-l-4 p-4 sm:p-5"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <p className="text-sm leading-relaxed sm:text-base">
            Jeden szczebel jest wygaszony — <strong style={{ color: textColor }}>deka-</strong>{' '}
            (czyli „dekametr”) istnieje w systemie, ale w tym kursie się go nie używa. Dlatego z m
            na km jest od razu ×1000, a nie ×10 jak wszędzie indziej — to właśnie ten pominięty
            krok.
          </p>
        </div>
      </Beat>
    </>
  );
}
