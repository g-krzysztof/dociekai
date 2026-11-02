'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Minus, Plus } from 'lucide-react';
import { buildKorpus, tokenAtPoint, type Korpus, type Rect } from '../../../lib/korpus';
import { MAZUREK } from './mazurek';
import { ROTA } from './rota';
import { MY_KIND_LABEL, MY_TARGETS, MY_TOTAL, countByKind, guessMessage, splitEnding, type MyKind } from './my';

/**
 * L9, blok 3 „Gdzie jest «my»?” — **gest nowy dla kursu: prowadzi figurkę
 * „ja” przez tekst.** Najpierw dziecko obstawia, ile razy w obu tekstach
 * mówi „my”. Potem przeciąga figurkę po wersach; wyraz pod jej stopami
 * (trafienie geometrią, `tokenAtPoint`) zapala się, jeśli to „my” — także
 * `nam`/`nas`/`nasz` i końcówka czasownika, która świeci osobno. Na końcu
 * typ kontra wynik: samo słowo „my” stoi dwa razy, a mówi osiemnaście.
 */

const TEXTS: { id: 'mazurek' | 'rota'; title: string; korpus: Korpus }[] = [
  { id: 'mazurek', title: 'Mazurek Dąbrowskiego', korpus: buildKorpus(MAZUREK) },
  { id: 'rota', title: 'Rota', korpus: buildKorpus(ROTA) },
];

const KIND_COLOR: Record<MyKind, string> = {
  slowo: '#b91c1c',
  przebranie: '#c2410c',
  koncowka: '#7c3aed',
};

const FIG_W = 30;
const FIG_H = 44;

interface Props {
  color: string;
  onComplete: () => void;
}

