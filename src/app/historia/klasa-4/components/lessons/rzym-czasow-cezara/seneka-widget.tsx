'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { SourcePassport } from '../../source-desk/source-passport';
import { judgePens, SENEKA, SENEKA_BANK, SENEKA_FIELDS, type Pen, type PenScore } from './seneka';

const PEN_STYLE: Record<Pen, { bg: string; label: string }> = {
  'nie-wolno': { bg: '#fecaca', label: 'czego niewolnikom nie wolno' },
  seneka: { bg: '#bbf7d0', label: 'co myśli o nich Seneka' },
};

/**
 * Blok 2 — **Seneka o niewolnikach**. Gest: zakreślacz dwoma kolorami na
 * omówieniu listu (sędzią jest treść zdania; pozostałe zdania to tło), potem
 * paszport źródła (kto, kiedy, po co — silnik `source-desk`). Porównanie
 * z dniem Dawosa z bloku 1.
 */
export function SenekaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [pen, setPen] = useState<Pen>('nie-wolno');
  const [marks, setMarks] = useState<Record<string, Pen | undefined>>({});
  const [score, setScore] = useState<PenScore | null>(null);
  const [passport, setPassport] = useState(false);
  const reported = useRef(false);
  const read = score?.ok === true;

  useEffect(() => {
    if (passport && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [passport, onDone]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Zakreślacz">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Zakreślacz:</span>
        {(Object.keys(PEN_STYLE) as Pen[]).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={pen === m}
            disabled={read}
            onClick={() => setPen(m)}
            className={cn('border-2 px-3 py-1 text-sm', pen === m && 'font-semibold')}
            style={{ background: PEN_STYLE[m].bg, borderColor: pen === m ? '#111' : 'transparent' }}
          >
            {PEN_STYLE[m].label}
          </button>
        ))}
      </div>

      <figure className="border bg-[#fbf7ee] p-4 dark:bg-zinc-900/70">
        <blockquote className="space-y-0 text-base leading-loose">
          {SENEKA.map((p) => {
            const m = marks[p.id];
            const bad = score?.wrong.includes(p) || score?.missed.includes(p);
            return (
              <button
                key={p.id}
                type="button"
                disabled={read}
                onClick={() => {
                  setScore(null);
                  setMarks((prev) => ({ ...prev, [p.id]: prev[p.id] === pen ? undefined : pen }));
                }}
                className={cn('mr-1 inline rounded-sm px-0.5 text-left', bad && 'underline decoration-destructive decoration-wavy')}
                style={{ background: m ? PEN_STYLE[m].bg : undefined }}
              >
                {p.text}
              </button>
            );
          })}
        </blockquote>
        <figcaption className="mt-3 text-xs text-muted-foreground">
          Seneka, „Listy moralne do Lucyliusza”, list 47 — omówienie fragmentów własnymi słowami, nie przekład.
        </figcaption>
      </figure>

      {!read && (
        <button type="button" onClick={() => setScore(judgePens(marks))} className="border-2 px-3 py-1.5 text-sm font-semibold" style={{ borderColor: color, color }}>
          Sprawdź zakreślenia
        </button>
      )}

      <div aria-live="polite" className="text-sm leading-relaxed">
        {score && !score.ok && (
          <div className="border border-destructive/50 bg-destructive/5 p-3 text-destructive">
            {score.wrong.length > 0 && (
              <p>
                Za dużo: „{score.wrong[0].text}” —{' '}
                {score.wrong[0].truth === null
                  ? 'to tło: opisuje ucztę, ale nie mówi ani o zakazie, ani o zdaniu Seneki.'
                  : score.wrong[0].truth === 'nie-wolno'
                    ? 'to zdanie mówi, czego niewolnikom nie wolno.'
                    : 'to zdanie mówi, co myśli sam Seneka.'}
              </p>
            )}
            {score.wrong.length === 0 && score.missed.length > 0 && (
              <p>
                Brakuje jeszcze {score.missed.length} {score.missed.length === 1 ? 'zdania' : 'zdań'} — np. „{score.missed[0].text}”.
              </p>
            )}
          </div>
        )}
        {read && (
          <p className="border-l-2 pl-3" style={{ borderColor: color }}>
            Pamiętasz Dawosa? Od godziny VIII do XII stał przy uczcie — tak jak niewolnicy w liście Seneki: bez jedzenia,
            bez słowa. Seneka pisze, że to ludzie. Ale kim był sam Seneka? Wypełnij paszport źródła.
          </p>
        )}
      </div>

      {read && (
        <SourcePassport color={color} fields={SENEKA_FIELDS} bank={SENEKA_BANK} locked={passport} onDone={() => setPassport(true)} />
      )}

      {passport && (
        <p className="border-2 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Seneka współczuł niewolnikom i prosił, żeby panowie byli dla nich łagodni. Ale nie napisał, że niewolnictwo trzeba
          znieść — sam miał niewolników. Nawet mądry i dobry Rzymianin nie wyobrażał sobie świata bez nich. Tak źródło
          pokazuje nie tylko to, o czym pisze, ale i to, jak myślał jego autor.
        </p>
      )}
    </div>
  );
}
