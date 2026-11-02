'use client';

import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { RotateCcw } from 'lucide-react';
import { TaskShell, type ProofOutcome } from '@/components/block-lesson/task-shell';
import { Pisarnia } from '../../pisarnia/pisarnia';
import { analyze, type PisMark } from '../../../lib/pisarnia';
import { useTeczka } from '../../../lib/teczka/use-teczka';
import { judgeObietnica, type MyWord } from './obietnica';

/**
 * L9, blok 4 „Nasza obietnica” (`[5.2]`) — zadanie. Dziecko wybiera
 * wspólnotę i pisze w Pisarni **jedną obietnicę w liczbie mnogiej**. Sędzia
 * (`obietnica.ts`) sprawdza tylko strukturę: jedno zdanie z wielką literą,
 * kropką albo wykrzyknikiem i formą „my” — i zawsze pokazuje, które słowo
 * przeczytał jako „my”. Treść należy do dziecka. W nagrodę **gest nowy dla
 * kursu: podpis palcem** (dowolny zygzak, to nie dane) i pieczęć — obietnica
 * idzie do Teczki autora.
 */

const LESSON = 'ja-i-my/mazurek-i-rota';
const TECZKA_ID = `${LESSON}#obietnica`;

const WSPOLNOTY = [
  { id: 'klasa', label: 'moja klasa', komu: 'Klasa' },
  { id: 'kamienica', label: 'mój dom albo blok', komu: 'Sąsiedzi' },
  { id: 'podworko', label: 'podwórko', komu: 'Podwórko' },
  { id: 'druzyna', label: 'drużyna albo zespół', komu: 'Drużyna' },
  { id: 'przyjaciele', label: 'moi przyjaciele', komu: 'Przyjaciele' },
  { id: 'rodzina', label: 'moja rodzina', komu: 'Rodzina' },
] as const;

type WspolnotaId = (typeof WSPOLNOTY)[number]['id'];

const CRITERIA = [
  { id: 'wspolnota', label: 'Wybrana wspólnota — dla kogo jest ta obietnica.' },
  { id: 'zdanie', label: 'Jedno zdanie: wielka litera na początku, kropka albo wykrzyknik na końcu.' },
  { id: 'my', label: 'Forma „my”: słowo „my” albo czasownik, który mówi, co zrobicie razem („pomożemy”, „nie damy”).' },
];

interface Report {
  text: string;
  myWords: MyWord[];
}

interface Props {
  color: string;
  onComplete: () => void;
}

export function NaszaObietnica({ color, onComplete }: Props) {
  const [wsp, setWsp] = useState<WspolnotaId | null>(null);
  const [text, setText] = useState('');
  const analysis = useMemo(() => analyze(text), [text]);
  const verdict = useMemo(() => judgeObietnica(analysis), [analysis]);

  const marks: PisMark[] = verdict.myWords.map((m) => ({
    start: m.word.start,
    end: m.word.end,
    tone: m.reading === 'obietnica' || m.reading === 'my' ? 'good' : 'bad',
    title: m.reading === 'obietnica' || m.reading === 'my' ? 'tu słychać „my”' : 'to „my”, ale nie obietnica',
  }));

  const judge = (): ProofOutcome<Report> => {
    const chosen = WSPOLNOTY.find((w) => w.id === wsp);
    return {
      verdicts: {
        wspolnota: chosen
          ? { ok: true, note: `Obietnica dla: ${chosen.label}.` }
          : { ok: false, note: 'Nie wiem jeszcze, czyje to „my” — wybierz wspólnotę.' },
        zdanie: verdict.zdanie,
        my: verdict.my,
      },
      data: { text: text.trim(), myWords: verdict.myWords },
    };
  };

  const chosen = WSPOLNOTY.find((w) => w.id === wsp);

  return (
    <TaskShell<Report>
      color={color}
      brief={
        <p>
          Hymn i „Rota” obiecują w imieniu wszystkich. Teraz twoja kolej: wybierz wspólnotę, do której należysz, i napisz{' '}
          <strong>jedną obietnicę</strong> — co zrobicie razem albo na co nie pozwolicie. Co obiecasz, to twoja sprawa;
          sprawdzę tylko, czy to zdanie i czy mówi „my”.
        </p>
      }
      criteria={CRITERIA}
      workshop={
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Dla kogo?</p>
            <div className="flex flex-wrap gap-2">
              {WSPOLNOTY.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWsp(w.id)}
                  aria-pressed={wsp === w.id}
                  className="border px-3 py-1.5 text-sm transition-colors"
                  style={{
                    borderColor: wsp === w.id ? color : undefined,
                    backgroundColor: wsp === w.id ? `color-mix(in srgb, ${color} 12%, transparent)` : undefined,
                    fontWeight: wsp === w.id ? 600 : undefined,
                  }}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
          <Pisarnia
            value={text}
            onChange={setText}
            color={color}
            label="Nasza obietnica"
            showLabel
            marks={marks}
            analysis={analysis}
            placeholder="Na przykład: Nie damy nikomu…"
            minRows={2}
            maxLength={300}
          />
        </div>
      }
      judge={judge}
      canCheck={text.trim().length > 0}
      renderReport={(r) => (
        <p className="text-sm">
          Słowa, w których słychać „my”:{' '}
          {r.myWords.length ? r.myWords.map((m) => `„${m.word.form}”`).join(', ') : 'nic'}.
        </p>
      )}
      acceptedText="To jest obietnica. Zostało ją podpisać i przypieczętować."
      reward={chosen ? <Podpis color={color} text={text.trim()} wspolnota={chosen} onSealed={onComplete} /> : null}
      onReset={() => {
        setText('');
        setWsp(null);
      }}
    />
  );
}

