'use client';

import { Beat, GuideAct } from '../guide-act';
import { EquationRow } from './equation-row';
import { ADDITION_EQUATION, SUBTRACTION_EQUATION } from './guide-content';

export function ActDodawanieIOdejmowanie({ color }: { color: string }) {
  return (
    <GuideAct id="dodawanie-i-odejmowanie" mode="flow">
      <DodawanieIOdejmowanieBody color={color} />
    </GuideAct>
  );
}

function DodawanieIOdejmowanieBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Dodawanie i odejmowanie</h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Kliknij każdą liczbę, żeby zobaczyć, jak się nazywa.
      </p>

      <Beat at={0.05} className="mb-10">
        <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
          <EquationRow terms={ADDITION_EQUATION} operator="+" color={color} />
        </div>
      </Beat>

      <Beat at={0.35} className="mb-10">
        <div
          className="border-l-4 p-4 sm:p-5"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <p className="text-sm leading-relaxed sm:text-base">
            Liczby, które dodajesz, to <strong style={{ color: textColor }}>składniki</strong>.
            Wynik dodawania to <strong style={{ color: textColor }}>suma</strong>.
          </p>
        </div>
      </Beat>

      <Beat at={0.6} className="mb-10">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Odejmowanie odwraca dodawanie — te same trzy liczby, inny kierunek.
        </p>
        <div className="mt-4 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
          <EquationRow terms={SUBTRACTION_EQUATION} operator="−" color={color} />
        </div>
      </Beat>

      <Beat at={0.85}>
        <div
          className="border-l-4 p-4 sm:p-5"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <p className="text-sm leading-relaxed sm:text-base">
            Liczba, od której odejmujesz, to{' '}
            <strong style={{ color: textColor }}>odjemna</strong>. Liczba, którą odejmujesz, to{' '}
            <strong style={{ color: textColor }}>odjemnik</strong>. Wynik odejmowania to{' '}
            <strong style={{ color: textColor }}>różnica</strong>.
          </p>
        </div>
      </Beat>
    </>
  );
}
