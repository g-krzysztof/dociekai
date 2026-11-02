'use client';

import { useRef, useState, type PointerEvent } from 'react';

/**
 * Przypominajka L22 (z L19, dystans 3): Memfis leży w Dolnym Egipcie — z prądem
 * Nilu, czyli na północ. Dziecko ciągnie łódź od Teb; z prądem płynie lekko,
 * pod prąd ledwo drgnie. Most do tematu: Grecja nie ma takiej rzeki — drogą
 * Greków było morze.
 */
const TOP = 24; // ujście (północ)
const BOTTOM = 196; // Górny Egipt (południe)
const TEBY = 150;

export function NilPrzypominajka({ color }: { color: string }) {
  const [y, setY] = useState(TEBY);
  const [result, setResult] = useState<'memfis' | 'poludnie' | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const grab = useRef<number | null>(null);

  const toY = (e: PointerEvent<SVGSVGElement>) => {
    const box = svgRef.current!.getBoundingClientRect();
    return ((e.clientY - box.top) * 220) / box.height;
  };

  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (grab.current === null || result === 'memfis') return;
    const fy = toY(e);
    const delta = fy - grab.current;
    grab.current = fy;
    // z prądem (w górę mapy) łódź idzie za palcem, pod prąd — pięć razy wolniej
    const next = Math.max(TOP, Math.min(BOTTOM, y + (delta < 0 ? delta : delta / 5)));
    setY(next);
    if (next <= 52) setResult('memfis');
    else if (next >= BOTTOM - 4) setResult('poludnie');
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Płyniesz łodzią z Teb do Memfis, stolicy w Dolnym Egipcie. <strong>Pociągnij łódź</strong> — z prądem
        będzie lżej.
      </p>
      <div className="flex items-start gap-4">
        <svg
          ref={svgRef}
          viewBox="0 0 120 220"
          className="w-[110px] shrink-0 cursor-grab touch-none border bg-[#ead6a6]"
          role="img"
          aria-label="Nil od Górnego Egiptu do morza, łódź przy Tebach"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            grab.current = toY(e);
          }}
          onPointerMove={move}
          onPointerUp={() => (grab.current = null)}
          onPointerCancel={() => (grab.current = null)}
        >
          <path d="M0,0 H120 V14 Q60,30 0,14 Z" fill="#a9cbe0" />
          <path d="M62,220 C56,170 70,130 58,90 C50,60 66,40 60,16" fill="none" stroke="#3f7fae" strokeWidth="7" />
          <path d="M60,16 L40,8 M60,16 L80,8 M60,16 L60,4" stroke="#3f7fae" strokeWidth="3" />
          <circle cx="70" cy={TEBY} r="3" fill="#5b3a1a" />
          <text x="74" y={TEBY + 4} fontSize="10" fill="#3b2a12">Teby</text>
          {result === 'memfis' && (
            <>
              <circle cx="52" cy="46" r="3" fill="#5b3a1a" />
              <text x="4" y="42" fontSize="10" fill="#3b2a12">Memfis</text>
            </>
          )}
          <g transform={`translate(60 ${y.toFixed(1)})`}>
            <path d="M-10,0 Q0,8 10,0 Z" fill="#6b4423" />
            <path d="M0,0 V-12 L7,-3 Z" fill="#f5f0e1" stroke="#6b4423" strokeWidth="0.8" />
          </g>
        </svg>
        <div className="text-sm leading-relaxed">
          {result === 'poludnie' && (
            <p className="text-destructive">
              Ciężko szło — to było pod prąd, w stronę Górnego Egiptu. Dolny Egipt leży tam, dokąd płynie Nil.
            </p>
          )}
          {result === 'memfis' && (
            <p className="border-l-2 pl-3" style={{ borderColor: color }}>
              Nil płynie z południa na północ, więc Dolny Egipt jest na północy, przy morzu. Cały Egipt łączyła jedna
              rzeka. Grecja takiej rzeki nie ma — zobacz, co ją łączyło.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
