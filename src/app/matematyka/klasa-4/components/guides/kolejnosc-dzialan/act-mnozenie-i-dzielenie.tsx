'use client';

import { Beat, GuideAct } from '../guide-act';
import { ExpressionSolver } from './expression-solver';
import { PRECEDENCE_STEPS } from './guide-content';

export function ActMnozenieIDzielenie({ color }: { color: string }) {
  return (
    <GuideAct id="mnozenie-i-dzielenie" mode="flow">
      <MnozenieIDzielenieBody color={color} />
    </GuideAct>
  );
}

function MnozenieIDzielenieBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        Zasada 2
      </p>
      <h2 className="mb-6 text-2xl font-bold leading-snug sm:text-3xl">
        Mnożenie i dzielenie przed dodawaniem i odejmowaniem
      </h2>

      <Beat at={0.1} className="mb-8">
        <div
          className="border-l-4 p-4 sm:p-5"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <p className="text-sm leading-relaxed sm:text-base">
            Nawet jeśli w zapisie mnożenie stoi dalej niż dodawanie, i tak liczysz je najpierw.
            Kolejność zapisu na kartce nie decyduje o kolejności liczenia.
          </p>
        </div>
      </Beat>

      <Beat at={0.4}>
        <p className="mb-4 text-sm text-muted-foreground sm:text-base">
          Pamiętasz <strong>2 + 3 × 4</strong> z samego początku? Oto dlaczego wynosi 14, nie 20.
        </p>
        <div className="border bg-white p-6 dark:bg-zinc-900/80 sm:p-8">
          <ExpressionSolver
            steps={PRECEDENCE_STEPS}
            color={color}
            ariaLabel="Rozwiąż krok po kroku: 2 plus 3 razy 4"
          />
        </div>
      </Beat>
    </div>
  );
}
