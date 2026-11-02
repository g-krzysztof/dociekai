'use client';

import { useState } from 'react';
import { Beat, GuideAct } from '../guide-act';
import { CircleFigure } from '../../circle-figure';
import { PartChip } from '../part-chip';
import { CIRCLE_DIAGRAM } from './guide-content';

export function ActSrednicaICieciwa({ color }: { color: string }) {
  const [srednica, setSrednica] = useState(false);
  const [cieciwa, setCieciwa] = useState(false);
  const bothRevealed = srednica && cieciwa;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <GuideAct id="srednica-i-cieciwa" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Średnica i cięciwa</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Obie łączą dwa punkty na okręgu — różnica jest tylko jedna. Kliknij, żeby ją zobaczyć.
      </p>

      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[220px_1fr]">
        <CircleFigure
          color={color}
          diagram={CIRCLE_DIAGRAM}
          ariaLabel="Koło ze średnicą i cięciwą"
          parts={{
            srodek: { shown: true, active: false },
            srednica: { shown: true, active: srednica, label: 'średnica' },
            cieciwa: { shown: true, active: cieciwa, label: 'cięciwa' },
          }}
        />

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <PartChip label="Średnica" color={color} active={srednica} onClick={() => setSrednica(true)} />
            <PartChip label="Cięciwa" color={color} active={cieciwa} onClick={() => setCieciwa(true)} />
          </div>

          {srednica && (
            <p className="mb-2 text-sm leading-relaxed sm:text-base">
              <strong>Średnica</strong> łączy dwa punkty okręgu i{' '}
              <strong>przechodzi przez środek</strong>. To zarazem najdłuższa możliwa cięciwa.
            </p>
          )}
          {cieciwa && (
            <p className="text-sm leading-relaxed sm:text-base">
              <strong>Cięciwa</strong> łączy dwa dowolne punkty okręgu — może, ale nie musi,
              przechodzić przez środek.
            </p>
          )}
          {!srednica && !cieciwa && (
            <p className="text-sm text-muted-foreground">Zacznij od dowolnej etykiety.</p>
          )}
        </div>
      </div>

      {bothRevealed && (
        <Beat at={0.1} className="mt-6">
          <div
            className="border-l-4 p-5 sm:p-6"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            <p className="mb-2 font-mono text-xl font-black" style={{ color: textColor }}>
              średnica = 2 × promień
            </p>
            <p className="text-sm leading-relaxed sm:text-base">
              Widziałeś to na rysunku: kreska w środku dzieli średnicę dokładnie na dwa promienie,
              ułożone w linii prostej, w przeciwne strony.
            </p>
          </div>
        </Beat>
      )}
    </GuideAct>
  );
}
