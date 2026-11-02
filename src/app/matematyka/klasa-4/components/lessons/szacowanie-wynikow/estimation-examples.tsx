'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface Example {
  id: string;
  label: string;
  steps: string;
  explain: string;
  warning?: boolean;
}

const EXAMPLES: Example[] = [
  {
    id: 'suma',
    label: '289 + 412 ≈ ?',
    steps: '300 + 400 = 700  (dokładnie: 701)',
    explain: 'Każdą liczbę zaokrąglasz do pełnych setek, a potem liczysz w pamięci. Szacunek 700 jest bardzo bliski dokładnemu wynikowi.',
  },
  {
    id: 'roznica',
    label: '5120 − 1890 ≈ ?',
    steps: '5000 − 2000 = 3000  (dokładnie: 3230)',
    explain: 'Zaokrąglasz obie liczby do pełnych tysięcy. Szacunek nie musi być idealny — ma dać dobre wyobrażenie o wyniku.',
  },
  {
    id: 'iloczyn',
    label: '62 × 8 ≈ ?',
    steps: '60 × 8 = 480  (dokładnie: 496)',
    explain: 'W mnożeniu czasem wystarczy zaokrąglić tylko jeden czynnik, żeby dało się policzyć w pamięci.',
  },
  {
    id: 'pulapka',
    label: 'Ktoś obliczył: 2380 + 4750 = 5830',
    steps: 'Szacunek: 2000 + 5000 = 7000 — a 5830 leży daleko od 7000!',
    explain: 'To sygnał, że w dokładnym obliczeniu jest błąd (prawdziwy wynik to 7130). Właśnie do tego służy szacowanie — nie do liczenia dokładnie, tylko do sprawdzania, czy wynik ma sens.',
    warning: true,
  },
];

interface EstimationExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: szacowanie sumy, różnicy i iloczynu, a na koniec — łapanie błędu dzięki szacunkowi. */
export function EstimationExamples({ color, onComplete }: EstimationExamplesProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${revealed}`);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setRevealed(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {EXAMPLES.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{EXAMPLES.length}
        </span>
      </div>

      <h3 className="mb-4 text-center font-mono text-lg font-bold leading-snug tabular-nums sm:text-xl" style={{ color }}>
        {example.label}
      </h3>

      {revealed && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-2 text-center font-mono text-base font-bold tabular-nums sm:text-lg" style={{ color }}>
            {example.steps}
          </p>
          <p
            className={
              example.warning
                ? 'bg-amber-50 p-3 text-sm leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
                : 'text-sm leading-relaxed text-muted-foreground sm:text-base'
            }
          >
            {example.explain}
          </p>
        </motion.div>
      )}

      <div className="mt-4 flex justify-end">
        {!revealed ? (
          <Button onClick={() => setRevealed(true)} className="gap-1.5">
            <Eye className="h-4 w-4" />
            Pokaż szacunek
          </Button>
        ) : (
          <Button onClick={next} className="gap-1.5">
            {isLast ? 'Zakończ' : 'Następny przykład'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