export function GdzieJestMy({ color, onComplete }: Props) {
  const [guess, setGuess] = useState(4);
  const [locked, setLocked] = useState(false);
  const [tab, setTab] = useState<'mazurek' | 'rota'>('mazurek');
  const [found, setFound] = useState<Set<string>>(new Set());
  const [ty, setTy] = useState(false);

  const done = found.size === MY_TOTAL;
  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  const text = TEXTS.find((t) => t.id === tab)!;
  const leftIn = (k: Korpus) => k.tokens.filter((t) => MY_TARGETS[t.id] && !found.has(t.id)).length;
  const counts = countByKind(found);

  const hit = (id: string) => {
    if (id.startsWith('ty-')) setTy(true);
    if (!MY_TARGETS[id]) return;
    setFound((f) => (f.has(id) ? f : new Set(f).add(id)));
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      {!locked ? (
        <div>
          <p className="text-sm leading-relaxed sm:text-base">
            Jak myślisz: ile razy w hymnie i w „Rocie” <strong>mówi „my”</strong>? Obstaw, zanim zaczniesz szukać.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setGuess((g) => Math.max(0, g - 1))}
              className="flex h-10 w-10 items-center justify-center border"
              aria-label="mniej"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center font-mono text-3xl font-bold tabular-nums" style={{ color }} aria-live="polite">
              {guess}
            </span>
            <button
              type="button"
              onClick={() => setGuess((g) => Math.min(40, g + 1))}
              className="flex h-10 w-10 items-center justify-center border"
              aria-label="więcej"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setLocked(true)}
              className="ml-auto border-2 px-4 py-2 text-sm font-semibold text-white sm:ml-4"
              style={{ backgroundColor: color, borderColor: color }}
            >
              Obstawiam {guess}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm leading-relaxed sm:text-base">
            Twój typ: <strong>{guess}</strong>. Teraz złap figurkę „ja” i przeprowadź ją po wersach. Każde „my”, przez
            które przejdzie, się zapali — nawet schowane.
          </p>

          <div className="mt-4 flex gap-1 border-b" role="tablist">
            {TEXTS.map((t) => {
              const left = leftIn(t.korpus);
              const on = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTab(t.id)}
                  className="-mb-px border-b-2 px-3 py-2 text-sm font-medium"
                  style={{ borderColor: on ? color : 'transparent', color: on ? color : undefined }}
                >
                  {t.title}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {left === 0 ? 'wszystko' : `zostało ${left}`}
                  </span>
                </button>
              );
            })}
          </div>

          <WalkText key={tab} korpus={text.korpus} found={found} color={color} onHit={hit} />

          <div className="mt-4 grid gap-1 text-sm sm:grid-cols-3" aria-live="polite">
            {(Object.keys(MY_KIND_LABEL) as MyKind[]).map((k) => (
              <p key={k} className="flex items-baseline gap-2">
                <span className="inline-block h-2.5 w-2.5 shrink-0" style={{ backgroundColor: KIND_COLOR[k] }} />
                <span>
                  {MY_KIND_LABEL[k]}: <strong className="tabular-nums">{counts[k]}</strong>
                </span>
              </p>
            ))}
          </div>
          <p className="mt-2 min-h-[1.5rem] text-xs text-muted-foreground">
            {ty && '„Twoim” to „ty”, nie „my” — hymn woła tu do generała Dąbrowskiego.'}
          </p>

          <div className="mt-3 min-h-[5rem] border-t pt-3 text-sm leading-relaxed sm:text-base" aria-live="polite">
            {done && (
              <>
                <p>{guessMessage(guess, MY_TOTAL, counts.slowo)}</p>
                <p className="mt-2">
                  W żadnym z tych tekstów nie ma „oni”. Mówi wspólnota — a kto czyta albo śpiewa, mówi razem z nią.{' '}
                  <strong>„My” to także ja.</strong>
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function WalkText({
  korpus,
  found,
  color,
  onHit,
}: {
  korpus: Korpus;
  found: Set<string>;
  color: string;
  onHit: (id: string) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 4, y: 4 });
  const drag = useRef<{ dx: number; dy: number; rects: { id: string; rect: Rect }[] } | null>(null);
  const [holding, setHolding] = useState(false);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button > 0 || !boxRef.current) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* syntetyczne zdarzenia */
    }
    const box = boxRef.current.getBoundingClientRect();
    const rects = [...boxRef.current.querySelectorAll<HTMLElement>('[data-word]')].map((el) => ({
      id: el.dataset.token!,
      rect: el.getBoundingClientRect(),
    }));
    drag.current = { dx: e.clientX - box.left - pos.x, dy: e.clientY - box.top - pos.y, rects };
    setHolding(true);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !boxRef.current) return;
    const box = boxRef.current.getBoundingClientRect();
    const x = Math.round(Math.min(Math.max(e.clientX - box.left - d.dx, 0), box.width - FIG_W));
    const y = Math.round(Math.min(Math.max(e.clientY - box.top - d.dy, 0), box.height - FIG_H));
    setPos({ x, y });
    // Stopy figurki: środek dolnej krawędzi.
    const id = tokenAtPoint(d.rects, box.left + x + FIG_W / 2, box.top + y + FIG_H - 2, 6);
    if (id) onHit(id);
  };

  const onUp = () => {
    drag.current = null;
    setHolding(false);
  };

  return (
    <div ref={boxRef} className="relative mt-3 select-none pb-2 pl-10 pt-12 sm:pl-12">
      {korpus.blocks.map((block, bi) => (
        <div key={bi} className={bi > 0 ? 'mt-4' : ''}>
          {block.map((uid) => {
            const u = korpus.unitById[uid];
            return (
              <p key={uid} className="text-base leading-9 sm:text-lg">
                {u.tokenIds.map((tid, i) => {
                  const t = korpus.tokenById[tid];
                  const after = i < u.tokenIds.length - 1 ? t.after : '';
                  if (t.type !== 'word') return <span key={tid}>{t.form + after}</span>;
                  const target = MY_TARGETS[tid];
                  const lit = target && found.has(tid);
                  if (!lit)
                    return (
                      <span key={tid}>
                        <span data-word="" data-token={tid}>
                          {t.form}
                        </span>
                        {after}
                      </span>
                    );
                  const [stem, ending] = splitEnding(t.form, target);
                  const c = KIND_COLOR[target.kind];
                  return (
                    <span key={tid}>
                      <span data-word="" data-token={tid}>
                        {stem}
                        <span
                          className="font-bold"
                          style={{ color: c, backgroundColor: `color-mix(in srgb, ${c} 14%, transparent)`, boxShadow: `inset 0 -2px 0 ${c}` }}
                        >
                          {ending}
                        </span>
                      </span>
                      {after}
                    </span>
                  );
                })}
              </p>
            );
          })}
        </div>
      ))}

      <div
        role="img"
        aria-label="Figurka „ja” — przeciągnij ją po tekście"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="absolute left-0 top-0 z-10 cursor-grab touch-none"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, width: FIG_W, height: FIG_H }}
      >
        <svg width={FIG_W} height={FIG_H} viewBox="0 0 30 44" className="pointer-events-none block drop-shadow">
          <circle cx="15" cy="7" r="6" fill={color} />
          <path d="M6 18 Q15 13 24 18 L22 31 L8 31 Z" fill={color} />
          <rect x="9" y="31" width="4" height="11" fill={color} />
          <rect x="17" y="31" width="4" height="11" fill={color} />
          <text x="15" y="26" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff">
            ja
          </text>
        </svg>
        {holding && <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-black/60" />}
      </div>
    </div>
  );
}
