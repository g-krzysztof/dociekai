'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { TaskShell, type ProofOutcome } from '@/components/block-lesson/task-shell';
import { Pisarnia } from '../../pisarnia/pisarnia';
import { Twarz } from '../../twarz/twarz';
import { analyze, buildMarks, compilePalette } from '../../../lib/pisarnia';
import { useTeczka } from '../../../lib/teczka/use-teczka';
import { UCZUCIA } from '../../../data/uczucia';
import { FORMS } from '../../../data/uczucia.forms';
import { czytaOla, judgeOdpowiedz, maskEmotki } from './odpowiedz';
import type { PisarniaAnalysis } from '../../../lib/pisarnia/types';

/**
 * L4, blok 3 „Bez twarzy” `[1.1]` `[5.5]` — zadanie, pierwsze swobodne
 * pisanie kursu (Pisarnia). Ola napisała „Dostałam psa!”; dziecko odpisuje
 * tak, żeby Ola nie mogła źle zrozumieć, co czuje — bez twarzy i bez tonu.
 * Sędzia tylko struktury i palety (`odpowiedz.ts`); po przyjęciu Ola czyta,
 * a jej twarz pokazuje, co z tekstu wyczytała. Odpowiedź idzie do Teczki.
 */

const PALETA = compilePalette(UCZUCIA, FORMS);
const LESSON = 'komunikacja/twarz-i-ton';

const CRITERIA = [
  { id: 'zdania', label: 'Jedno albo dwa zdania.' },
  { id: 'zapis', label: 'Każde zdanie zaczyna się wielką literą i kończy znakiem (. ! ?).' },
  { id: 'uczucie', label: 'Co najmniej jedno słowo uczucia z palety (cieszę się, zazdroszczę, martwię się…) — bez „nie” przed nim.' },
];

interface Props {
  color: string;
  onComplete: () => void;
}

export function BezTwarzy({ color, onComplete }: Props) {
  const [text, setText] = useState('');
  // Emotki maskowane przed analizą: pisemna mina nie jest błędem zapisu (`maskEmotki`).
  const masked = useMemo(() => maskEmotki(text), [text]);
  const analysis = useMemo(() => analyze(masked.text, { palette: PALETA, names: ['Ola', 'Olu', 'Oli', 'Olą', 'Olę'] }), [masked.text]);
  const marks = useMemo(() => buildMarks(analysis, { issues: true, hits: (h) => (h.negated ? 'warn' : 'good') }), [analysis]);
  const { save } = useTeczka();

  const judge = (): ProofOutcome<string> => {
    const v = judgeOdpowiedz(analysis, masked.emotki);
    return { verdicts: v, data: text.trim() };
  };

  return (
    <TaskShell<string>
      color={color}
      brief={
        <div className="flex items-start gap-3">
          <Twarz kto="ola" mina="usmiech" size={72} label="Ola" />
          <div>
            <p className="border-l-4 bg-stone-50 px-3 py-2 font-serif text-lg dark:bg-zinc-800" style={{ borderColor: '#9fdcc4' }}>
              Ola: „Dostałam psa!”
            </p>
            <p className="mt-2">
              Odpisz Oli tak, żeby nie mogła źle zrozumieć, <strong>co czujesz</strong>. Ona nie zobaczy twojej miny i nie
              usłyszy głosu — ma tylko twoje słowa.
            </p>
          </div>
        </div>
      }
      criteria={CRITERIA}
      workshop={
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paleta uczuć</p>
            <p className="flex flex-wrap gap-1.5">
              {UCZUCIA.map((u) => (
                <span key={u.id} className="border px-2 py-0.5 text-sm">
                  {u.label}
                </span>
              ))}
            </p>
          </div>
          <Pisarnia
            value={text}
            onChange={setText}
            color={color}
            label="Twoja odpowiedź do Oli"
            showLabel
            marks={marks}
            analysis={analysis}
            minRows={2}
            maxLength={400}
          />
        </div>
      }
      judge={judge}
      canCheck={text.trim().length > 0}
      acceptedText="Wysłane. Zobacz, co Ola wyczytała z twoich słów."
      reward={<OlaCzyta text={text.trim()} analysis={analysis} emotki={masked.emotki} onRead={(t) => {
        save({ id: `${LESSON}#odpowiedz`, lesson: LESSON, kind: 'wiadomosc', title: 'Odpowiedź do Oli: „Dostałam psa!”', text: t });
      }} />}
      onComplete={onComplete}
      onReset={() => setText('')}
    />
  );
}

function OlaCzyta({ text, analysis, emotki, onRead }: { text: string; analysis: PisarniaAnalysis; emotki: string[]; onRead: (t: string) => void }) {
  const o = czytaOla(analysis);
  const [saved, setSaved] = useState(false);
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    onRead(text);
    setSaved(true);
  }, [onRead, text]);
  return (
    <div className="mt-4 flex items-start gap-3 border p-3">
      <Twarz kto="ola" ksztalt={o.twarz} size={96} label="Ola czyta twoją odpowiedź" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ola czyta: „{text}”</p>
        <p className="mt-1 border-l-4 bg-stone-50 px-3 py-2 italic dark:bg-zinc-800" style={{ borderColor: '#9fdcc4' }}>
          {o.mowi}
        </p>
        <p className="mt-2 text-sm leading-relaxed">
          {emotki.length
            ? `Twoja buźka „${emotki[0]}” to pisemna mina. Ludzie wymyślili buźki właśnie dlatego, że w piśmie nie widać twarzy. Podpowiadają — ale co czujesz, Ola wyczytała ze słów.`
            : 'Ciekawostka: buźki w wiadomościach, takie jak :) albo 😊, to pisemne miny. Wymyślono je, bo w piśmie nie widać twarzy. Podpowiadają — ale najwięcej mówią słowa.'}
        </p>
        {saved && <p className="mt-2 text-xs text-muted-foreground">Twoja odpowiedź leży w Teczce autora.</p>}
      </div>
    </div>
  );
}
