'use client';

import { Beat, GuideAct } from '../guide-act';
import {
  angleMarker,
  rightAngleMarker,
  type GeoPoint as Pt,
} from '../../../lib/lines';

const ANGLE_A: Pt = { x: 30, y: 110 };
const ANGLE_B: Pt = { x: 90, y: 30 };
const ANGLE_C: Pt = { x: 160, y: 70 };
const ANGLE_RADIUS = 24;
const ANGLE_MARK = angleMarker(ANGLE_B, ANGLE_A, ANGLE_C, ANGLE_RADIUS, 15);

const PERP_CENTER: Pt = { x: 70, y: 50 };
const PERP_ARM = 38;
const PERP_LEFT: Pt = { x: PERP_CENTER.x - PERP_ARM, y: PERP_CENTER.y };
const PERP_RIGHT: Pt = { x: PERP_CENTER.x + PERP_ARM, y: PERP_CENTER.y };
const PERP_TOP: Pt = { x: PERP_CENTER.x, y: PERP_CENTER.y - PERP_ARM };
const PERP_BOTTOM: Pt = { x: PERP_CENTER.x, y: PERP_CENTER.y + PERP_ARM };
const PERP_MARK = rightAngleMarker(PERP_CENTER, PERP_TOP, PERP_RIGHT, 14);

export function ActKatISymbole({ color }: { color: string }) {
  return (
    <GuideAct id="kat-i-symbole" mode="flow">
      <KatISymboleBody color={color} />
    </GuideAct>
  );
}

function KatISymboleBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Kąt i trzy symbole</h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Ostatni kawałek języka geometrii — jak nazwać kąt i trzy symbole, które oszczędzają
        rysowania kątomierza za każdym razem.
      </p>

      <Beat at={0.15} className="mb-8">
        <div className="grid items-center gap-6 sm:grid-cols-[180px_1fr]">
          <svg
            viewBox="0 0 180 140"
            className="mx-auto h-auto w-full max-w-[180px]"
            role="img"
            aria-label="Kąt ABC z wierzchołkiem w punkcie B"
          >
            <line x1={ANGLE_A.x} y1={ANGLE_A.y} x2={ANGLE_B.x} y2={ANGLE_B.y} stroke={color} strokeWidth={2.5} />
            <line x1={ANGLE_B.x} y1={ANGLE_B.y} x2={ANGLE_C.x} y2={ANGLE_C.y} stroke={color} strokeWidth={2.5} />
            <path
              d={`M ${ANGLE_MARK.arcStart.x} ${ANGLE_MARK.arcStart.y} A ${ANGLE_RADIUS} ${ANGLE_RADIUS} 0 0 ${ANGLE_MARK.sweepFlag} ${ANGLE_MARK.arcEnd.x} ${ANGLE_MARK.arcEnd.y}`}
              fill="none"
              stroke={textColor}
              strokeWidth={2}
            />
            <circle cx={ANGLE_MARK.dot.x} cy={ANGLE_MARK.dot.y} r={2.5} fill={textColor} />
            <circle cx={ANGLE_A.x} cy={ANGLE_A.y} r={4} fill={color} />
            <circle cx={ANGLE_B.x} cy={ANGLE_B.y} r={4} fill={color} />
            <circle cx={ANGLE_C.x} cy={ANGLE_C.y} r={4} fill={color} />
            <text x={ANGLE_A.x - 18} y={ANGLE_A.y + 14} style={{ fontSize: 16, fontWeight: 800 }} fill={textColor}>
              A
            </text>
            <text x={ANGLE_B.x - 4} y={ANGLE_B.y - 10} style={{ fontSize: 16, fontWeight: 800 }} fill={textColor}>
              B
            </text>
            <text x={ANGLE_C.x + 6} y={ANGLE_C.y - 4} style={{ fontSize: 16, fontWeight: 800 }} fill={textColor}>
              C
            </text>
          </svg>
          <div>
            <p className="mb-2 text-sm leading-relaxed sm:text-base">
              Kąt nazywamy <strong>trzema literami</strong> — środkowa to zawsze wierzchołek. Ten
              kąt to{' '}
              <strong className="font-mono" style={{ color }}>
                ∠ABC
              </strong>{' '}
              (wierzchołek w{' '}
              <strong className="font-mono" style={{ color }}>
                B
              </strong>
              ).
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Wielkość kąta mierzymy w <strong style={{ color: textColor }}>stopniach</strong>,
              symbol{' '}
              <strong className="font-mono" style={{ color }}>
                °
              </strong>{' '}
              — np. kąt prosty to zawsze{' '}
              <strong className="font-mono" style={{ color }}>
                90°
              </strong>
              .
            </p>
          </div>
        </div>
      </Beat>

      <Beat at={0.4}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border p-4 sm:p-5">
            <div className="mb-3 flex justify-center">
              <svg viewBox="0 0 140 100" className="h-auto w-28" role="img" aria-label="Dwie proste prostopadłe">
                <line x1={PERP_LEFT.x} y1={PERP_LEFT.y} x2={PERP_RIGHT.x} y2={PERP_RIGHT.y} stroke={color} strokeWidth={2.5} />
                <line x1={PERP_TOP.x} y1={PERP_TOP.y} x2={PERP_BOTTOM.x} y2={PERP_BOTTOM.y} stroke={color} strokeWidth={2.5} />
                <path
                  d={`M ${PERP_MARK.onLine1.x} ${PERP_MARK.onLine1.y} L ${PERP_MARK.outer.x} ${PERP_MARK.outer.y} L ${PERP_MARK.onLine2.x} ${PERP_MARK.onLine2.y}`}
                  fill="none"
                  stroke={textColor}
                  strokeWidth={1.5}
                />
              </svg>
            </div>
            <p className="text-center text-sm leading-relaxed sm:text-base">
              Proste przecinają się pod kątem prostym →{' '}
              <strong className="font-mono" style={{ color }}>
                ⊥
              </strong>{' '}
              <span className="text-muted-foreground">(prostopadłe)</span>
            </p>
          </div>
          <div className="border p-4 sm:p-5">
            <div className="mb-3 flex justify-center">
              <svg viewBox="0 0 140 100" className="h-auto w-28" role="img" aria-label="Dwie proste równoległe">
                <line x1={20} y1={30} x2={120} y2={30} stroke={color} strokeWidth={2.5} />
                <line x1={20} y1={70} x2={120} y2={70} stroke={color} strokeWidth={2.5} />
                <line x1={65} y1={22} x2={60} y2={38} stroke={textColor} strokeWidth={2} />
                <line x1={65} y1={62} x2={60} y2={78} stroke={textColor} strokeWidth={2} />
              </svg>
            </div>
            <p className="text-center text-sm leading-relaxed sm:text-base">
              Proste nigdy się nie przetną, zawsze w tej samej odległości →{' '}
              <strong className="font-mono" style={{ color }}>
                ∥
              </strong>{' '}
              <span className="text-muted-foreground">(równoległe)</span>
            </p>
          </div>
        </div>
      </Beat>
    </>
  );
}
