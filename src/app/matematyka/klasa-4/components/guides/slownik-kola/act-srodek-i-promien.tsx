'use client';

import { useState } from 'react';
import { Beat, GuideAct } from '../guide-act';
import { CircleFigure } from '../../circle-figure';
import { PartChip } from '../part-chip';
import { CIRCLE_DIAGRAM } from './guide-content';
import { radiusFan } from '../../../lib/circle';
import { round } from '../../../lib/lines';

const FAN_POINTS = radiusFan(CIRCLE_DIAGRAM.center, CIRCLE_DIAGRAM.radius, 8);

export function ActSrodekIPromien({ color }: { color: string }) {
  const [srodek, setSrodek] = useState(false);
  const [promien, setPromien] = useState(false);
  const bothRevealed = srodek && promien;
  const viewSize = round((CIRCLE_DIAGRAM.center.x + CIRCLE_DIAGRAM.radius) * 2);

  return (
    <GuideAct id="srodek-i-promien" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Środek i promień</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Kliknij obie etykiety, żeby zobaczyć, co dokładnie oznaczają na rysunku.
      </p>

      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[220px_1fr]">
        <CircleFigure
          color={color}
          diagram={CIRCLE_DIAGRAM}
          ariaLabel="Koło ze środkiem i promieniem"
          parts={{
            srodek: { shown: true, active: srodek, label: 'środek' },
            promien: { shown: true, active: promien, label: 'promień' },
          }}
        />

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <PartChip label="Środek" color={color} active={srodek} onClick={() => setSrodek(true)} />
            <PartChip label="Promień" color={color} active={promien} onClick={() => setPromien(true)} />
          </div>

          {srodek && (
            <p className="mb-2 text-sm leading-relaxed sm:text-base">
              <strong>Środek</strong> to punkt w samym sercu koła — każdy punkt okręgu jest od
              niego w tej samej odległości.
            </p>
          )}
          {promien && (
            <p className="text-sm leading-relaxed sm:text-base">
              <strong>Promień</strong> to odcinek łączący środek z dowolnym punktem na okręgu.
            </p>
          )}
          {!srodek && !promien && (
            <p className="text-sm text-muted-foreground">Zacznij od dowolnej etykiety.</p>
          )}
        </div>
      </div>

      {bothRevealed && (
        <Beat at={0.1} className="mt-6">
          <div
            className="grid items-center gap-6 border-l-4 p-5 sm:p-6 md:grid-cols-[220px_1fr]"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            <svg
              viewBox={`0 0 ${viewSize} ${viewSize}`}
              width={180}
              height={180}
              className="mx-auto h-auto w-full max-w-[180px]"
              role="img"
              aria-label="Osiem promieni w różnych kierunkach, wszystkie tej samej długości"
            >
              <circle
                cx={CIRCLE_DIAGRAM.center.x}
                cy={CIRCLE_DIAGRAM.center.y}
                r={CIRCLE_DIAGRAM.radius}
                fill="none"
                stroke={`${color}40`}
                strokeWidth={2}
              />
              {FAN_POINTS.map((point, i) => (
                <line
                  key={i}
                  x1={CIRCLE_DIAGRAM.center.x}
                  y1={CIRCLE_DIAGRAM.center.y}
                  x2={point.x}
                  y2={point.y}
                  stroke={color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              ))}
              <circle cx={CIRCLE_DIAGRAM.center.x} cy={CIRCLE_DIAGRAM.center.y} r={4} fill={color} />
            </svg>
            <p className="text-sm leading-relaxed sm:text-base">
              Promień poprowadzony w każdym kierunku ma <strong>dokładnie tę samą długość</strong>.
              Spróbuj znaleźć na tym rysunku promień, który jest inny — nie znajdziesz.
            </p>
          </div>
        </Beat>
      )}
    </GuideAct>
  );
}
