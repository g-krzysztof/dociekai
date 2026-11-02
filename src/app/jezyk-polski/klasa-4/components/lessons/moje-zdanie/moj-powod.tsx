'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { TaskShell, type ProofOutcome } from '@/components/block-lesson/task-shell';
import { Pisarnia } from '../../pisarnia/pisarnia';
import { analyze, type PisMark } from '../../../lib/pisarnia';
import { useTeczka } from '../../../lib/teczka/use-teczka';
import { STRONA_LABEL, judgePowod, type Strona } from './argumenty';

/**
 * L6, blok 3 „Mój powód” `[4.4]` — zadanie: jedno zdanie z własnym powodem.
 * Sędzia struktury (`judgePowod`): „bo”/„ponieważ” z czymś przed i po, wielka
 * litera i znak, nie karta z bloku 2 (podobieństwo wyrazów > 70%). Treść
 * należy do dziecka. Po przyjęciu pan Bogdan przypina zdanie pod chorągiewką,
 * a zdanie idzie do Teczki.
 */

const LESSON = 'komunikacja/moje-zdanie';
const CRITERIA = [
  { id: 'spojnik', label: 'Jest „bo” albo „ponieważ”, przed nim twoje zdanie, po nim powód.' },
  { id: 'zapis', label: 'Jedno zdanie: wielka litera na początku, kropka albo wykrzyknik na końcu.' },
  { id: 'swoj', label: 'Twój własny powód — nie przepisana karta z zebrania.' },
];

interface Props {
  color: string;
  strona: Strona;
  onAccepted: (zdanie: string) => void;
}

export function MojPowod({ color, strona, onAccepted }: Props) {
  const [text, setText] = useState('');
  const analysis = useMemo(() => analyze(text), [text]);
  const { save } = useTeczka();

  const marks: PisMark[] = analysis.words
    .filter((w) => w.low === 'bo' || w.low === 'ponieważ')
    .map((w) => ({ start: w.start, end: w.end, tone: 'good', title: 'tu zaczyna się powód' }));

  const judge = (): ProofOutcome<string> => ({ verdicts: judgePowod(analysis), data: text.trim() });

  return (
    <TaskShell<string>
      color={color}
      brief={
        <p>
          Wybrałeś albo wybrałaś: <strong>{STRONA_LABEL[strona]}</strong>. Napisz jedno zdanie z własnym powodem — takim, którego
          nie było na kartach. Co napiszesz, to twoja sprawa; sprawdzę, czy jest „bo” i powód po nim.
        </p>
      }
      criteria={CRITERIA}
      workshop={
        <Pisarnia
          value={text}
          onChange={setText}
          color={color}
          label="Mój powód"
          showLabel
          marks={marks}
          analysis={analysis}
          placeholder={strona === 'boisko' ? 'Chcę boisko, bo…' : 'Chcę ogródek, bo…'}
          minRows={2}
          maxLength={300}
        />
      }
      judge={judge}
      canCheck={text.trim().length > 0}
      acceptedText="To jest zdanie z powodem. Pan Bogdan przypina je pod twoją chorągiewką."
      reward={<Przypnij text={text.trim()} onRead={(t) => {
        save({ id: `${LESSON}#powod`, lesson: LESSON, kind: 'zdanie', title: `Mój powód: ${STRONA_LABEL[strona]}`, text: t });
        onAccepted(t);
      }} color={color} />}
      onReset={() => setText('')}
    />
  );
}

function Przypnij({ text, onRead, color }: { text: string; onRead: (t: string) => void; color: string }) {
  const once = useRef(false);
  useEffect(() => {
    if (once.current) return;
    once.current = true;
    onRead(text);
  }, [onRead, text]);
  return (
    <div className="mt-4 border-l-4 bg-amber-50 px-3 py-2 dark:bg-zinc-800" style={{ borderColor: color }}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">przypięte pod chorągiewką · w Teczce autora</p>
      <p className="mt-1 font-serif text-lg italic">{text}</p>
    </div>
  );
}
