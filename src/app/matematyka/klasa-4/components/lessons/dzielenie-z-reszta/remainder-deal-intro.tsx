'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PartyPopper, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { DealerBoard } from './dealer-board';

interface Round {
  id: string;
  total: number;
  groups: number;
  item: string;
  recipient: string;
  explain: string;
}

const ROUNDS: Round[] = [
  {
    id: 'cukierki',
    total: 17,
    groups: 5,
    item: 'cukierków',
    recipient: '5 osób',
    explain:
      '17 cukierków rozdajesz po kolei do 5 osób. Każda dostaje po 3, a 2 cukierki zostają w resztce — za mało, żeby dać każdemu jeszcze jeden.',
  },
  {
    id: 'kredki',
    total: 20,
    groups: 4,
    item: 'kredek',
    recipient: '4 piórniki',
    explain:
      '20 kredek rozdanych do 4 piórników dzieli się dokładnie: każdy dostaje po 5, a w resztce nie zostaje nic. Reszta wcale nie musi coś zostawiać — może wynosić 0.',
  },
  {
    id: 'balony',
    total: 23,
    groups: 6,
    item: 'balonów',
    recipient: '6 dzieci',
    explain:
      '23 balony rozdane do 6 dzieci: każde dostaje po 3, a 5 balonów zostaje w resztce. Ta reszta (5) jest mniejsza niż liczba grup (6) — gdyby było ich 6 lub więcej, dałoby się rozdać jeszcze jedną kolejkę.',
  },
];

interface RemainderDealIntroProps {
  color: string;
  onComplete?: () => void;
}

/** Nowe pojęcie: rozdajesz przedmioty po kolei do grup i widzisz na żywo, co zostaje w resztce. */
export function RemainderDealIntro({ color, onComplete }: RemainderDealIntroProps) {
  const [index, setIndex] = useState(0);
  const [dealt, setDealt] = useState(false);
  const containerRef = useSectionScrollAnchor(index);

  const round = ROUNDS[index];
  const quotient = Math.floor(round.total / round.groups);
  const remainder = round.total % round.groups;
  const isLast = index === ROUNDS.length - 1;

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setDealt(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{ROUNDS.length}
        </span>
      </div>

      <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
        {round.total} {round.item} rozdanych do {round.recipient}
      </p>

      <DealerBoard
        total={round.total}
        groups={round.groups}
        color={color}
        dealt={dealt}
        ariaLabel={`Rozdanie ${round.total} elementów do ${round.groups} grup`}
        className="mx-auto mb-5 max-w-md"
      />

      {!dealt ? (
        <div className="flex justify-center">
          <Button onClick={() => setDealt(true)} className="gap-1.5">
            <Shuffle className="h-4 w-4" />
            Rozdaj!
          </Button>
        </div>
      ) : (
        <>
          <p
            className="mb-4 text-center font-mono text-xl font-black tabular-nums sm:text-2xl"
            style={{ color }}
          >
            {round.total} : {round.groups} = {quotient} r {remainder}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-start gap-3 p-4 text-sm leading-relaxed"
            style={{ backgroundColor: `${color}0f` }}
          >
            <PartyPopper className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            <p>{round.explain}</p>
          </motion.div>

          <div className="flex justify-end">
            <Button onClick={next}>{isLast ? 'Zakończ' : 'Następne rozdanie'}</Button>
          </div>
        </>
      )}
    </div>
  );
}
