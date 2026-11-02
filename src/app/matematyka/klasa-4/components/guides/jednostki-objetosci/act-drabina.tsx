'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Beat, GuideAct } from '../guide-act';
import { UnitLadder } from '../../lessons/jednostki-dlugosci/unit-ladder';
import {
  LADDER_UNITS,
  VOLUME_STEP,
  VOLUME_UNITS,
  volumeStepRatio,
} from '../../../lib/volume-units';

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
        Cała drabinka idzie krokiem po tysiąc
      </h2>
      <p className="mb-6 max-w-2xl text-base leading-relaxed sm:text-lg">
        Drabinka długości szła krokiem ×10 i miała wyjątek przy kilometrze. Drabinka pola szła ×100,
        bez wyjątków. Drabinka objętości idzie{' '}
        <strong style={{ color: textColor }}>×{VOLUME_STEP.toLocaleString('pl-PL')}</strong> — też
        bez ani jednego wyjątku. Zejdź nią z metra sześciennego do centymetrów.
      </p>

      {/* Drabinka pokazuje trzy jednostki, które realnie się liczą. Dorzucenie
          mm³ oznaczałoby skok do miliarda — liczba przestałaby się mieścić na
          szczeblu i nic by nie wnosiła. Tabela niżej domyka komplet. */}
      <div className="mb-6">
        <UnitLadder
          units={LADDER_UNITS.map((unit) => ({ code: unit.code }))}
          stepRatio={volumeStepRatio}
          color={color}
          startIndex={LADDER_UNITS.length - 1}
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
          Jeden metr sześcienny to milion centymetrów sześciennych. Dwa szczeble, dwa razy po
          tysiąc — i stąd te sześć zer.
        </motion.p>
      )}

      <Beat at={0.4}>
        <div className="overflow-x-auto border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b" style={{ backgroundColor: `${color}0d` }}>
                <th className="px-4 py-2 font-semibold">Jednostka</th>
                <th className="px-4 py-2 font-semibold">To objętość sześcianu o krawędzi</th>
                <th className="px-4 py-2 font-semibold">To samo po „płynnemu”</th>
                <th className="px-4 py-2 font-semibold">Mniej więcej tyle ma</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {VOLUME_UNITS.map((unit) => (
                <tr key={unit.code}>
                  <td className="px-4 py-2">
                    <span className="font-mono text-base font-bold" style={{ color }}>
                      {unit.code}
                    </span>{' '}
                    <span className="text-muted-foreground">{unit.name}</span>
                  </td>
                  <td className="px-4 py-2">{unit.side}</td>
                  <td className="px-4 py-2 font-mono" style={{ color: textColor }}>
                    {unit.capacity ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{unit.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Milimetr sześcienny jest w tabeli dla porządku — w klasie 4 prawie się nim nie liczy, bo
          już 1 cm³ to jego tysiąc. Zapamiętaj środek drabinki: cm³, dm³ i m³.
        </p>
      </Beat>
    </div>
  );
}
