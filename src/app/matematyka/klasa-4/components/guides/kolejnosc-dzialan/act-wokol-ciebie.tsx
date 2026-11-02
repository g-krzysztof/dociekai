'use client';

import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { GuideAct } from '../guide-act';
import { ExpressionSolver } from './expression-solver';
import { FINALE_STEPS, REAL_LIFE_EXAMPLES } from './guide-content';
import { img } from '@/lib/media';

export function ActWokolCiebie({ color }: { color: string }) {
  return (
    <GuideAct id="wokol-ciebie" mode="flow">
      <WokolCiebieBody color={color} />
    </GuideAct>
  );
}

function WokolCiebieBody({ color }: { color: string }) {
  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Wokół ciebie</h2>
      <p className="mb-8 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Ta kolejność to nie szkolna umowa — to międzynarodowy standard, którego trzyma się każde
        urządzenie liczące.
      </p>

      <div className="mb-10 grid items-center gap-6 md:grid-cols-[220px_1fr]">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[220px]">
          <Image
            src={img('/images/matematyka/przewodniki/kolejnosc-dzialan/liczydlo.jpg')}
            alt="Drewniane liczydło z kolorowymi koralikami"
            width={220}
            height={165}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
        <ul className="space-y-3">
          {REAL_LIFE_EXAMPLES.map((example) => (
            <li key={example} className="flex items-start gap-2 text-sm sm:text-base">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span className="leading-relaxed">{example}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mb-4 text-sm text-muted-foreground sm:text-base">
        Na koniec — jedno wyrażenie, wszystkie trzy zasady naraz: <strong>2 × (3 + 4) − 5</strong>
      </p>
      <div className="border bg-white p-6 dark:bg-zinc-900/80 sm:p-8">
        <ExpressionSolver
          steps={FINALE_STEPS}
          color={color}
          ariaLabel="Rozwiąż krok po kroku: 2 razy (3 plus 4), minus 5"
        />
      </div>
    </div>
  );
}
