'use client';

import { Beat, GuideAct } from '../guide-act';
import { ClockFace } from '../../clock-face';
import { ClockCard } from './clock-card';
import { NOTATION_EXAMPLES } from './guide-content';
import { digital12, digital24 } from '../../../lib/clock';

export function ActZapis1224({ color }: { color: string }) {
  return (
    <GuideAct id="zapis-12-24" mode="flow">
      <Zapis1224Body color={color} />
    </GuideAct>
  );
}

function Zapis1224Body({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">
        Dwa zapisy tej samej godziny
      </h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Zwykły zegar ze wskazówkami liczy tylko do 12 — po dwunastej zaczyna od nowa. Zapis
        cyfrowy, który znasz z rozkładów jazdy, liczy dalej: od 13 aż do 23, zanim znów zacznie od
        zera o północy.
      </p>

      <Beat at={0.1} className="mb-8">
        <div className="grid items-center gap-6 border bg-white p-4 dark:bg-zinc-900/80 sm:grid-cols-[220px_1fr] sm:p-6">
          <ClockFace
            color={color}
            hours24={15}
            minutes={0}
            innerRing
            size={220}
            ariaLabel="Tarcza zegara z dwoma pierścieniami cyfr — zewnętrznym 1 do 12 i wewnętrznym 13 do 24 — wskazówki na godzinie 15:00"
          />
          <div className="space-y-3 text-sm leading-relaxed sm:text-base">
            <p>
              <strong style={{ color: textColor }}>Zewnętrzny pierścień</strong> (duże cyfry) — to
              zwykły zapis 12-godzinny, taki jak na każdym zegarze ze wskazówkami.
            </p>
            <p>
              <strong style={{ color: textColor }}>Wewnętrzny pierścień</strong> (małe cyfry) — to
              zapis 24-godzinny. Wskazówka godzinowa stoi w tym samym miejscu dla „3” i dla „15” —
              to naprawdę ta sama godzina, tylko nazwana inaczej.
            </p>
          </div>
        </div>
      </Beat>

      <Beat at={0.35}>
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Kliknij każdą tarczę, żeby zobaczyć oba zapisy naraz.
        </p>
      </Beat>

      <Beat at={0.45}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {NOTATION_EXAMPLES.map(({ hours24, minutes, context }) => {
            const d24 = digital24(hours24, minutes);
            const d12 = digital12(hours24, minutes);
            return (
              <ClockCard
                key={`${hours24}-${minutes}`}
                color={color}
                hours24={hours24}
                minutes={minutes}
                innerRing
                context={context}
                reveal={
                  <p>
                    <span className="font-mono font-black tabular-nums" style={{ color }}>
                      {d24}
                    </span>{' '}
                    to{' '}
                    <span className="font-semibold" style={{ color: textColor }}>
                      {d12}
                    </span>
                  </p>
                }
                srRevealText={`${d24}, czyli ${d12}`}
                ariaLabel={`Tarcza zegara pokazująca godzinę ${d24}`}
              />
            );
          })}
        </div>
      </Beat>
    </>
  );
}
