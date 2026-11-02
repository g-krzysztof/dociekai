'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { CITY, flow, LENGTH_KM, NODES, nodeX, SPRING, startHeights, terrainAt, type FlowResult } from './akwedukt';

const W = 360;
const H = 230;
const X0 = 22;
const XW = 316;
const Y0 = 205;
const KY = 1.5;
const sx = (x: number) => Math.round((X0 + x * XW) * 10) / 10;
const sy = (h: number) => Math.round((Y0 - h * KY) * 10) / 10;
const MAX_H = 120;

/**
 * Blok 1 — **Akwedukt**. Gest: dziecko przeciąga w pionie sześć punktów
 * kanału (albo strzałkami) między źródłem a miastem i puszcza wodę. Nad ziemią
 * rysują się łuki, pod ziemią tunel. Woda staje na pierwszym odcinku, który
 * idzie pod górę, albo przy zbyt wysokim moście.
 */
export function AkweduktWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [h, setH] = useState<number[]>(startHeights);
  const [result, setResult] = useState<FlowResult | null>(null);
  const [run, setRun] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<number | null>(null);
  const reported = useRef(false);
  const ok = result?.ok === true;

  useEffect(() => {
    if (ok && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [ok, onDone]);

  const setNode = (i: number, v: number) => {
    setResult(null);
    setH((prev) => prev.map((x, j) => (j === i ? Math.max(0, Math.min(MAX_H, Math.round(v))) : x)));
  };

  const fromPointer = (clientY: number) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const p = new DOMPoint(0, clientY).matrixTransform(ctm.inverse());
    return (Y0 - p.y) / KY;
  };

  // Teren i kanał próbkowane do rysunku.
  const terrainPts = Array.from({ length: 81 }, (_, k) => k / 80);
  const terrainPath = `M${sx(0)},${H} ` + terrainPts.map((x) => `L${sx(x)},${sy(terrainAt(x))}`).join(' ') + ` L${sx(1)},${H} Z`;
  const channel = h.map((v, i) => `${sx(nodeX(i))},${sy(v)}`).join(' ');

  const channelAt = (x: number) => {
    const seg = Math.min(NODES - 2, Math.floor(x * (NODES - 1)));
    const t = x * (NODES - 1) - seg;
    return h[seg] + (h[seg + 1] - h[seg]) * t;
  };
  const samples = Array.from({ length: 65 }, (_, k) => {
    const x = k / 64;
    return { x, c: channelAt(x), g: terrainAt(x) };
  });
  // Łuki mostu: filary od kanału do ziemi; tunel: kreskowany kanał pod ziemią.
  const piers = samples.filter((p) => p.c > p.g + 2);
  const tunnels = samples.slice(0, -1).filter((p) => p.c < p.g - 2);

  const waterNodes = result && !result.ok ? result.stopAt + 1 : NODES;
  const water = h
    .slice(0, waterNodes)
    .map((v, i) => `${sx(nodeX(i))},${sy(v) - 1.5}`)
    .join(' ');

  return (
    <div className="space-y-3">
      <div className="border bg-[#eef3f6] dark:bg-zinc-900">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full touch-none select-none"
          onPointerMove={(e) => {
            if (drag.current === null) return;
            const v = fromPointer(e.clientY);
            if (v !== null) setNode(drag.current, v);
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          role="group"
          aria-label="Profil trasy akweduktu od źródła w górach do miasta"
        >
          <path d={terrainPath} fill="#d9cba5" stroke="#a08b5c" strokeWidth={1} />
          <path d={`M${sx(0.56)},${sy(9)} L${sx(0.64)},${sy(9)}`} stroke="#60a5fa" strokeWidth={4} />
          {/* Łuki mostu: filary od kanału do ziemi. */}
          {piers.map((p) => (
            <line key={p.x} x1={sx(p.x)} x2={sx(p.x)} y1={sy(p.c)} y2={sy(p.g)} stroke="#b8a37a" strokeWidth={3} />
          ))}
          {tunnels.map((p) => (
            <circle key={p.x} cx={sx(p.x)} cy={sy(p.c)} r={3.5} fill="none" stroke="#57534e" strokeWidth={1} />
          ))}
          <polyline points={channel} fill="none" stroke="#78716c" strokeWidth={3} strokeLinejoin="round" />
          {result && (
            <motion.polyline
              key={run}
              points={water}
              fill="none"
              stroke="#2563eb"
              strokeWidth={3}
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: 'linear' }}
            />
          )}
          {/* Źródło i miasto. */}
          <g>
            <circle cx={sx(0)} cy={sy(SPRING)} r={5} fill="#2563eb" />
            <text x={sx(0) + 2} y={sy(SPRING) - 9} fontSize={10} fill="#1e3a8a">
              źródło {SPRING} m
            </text>
            <rect x={sx(1) - 16} y={sy(CITY) - 14} width={14} height={14} fill="#a16207" />
            <rect x={sx(1) - 30} y={sy(CITY) - 10} width={12} height={10} fill="#a16207" />
            <text x={sx(1) - 2} y={sy(CITY) - 18} textAnchor="end" fontSize={10} fill="#78350f">
              miasto {CITY} m
            </text>
          </g>
          {/* Uchwyty. */}
          {h.map((v, i) =>
            i === 0 || i === NODES - 1 ? null : (
              <g
                key={i}
                role="slider"
                tabIndex={0}
                aria-label={`Wysokość kanału w punkcie ${i}`}
                aria-valuemin={0}
                aria-valuemax={MAX_H}
                aria-valuenow={v}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  (e.currentTarget.ownerSVGElement as SVGSVGElement).setPointerCapture(e.pointerId);
                  drag.current = i;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') setNode(i, v + (e.shiftKey ? 10 : 1));
                  if (e.key === 'ArrowDown') setNode(i, v - (e.shiftKey ? 10 : 1));
                }}
                className="cursor-ns-resize"
              >
                <circle cx={sx(nodeX(i))} cy={sy(v)} r={14} fill="transparent" />
                <circle cx={sx(nodeX(i))} cy={sy(v)} r={6} fill="#fff" stroke={color} strokeWidth={2.5} />
                <text x={sx(nodeX(i))} y={sy(v) - 10} textAnchor="middle" fontSize={9} fontWeight={700} fill="#44403c">
                  {v}
                </text>
              </g>
            )
          )}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setResult(flow(h));
            setRun((r) => r + 1);
          }}
          disabled={ok}
          className="inline-flex items-center gap-1.5 border-2 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          style={{ background: color, borderColor: color }}
        >
          <Droplets className="h-4 w-4" aria-hidden /> Puść wodę
        </button>
        <span className="text-xs text-muted-foreground">Przeciągaj białe punkty kanału w górę i w dół (albo strzałkami).</span>
      </div>

      <div aria-live="polite" className="text-sm leading-relaxed">
        {result && !result.ok && <p className="border border-destructive/50 bg-destructive/5 p-3 text-destructive">{result.message}</p>}
        {result?.ok && (
          <div className="space-y-2 border-2 p-3" style={{ borderColor: color }}>
            <p>
              <strong>Woda dopłynęła do miasta!</strong> Twój akwedukt: {result.tunnelKm} km w tunelu, {result.bridgeKm} km na
              łukach, najwyższy most {result.maxBridge} m. Spadek: {SPRING - CITY} m na {LENGTH_KM} km — metr na kilometr.
            </p>
            <p>
              Rzymianie umieli zbudować kanał, który spada zaledwie ok. 25 cm na kilometr — tak płynie woda przez Pont du
              Gard. Przez doliny prowadzili ją po łukach na stałej wysokości, przez góry — tunelami. Bez pomp, tylko dzięki
              temu, że woda zawsze płynie w dół.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
