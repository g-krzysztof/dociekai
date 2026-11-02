'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { img } from '@/lib/media';

function ReadingPanel({ label, formula, result, color }: { label: string; formula: string; result: string; color: string }) {
  return (
    <div className="border bg-white p-4 text-center dark:bg-zinc-900/80 sm:p-5">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mb-1 font-mono text-lg font-bold text-muted-foreground sm:text-xl">{formula}</p>
      <p className="font-mono text-4xl font-black tabular-nums sm:text-5xl" style={{ color }}>
        {result}
      </p>
    </div>
  );
}

export function ActOtwarcie({ color }: { color: string }) {
  return (
    <GuideAct id="otwarcie" mode="flow">
      <OtwarcieBody color={color} />
    </GuideAct>
  );
}

function OtwarcieBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_240px]">
      <div>
        <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">2 + 3 × 4 = ?</h2>
        <p className="mb-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Policz to samo wyrażenie na dwa różne sposoby. Wychodzą dwa różne wyniki.
        </p>

        <div className="mb-6 grid max-w-md grid-cols-2 gap-3">
          <ReadingPanel label="Od lewej do prawej" formula="(2 + 3) × 4" result="20" color={color} />
          <ReadingPanel label="Mnożenie najpierw" formula="2 + (3 × 4)" result="14" color={color} />
        </div>

        <Beat at={0.3} className="mb-6">
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Ta sama liczba, dwa różne wyniki — <strong>tylko jeden może być poprawny</strong>. Gdyby
            każdy liczył wyrażenia po swojemu, dwie osoby licząc to samo działanie dostałyby różne
            odpowiedzi.
          </p>
        </Beat>

        <Beat at={0.55}>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: textColor }}>
            Dlatego matematycy umówili się na jedną, stałą kolejność — tej samej używa dziś każdy
            kalkulator i każdy komputer na świecie. Poznasz ją w trzech zasadach, jedna po drugiej.
          </p>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/kolejnosc-dzialan/drogowskaz.jpg')}
          alt="Drewniany drogowskaz w lesie ze strzałkami wskazującymi w dwie różne strony"
          width={240}
          height={180}
          className="absolute inset-0 h-full w-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
