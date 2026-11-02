'use client';

import { useState } from 'react';
import { ArrowRight, BookOpen, PenLine, Tag, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { ProblemUnpacker, type WordProblem } from '../../problem-unpacker';

const STRATEGY_STEPS = [
  {
    icon: BookOpen,
    title: 'Przeczytaj uważnie',
    text: 'Czasem trzeba dwa razy — zwłaszcza jeśli w zdaniu jest liczba, która wcale nie jest potrzebna.',
  },
  {
    icon: Tag,
    title: 'Wypisz dane i pytanie',
    text: 'Jakie liczby znasz? O co dokładnie pyta zadanie?',
  },
  {
    icon: Workflow,
    title: 'Narysuj schemat',
    text: 'Schemat pokazuje, czy liczby się łączą, czy jedna wynika z drugiej.',
  },
  {
    icon: PenLine,
    title: 'Oblicz i sprawdź',
    text: 'Zapisz działanie, policz, a potem zapytaj: czy ten wynik ma sens?',
  },
];

const GARDEN_PROBLEM: WordProblem = {
  id: 'ogrod',
  phrases: [
    { id: 'ogrod-p1', text: 'Ogród ma kształt prostokąta. Pan Nowak zasadził ' },
    {
      id: 'ogrod-g1',
      text: '24 sadzonki pomidorów',
      tappable: true,
      role: 'given',
      label: 'pomidory',
    },
    { id: 'ogrod-p2', text: ' i ' },
    {
      id: 'ogrod-g2',
      text: '18 sadzonek papryki',
      tappable: true,
      role: 'given',
      label: 'papryka',
    },
    { id: 'ogrod-p3', text: '. Jego syn ma ' },
    { id: 'ogrod-decoy', text: '11 lat', tappable: true, role: 'decoy' },
    { id: 'ogrod-p4', text: '. ' },
    {
      id: 'ogrod-q',
      text: 'Ile sadzonek zasadził pan Nowak w sumie?',
      tappable: true,
      role: 'question',
    },
  ],
  model: {
    type: 'part-whole',
    wholeLabel: 'razem sadzonek',
    wholeValue: null,
    parts: [
      { label: 'pomidory', value: 24 },
      { label: 'papryka', value: 18 },
    ],
  },
  equation: '24 + 18 = ?',
  answer: 42,
  answerLabel: 'sadzonek',
};

const PENS_PROBLEM: WordProblem = {
  id: 'dlugopisy',
  phrases: [
    { id: 'dlugopisy-p1', text: 'W sklepiku szkolnym było ' },
    {
      id: 'dlugopisy-g1',
      text: '60 długopisów',
      tappable: true,
      role: 'given',
      label: 'długopisy na start',
    },
    { id: 'dlugopisy-p2', text: '. Do przerwy zostało ' },
    { id: 'dlugopisy-g2', text: '22 długopisy', tappable: true, role: 'given', label: 'zostało' },
    { id: 'dlugopisy-p3', text: '. ' },
    {
      id: 'dlugopisy-decoy',
      text: 'Zeszyty kosztują 4 zł za sztukę',
      tappable: true,
      role: 'decoy',
    },
    { id: 'dlugopisy-p4', text: '. ' },
    {
      id: 'dlugopisy-q',
      text: 'Ile długopisów sprzedano do przerwy?',
      tappable: true,
      role: 'question',
    },
  ],
  model: {
    type: 'part-whole',
    wholeLabel: 'na start',
    wholeValue: 60,
    parts: [
      { label: 'zostało', value: 22 },
      { label: 'sprzedano', value: null },
    ],
  },
  equation: '60 − 22 = ?',
  answer: 38,
  answerLabel: 'długopisów',
};

interface Phase {
  id: string;
  kind: 'demo' | 'practice';
  problem: WordProblem;
  lead: string;
}

const PHASES: Phase[] = [
  {
    id: 'demo',
    kind: 'demo',
    problem: GARDEN_PROBLEM,
    lead: 'Zacznijmy razem. Kliknij liczby i pytanie w zdaniu — ale uważaj, jedna liczba jest tu zupełnie niepotrzebna do obliczeń.',
  },
  {
    id: 'practice',
    kind: 'practice',
    problem: PENS_PROBLEM,
    lead: 'Teraz Ty — tą samą metodą, krok po kroku. I znowu jest tu jedna zbędna liczba.',
  },
];

interface ReadingStrategyLabProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: cztery kroki strategii jako stała ściąga na górze, a pod nią
 * dwie rundy `<ProblemUnpacker mode="solve">` — jedna prowadzona (z liczbą-
 * podpuchą do odsiania), jedna samodzielna (inna struktura: część nieznana
 * zamiast sumy nieznanej), tak żeby dziecko od razu zobaczyło, że ta sama
 * metoda działa dla dodawania i odejmowania.
 */
export function ReadingStrategyLab({ color, onComplete }: ReadingStrategyLabProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const containerRef = useSectionScrollAnchor(phaseIndex);

  const phase = PHASES[phaseIndex];
  const isLast = phaseIndex === PHASES.length - 1;

  const next = () => {
    if (!isLast) {
      setPhaseIndex((prev) => prev + 1);
      setSolved(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div ref={containerRef} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {STRATEGY_STEPS.map((step, i) => (
          <div
            key={step.title}
            className="flex gap-3 border p-4"
            style={{ borderColor: `${color}33` }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center font-mono text-lg font-bold tabular-nums"
              style={{ color }}
            >
              {i + 1}
            </span>
            <div>
              <p className="mb-0.5 flex items-center gap-1.5 text-sm font-bold">
                <step.icon className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                {step.title}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {step.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          {PHASES.map((item, i) => (
            <span
              key={item.id}
              className="h-1.5 flex-1 transition-colors"
              style={{ backgroundColor: i <= phaseIndex ? color : `${color}26` }}
            />
          ))}
          <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
            {phaseIndex + 1}/{PHASES.length}
          </span>
        </div>

        <p
          className="mb-1 text-xs font-bold uppercase tracking-[0.15em]"
          style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
        >
          {phase.kind === 'demo' ? 'Pokaz' : 'Twoja kolej'}
        </p>
        <p className="mb-4 text-sm leading-relaxed sm:text-base">{phase.lead}</p>

        <ProblemUnpacker
          key={phase.id}
          problem={phase.problem}
          color={color}
          mode="solve"
          onComplete={() => setSolved(true)}
        />

        {solved && (
          <div className="mt-5 flex justify-end">
            <Button onClick={next} className="gap-1.5">
              {isLast ? 'Zakończ' : 'Dalej'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
