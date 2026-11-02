'use client';

import { CalculationCascade, type CascadeStepData } from './calculation-cascade';

const STEPS: CascadeStepData[] = [
  { segments: [{ text: '3 × (4 + 2) − 10 : 5 + 1' }], note: 'Zaczynamy — cały wzór na raz.' },
  {
    segments: [{ text: '3 × ' }, { text: '6', highlight: true }, { text: ' − 10 : 5 + 1' }],
    note: 'Nawiasy zawsze pierwsze: 4 + 2 = 6.',
  },
  {
    segments: [{ text: '18', highlight: true }, { text: ' − 10 : 5 + 1' }],
    note: 'Mnożenie i dzielenie przed +/− — liczymy od lewej: 3 × 6 = 18.',
  },
  {
    segments: [{ text: '18 − ' }, { text: '2', highlight: true }, { text: ' + 1' }],
    note: 'Zostało jeszcze dzielenie: 10 : 5 = 2.',
  },
  {
    segments: [{ text: '16', highlight: true }, { text: ' + 1' }],
    note: 'Teraz dodawanie i odejmowanie, od lewej: 18 − 2 = 16.',
  },
  { segments: [{ text: '17', highlight: true }], note: 'Ostatni krok: 16 + 1 = 17.' },
];

const RULES = [
  'Nawiasy zawsze pierwsze.',
  'Mnożenie i dzielenie przed dodawaniem i odejmowaniem.',
  'Działania o tym samym priorytecie — od lewej do prawej.',
];

interface CalculationCascadeIntroProps {
  color: string;
  onComplete?: () => void;
}

/** Nowe pojęcie: przypomnienie trzech zasad, a potem duże wyrażenie rozwiązywane samo, na oczach dziecka. */
export function CalculationCascadeIntro({ color, onComplete }: CalculationCascadeIntroProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <ol className="mb-6 grid gap-2 sm:grid-cols-3">
        {RULES.map((rule, index) => (
          <li
            key={rule}
            className="flex items-start gap-2 border-l-4 p-3 text-sm leading-relaxed"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            <span className="font-mono font-bold tabular-nums" style={{ color: textColor }}>
              {index + 1}.
            </span>
            <span>{rule}</span>
          </li>
        ))}
      </ol>

      <p className="mb-5 text-center text-sm text-muted-foreground sm:text-base">
        Teraz zobacz, jak te trzy zasady rozwiązują jedno duże wyrażenie — samo, krok po kroku.
      </p>

      <CalculationCascade
        steps={STEPS}
        color={color}
        ariaLabel="Rozwiąż samodzielnie: 3 razy (4 plus 2), minus 10 podzielić przez 5, plus 1"
        onComplete={onComplete}
      />
    </div>
  );
}
