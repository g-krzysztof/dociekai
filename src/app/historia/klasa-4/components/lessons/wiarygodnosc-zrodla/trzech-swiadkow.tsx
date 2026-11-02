'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowRight, Highlighter, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import {
  COMPARE_ROWS,
  WITNESSES,
  judgeHighlights,
  type HighlightVerdict,
  type Marker,
  type Marks,
} from './swiadkowie';

const MESSAGE_DELAY_MS = 900;

const MARKER_STYLE: Record<Marker, { label: string; hint: string; bg: string; swatch: string }> = {
  fakt: {
    label: 'Zielony — da się sprawdzić',
    hint: 'zegar, inni świadkowie, plan szkoły',
    bg: 'bg-emerald-200/80 dark:bg-emerald-700/60',
    swatch: 'bg-emerald-300 dark:bg-emerald-600',
  },
  opinia: {
    label: 'Żółty — czyjeś zdanie',
    hint: 'ocena, zgadywanie, przesada',
    bg: 'bg-yellow-200/90 dark:bg-yellow-600/60',
    swatch: 'bg-yellow-300 dark:bg-yellow-500',
  },
};

/**
 * Blok 1 — **„Trzech świadków”** (haczyk).
 *
 * Gest nowy w kursie: **zakreślacz w dwóch kolorach**. Wiadomości świadków
 * przychodzą do czatu po kolei (bez udziału dziecka); dziecko wybiera pisak
 * i przeciąga palcem po zdaniach (albo w nie stuka) — zielony to „da się
 * sprawdzić”, żółty to „czyjeś zdanie”. Zdanie w tym samym kolorze stuknięte
 * jeszcze raz traci kolor. Sędzia (`judgeHighlights`) sprawdza tylko zdania
 * jednoznaczne; graniczne przyjmuje w obu kolorach i tłumaczy dlaczego.
 * Po przyjęciu tabela zestawia zielone zdania trojga świadków — co
 * potwierdzają dwa niezależne głosy, a co tylko jeden.
 */
export function TrzechSwiadkow({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [shown, setShown] = useState(1);
  const [marker, setMarker] = useState<Marker>('fakt');
  const [marks, setMarks] = useState<Marks>({});
  const [verdict, setVerdict] = useState<HighlightVerdict | null>(null);
  const [finished, setFinished] = useState(false);
  const paintMode = useRef<'paint' | 'erase' | null>(null);
  const lastFrag = useRef<string | null>(null);

  useEffect(() => {
    if (shown >= WITNESSES.length) return;
    const t = window.setTimeout(() => setShown((n) => n + 1), MESSAGE_DELAY_MS * 2);
    return () => window.clearTimeout(t);
  }, [shown]);

  const accepted = verdict?.ok === true;

  const applyTo = (id: string) => {
    if (accepted || lastFrag.current === id) return;
    lastFrag.current = id;
    setMarks((prev) => {
      const next = { ...prev };
      if (paintMode.current === 'erase') delete next[id];
      else next[id] = marker;
      return next;
    });
    setVerdict(null);
  };

  const fragAt = (x: number, y: number): string | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-frag]');
    return el?.dataset.frag ?? null;
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const id = fragAt(e.clientX, e.clientY);
    if (!id || accepted) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Bez przechwycenia ruch i tak działa, dopóki palec jest na czacie.
    }
    paintMode.current = marks[id] === marker ? 'erase' : 'paint';
    lastFrag.current = null;
    applyTo(id);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!paintMode.current) return;
    const id = fragAt(e.clientX, e.clientY);
    if (id) applyTo(id);
  };
  const endPaint = () => {
    paintMode.current = null;
    lastFrag.current = null;
  };

  const allShown = shown >= WITNESSES.length;
  const markedCount = Object.keys(marks).length;

  return (
    <div className="space-y-5">
      <p className="text-base leading-relaxed">
        Na przerwie ktoś stłukł doniczkę. Wychowawczyni pyta w czacie klasy, co się stało — odpisuje troje świadków{' '}
        <span className="text-muted-foreground">(postaci wymyślone do ćwiczenia)</span>. Weź pisak i{' '}
        <strong>przeciągnij palcem po zdaniach</strong>: na zielono to, co da się sprawdzić, na żółto — czyjeś zdanie.
      </p>

      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Pisak">
        {(Object.keys(MARKER_STYLE) as Marker[]).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={marker === m}
            disabled={accepted}
            onClick={() => setMarker(m)}
            className={cn(
              'flex items-center gap-3 border-2 px-3 py-2 text-left text-sm transition-colors disabled:opacity-60',
              marker === m ? 'font-semibold' : 'border-transparent bg-muted/60'
            )}
            style={marker === m ? { borderColor: color } : undefined}
          >
            <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center', MARKER_STYLE[m].swatch)}>
              <Highlighter className="h-4 w-4" aria-hidden />
            </span>
            <span>
              <span className="block">{MARKER_STYLE[m].label}</span>
              <span className="block text-xs font-normal text-muted-foreground">{MARKER_STYLE[m].hint}</span>
            </span>
          </button>
        ))}
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPaint}
        onPointerCancel={endPaint}
        className="space-y-3 border bg-muted/30 p-3 select-none sm:p-4"
        aria-label="Czat klasy"
      >
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden /> Czat klasy 4b
        </p>
        <div className="max-w-[85%] bg-white px-3 py-2 text-sm dark:bg-zinc-900">
          <span className="block text-xs font-semibold text-muted-foreground">Wychowawczyni</span>
          Co się stało z doniczką na korytarzu? Napiszcie, co widzieliście.
        </div>
        {WITNESSES.slice(0, shown).map((w) => (
          <div key={w.id} className="ml-auto max-w-[92%] bg-white px-3 py-2 dark:bg-zinc-900">
            <span className="block text-xs font-semibold" style={{ color }}>
              {w.name} <span className="font-normal text-muted-foreground">· {w.where}</span>
            </span>
            <p className="mt-1 text-[15px] leading-relaxed">
              {w.fragments.map((f) => {
                const m = marks[f.id];
                const wrong = verdict?.wrong.some((x) => x.id === f.id);
                return (
                  <span key={f.id}>
                    <button
                      type="button"
                      data-frag={f.id}
                      disabled={accepted}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          paintMode.current = marks[f.id] === marker ? 'erase' : 'paint';
                          lastFrag.current = null;
                          applyTo(f.id);
                          endPaint();
                        }
                      }}
                      aria-label={`${f.text}${m ? ` — zakreślone: ${m === 'fakt' ? 'zielony' : 'żółty'}` : ''}`}
                      className={cn(
                        'touch-none rounded-sm px-0.5 text-left transition-colors disabled:cursor-default',
                        m && MARKER_STYLE[m].bg,
                        wrong && 'underline decoration-destructive decoration-wavy decoration-2 underline-offset-4'
                      )}
                    >
                      {f.text}
                    </button>{' '}
                  </span>
                );
              })}
            </p>
          </div>
        ))}
        {!allShown && (
          <p className="ml-auto w-fit animate-pulse bg-white px-3 py-1.5 text-xs text-muted-foreground dark:bg-zinc-900">
            {WITNESSES[shown]?.name} pisze…
          </p>
        )}
      </div>

      {!accepted && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!allShown || markedCount === 0}
            onClick={() => setVerdict(judgeHighlights(marks))}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: color }}
          >
            Sprawdź zakreślenia <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
          <span className="text-sm text-muted-foreground">
            {markedCount} {plural(markedCount, { one: 'zakreślone zdanie', few: 'zakreślone zdania', many: 'zakreślonych zdań' })}
          </span>
        </div>
      )}

      {verdict && !verdict.ok && (
        <div className="space-y-2 border-l-2 border-destructive pl-4 text-sm leading-relaxed" aria-live="polite">
          {verdict.wrong.map((w) => (
            <p key={w.id}>
              <strong>„{w.text}”</strong> — {w.why}
            </p>
          ))}
          {verdict.missing > 0 && (
            <p className="font-medium text-destructive">
              {verdict.missing === 1
                ? 'Jedno zdanie nie ma jeszcze koloru.'
                : `${verdict.missing} ${plural(verdict.missing, { one: 'zdanie', few: 'zdania', many: 'zdań' })} nie ${verdict.missing % 10 >= 2 && verdict.missing % 10 <= 4 ? 'mają' : 'ma'} jeszcze koloru.`}{' '}
              Zakreśl każde — przy niektórych możesz się wahać, i to też jest odpowiedź.
            </p>
          )}
        </div>
      )}

      {accepted && (
        <Comparison color={color} verdict={verdict} finished={finished} onFinish={() => { setFinished(true); onComplete(); }} />
      )}
    </div>
  );
}

