'use client';

import { useMemo, useState } from 'react';
import { Pisarnia } from '@/app/jezyk-polski/klasa-4/components/pisarnia/pisarnia';
import {
  analyze,
  buildMarks,
  compilePalette,
  ISSUE_TEXT,
  usedGroups,
} from '@/app/jezyk-polski/klasa-4/lib/pisarnia';
import { TaskShell } from '@/components/block-lesson/task-shell';
import { plural } from '@/lib/plural';
import { ACCUSATIONS, FEELINGS } from './demo-palette';
import { FORMS } from './demo-palette.forms';

const COLOR = '#2f6f8f';

const FEEL = compilePalette(FEELINGS, FORMS);
const ACC = compilePalette(ACCUSATIONS, FORMS);

const NAMES = ['ola', 'oli', 'olu', 'olą', 'tymek', 'tymka', 'tymkiem', 'zuzia', 'zuzi', 'zuzią'];

const FREE_INIT = 'mam psa. Ma na imię Burek.Burek jest mały ,ale szybki\nwczoraj byłam u oli. Burek biegał. Burek spał';

const ACCUSE_INIT = 'Ty jesteś zawsze taki niemiły!';

export function PisarniaDemo() {
  const [freeValue, setFreeValue] = useState(FREE_INIT);
  const [paletteValue, setPaletteValue] = useState('');
  const [accuseValue, setAccuseValue] = useState(ACCUSE_INIT);
  const [taskValue, setTaskValue] = useState('');

  const freeA = useMemo(() => analyze(freeValue, { names: NAMES }), [freeValue]);
  const paletteA = useMemo(() => analyze(paletteValue, { palette: FEEL }), [paletteValue]);
  const accuseA = useMemo(() => analyze(accuseValue, { palette: ACC }), [accuseValue]);
  const taskA = useMemo(() => analyze(taskValue, { palette: FEEL }), [taskValue]);

  const freeMarks = useMemo(() => buildMarks(freeA, { issues: true, repeats: true }), [freeA]);
  const paletteMarks = useMemo(
    () => buildMarks(paletteA, { issues: true, hits: (h) => (h.negated ? 'warn' : 'good') }),
    [paletteA],
  );
  const accuseMarks = useMemo(() => buildMarks(accuseA, { hits: () => 'bad' }), [accuseA]);
  const taskMarks = useMemo(
    () => buildMarks(taskA, { issues: true, hits: (h) => (h.negated ? 'warn' : 'good') }),
    [taskA],
  );

  const paletteGroups = usedGroups(paletteA.hits, true);

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <h1 className="text-2xl font-bold">Pisarnia — harness</h1>

      <section data-testid="demo-free" className="space-y-3 border p-4">
        <h2 className="font-semibold">Swobodne pisanie</h2>
        <p className="text-sm text-muted-foreground">
          Pisz bez ograniczeń — pod polem widać zdania, usterki i powtórzenia.
        </p>
        <Pisarnia
          value={freeValue}
          onChange={setFreeValue}
          color={COLOR}
          label="Swobodne pisanie"
          minRows={4}
          marks={freeMarks}
          analysis={freeA}
        />
        <ol data-testid="free-sentences" className="list-decimal space-y-1 pl-5 text-sm">
          {freeA.sentences.map((s) => (
            <li key={s.index}>
              {s.text} · koniec: {s.endMark ?? 'brak'} · wielka litera: {s.capitalOk ? '✓' : '✗'}
            </li>
          ))}
        </ol>
        <ul data-testid="free-issues" className="list-disc space-y-1 pl-5 text-sm">
          {freeA.issues.map((issue, i) => (
            <li key={`${issue.start}-${issue.end}-${i}`}>
              {issue.kind} „{freeValue.slice(issue.start, issue.end)}” — {ISSUE_TEXT[issue.kind]}
            </li>
          ))}
        </ul>
        <ul data-testid="free-repeats" className="list-disc space-y-1 pl-5 text-sm">
          {freeA.repeats.map((r) => (
            <li key={`${r.low}-${r.words[0]}`}>
              {r.low} × {r.words.length}
            </li>
          ))}
        </ul>
      </section>

      <section data-testid="demo-palette" className="space-y-3 border p-4">
        <h2 className="font-semibold">Paleta uczuć (wzór L4)</h2>
        <p className="text-sm text-muted-foreground">
          Słowa z palety podświetlają się na zielono, zaprzeczone — na pomarańczowo.
        </p>
        <div className="flex flex-wrap gap-2">
          {FEELINGS.map((entry) => (
            <span key={entry.id} className="border px-2 py-0.5 text-sm">
              {entry.label}
            </span>
          ))}
        </div>
        <Pisarnia
          value={paletteValue}
          onChange={setPaletteValue}
          color={COLOR}
          label="Paleta uczuć"
          placeholder="Napisz Oli, co czujesz…"
          marks={paletteMarks}
          analysis={paletteA}
        />
        <p data-testid="palette-groups" className="text-sm">
          {paletteGroups.join(', ') || '—'}
        </p>
      </section>

      <section data-testid="demo-accuse" className="space-y-3 border p-4">
        <h2 className="font-semibold">Słowa-oskarżenia (wzór L7)</h2>
        <p className="text-sm text-muted-foreground">
          Słowa-oskarżenia podświetlają się na czerwono — policz je pod polem.
        </p>
        <Pisarnia
          value={accuseValue}
          onChange={setAccuseValue}
          color={COLOR}
          label="Słowa-oskarżenia"
          marks={accuseMarks}
          analysis={accuseA}
        />
        <p data-testid="accuse-count" className="text-sm">
          {accuseA.hits.length}
        </p>
      </section>

      <section data-testid="demo-task" className="space-y-3 border p-4">
        <h2 className="font-semibold">Zadanie z werdyktem (wzór L4)</h2>
        <p className="text-sm text-muted-foreground">
          Odpowiedź sprawdza sędzia — wszystkie kryteria muszą być na zielono.
        </p>
        <TaskShell
          color={COLOR}
          brief="Ola napisała: «Dostałam psa!». Odpisz jej tak, żeby wiedziała, co czujesz."
          criteria={[
            { id: 'len', label: 'Jedno albo dwa zdania.' },
            { id: 'cap', label: 'Każde zdanie zaczyna się wielką literą.' },
            { id: 'end', label: 'Każde zdanie ma znak na końcu.' },
            { id: 'feel', label: 'Co najmniej jedno słowo z palety uczuć.' },
          ]}
          workshop={
            <Pisarnia
              value={taskValue}
              onChange={setTaskValue}
              color={COLOR}
              label="Odpowiedź dla Oli"
              marks={taskMarks}
              analysis={taskA}
            />
          }
          judge={() => {
            const n = taskA.sentences.length;
            const lenOk = n >= 1 && n <= 2;
            return {
              verdicts: {
                len: {
                  ok: lenOk,
                  note: lenOk
                    ? undefined
                    : `Masz ${n} ${plural(n, { one: 'zdanie', few: 'zdania', many: 'zdań' })}.`,
                },
                cap: { ok: taskA.sentences.every((s) => s.capitalOk) },
                end: { ok: taskA.sentences.every((s) => s.endMark !== null) },
                feel: { ok: usedGroups(taskA.hits, true).length > 0 },
              },
              data: taskA,
            };
          }}
          canCheck={taskA.words.length > 0}
          acceptedText="Ola przeczytała i już wie, co czujesz."
          onReset={() => setTaskValue('')}
        />
      </section>
    </main>
  );
}
