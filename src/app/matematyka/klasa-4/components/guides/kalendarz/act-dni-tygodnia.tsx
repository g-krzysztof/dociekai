'use client';

import { ArrowRight } from 'lucide-react';
import { Beat, GuideAct } from '../guide-act';
import { NEW_YEAR_SEQUENCE, WEEKDAYS } from '../../../lib/calendar';

export function ActDniTygodnia({ color }: { color: string }) {
  return (
    <GuideAct id="dni-tygodnia" mode="flow">
      <DniTygodniaBody color={color} />
    </GuideAct>
  );
}

function DniTygodniaBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Siedem dni w kółko</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Tydzień zawsze ma siedem dni i zaczyna się od nowa, gdy dojdzie do końca:
      </p>

      <div className="mb-8 flex flex-wrap gap-2">
        {WEEKDAYS.map((day, i) => (
          <span
            key={day}
            className="border px-3 py-1.5 text-xs font-semibold capitalize sm:text-sm"
            style={{ borderColor: `${color}40` }}
          >
            <span className="font-mono tabular-nums" style={{ color }}>
              {i + 1}
            </span>{' '}
            {day}
          </span>
        ))}
      </div>

      <Beat at={0.25} className="mb-6">
        <p className="max-w-2xl text-base leading-relaxed sm:text-lg">
          Rok zwykły ma 365 dni. Skoro{' '}
          <span className="font-mono font-black tabular-nums" style={{ color: textColor }}>
            365 = 52 × 7 + 1
          </span>
          , to mija dokładnie 52 pełne tygodnie i zostaje jeszcze jeden dzień. Dlatego ta sama data
          w przyszłym roku zwykle wypada{' '}
          <strong style={{ color: textColor }}>jeden dzień tygodnia dalej.</strong>
        </p>
      </Beat>

      <Beat at={0.45} className="mb-6">
        <p className="max-w-2xl text-base leading-relaxed sm:text-lg">
          Ale rok przestępny ma o jeden dzień więcej — 366. Jeśli między dwiema takimi samymi
          datami zmieści się 29 lutego, przesunięcie jest{' '}
          <strong style={{ color: textColor }}>o dwa dni, nie o jeden.</strong>
        </p>
      </Beat>

      <Beat at={0.6}>
        <div className="mb-3 flex flex-wrap items-center gap-x-1 gap-y-3 sm:gap-x-2">
          {NEW_YEAR_SEQUENCE.map((entry, i) => {
            const prev = NEW_YEAR_SEQUENCE[i - 1];
            const jump = prev ? (entry.weekdayIndex - prev.weekdayIndex + 7) % 7 : null;
            return (
              <div key={entry.year} className="flex items-center gap-1 sm:gap-2">
                {prev && (
                  <div className="flex flex-col items-center px-1">
                    <span
                      className="font-mono text-xs font-bold tabular-nums sm:text-sm"
                      style={{ color: jump === 2 ? textColor : undefined }}
                    >
                      {jump === 2 ? '+2' : '+1'}
                    </span>
                    <ArrowRight
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: jump === 2 ? color : `${color}59` }}
                      aria-hidden
                    />
                  </div>
                )}
                <div
                  className="border-2 px-2.5 py-1.5 text-center sm:px-3"
                  style={{
                    borderColor: jump === 2 ? color : `${color}40`,
                    backgroundColor: jump === 2 ? `${color}1f` : undefined,
                  }}
                >
                  <div className="font-mono text-sm font-black tabular-nums sm:text-base">
                    {entry.year}
                  </div>
                  <div className="text-[11px] capitalize text-muted-foreground sm:text-xs">
                    {WEEKDAYS[entry.weekdayIndex]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="max-w-2xl text-sm leading-relaxed" style={{ color: textColor }}>
          Odpowiedź z otwarcia: skoro 2026 nie jest przestępny, 1 stycznia 2027 wypadnie zwykły
          jeden dzień po czwartku — w piątek.
        </p>
      </Beat>
    </>
  );
}
