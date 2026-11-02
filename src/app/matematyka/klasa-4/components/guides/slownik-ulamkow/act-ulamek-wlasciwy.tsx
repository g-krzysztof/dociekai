'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GuideAct } from '../guide-act';
import { FractionPie } from '../../fraction-pie';
import { FractionNotation } from '../../fraction-notation';
import { CLASSIFY_EXAMPLES, type FractionExample } from './guide-content';

const VERDICT_LABEL: Record<FractionExample['verdict'], string> = {
  wlasciwy: 'Ułamek właściwy',
  calosc: 'To cała całość',
  niewlasciwy: 'Ułamek niewłaściwy',
};

export function ActUlamekWlasciwy({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <GuideAct id="ulamek-wlasciwy" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Ułamek właściwy</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Kliknij każdy przykład, żeby sprawdzić, czy to ułamek właściwy.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {CLASSIFY_EXAMPLES.map((example) => (
          <ExampleCard key={`${example.licznik}/${example.mianownik}`} example={example} color={color} />
        ))}
      </div>

      <div className="mt-6 border-l-4 p-4 sm:p-5" style={{ borderColor: color, backgroundColor: `${color}0c` }}>
        <p className="text-sm leading-relaxed sm:text-base">
          <strong style={{ color: textColor }}>Ułamek właściwy</strong> to taki, w którym licznik
          jest mniejszy od mianownika — zawsze mniejszy niż jedna całość.
        </p>
      </div>
    </GuideAct>
  );
}

function ExampleCard({ example, color }: { example: FractionExample; color: string }) {
  const [revealed, setRevealed] = useState(false);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  // Jeden okrąg nie zmieści więcej niż całość — licznik większy od mianownika
  // (5/3) rysuje się jako kilka pełnych kół plus jedno częściowe, co samo w
  // sobie pokazuje „więcej niż jedna całość" zamiast tego tłumaczyć słowami.
  const wholePies = Math.floor(example.licznik / example.mianownik);
  const remainder = example.licznik % example.mianownik;
  const pies = [...Array.from({ length: wholePies }, () => example.mianownik), ...(remainder > 0 ? [remainder] : [])];

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      className={cn(
        'flex cursor-pointer flex-col items-center gap-3 border p-4 text-center transition-all',
        !revealed && 'hover:-translate-y-0.5 hover:shadow-md'
      )}
      style={{ borderColor: revealed ? color : `${color}40` }}
    >
      <div className="flex items-center justify-center gap-1">
        {pies.map((filledCount, i) => (
          <div key={i} className="w-full max-w-[68px]">
            <FractionPie
              color={color}
              mianownik={example.mianownik}
              filled={new Set(Array.from({ length: filledCount }, (_, j) => j))}
              ariaLabel={`Koło z ${filledCount} z ${example.mianownik} części zamalowanych`}
            />
          </div>
        ))}
      </div>

      <FractionNotation licznik={example.licznik} mianownik={example.mianownik} color={color} licznikRevealed mianownikRevealed size="md" />

      {revealed ? (
        <div>
          <p className="text-sm font-bold" style={{ color: textColor }}>
            {VERDICT_LABEL[example.verdict]}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{example.note}</p>
        </div>
      ) : (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stuknij, żeby sprawdzić</p>
      )}
    </button>
  );
}
