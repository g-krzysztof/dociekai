'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Beat, GuideAct } from '../guide-act';
import { CompletionStamp } from '../../completion-stamp';
import { SolidSpinner } from '../../solid-spinner';
import { DimensionDial } from './dimension-dial';

const MIN = 2;
const MAX = 6;

export function ActProstopadloscianISzescian({ color }: { color: string }) {
  const [dims, setDims] = useState({ width: 5, height: 3, depth: 4 });
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const isCube = dims.width === dims.height && dims.height === dims.depth;

  const set = (key: keyof typeof dims) => (value: number) =>
    setDims((prev) => ({ ...prev, [key]: value }));

  return (
    <GuideAct id="prostopadloscian-i-szescian" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">
        Prostopadłościan i sześcian
      </h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Całe pudełko opisują trzy liczby: długość, szerokość i wysokość. Ustaw je sam i sprawdź,
        kiedy prostopadłościan przestaje być zwykłym pudełkiem.
      </p>

      <div className="relative grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[280px_1fr]">
        <SolidSpinner
          spec={{ width: dims.width, height: dims.height, depth: dims.depth }}
          color={color}
          ariaLabel={`Prostopadłościan o wymiarach ${dims.width} na ${dims.depth} na ${dims.height}, do obracania`}
        />

        <div>
          <div className="space-y-4">
            <DimensionDial
              label="Długość"
              value={dims.width}
              min={MIN}
              max={MAX}
              color={color}
              onChange={set('width')}
            />
            <DimensionDial
              label="Szerokość"
              value={dims.depth}
              min={MIN}
              max={MAX}
              color={color}
              onChange={set('depth')}
            />
            <DimensionDial
              label="Wysokość"
              value={dims.height}
              min={MIN}
              max={MAX}
              color={color}
              onChange={set('height')}
            />
          </div>

          <div className="mt-5 border-t pt-4">
            <p className="font-mono text-xl font-black tabular-nums" style={{ color }}>
              {dims.width} × {dims.depth} × {dims.height}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={isCube ? 'szescian' : 'prostopadloscian'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-1 text-sm leading-relaxed sm:text-base"
              >
                {isCube ? (
                  <>
                    Wszystkie trzy wymiary równe — każda ściana jest teraz{' '}
                    <strong style={{ color: textColor }}>kwadratem</strong>. Taki prostopadłościan
                    ma własną nazwę: <strong style={{ color: textColor }}>sześcian</strong>.
                  </>
                ) : (
                  <>
                    Zwykły <strong style={{ color: textColor }}>prostopadłościan</strong> — ściany są
                    prostokątami. Ustaw wszystkie trzy liczby na tę samą wartość i zobacz, co się
                    stanie.
                  </>
                )}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {isCube && <CompletionStamp label="To sześcian!" className="right-4 top-4 sm:right-6" />}
      </div>

      <Beat at={0.4} className="mt-8">
        <div
          className="border-l-4 p-5 sm:p-6"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <p className="text-base leading-relaxed sm:text-lg">
            <strong style={{ color: textColor }}>Każdy sześcian jest prostopadłościanem</strong>, ale
            nie każdy prostopadłościan jest sześcianem — tak samo jak każdy kwadrat jest
            prostokątem, ale nie odwrotnie. Sześcian to po prostu prostopadłościan, któremu wszystkie
            dwanaście krawędzi wyszło równej długości.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Liczba ścian, krawędzi i wierzchołków nie zmienia się przy tym ani o jeden: sześć,
            dwanaście, osiem — niezależnie od tego, jak przesuniesz suwaki.
          </p>
        </div>
      </Beat>
    </GuideAct>
  );
}
