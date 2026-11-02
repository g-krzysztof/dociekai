'use client';

import { Beat, GuideAct } from '../guide-act';

export function ActCoToSkala({ color }: { color: string }) {
  return (
    <GuideAct id="co-to-skala" mode="flow">
      <CoToSkalaBody color={color} />
    </GuideAct>
  );
}

function CoToSkalaBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="max-w-3xl">
      <h2 className="mb-6 text-2xl font-bold leading-snug sm:text-3xl">Skala to stosunek dwóch długości</h2>

      <Beat at={0.2} className="mb-6">
        <p className="text-base leading-relaxed sm:text-lg">
          Zapis <strong style={{ color: textColor }}>1 : 100</strong> mówi: jednej jednostce
          długości na rysunku odpowiada 100 takich samych jednostek w rzeczywistości. Nieważne, czy
          to centymetry, czy kilometry — obie strony zapisu muszą być w tej samej jednostce.
        </p>
      </Beat>

      <Beat at={0.45} className="mb-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-3 w-10" style={{ backgroundColor: color }} />
            <p className="text-sm font-semibold">1 cm na rysunku</p>
          </div>
          <span className="font-mono text-2xl font-bold" style={{ color }}>
            ×100
          </span>
          <div className="flex flex-col items-center gap-2">
            <div className="h-3 w-full max-w-[260px]" style={{ backgroundColor: color }} />
            <p className="text-sm font-semibold">100 cm (1 m) w rzeczywistości</p>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          (paski nie są narysowane w prawdziwej skali 1:100 — 100 cm nie zmieściłoby się na
          ekranie)
        </p>
      </Beat>

      <Beat at={0.7}>
        <p className="text-sm leading-relaxed" style={{ color: textColor }}>
          Im większa druga liczba, tym mocniejsze pomniejszenie — plan mieszkania w skali 1:100
          pokazuje bliski, mały fragment świata; mapa Polski w skali 1:1 000 000 pokazuje ogromny
          obszar, ale z dużo mniejszą ilością szczegółów.
        </p>
      </Beat>
    </div>
  );
}
