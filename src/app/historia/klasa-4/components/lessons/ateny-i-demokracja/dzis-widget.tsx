'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { Postac, GroupLegend } from './postac';
import { COLS, MODERN, PEOPLE, SILENT, SPEECH, WHO, judgeSpeech, votesUnder, type ModernRule, type Who } from './tlum';

/**
 * Blok 4 — **Ateny kontra dziś**. Te same sto osób: dziecko przestawia zasady
 * jedna po drugiej z ateńskich na dzisiejsze polskie i patrzy, kto zyskuje głos.
 * Potem mowa Peryklesa (omówienie): przykłada grupy mieszkańców do zdań, które
 * o nich mówią — albo na półkę „o nich ani słowa”.
 */
const CW = 30;
const CH = 34;
const W = COLS * CW;
const H = Math.ceil(PEOPLE.length / COLS) * CH + 6;

export function DzisWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [on, setOn] = useState<Set<ModernRule>>(() => new Set());
  const [placed, setPlaced] = useState<Partial<Record<Who, string>>>({});
  const [picked, setPicked] = useState<Who | null>(null);
  const [why, setWhy] = useState<string | null>(null);
  const reported = useRef(false);

  const voters = PEOPLE.filter((p) => votesUnder(p, on)).length;
  const allOn = on.size === MODERN.length;
  const speechDone = WHO.every((w) => placed[w.id]);

  const toggle = (r: ModernRule) => setOn((prev) => {
    const next = new Set(prev);
    if (next.has(r)) next.delete(r);
    else next.add(r);
    return next;
  });

  const put = (who: Who, target: string) => {
    const v = judgeSpeech(who, target);
    if (!v.ok) {
      setWhy(v.why ?? null);
      return;
    }
    setWhy(null);
    setPicked(null);
    const next = { ...placed, [who]: target };
    setPlaced(next);
    if (WHO.every((w) => next[w.id]) && !reported.current) {
      reported.current = true;
      onDone();
    }
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: (id, target) => target && put(id as Who, target),
    onTap: (id) => setPicked(id as Who),
    disabled: speechDone,
  });

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Te same sto osób, ale prawo z dzisiejszej Polski. <strong>Przestawiaj zasady jedna po drugiej</strong> i patrz,
        kto dostaje głos.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {MODERN.map((m) => {
          const isOn = on.has(m.id);
          return (
            <button
              key={m.id}
              type="button"
              role="switch"
              aria-checked={isOn}
              onClick={() => toggle(m.id)}
              className="flex items-center gap-3 border-2 bg-white p-2 text-left text-sm dark:bg-zinc-900"
              style={isOn ? { borderColor: color } : undefined}
            >
              <span className="relative h-5 w-9 shrink-0 rounded-full bg-muted" style={isOn ? { background: color } : undefined}>
                <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', isOn ? 'left-[18px]' : 'left-0.5')} />
              </span>
              <span>
                <span className={cn(isOn && 'text-muted-foreground line-through')}>Ateny: {m.athens}</span>
                <span className={cn('block', isOn ? 'font-semibold' : 'text-muted-foreground')}>Polska 2026: {m.today}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mx-auto max-w-[360px]">
        <svg viewBox={`-4 -4 ${W + 8} ${H + 8}`} className="w-full border bg-[#f7f1e3] dark:bg-zinc-900" role="img" aria-label={`Sto osób; głosować może ${voters}`}>
          {PEOPLE.map((p) => (
            <g key={p.id} transform={`translate(${(p.id % COLS) * CW + CW / 2} ${Math.floor(p.id / COLS) * CH + CH - 2}) scale(0.78)`}>
              <Postac p={p} x={0} y={0} dim={!votesUnder(p, on)} />
            </g>
          ))}
        </svg>
      </div>
      <GroupLegend />
      <p className="text-sm" role="status">
        Głosować może: <strong className="text-lg tabular-nums">{voters}</strong> ze stu.
        {allOn && ' Zostały tylko dzieci — tak jak w Atenach, one nie głosują.'}
      </p>

      {allOn && (
        <p className="border-l-4 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Jest jeszcze jedna różnica. W Atenach obywatele głosowali sami, wszyscy naraz na wzgórzu. W Polsce głosujących
          są miliony, więc wybieramy przedstawicieli: 460 posłów i 100 senatorów decyduje w naszym imieniu. Ateńczyk
          powiedziałby, że to nie demokracja, tylko wybory. My mówimy: demokracja przedstawicielska.
        </p>
      )}

      {allOn && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm leading-relaxed">
            Perykles, najsłynniejszy przywódca Aten, wygłosił mowę o tym, czym jest ich demokracja. Spisał ją historyk
            Tukidydes. Oto cztery myśli z tej mowy, opowiedziane prostszymi słowami. <strong>Przyłóż każdą grupę do zdania, które
            o niej mówi</strong> — albo na półkę „o nich ani słowa”.
          </p>
          <div className="space-y-2">
            {SPEECH.map((s) => {
              const here = WHO.filter((w) => placed[w.id] === s.id);
              return (
                <div
                  key={s.id}
                  data-drop={s.id}
                  onClick={() => picked && put(picked, s.id)}
                  className={cn('border bg-[#fdfaf0] p-2 text-sm leading-relaxed dark:bg-zinc-900', hover === s.id && 'ring-2')}
                >
                  <span className="italic">„{s.text}”</span> <span className="text-xs text-muted-foreground">(Tukidydes, {s.ref})</span>
                  {here.map((w) => (
                    <span key={w.id} className="ml-2 border px-1.5 text-xs font-semibold" style={{ borderColor: color, color }}>
                      {w.label}
                    </span>
                  ))}
                </div>
              );
            })}
            <div
              data-drop={SILENT}
              onClick={() => picked && put(picked, SILENT)}
              className={cn('border border-dashed p-2 text-sm text-muted-foreground', hover === SILENT && 'ring-2')}
            >
              o nich ani słowa:
              {WHO.filter((w) => placed[w.id] === SILENT).map((w) => (
                <span key={w.id} className="ml-2 border px-1.5 text-xs font-semibold" style={{ borderColor: color, color }}>
                  {w.label}
                </span>
              ))}
            </div>
          </div>
          {!speechDone && (
            <div className="flex flex-wrap gap-2">
              {WHO.filter((w) => !placed[w.id]).map((w) => (
                <button key={w.id} type="button" {...bind(w.id)} className="touch-none border-2 bg-white px-3 py-1 text-sm font-semibold dark:bg-zinc-900" style={{ borderColor: picked === w.id ? color : undefined }}>
                  {w.label}
                </button>
              ))}
            </div>
          )}
          <DragGhost drag={drag}>
            <span className="border-2 bg-white px-3 py-1 text-sm font-semibold dark:bg-zinc-900">{WHO.find((w) => w.id === drag?.id)?.label}</span>
          </DragGhost>
          {why && <p className="text-sm text-destructive" role="status">{why}</p>}
          {speechDone && (
            <p className="border-l-4 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
              Perykles chwali obywateli, biednych i bogatych, i mówi, że miasto jest otwarte dla obcych. Kobietom radzi,
              żeby nikt o nich nie mówił. O niewolnikach — ani słowa. W swoich czasach Ateny były wyjątkowe: nigdzie
              indziej tylu ludzi nie decydowało o swoim mieście. Dziś uznalibyśmy je za niesprawiedliwe. Prawdziwe jest jedno
              i drugie.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
