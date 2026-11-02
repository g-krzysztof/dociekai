'use client';

import { Beat, GuideAct } from '../guide-act';
import { KnuckleHand } from './knuckle-hand';
import { MONTH_NAMES, daysInMonth } from '../../../lib/calendar';

export function ActMiesiace({ color }: { color: string }) {
  return (
    <GuideAct id="miesiace" mode="flow">
      <MiesiaceBody color={color} />
    </GuideAct>
  );
}

function MiesiaceBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">
        12 miesięcy, dwie długości (prawie)
      </h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Siedem miesięcy ma 31 dni, cztery mają 30, a luty jako jedyny ma tylko 28 (albo 29). Nikt
        nie pamięta tego na wyrywki — zamiast tego złóż obie dłonie w pięści. Każda ma cztery
        wypukłe kostki i trzy wklęsłe doliny między nimi, czyli razem czternaście miejsc — a
        dwanaście z nich to dwanaście miesięcy roku, licząc od lewego małego palca, przez oba
        złączone wskazujące, aż po prawy serdeczny.
      </p>

      <Beat at={0.15} className="mb-8">
        <KnuckleHand color={color} />
      </Beat>

      <Beat at={0.55}>
        <details className="group border" style={{ borderColor: `${color}40` }}>
          <summary
            className="cursor-pointer list-none px-4 py-3 text-sm font-semibold sm:text-base"
            style={{ color: textColor }}
          >
            Pokaż wszystkie 12 miesięcy w jednej tabeli
          </summary>
          <ol className="divide-y border-t" style={{ borderColor: `${color}40` }}>
            {MONTH_NAMES.map((name, i) => (
              <li key={name} className="flex items-center justify-between px-4 py-2 text-sm sm:text-base">
                <span className="capitalize">{name}</span>
                <span className="font-mono font-bold tabular-nums" style={{ color }}>
                  {daysInMonth(i, 2026)} dni{i === 1 ? ' (29 przestępny)' : ''}
                </span>
              </li>
            ))}
          </ol>
        </details>
      </Beat>
    </>
  );
}
