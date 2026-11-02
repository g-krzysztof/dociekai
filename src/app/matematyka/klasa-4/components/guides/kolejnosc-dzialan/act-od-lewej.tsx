'use client';

import { GuideAct } from '../guide-act';
import { ExpressionSolver } from './expression-solver';
import { LEFT_TO_RIGHT_ADD_STEPS, LEFT_TO_RIGHT_MUL_STEPS } from './guide-content';

export function ActOdLewej({ color }: { color: string }) {
  return (
    <GuideAct id="od-lewej" mode="flow">
      <OdLewejBody color={color} />
    </GuideAct>
  );
}

function OdLewejBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        Zasada 3
      </p>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Od lewej do prawej</h2>
      <p className="mb-8 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Zasady 1 i 2 mówią, CO liczyć najpierw. Ale co, gdy w wyrażeniu jest kilka działań o tym
        samym priorytecie — samo dodawanie i odejmowanie, albo samo mnożenie i dzielenie? Wtedy
        liczysz je po kolei, tak jak czytasz: od lewej do prawej.
      </p>

      <div className="mb-10 border bg-white p-6 dark:bg-zinc-900/80 sm:p-8">
        <p className="mb-4 text-sm text-muted-foreground sm:text-base">
          Dodawanie i odejmowanie: <strong>20 − 5 + 3</strong>
        </p>
        <ExpressionSolver
          steps={LEFT_TO_RIGHT_ADD_STEPS}
          color={color}
          ariaLabel="Rozwiąż krok po kroku: 20 minus 5 plus 3"
        />
      </div>

      <div className="border bg-white p-6 dark:bg-zinc-900/80 sm:p-8">
        <p className="mb-4 text-sm text-muted-foreground sm:text-base">
          Dzielenie i mnożenie: <strong>12 : 4 × 3</strong>
        </p>
        <ExpressionSolver
          steps={LEFT_TO_RIGHT_MUL_STEPS}
          color={color}
          ariaLabel="Rozwiąż krok po kroku: 12 podzielić przez 4, razy 3"
        />
      </div>

      <div
        className="mt-8 border-l-4 p-4 sm:p-5"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <p className="text-sm leading-relaxed sm:text-base">
          Uważaj: gdybyś w drugim przykładzie policzył najpierw <strong>4 × 3 = 12</strong>, a
          dopiero potem <strong>12 : 12</strong>, wyszłoby 1 — zupełnie inny, błędny wynik. Kolejność
          od lewej do prawej naprawdę ma znaczenie.
        </p>
      </div>
    </div>
  );
}
