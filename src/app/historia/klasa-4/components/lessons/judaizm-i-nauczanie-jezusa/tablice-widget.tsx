'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { COMMANDMENTS, judgeLaw, judgeTablet, LAWS, lawsPerTablet, type TabletId } from './tablice';

type Phase = 'dziel' | 'prawo' | 'gotowe';

const TABLETS: { id: TabletId; title: string }[] = [
  { id: 'bog', title: 'Tablica 1 · o Bogu' },
  { id: 'ludzie', title: 'Tablica 2 · o ludziach' },
];

/**
 * Blok 3 — **Dwie tablice**. Gesty: przykazania Dekalogu przeciągane (albo
 * stuk-stuk) na jedną z dwóch kamiennych tablic według treści — odrzut mówi,
 * o kim przykazanie mówi; potem karty dzisiejszego polskiego prawa przykładane
 * do przykazań, z którymi mówią o tym samym. Wszystkie lądują na tablicy
 * o ludziach — to jest odkrycie bloku. `onDone` po ostatnim przepisie.
 */
export function TabliceWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('dziel');
  const [placed, setPlaced] = useState<Record<string, TabletId>>({});
  const [laws, setLaws] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const reported = useRef(false);

  const drop = (token: string, target: string | null) => {
    setPicked(null);
    if (!target) return;
    if (phase === 'dziel') {
      if (!target.startsWith('tab:')) return;
      const tablet = target.slice(4) as TabletId;
      const v = judgeTablet(token, tablet);
      if (!v.ok) {
        setMsg(v.message);
        return;
      }
      setMsg(null);
      const next = { ...placed, [token]: tablet };
      setPlaced(next);
      if (Object.keys(next).length >= COMMANDMENTS.length) setPhase('prawo');
      return;
    }
    if (phase === 'prawo') {
      if (!target.startsWith('c:')) return;
      const v = judgeLaw(token, target.slice(2));
      if (!v.ok) {
        setMsg(v.message);
        return;
      }
      setMsg(null);
      const next = { ...laws, [token]: target.slice(2) };
      setLaws(next);
      if (Object.keys(next).length >= LAWS.length && !reported.current) {
        reported.current = true;
        setPhase('gotowe');
        onDone();
      }
    }
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: drop,
    onTap: (id) => setPicked((p) => (p === id ? null : id)),
    disabled: phase === 'gotowe',
  });

  const tap = (target: string) => {
    if (picked) drop(picked, target);
  };

  const trayCommandments = COMMANDMENTS.filter((c) => !placed[c.id]);
  const trayLaws = LAWS.filter((l) => !laws[l.id]);
  const per = lawsPerTablet();
  const dragged = drag ? (COMMANDMENTS.find((c) => c.id === drag.id)?.text ?? LAWS.find((l) => l.id === drag.id)?.source) : null;

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        {phase === 'dziel' && (
          <>
            <strong>Podziel przykazania między dwie tablice</strong> według tego, o czym mówią: o Bogu czy o ludziach.
            Przeciągnij przykazanie na tablicę albo stuknij je, a potem tablicę.
          </>
        )}
        {phase === 'prawo' && (
          <>
            Dekalog ma ponad trzy tysiące lat. Czy coś z niego jest w dzisiejszym polskim prawie?{' '}
            <strong>Przyłóż każdy przepis do przykazania, które mówi o tym samym.</strong>
          </>
        )}
      </p>

      {phase === 'dziel' && trayCommandments.length > 0 && (
        <div className="flex flex-wrap gap-2 border border-dashed p-2">
          {trayCommandments.map((c) => (
            <button
              key={c.id}
              type="button"
              {...bind(c.id)}
              className={cn('touch-none border-2 bg-white px-2.5 py-1.5 text-left text-sm dark:bg-zinc-900', drag?.id === c.id && 'opacity-30')}
              style={{ borderColor: picked === c.id ? color : undefined }}
            >
              {c.text}
            </button>
          ))}
        </div>
      )}
      {/* Na telefonie taca przepisów stoi między tablicami — tuż nad tablicą o ludziach, żeby przeciąganie nie wymagało przewijania. */}
      <div className="grid gap-3 sm:grid-cols-2">
        {phase === 'prawo' && trayLaws.length > 0 && (
          <div className="order-2 flex flex-wrap gap-2 border border-dashed p-2 sm:order-first sm:col-span-2">
            {trayLaws.map((l) => (
              <button
                key={l.id}
                type="button"
                {...bind(l.id)}
                className={cn('max-w-[16rem] touch-none border-2 bg-white px-2.5 py-1.5 text-left text-sm dark:bg-zinc-900', drag?.id === l.id && 'opacity-30')}
                style={{ borderColor: picked === l.id ? color : undefined }}
              >
                <span className="block text-xs font-semibold" style={{ color }}>
                  § {l.source}
                </span>
                {l.text}
              </button>
            ))}
          </div>
        )}

        {TABLETS.map((t) => {
          const items = COMMANDMENTS.filter((c) => placed[c.id] === t.id);
          const dropId = `tab:${t.id}`;
          return (
            <section
              key={t.id}
              data-drop={dropId}
              onClick={() => phase === 'dziel' && tap(dropId)}
              className={cn(t.id === 'bog' ? 'order-1' : 'order-3', 'min-h-[8rem] border-2 border-stone-400 bg-stone-100 p-3 pt-5 dark:bg-stone-800', phase === 'dziel' && picked && 'cursor-pointer')}
              style={{
                borderTopLeftRadius: '45% 2.2rem',
                borderTopRightRadius: '45% 2.2rem',
                borderColor: hover === dropId ? color : undefined,
              }}
            >
              <h4 className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-300">{t.title}</h4>
              <ol className="space-y-1.5">
                {items.map((c) => {
                  const cid = `c:${c.id}`;
                  const law = LAWS.find((l) => laws[l.id] === c.id);
                  return (
                    <li
                      key={c.id}
                      data-drop={phase === 'prawo' ? cid : undefined}
                      onClick={(e) => {
                        if (phase !== 'prawo') return;
                        e.stopPropagation();
                        tap(cid);
                      }}
                      className={cn('border bg-white/80 px-2 py-1 text-sm dark:bg-zinc-900/80', phase === 'prawo' && picked && 'cursor-pointer')}
                      style={{ borderColor: hover === cid ? color : undefined }}
                    >
                      {c.text}
                      {law && (
                        <span className="mt-0.5 block text-xs font-semibold" style={{ color }}>
                          § {law.source}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>

      {msg && (
        <p aria-live="polite" className="text-sm text-destructive">
          {msg}
        </p>
      )}

      {phase !== 'dziel' && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Według Biblii Bóg dał Dekalog Mojżeszowi na dwóch kamiennych tablicach. Nikt nie wie, ile przykazań było na każdej:
          Żydzi często dzielą je pięć i pięć, chrześcijanie w Polsce — trzy i siedem, tak jak Ty, według treści.
        </p>
      )}

      {phase === 'gotowe' && (
        <div className="space-y-2 border-2 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <p>
            Policz przepisy: na tablicy o Bogu — <strong>{per.bog}</strong>, na tablicy o ludziach — <strong>{per.ludzie}</strong>.
            Dzisiejsze państwo pilnuje spraw między ludźmi: nie wolno zabić, ukraść, kłamać przed sądem. W co wierzyć, państwo nie
            mówi — Konstytucja RP (art. 53) gwarantuje każdemu wolność religii i mówi, że nikogo nie wolno zmuszać ani do udziału
            w praktykach religijnych, ani do trzymania się od nich z daleka.
          </p>
          <p>
            Dekalog to wspólne dziedzictwo judaizmu i chrześcijaństwa: chrześcijaństwo przejęło go z judaizmu w całości. Przez
            wieki uczono się go w całej Europie — i dlatego tak wiele jego zasad znajdziesz w dzisiejszym prawie.
          </p>
        </div>
      )}

      <DragGhost drag={drag}>
        <div className="max-w-[14rem] border-2 bg-white px-2.5 py-1.5 text-sm dark:bg-zinc-900" style={{ borderColor: color }}>
          {dragged}
        </div>
      </DragGhost>
    </div>
  );
}
