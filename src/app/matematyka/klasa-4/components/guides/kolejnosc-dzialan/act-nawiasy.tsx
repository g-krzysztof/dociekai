'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { ExpressionSolver } from './expression-solver';
import { PARENS_STEPS } from './guide-content';
import { img } from '@/lib/media';

export function ActNawiasy({ color }: { color: string }) {
  return (
    <GuideAct id="nawiasy" mode="flow">
      <NawiasyBody color={color} />
    </GuideAct>
  );
}

function NawiasyBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_220px]">
      <div>
        <p
          className="mb-1 text-xs font-bold uppercase tracking-[0.15em]"
          style={{ color: textColor }}
        >
          Zasada 1
        </p>
        <h2 className="mb-6 text-2xl font-bold leading-snug sm:text-3xl">Nawiasy zawsze pierwsze</h2>

        <Beat at={0.1} className="mb-8">
          <div
            className="border-l-4 p-4 sm:p-5"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            <p className="text-sm leading-relaxed sm:text-base">
              To, co jest w nawiasie, liczysz w pierwszej kolejności — nieważne, czy to dodawanie,
              odejmowanie, czy cokolwiek innego. Dopiero potem liczysz resztę.
            </p>
          </div>
        </Beat>

        <Beat at={0.4}>
          <p className="mb-4 text-sm text-muted-foreground sm:text-base">
            Kliknij, żeby policzyć <strong>(2 + 3) × 4</strong> krok po kroku.
          </p>
          <div className="border bg-white p-6 dark:bg-zinc-900/80 sm:p-8">
            <ExpressionSolver
              steps={PARENS_STEPS}
              color={color}
              ariaLabel="Rozwiąż krok po kroku: (2 + 3) razy 4"
            />
          </div>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[220px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/kolejnosc-dzialan/matrioszki.jpg')}
          alt="Drewniane matrioszki różnej wielkości, otwarte, jedna w drugiej"
          width={220}
          height={165}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
