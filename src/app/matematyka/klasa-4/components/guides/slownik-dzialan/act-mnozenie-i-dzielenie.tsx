'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { EquationRow } from './equation-row';
import { DIVISION_EQUATION, MULTIPLICATION_EQUATION } from './guide-content';
import { img } from '@/lib/media';

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
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_200px]">
      <div>
        <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Mnożenie i dzielenie</h2>
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Ten sam mechanizm, inne słowa.
        </p>

        <Beat at={0.05} className="mb-10">
          <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
            <EquationRow terms={MULTIPLICATION_EQUATION} operator="×" color={color} />
          </div>
        </Beat>

        <Beat at={0.35} className="mb-10">
          <div
            className="border-l-4 p-4 sm:p-5"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            <p className="text-sm leading-relaxed sm:text-base">
              Liczby, które mnożysz, to <strong style={{ color: textColor }}>czynniki</strong>.
              Wynik mnożenia to <strong style={{ color: textColor }}>iloczyn</strong>.
            </p>
          </div>
        </Beat>

        <Beat at={0.6} className="mb-10">
          <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
            Dzielenie odwraca mnożenie — te same trzy liczby, inny kierunek.
          </p>
          <div className="mt-4 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
            <EquationRow terms={DIVISION_EQUATION} operator=":" color={color} />
          </div>
        </Beat>

        <Beat at={0.85}>
          <div
            className="border-l-4 p-4 sm:p-5"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            <p className="text-sm leading-relaxed sm:text-base">
              Liczba, którą dzielisz, to <strong style={{ color: textColor }}>dzielna</strong>.
              Liczba, przez którą dzielisz, to <strong style={{ color: textColor }}>dzielnik</strong>.
              Wynik dzielenia to <strong style={{ color: textColor }}>iloraz</strong>.
            </p>
          </div>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[200px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/slownik-dzialan/karton-jajek.jpg')}
          alt="Otwarty karton z jajkami ułożonymi w równych rzędach"
          width={200}
          height={150}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