function Comparison({
  color,
  verdict,
  finished,
  onFinish,
}: {
  color: string;
  verdict: HighlightVerdict;
  finished: boolean;
  onFinish: () => void;
}) {
  return (
    <div className="space-y-5" aria-live="polite">
      <div className="space-y-2 border-2 p-4" style={{ borderColor: color }}>
        <p className="font-semibold">Zakreślenia przyjęte. Dwa zdania były graniczne — i dobrze, jeśli się wahałeś/łaś:</p>
        {verdict.borderline.map((b) => (
          <p key={b.id} className="text-sm leading-relaxed">
            <strong>„{b.text}”</strong>
            {b.marked && (
              <span className="text-muted-foreground"> (u ciebie: {b.marked === 'fakt' ? 'zielony' : 'żółty'})</span>
            )}{' '}
            — {b.why.replace(/^Graniczne: /, '')}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-base leading-relaxed">
          Teraz zestaw <strong>same zielone zdania</strong> trojga świadków obok siebie:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[20rem] border-collapse text-sm">
            <thead>
              <tr className="text-left">
                <th className="border p-2 font-semibold" />
                {WITNESSES.map((w) => (
                  <th key={w.id} className="border p-2 font-semibold">
                    {w.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.about}>
                  <th className="border p-2 text-left font-semibold">{row.question}</th>
                  {row.cells.map((cell) => (
                    <td key={cell.witness} className={cn('border p-2 align-top', cell.text && 'bg-emerald-100/70 dark:bg-emerald-900/40')}>
                      {cell.text ?? <span className="text-muted-foreground">— milczy</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="space-y-1 text-sm leading-relaxed">
          {COMPARE_ROWS.map((row) => (
            <li key={row.about}>
              <strong>{row.question}</strong> {row.note}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2 bg-muted/60 p-4 text-base leading-relaxed">
        <p>
          A kto stłukł doniczkę? Z zielonych zdań tego <strong>nie wiadomo</strong> — wiadomo tylko, kto stał najbliżej.
          „Specjalnie” i „wiatr” to zgadywanie.
        </p>
        <p>
          I jeszcze jedno: Maja sama napisała, że <strong>Kuba to jej najlepszy kolega</strong>. Nie znaczy to, że kłamie
          — ale wiedząc, <strong>kto mówi i komu chce pomóc</strong>, jej opinię bierzemy ostrożniej. Tak samo historyk
          czyta stare kroniki.
        </p>
      </div>

      {!finished && (
        <button
          type="button"
          onClick={onFinish}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          Rozumiem — do kronik! <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
