'use client';

import { useEffect, useMemo, useState } from 'react';
import { TaskShell, type ProofOutcome } from '@/components/block-lesson/task-shell';
import { Pisarnia } from '../../pisarnia/pisarnia';
import { analyze, type PisMark } from '../../../lib/pisarnia';
import { useTeczka } from '../../../lib/teczka/use-teczka';
import { PALETA_PLANU, ocenPlan, type ZdaniePlanu } from './plan';

/**
 * L15 blok 3 — „Plan na jutro” `[4.7]`. Jedyna Pisarnia z werdyktem
 * w modułach 3–4. Dziecko planuje jutro na swojej wyspie: co najmniej trzy
 * zdania, w każdym czasownik z palety w czasie przyszłym. Sędzia (`plan.ts`)
 * czyta tylko strukturę i formy z SGJP, nazywa konkret („w zdaniu 2
 * „łowił” mówi o wczoraj”). Treść należy do dziecka; plan idzie do Teczki
 * i wisi na słupie wyspy.
 */

const LESSON = 'czesci-mowy/czasownik';
const TECZKA_ID = `${LESSON}#plan`;

const CRITERIA = [
  { id: 'zdania', label: 'Co najmniej trzy zdania — każde z wielką literą na początku i znakiem na końcu.' },
  { id: 'czasownik', label: 'W każdym zdaniu czasownik z palety (w dowolnej osobie).' },
  { id: 'jutro', label: 'Każdy z tych czasowników mówi o jutrze („zbuduję”, „będziemy łowić”, „będę łowiła”).' },
];

interface Report {
  text: string;
  plan: ZdaniePlanu[];
}

interface Props {
  color: string;
  wyspa?: string;
  onComplete: () => void;
}

export function PlanNaJutro({ color, wyspa, onComplete }: Props) {
  const [text, setText] = useState('');
  const analysis = useMemo(() => analyze(text), [text]);
  const werdykt = useMemo(() => ocenPlan(analysis), [analysis]);

  const marks: PisMark[] = werdykt.plan.flatMap((z) =>
    z.trafienia.map((t) => ({
      start: t.word.start,
      end: t.word.end,
      tone: t.odczyt === 'przyszly' ? ('good' as const) : ('bad' as const),
      title: t.odczyt === 'przyszly' ? 'mówi o jutrze' : t.odczyt === 'przeszly' ? 'mówi o wczoraj' : t.odczyt === 'terazniejszy' ? 'mówi o dziś' : 'nie mówi kiedy',
    }))
  );

  const judge = (): ProofOutcome<Report> => ({
    verdicts: { zdania: werdykt.zdania, czasownik: werdykt.czasownik, jutro: werdykt.jutro },
    data: { text: text.trim(), plan: werdykt.plan },
  });

  return (
    <TaskShell<Report>
      color={color}
      brief={
        <p>
          Jutro na wyspie{wyspa ? ` ${wyspa}` : ''} — twój plan. Napisz co najmniej trzy zdania o tym, co się jutro wydarzy. W każdym użyj czasownika z
          palety, w dowolnej osobie: ty, my, rybak, koza… Co zaplanujesz, to twoja sprawa — sprawdzę tylko, czy to zdania i czy czasowniki mówią o jutrze.
        </p>
      }
      criteria={CRITERIA}
      workshop={
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-sm font-medium">Paleta czasowników</p>
            <div className="flex flex-wrap gap-1.5">
              {PALETA_PLANU.map((v) => (
                <span key={v} className="border bg-[#fffdf6] px-2 py-0.5 font-serif text-sm dark:bg-zinc-800">
                  {v}
                </span>
              ))}
            </div>
          </div>
          <Pisarnia
            value={text}
            onChange={setText}
            color={color}
            label="Plan na jutro"
            showLabel
            marks={marks}
            analysis={analysis}
            placeholder="Na przykład: Jutro zbuduję…"
            minRows={4}
            maxLength={600}
          />
        </div>
      }
      judge={judge}
      canCheck={text.trim().length > 0}
      renderReport={(r) => (
        <ul className="space-y-0.5 text-sm">
          {r.plan.map((z) => (
            <li key={z.index}>
              Zdanie {z.index + 1}: {z.trafienia.length ? z.trafienia.map((t) => `„${t.word.form}”`).join(', ') : 'bez czasownika z palety'}
              {z.przyszly ? ' — jutro' : ''}
            </li>
          ))}
        </ul>
      )}
      acceptedText="Plan stoi. Każdy czasownik mówi o jutrze."
      reward={<Slup color={color} text={text.trim()} wyspa={wyspa} />}
      onReset={() => setText('')}
      onComplete={onComplete}
    />
  );
}

/** Nagroda: plan przybity do słupa na wyspie i zapisany w Teczce. */
function Slup({ color, text, wyspa }: { color: string; text: string; wyspa?: string }) {
  const { save } = useTeczka();
  useEffect(() => {
    save({ id: TECZKA_ID, lesson: LESSON, kind: 'plan', title: `Plan na jutro${wyspa ? ` — ${wyspa}` : ''}`, text });
    // Zapis raz, przy przyjęciu planu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="mt-4 flex flex-col items-center">
      <div className="w-full max-w-sm rotate-[-1deg] border bg-[#fffdf6] p-4 shadow-md dark:bg-zinc-800" data-testid="slup">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          {wyspa ?? 'Wyspa'} · plan na jutro
        </p>
        <p className="mt-2 whitespace-pre-line font-serif text-base leading-relaxed">{text}</p>
      </div>
      <span aria-hidden className="h-16 w-3" style={{ background: '#a8846a' }} />
      <p className="mt-2 text-xs text-muted-foreground">Kartka wisi na słupie wyspy i leży w Teczce autora (na tym urządzeniu).</p>
    </div>
  );
}
