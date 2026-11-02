'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Beat, GuideAct } from '../guide-act';
import { UnitLadder } from '../../lessons/jednostki-dlugosci/unit-ladder';
import { AREA_STEP, AREA_UNITS, areaStepRatio } from '../../../lib/area-units';

/** mm² … m² — część drabinki używana w szkole podstawowej. */
const SCHOOL_UNITS = AREA_UNITS.slice(0, 4);

export function ActDrabina({ color }: { color: string }) {
  return (
    <GuideAct id="drabina" mode="flow">
      <DrabinaBody color={color} />
    </GuideAct>
  );
}

function DrabinaBody({ color }: { color: string }) {
  const [reached, setReached] = useState(false);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold leading-snug sm:text-3xl">
        Cała drabinka idzie równym krokiem
      </h2>
      <p className="mb-6 max-w-2xl text-base leading-relaxed sm:text-lg">
        Drabinka jednostek długości miała wyjątek: z metrów na kilometry skacze się od razu o 1000.
        Drabinka pola nie ma <strong>ani jednego</strong> wyjątku — każdy szczebel to{' '}
        <strong style={{ color: textColor }}>×{AREA_STEP}</strong>. Zejdź nią z metra kwadratowego
        aż do milimetrów.
      </p>

      {/* Drabinka pokazuje cztery jednostki szkolne — cała siódemka rozpięłaby
          się na bilion i wartości przestałyby być czytelne. Ar, hektar i km²
          domyka tabela niżej. */}
      <div className="mb-6">
        <UnitLadder
          units={SCHOOL_UNITS.map((unit) => ({ code: unit.code }))}
          stepRatio={areaStepRatio}
          color={color}
          startIndex={SCHOOL_UNITS.length - 1}
          startValue={1}
          targetIndex={0}
          onReachTarget={() => setReached(true)}
        />
      </div>

      {reached && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center text-sm leading-relaxed"
          style={{ color: textColor }}
        >
          Jeden metr kwadratowy to milion milimetrów kwadratowych. Trzy szczeble, trzy razy po
          sto — i stąd te sześć zer.
        </motion.p>
      )}

      <Beat at={0.4}>
        <div className="overflow-x-auto border">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b" style={{ backgroundColor: `${color}0d` }}>
                <th className="px-4 py-2 font-semibold">Jednostka</th>
                <th className="px-4 py-2 font-semibold">To pole kwadratu o boku</th>
                <th className="px-4 py-2 font-semibold">Mniej więcej tyle ma</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {AREA_UNITS.map((unit) => (
                <tr key={unit.code}>
                  <td className="px-4 py-2">
                    <span className="font-mono text-base font-bold" style={{ color }}>
                      {unit.code}
                    </span>{' '}
                    <span className="text-muted-foreground">{unit.name}</span>
                  </td>
                  <td className="px-4 py-2">{unit.side}</td>
                  <td className="px-4 py-2 text-muted-foreground">{unit.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Beat>
    </div>
  );
}
