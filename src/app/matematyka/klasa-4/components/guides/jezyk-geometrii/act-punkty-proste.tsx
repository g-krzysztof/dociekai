'use client';

import { GuideAct } from '../guide-act';
import { POINT_A, POINT_B, arrowheadPoints, extendPoint } from './guide-content';

const LINE_START = extendPoint(POINT_B, POINT_A, 50);
const LINE_END = extendPoint(POINT_A, POINT_B, 50);
const ARROW_START = arrowheadPoints(POINT_B, LINE_START);
const ARROW_END = arrowheadPoints(POINT_A, LINE_END);

export function ActPunktyProste({ color }: { color: string }) {
  return (
    <GuideAct id="punkty-proste" mode="flow">
      <PunktyProsteBody color={color} />
    </GuideAct>
  );
}

function PunktyProsteBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Punkty i proste</h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Dwa najprostsze obiekty w geometrii — i dwa różne sposoby ich nazywania.
      </p>

      <div className="mb-8 flex justify-center overflow-x-auto border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <svg
          viewBox="0 0 400 220"
          className="h-auto w-full max-w-md"
          role="img"
          aria-label="Prosta przechodząca przez punkty A i B"
        >
          <line
            x1={LINE_START.x}
            y1={LINE_START.y}
            x2={LINE_END.x}
            y2={LINE_END.y}
            stroke={color}
            strokeWidth={2.5}
          />
          <polygon points={ARROW_START} fill={color} />
          <polygon points={ARROW_END} fill={color} />
          <circle cx={POINT_A.x} cy={POINT_A.y} r={6} fill={color} />
          <circle cx={POINT_B.x} cy={POINT_B.y} r={6} fill={color} />
          <text x={POINT_A.x - 20} y={POINT_A.y + 6} style={{ fontSize: 20, fontWeight: 800 }} fill={textColor}>
            A
          </text>
          <text x={POINT_B.x + 12} y={POINT_B.y - 8} style={{ fontSize: 20, fontWeight: 800 }} fill={textColor}>
            B
          </text>
        </svg>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border-l-4 p-4 sm:p-5" style={{ borderColor: color, backgroundColor: `${color}0c` }}>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide" style={{ color: textColor }}>
            Punkt
          </p>
          <p className="text-sm leading-relaxed sm:text-base">
            Nazywamy go <strong>jedną wielką literą</strong> — tu punkty{' '}
            <strong className="font-mono" style={{ color }}>
              A
            </strong>{' '}
            i{' '}
            <strong className="font-mono" style={{ color }}>
              B
            </strong>
            .
          </p>
        </div>
        <div className="border-l-4 p-4 sm:p-5" style={{ borderColor: color, backgroundColor: `${color}0c` }}>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide" style={{ color: textColor }}>
            Prosta
          </p>
          <p className="text-sm leading-relaxed sm:text-base">
            Biegnie w nieskończoność w obie strony. Zapisujemy ją jako{' '}
            <strong className="font-mono" style={{ color }}>
              prosta AB
            </strong>{' '}
            (dwa punkty, które na niej leżą) albo jedną małą literą, np.{' '}
            <strong className="font-mono" style={{ color }}>
              prosta k
            </strong>
            . Kolejność liter nie ma znaczenia — prosta AB to ta sama prosta co BA.
          </p>
        </div>
      </div>
    </>
  );
}
