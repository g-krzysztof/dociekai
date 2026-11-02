'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Beat, GuideAct } from '../guide-act';
import { SquareUnitZoom } from './square-unit-zoom';
import { ZOOM_CASES, zoomArea } from '../../../lib/area-units';
import { img } from '@/lib/media';

export function ActBokAPole({ color }: { color: string }) {
  return (
    <GuideAct id="bok-a-pole" mode="flow">
      <BokAPoleBody color={color} />
    </GuideAct>
  );
}

function BokAPoleBody({ color }: { color: string }) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<boolean[]>(() => ZOOM_CASES.map(() => false));
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const item = ZOOM_CASES[index] ?? ZOOM_CASES[ZOOM_CASES.length - 1];
  const allDone = done.every(Boolean);

  const markDone = (i: number) => {
    setDone((prev) => {
      if (prev[i]) return prev;
      const next = [...prev];
      next[i] = true;
      return next;
    });
  };

  return (
    <div>
      <div className="mb-6 grid items-center gap-8 lg:grid-cols-[1fr_240px]">
        <div>
          <h2 className="mb-4 text-2xl font-bold leading-snug sm:text-3xl">
            Bok rośnie 10 razy, a pole — 100 razy
          </h2>
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Tu prawie każdy się myli, więc lepiej to zobaczyć, niż zapamiętać. Złap uchwyt nad
            kwadratem i przesuwaj go powoli. Sterujesz <strong>jednym</strong> — długością boku. A
            liczba kratek nie idzie 1, 2, 3, tylko{' '}
            <strong style={{ color: textColor }}>1, 4, 9, 16…</strong>, bo każdy podział działa i
            wzdłuż, i w poprzek naraz.
          </p>
        </div>

        <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
          <Image
            src={img('/images/matematyka/przewodniki/jednostki-pola/tabliczka-czekolady-w-kwadraciki.jpg')}
            alt="Tabliczka czekolady podzielona na równe kwadratowe kostki, leżąca na jasnym papierze"
            width={240}
            height={180}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>

      {/* Przełącznik przypadków */}
      <div className="mb-3 flex flex-wrap gap-2">
        {ZOOM_CASES.map((zoomCase, i) => (
          <button
            key={zoomCase.id}
            type="button"
            onClick={() => setIndex(i)}
            className="cursor-pointer border px-3 py-2 font-mono text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={
              i === index
                ? { borderColor: color, backgroundColor: `${color}14`, color: textColor }
                : undefined
            }
          >
            1 {zoomCase.bigUnit} {done[i] ? '✓' : ''}
          </button>
        ))}
      </div>

      <SquareUnitZoom item={item} color={color} onReachTarget={() => markDone(index)} />

      <Beat at={0.6} className="mt-6">
        <div
          className="border-l-2 p-4"
          style={{ borderColor: color, backgroundColor: `${color}0d` }}
        >
          <p className="text-base leading-relaxed">
            To jest cała tajemnica tego przewodnika:{' '}
            <strong style={{ color: textColor }}>
              sąsiednie jednostki pola dzieli 100, a nie 10
            </strong>
            . Bok idzie ×10, ale pole ×10×10.
          </p>
        </div>
      </Beat>

      {allDone && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center font-mono text-lg font-bold tabular-nums"
          style={{ color }}
        >
          {ZOOM_CASES.map((zoomCase) => `1 ${zoomCase.bigUnit} = ${zoomArea(zoomCase)} ${zoomCase.smallUnit}`).join('   ·   ')}
        </motion.p>
      )}

      <ul className="sr-only">
        {ZOOM_CASES.map((zoomCase) => (
          <li key={zoomCase.id}>
            1 {zoomCase.bigUnit} = {zoomArea(zoomCase)} {zoomCase.smallUnit}, bo bok jest{' '}
            {zoomCase.sideRatio} razy dłuższy.
          </li>
        ))}
      </ul>
    </div>
  );
}
