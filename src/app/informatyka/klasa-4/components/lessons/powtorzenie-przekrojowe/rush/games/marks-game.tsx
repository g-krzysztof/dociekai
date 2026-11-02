'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { pick, type GameProps } from '../types';

/**
 * Dział 4 — **ZNAJDŹ ENTER!** W tekście siedzą dwa błędy, których nie widać:
 * Enter w środku zdania (zwykłe zawinięcie wiersza wygląda tak samo) i
 * podwójna spacja. Dopóki znaki niedrukowane są wyłączone, **nie ma w co
 * kliknąć** — to cała lekcja o tym, że widoczność jest narzędziem. Po
 * włączeniu ¶ każda spacja to kropka; stuknięcie zwykłej spacji jest pomyłką.
 */

interface Sentence {
  words: string[];
  /** Po którym słowie stoi zbędny Enter. */
  enterAfter: number;
  /** Po którym słowie stoi podwójna spacja. */
  doubleAfter: number;
}

const SENTENCES: Sentence[] = [
  { words: ['Ala', 'ma', 'kota,', 'a', 'kot', 'ma', 'Alę.'], enterAfter: 2, doubleAfter: 4 },
  { words: ['Wtorek', 'jest', 'dniem', 'wycieczki,', 'więc', 'zabierz', 'kanapkę.'], enterAfter: 2, doubleAfter: 4 },
  { words: ['Robot', 'idzie', 'naprzód,', 'potem', 'skręca', 'w', 'lewo.'], enterAfter: 2, doubleAfter: 3 },
];

export function MarksGame({ finish, seed }: GameProps) {
  const sentence = pick(SENTENCES, seed);
  const [marks, setMarks] = useState(false);
  const [enterFixed, setEnterFixed] = useState(false);
  const [doubleFixed, setDoubleFixed] = useState(false);

  const fix = (kind: 'enter' | 'double') => {
    const nextEnter = kind === 'enter' ? true : enterFixed;
    const nextDouble = kind === 'double' ? true : doubleFixed;
    setEnterFixed(nextEnter);
    setDoubleFixed(nextDouble);
    if (nextEnter && nextDouble) finish(true);
  };

  const dot = (key: string, onTap: () => void) => (
    <button
      key={key}
      type="button"
      onClick={onTap}
      aria-label="Spacja"
      className="inline-block min-w-[1.35rem] cursor-pointer text-center align-baseline text-sky-500 hover:bg-sky-500/15"
    >
      ·
    </button>
  );

  const parts: React.ReactNode[] = [];
  sentence.words.forEach((word, index) => {
    parts.push(<span key={`w${index}`}>{word}</span>);
    if (index === sentence.words.length - 1) return;
    if (index === sentence.enterAfter) {
      if (enterFixed) {
        parts.push(marks ? dot(`s${index}`, () => finish(false)) : <span key={`s${index}`}> </span>);
      } else {
        if (marks) {
          parts.push(
            <button
              key={`e${index}`}
              type="button"
              onClick={() => fix('enter')}
              aria-label="Znak końca akapitu w środku zdania"
              className="inline-block min-w-[1.5rem] cursor-pointer text-center font-bold text-rose-500 hover:bg-rose-500/15"
            >
              ¶
            </button>
          );
        }
        parts.push(<br key={`br${index}`} />);
      }
      return;
    }
    if (index === sentence.doubleAfter) {
      if (marks) {
        parts.push(dot(`d${index}a`, () => fix('double')));
        if (!doubleFixed) parts.push(dot(`d${index}b`, () => fix('double')));
      } else {
        parts.push(<span key={`d${index}`} style={{ whiteSpace: 'pre' }}>{doubleFixed ? ' ' : '  '}</span>);
      }
      return;
    }
    parts.push(marks ? dot(`s${index}`, () => finish(false)) : <span key={`s${index}`}> </span>);
  });
  if (marks) parts.push(<span key="end" className="font-bold text-slate-400"> ¶</span>);

  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div className="border bg-white p-4 text-lg leading-loose text-zinc-900 sm:text-xl dark:bg-zinc-100">
        {parts}
      </div>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          aria-pressed={marks}
          onClick={() => setMarks((value) => !value)}
          className={cn(
            'inline-flex min-h-11 cursor-pointer items-center gap-2 border-2 px-4 text-sm font-bold',
            marks ? 'border-sky-500 bg-sky-500/15 text-sky-700 dark:text-sky-300' : 'hover:bg-muted/50'
          )}
        >
          <span className="text-lg leading-none">¶</span> Znaki niedrukowane: {marks ? 'włączone' : 'wyłączone'}
        </button>
        <span className="text-xs text-muted-foreground">Błędy: {Number(enterFixed) + Number(doubleFixed)}/2</span>
      </div>
    </div>
  );
}