/** Nagroda: podpis palcem na płótnie, pieczęć i zapis do Teczki. */
function Podpis({
  color,
  text,
  wspolnota,
  onSealed,
}: {
  color: string;
  text: string;
  wspolnota: (typeof WSPOLNOTY)[number];
  onSealed: () => void;
}) {
  const { save } = useTeczka();
  const [strokes, setStrokes] = useState<[number, number][][]>([]);
  const [sealed, setSealed] = useState(false);
  const drawing = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const point = (e: PointerEvent<SVGSVGElement>): [number, number] => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = Math.round(Math.min(Math.max(((e.clientX - r.left) / r.width) * 300, 0), 300));
    const y = Math.round(Math.min(Math.max(((e.clientY - r.top) / r.height) * 90, 0), 90));
    return [x, y];
  };

  const length = strokes.reduce(
    (sum, s) => sum + s.reduce((acc, p, i) => (i ? acc + Math.hypot(p[0] - s[i - 1][0], p[1] - s[i - 1][1]) : acc), 0),
    0
  );
  const signed = length >= 60;
  const path = strokes.map((s) => 'M' + s.map((p) => p.join(' ')).join(' L')).join(' ');

  const seal = () => {
    if (!signed || sealed) return;
    setSealed(true);
    save({
      id: TECZKA_ID,
      lesson: LESSON,
      kind: 'obietnica',
      title: `Nasza obietnica — ${wspolnota.label}`,
      text,
      parts: { wspolnota: wspolnota.id, podpis: path.slice(0, 4000) },
    });
    onSealed();
  };

  return (
    <div className="mt-4 border p-4" style={{ borderColor: color }}>
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        {wspolnota.komu} · obietnica
      </p>
      <p className="mt-2 font-serif text-lg italic leading-relaxed">{text}</p>
      <div className="relative mt-3">
        <svg
          ref={svgRef}
          viewBox="0 0 300 90"
          className="block h-24 w-full max-w-[420px] cursor-crosshair touch-none border-b-2 border-dashed bg-amber-50/40 dark:bg-zinc-800/40"
          aria-label="Pole podpisu — podpisz się palcem albo myszą"
          onPointerDown={(e) => {
            if (sealed || e.button > 0) return;
            e.preventDefault();
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              /* syntetyczne zdarzenia */
            }
            drawing.current = true;
            setStrokes((s) => [...s, [point(e)]]);
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            const p = point(e);
            setStrokes((s) => {
              const last = s[s.length - 1];
              if (!last || last.length > 400) return s;
              return [...s.slice(0, -1), [...last, p]];
            });
          }}
          onPointerUp={() => (drawing.current = false)}
          onPointerCancel={() => (drawing.current = false)}
        >
          <path d={path} fill="none" stroke="#1e3a8a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {!strokes.length && (
          <span className="pointer-events-none absolute left-3 top-8 text-sm text-muted-foreground">podpisz się tutaj palcem</span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={seal}
          disabled={!signed || sealed}
          className="border-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          style={{ backgroundColor: '#b91c1c', borderColor: '#b91c1c' }}
        >
          {sealed ? 'Przypieczętowane' : 'Przypieczętuj'}
        </button>
        {!sealed && strokes.length > 0 && (
          <button type="button" onClick={() => setStrokes([])} className="flex items-center gap-1 text-sm text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5" /> Podpiszę jeszcze raz
          </button>
        )}
      </div>
      <p className="mt-2 min-h-[1.5rem] text-sm" aria-live="polite">
        {sealed ? 'Obietnica leży w Teczce autora — z podpisem.' : !signed && strokes.length ? 'Podpis jest za krótki — pociągnij dłużej.' : ''}
      </p>
    </div>
  );
}
