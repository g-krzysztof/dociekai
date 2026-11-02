'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';

/**
 * R (poza postępem) — **Mapa „T w O”**. Średniowieczne mapy świata kładły
 * wschód u góry (F-II.4-20): Azja na górnej połowie koła, Europa i Afryka na
 * dole, rozdzielone kreską „T”. Dziecko **obraca mapę palcem po okręgu**, aż
 * Europa trafi na swoje dzisiejsze miejsce (północny zachód) — obrót o 90°
 * zgodnie ze wskazówkami zegara. Po puszczeniu mapa dosuwa się do pełnej
 * ćwiartki.
 */

const R = 92;

export function MapaTO({ color }: { color: string }) {
  const [angle, setAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const last = useRef<number | null>(null);
  const box = useRef<SVGSVGElement>(null);

  const norm = (((Math.round(angle / 90) * 90) % 360) + 360) % 360;
  const solved = !dragging && norm === 90;

  const pointerAngle = (e: PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    return (
      (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) /
      Math.PI
    );
  };

  return (
    <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
      <div className="mx-auto">
        <p className="mb-1 text-center text-xs font-semibold text-muted-foreground">
          ↑ góra kartki
        </p>
        <svg
          ref={box}
          viewBox="-110 -110 220 220"
          className="h-[220px] w-[220px] cursor-grab touch-none select-none"
          role="slider"
          tabIndex={0}
          aria-label="Mapa T w O — obróć ją"
          aria-valuenow={norm}
          aria-valuemin={0}
          aria-valuemax={270}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp')
              setAngle((a) => Math.round(a / 90) * 90 + 90);
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown')
              setAngle((a) => Math.round(a / 90) * 90 - 90);
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            last.current = pointerAngle(e);
            setDragging(true);
          }}
          onPointerMove={(e) => {
            if (last.current === null) return;
            const a = pointerAngle(e);
            let d = a - last.current;
            if (d > 180) d -= 360;
            if (d < -180) d += 360;
            last.current = a;
            setAngle((v) => v + d);
          }}
          onPointerUp={() => {
            last.current = null;
            setDragging(false);
            setAngle((v) => Math.round(v / 90) * 90);
          }}
          onPointerCancel={() => {
            last.current = null;
            setDragging(false);
          }}
        >
          <g
            transform={`rotate(${Math.round(angle * 10) / 10})`}
            style={{ transition: dragging ? 'none' : 'transform 0.25s ease-out' }}
          >
            <circle r={R + 10} fill="#cfe2ea" stroke="#4f86a8" strokeWidth={1.5} />
            <circle r={R} fill="#f4ecd9" stroke="#2b2118" strokeWidth={1.5} />
            {/* Kreska T: pozioma — rzeki Don i Nil, pionowa — Morze Śródziemne. */}
            <path d={`M${-R},0 L${R},0 M0,0 L0,${R}`} stroke="#4f86a8" strokeWidth={6} />
            <Label x={0} y={-42} text="AZJA" angle={angle} />
            <Label x={-46} y={48} text="EUROPA" angle={angle} highlight={solved} color={color} />
            <Label x={46} y={48} text="AFRYKA" angle={angle} />
            <Label x={0} y={-R - 2} text="wschód" angle={angle} small />
          </g>
        </svg>
      </div>

      <div className="text-sm leading-relaxed">
        <p>
          Tak wyglądały mapy świata w średniowieczu: koło (O) przecięte wodą w kształt litery T. U
          góry — <strong>Azja</strong>, czyli wschód. Na dole Europa i Afryka.
        </p>
        <p className="mt-2 flex items-center gap-1.5 font-semibold" style={{ color }}>
          <RotateCw className="h-4 w-4" aria-hidden /> Obróć mapę palcem, aż Europa znajdzie się
          tam, gdzie leży na dzisiejszych mapach.
        </p>
        {solved && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-2"
            style={{ backgroundColor: `${color}14` }}
          >
            Teraz u góry jest <strong>północ</strong>, jak na dzisiejszych mapach: Europa w lewym
            górnym rogu, Azja na prawo, Afryka na dole. Średniowieczni kartografowie kładli u góry
            wschód, bo tam, na krańcu Azji, umieszczali raj. Po łacinie wschód to <em>oriens</em> —
            stąd nasze słowo „orientacja”: dawniej znaczyło ustawienie czegoś w stronę wschodu.
          </motion.p>
        )}
      </div>
    </div>
  );
}

function Label({
  x,
  y,
  text,
  angle,
  small,
  highlight,
  color,
}: {
  x: number;
  y: number;
  text: string;
  angle: number;
  small?: boolean;
  highlight?: boolean;
  color?: string;
}) {
  // Napis kręci się z mapą, ale zostaje poziomy — łatwiej go przeczytać.
  return (
    <text
      x={x}
      y={y}
      transform={`rotate(${-Math.round(angle * 10) / 10} ${x} ${y})`}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={small ? 10 : 14}
      fontWeight={small ? 400 : 700}
      fontStyle={small ? 'italic' : undefined}
      fill={highlight ? color : '#2b2118'}
    >
      {text}
    </text>
  );
}
