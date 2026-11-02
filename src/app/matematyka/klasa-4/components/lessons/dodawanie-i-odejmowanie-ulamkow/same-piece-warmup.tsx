'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FractionBarGlyph } from '../../fraction-bar-glyph';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface WarmupBar {
  mianownik: number;
  licznik: number;
  caption: string;
}

interface WarmupRound {
  id: string;
  bars: WarmupBar[];
  question: string;
  options: string[];
  correctIndex: number;
  note: string;
}

const ROUNDS: WarmupRound[] = [
  {
    id: 'dwa-paski-piate',
    bars: [
      { mianownik: 5, licznik: 2, caption: 'Pierwszy pasek: 2 kawałki' },
      { mianownik: 5, licznik: 1, caption: 'Drugi pasek: 1 kawałek' },
    ],
    question: 'Oba paski są podzielone na 5 równych części. Ile kawałków jest razem — i jak duży jest jeden kawałek?',
    options: ['3 kawałki po jednej piątej', '3 kawałki po jednej dziesiątej', '2 kawałki po jednej piątej', '3 kawałki po jednej trzeciej'],
    correctIndex: 0,
    note: 'Kawałki są tej samej wielkości, więc po prostu je liczymy: 2 + 1 = 3 kawałki po 1/5, czyli 3/5. Wielkość kawałka się nie zmieniła — dalej jest to jedna piąta.',
  },
  {
    id: 'osme-czesci',
    bars: [
      { mianownik: 8, licznik: 3, caption: 'Zjedzone przez Olę: 3 kawałki' },
      { mianownik: 8, licznik: 2, caption: 'Zjedzone przez brata: 2 kawałki' },
    ],
    question: 'Ciasto pokrojono na 8 równych kawałków. Ile ósmych części ciasta zniknęło razem?',
    options: ['5/16 ciasta', '6/8 ciasta', '5/8 ciasta', '1/8 ciasta'],
    correctIndex: 2,
    note: 'Znów te same kawałki: 3 + 2 = 5 kawałków po 1/8, czyli 5/8 ciasta. Ciasta nie pokrojono drugi raz, więc mianownik nie miał powodu się zmienić.',
  },
  {
    id: 'odejmowanie-szoste',
    bars: [{ mianownik: 6, licznik: 5, caption: 'Na początku w butelce: 5 kawałków' }],
    question: 'W butelce było 5/6 soku. Wypito 2 takie kawałki. Ile soku zostało?',
    options: ['3/6 butelki', '3/4 butelki', '7/6 butelki', '2/6 butelki'],
    correctIndex: 0,
    note: 'Zabranie 2 kawałków z 5 zostawia 3 kawałki tej samej wielkości: 5 − 2 = 3, czyli 3/6 butelki. To dokładnie ta sama myśl, tylko puszczona w drugą stronę.',
  },
  {
    id: 'rozne-kawalki',
    bars: [
      { mianownik: 4, licznik: 1, caption: 'Kawałek z paska podzielonego na 4' },
      { mianownik: 3, licznik: 1, caption: 'Kawałek z paska podzielonego na 3' },
    ],
    question: 'A tutaj? Czy te dwa kawałki da się po prostu policzyć razem jako „2 kawałki”?',
    options: [
      'Tak — to przecież 2 kawałki, czyli 2/7',
      'Tak — to 2 kawałki, czyli 2/4',
      'Nie — kawałki mają różną wielkość, więc nie wiadomo, czym byłby „jeden kawałek”',
      'Nie — bo paski mają różną długość',
    ],
    correctIndex: 2,
    note: 'Jedna czwarta i jedna trzecia to kawałki różnej wielkości — nie da się ich zliczyć jak jednakowych klocków. Dlatego w tej lekcji dodajemy i odejmujemy wyłącznie ułamki o jednakowych mianownikach.',
  },
];

interface SamePieceWarmupProps {
  color: string;
  onComplete?: () => void;
}

function fill(count: number): Set<number> {
  return new Set(Array.from({ length: count }, (_, i) => i));
}

/**
 * Rozgrzewka: cztery sceny, w których liczy się kawałki zamiast liczyć ułamki.
 * Trzy pierwsze mają jednakowe mianowniki i wychodzą naturalnie, czwarta
 * celowo je łamie — to ona ustawia warunek całej lekcji („kawałki muszą być
 * tej samej wielkości”), zanim padnie jakakolwiek reguła.
 */
export function SamePieceWarmup({ color, onComplete }: SamePieceWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const containerRef = useSectionScrollAnchor(index);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    onComplete?.();
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{ROUNDS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={round.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
          <div className="mb-5 space-y-3 border p-4" style={{ borderColor: `${color}33` }}>
            {round.bars.map((bar, i) => (
              <div key={i}>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: textColor }}>
                  {bar.caption}
                </p>
                <div className="mx-auto max-w-sm">
                  <FractionBarGlyph
                    color={color}
                    mianownik={bar.mianownik}
                    filled={fill(bar.licznik)}
                    ariaLabel={`Pasek podzielony na ${bar.mianownik} równych części, zamalowane ${bar.licznik}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mb-4 text-sm font-semibold leading-relaxed sm:text-base">{round.question}</p>

          <div className="grid gap-2 sm:grid-cols-2">
            {round.options.map((option, i) => {
              const isCorrect = i === round.correctIndex;
              const isPicked = i === picked;
              const reveal = picked !== null;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => picked === null && setPicked(i)}
                  disabled={reveal}
                  className={cn(
                    'flex items-center justify-between gap-2 border p-3 text-left text-sm font-semibold transition-all disabled:cursor-not-allowed',
                    !reveal && 'hover:-translate-y-0.5 hover:shadow-md',
                    reveal && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal && isPicked && !isCorrect && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isCorrect && 'opacity-50'
                  )}
                  style={!reveal ? { borderColor: `${color}55` } : undefined}
                >
                  <span>{option}</span>
                  {isPicked && (isCorrect ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : <X className="h-4 w-4 shrink-0 text-rose-600" />)}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <>
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {round.note}
              </motion.p>
              <div className="mt-4 flex justify-end">
                <Button onClick={next}>{isLast ? 'Dalej' : 'Następna scena'}</Button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
