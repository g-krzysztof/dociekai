'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Eraser, Undo2 } from 'lucide-react';
import {
  CLAY_H,
  CLAY_W,
  ORDERS,
  SIGN_ZONE,
  judgeTablet,
  strokeToWedge,
  wedgeValue,
  type TabletVerdict,
  type Wedge,
} from './pismo';

/**
 * Blok 2 (symulator): **gliniana tabliczka.** Dziecko odciska rylcem kliny
 * w mokrej glinie: pociągnięcie w dół — klin pionowy (1), w bok — klin kątowy
 * (10). To prawdziwe liczebniki pisma klinowego. Obok liczby stoi znak towaru
 * (owca — koło z krzyżem, jęczmień — kłos; uproszczone rysunki dawnych znaków
 * sumeryjskich). Trzy zamówienia; sędzia liczy kliny i pilnuje, żeby dziesiątki
 * stały po lewej. Znaki rysuje SVG, nie generator obrazów.
 */

export function WedgeShape({ w, fill = '#4a3624' }: { w: Wedge; fill?: string }) {
  const { x, y } = w;
  if (w.kind === 'pionowy') {
    return (
      <g>
        <polygon points={`${x - 8},${y} ${x + 8},${y} ${x},${y + 11}`} fill={fill} />
        <line x1={x} y1={y + 10} x2={x} y2={y + 34} stroke={fill} strokeWidth="2.4" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <polygon points={`${x - 11},${y} ${x + 9},${y - 11} ${x + 3},${y} ${x + 9},${y + 11}`} fill={fill} />
  );
}

function GoodSign({ good }: { good: 'owca' | 'jeczmien' }) {
  const c = '#4a3624';
  if (good === 'owca')
    return (
      <g stroke={c} strokeWidth="3" fill="none">
        <circle cx="46" cy="100" r="26" />
        <line x1="20" y1="100" x2="72" y2="100" />
        <line x1="46" y1="74" x2="46" y2="126" />
      </g>
    );
  return (
    <g stroke={c} strokeWidth="3" fill="none" strokeLinecap="round">
      <line x1="46" y1="62" x2="46" y2="140" />
      {[72, 88, 104].map((y) => (
        <g key={y}>
          <line x1="46" y1={y + 10} x2="30" y2={y} />
          <line x1="46" y1={y + 10} x2="62" y2={y} />
        </g>
      ))}
    </g>
  );
}

export function TabliczkaWidget({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [wedges, setWedges] = useState<Wedge[]>([]);
  const [drag, setDrag] = useState<{ x0: number; y0: number; x: number; y: number } | null>(null);
  const [verdict, setVerdict] = useState<TabletVerdict | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const reported = useRef(false);

  const finished = step >= ORDERS.length;
  const order = ORDERS[Math.min(step, ORDERS.length - 1)];
  const accepted = verdict?.ok === true;

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [finished, onComplete]);

  const toSvg = (e: ReactPointerEvent) => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: Math.round(p.x), y: Math.round(p.y) };
  };

  const down = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (accepted || finished) return;
    const p = toSvg(e);
    if (!p) return;
    if (p.x < SIGN_ZONE) {
      setHint('Tu stoi znak towaru. Liczbę odciskaj obok, na gładkiej glinie.');
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x0: p.x, y0: p.y, x: p.x, y: p.y });
  };

  const move = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    const p = toSvg(e);
    if (p) setDrag({ ...drag, x: p.x, y: p.y });
  };

  const up = () => {
    if (!drag) return;
    const kind = strokeToWedge(drag.x - drag.x0, drag.y - drag.y0);
    setDrag(null);
    if (!kind) {
      setHint('Glina tylko się wgniotła. Pociągnij rylcem: w dół albo w bok.');
      return;
    }
    setHint(null);
    setVerdict(null);
    const x = Math.min(Math.max(drag.x0, SIGN_ZONE + 12), CLAY_W - 12);
    const y = Math.min(Math.max(drag.y0, 14), CLAY_H - (kind === 'pionowy' ? 38 : 14));
    setWedges((w) => [...w, { kind, x, y }]);
  };

  const check = () => setVerdict(judgeTablet(wedges, order.n));

  const next = () => {
    setStep((s) => s + 1);
    setWedges([]);
    setVerdict(null);
    setHint(null);
  };

  const preview = drag ? strokeToWedge(drag.x - drag.x0, drag.y - drag.y0) : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-3 border p-2">
          <svg viewBox="0 0 60 50" className="h-10 w-12 shrink-0" aria-hidden>
            <WedgeShape w={{ kind: 'pionowy', x: 30, y: 6 }} />
          </svg>
          <span>
            <strong>Pociągnij w dół</strong> — klin pionowy = <strong>1</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 border p-2">
          <svg viewBox="0 0 60 50" className="h-10 w-12 shrink-0" aria-hidden>
            <WedgeShape w={{ kind: 'katowy', x: 30, y: 25 }} />
          </svg>
          <span>
            <strong>Pociągnij w bok</strong> — klin kątowy = <strong>10</strong>
          </span>
        </div>
      </div>

      {!finished && (
        <>
          <p className="text-sm font-semibold">
            Zamówienie {step + 1} z {ORDERS.length}: zapisz <span style={{ color }}>{order.n}</span>{' '}
            {order.good === 'owca' ? 'przy znaku owcy' : 'przy znaku jęczmienia'}.
          </p>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CLAY_W} ${CLAY_H}`}
            className="block h-auto w-full max-w-[520px] cursor-crosshair touch-none select-none"
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={() => setDrag(null)}
            role="img"
            aria-label={`Gliniana tabliczka: ${wedges.length} klinów, razem ${wedgeValue(wedges)}`}
          >
            <defs>
              <radialGradient id="glina" cx="50%" cy="40%" r="75%">
                <stop offset="0%" stopColor="#c9a37a" />
                <stop offset="100%" stopColor="#a8825c" />
              </radialGradient>
            </defs>
            <rect x="2" y="2" width={CLAY_W - 4} height={CLAY_H - 4} fill="url(#glina)" stroke="#7d5c3c" strokeWidth="2" />
            <line x1={SIGN_ZONE} y1="10" x2={SIGN_ZONE} y2={CLAY_H - 10} stroke="#7d5c3c" strokeWidth="1.5" />
            <GoodSign good={order.good} />
            {wedges.map((w, i) => (
              <WedgeShape key={i} w={w} />
            ))}
            {drag && (
              <>
                <line x1={drag.x0} y1={drag.y0} x2={drag.x} y2={drag.y} stroke="#4a3624" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="3 3" />
                {preview && <WedgeShape w={{ kind: preview, x: drag.x0, y: drag.y0 }} fill="#4a362488" />}
              </>
            )}
          </svg>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={check}
              disabled={accepted || wedges.length === 0}
              className="border px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: color, borderColor: color }}
            >
              Oddaj tabliczkę
            </button>
            <button
              type="button"
              onClick={() => {
                setWedges((w) => w.slice(0, -1));
                setVerdict(null);
              }}
              disabled={accepted || wedges.length === 0}
              className="inline-flex items-center gap-1.5 border px-3 py-2 text-sm disabled:opacity-50"
            >
              <Undo2 className="h-4 w-4" /> Cofnij klin
            </button>
            <button
              type="button"
              onClick={() => {
                setWedges([]);
                setVerdict(null);
              }}
              disabled={accepted || wedges.length === 0}
              className="inline-flex items-center gap-1.5 border px-3 py-2 text-sm disabled:opacity-50"
            >
              <Eraser className="h-4 w-4" /> Wygładź glinę
            </button>
            <span className="ml-auto font-mono text-sm tabular-nums text-muted-foreground" aria-live="polite">
              na tabliczce: {wedgeValue(wedges)}
            </span>
          </div>
          {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
          {verdict && (
            <div
              className="space-y-2 border-l-2 pl-3 text-sm leading-relaxed"
              style={{ borderColor: verdict.ok ? color : 'hsl(var(--destructive))' }}
              role="status"
            >
              <p>{verdict.text}</p>
              {verdict.ok && (
                <button type="button" onClick={next} className="border px-3 py-1.5 text-sm font-semibold" style={{ borderColor: color, color }}>
                  {step + 1 < ORDERS.length ? 'Następne zamówienie' : 'Wypal tabliczki'}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {finished && (
        <div className="space-y-2 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <p>
            Trzy tabliczki wyschły na słońcu. Teraz każdy pisarz w mieście odczyta je tak samo — także za sto
            lat. Dlatego archeolodzy znajdują dziś setki tysięcy takich tabliczek.
          </p>
          <p>
            Najpierw Sumerowie rysowali rzeczy: owcę, kłos, dzban. Ale rysunków trzeba było tysięcy, a z
            obrazka nie zawsze wiadomo, co znaczy — słońce to „słońce”, „dzień” czy „ciepło”? Rysunek
            w glinie był też trudny, więc z czasem znaki uprościły się do kilku kresek odciskanych trójkątnym
            końcem trzciny. Tak powstało <strong>pismo klinowe</strong>, którego ludzie używali przez około
            dwa tysiące lat.
          </p>
        </div>
      )}
    </div>
  );
}
