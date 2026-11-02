'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Beat, GuideAct } from '../guide-act';
import { CubeUnitZoom } from './cube-unit-zoom';
import { ZOOM_CASES, formatVolume, zoomVolume } from '../../../lib/volume-units';
import { img } from '@/lib/media';

export function ActBokAObjetosc({ color }: { color: string }) {
  return (
    <GuideAct id="bok-a-objetosc" mode="flow">
      <BokAObjetoscBody color={color} />
    </GuideAct>
  );
}

function BokAObjetoscBody({ color }: { color: string }) {
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
            Krawędź rośnie 10 razy, a objętość — 1000 razy
          </h2>
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Przy polu było ×100 i już to zaskakiwało. Tu jest jeszcze mocniej, więc lepiej to
            zobaczyć niż zapamiętać. Sterujesz <strong>jednym</strong> — długością krawędzi. A liczba
            kostek nie idzie 1, 2, 3, tylko{' '}
            <strong style={{ color: textColor }}>1, 8, 27, 64…</strong>, bo każdy podział działa
            wzdłuż, w poprzek i na wysokość naraz.
          </p>
        </div>

        <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
          <Image
            src={img('/images/matematyka/przewodniki/jednostki-objetosci/wieza-z-drewnianych-kostek.jpg')}
            alt="Drewniane klocki sześcienne ułożone w większy sześcian na jasnym blacie, kilka luźnych kostek obok"
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

      <CubeUnitZoom item={item} color={color} onReachTarget={() => markDone(index)} />

      <Beat at={0.6} className="mt-6">
        <div
          className="border-l-2 p-4"
          style={{ borderColor: color, backgroundColor: `${color}0d` }}
        >
          <p className="text-base leading-relaxed">
            To jest cała tajemnica tego przewodnika:{' '}
            <strong style={{ color: textColor }}>
              sąsiednie jednostki objętości dzieli 1000, a nie 10
            </strong>
            . Krawędź idzie ×10, ale objętość ×10×10×10. Rozsuń warstwy, a zobaczysz to jako{' '}
            <strong>100 kostek w warstwie razy 10 warstw</strong>.
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
          {ZOOM_CASES.map(
            (zoomCase) =>
              `1 ${zoomCase.bigUnit} = ${formatVolume(zoomVolume(zoomCase))} ${zoomCase.smallUnit}`,
          ).join('   ·   ')}
        </motion.p>
      )}

      <ul className="sr-only">
        {ZOOM_CASES.map((zoomCase) => (
          <li key={zoomCase.id}>
            1 {zoomCase.bigUnit} = {formatVolume(zoomVolume(zoomCase))} {zoomCase.smallUnit}, bo
            krawędź jest {zoomCase.sideRatio} razy dłuższa.
          </li>
        ))}
      </ul>
    </div>
  );
}
