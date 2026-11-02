'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import {
  ASKED,
  GOODS,
  countGoods,
  goodLabel,
  judgeWarehouse,
  makeDelivery,
  type GoodId,
  type WarehouseVerdict,
} from './pismo';

/**
 * Blok 1 (haczyk): **magazyn bez pisma.** Dwanaście dostaw przesuwa się przez
 * bramę świątynnego magazynu, potem uciekają kozy (dziecko je łapie), a po
 * powrocie urzędnik pyta, ile było owiec i dzbanów. W pierwszej rundzie pamięć
 * zawodzi. W drugiej dziecko dostaje mokrą glinę i **przy każdej dostawie
 * odciska znak w przegródce towaru** — odpowiada z tabliczki. Werdykt mówi,
 * czy zawiodła tabliczka (dostawa bez znaku), czy odczyt.
 */

type Phase = 'start' | 'dostawa' | 'kozy' | 'pytanie' | 'werdykt';

const STEP_MS = [1300, 1700];
const GOATS = 6;

function emptyTally(): Record<GoodId, number> {
  return { owca: 0, jeczmien: 0, olej: 0, ryba: 0 };
}

export function MagazynWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [round, setRound] = useState<1 | 2>(1);
  const [phase, setPhase] = useState<Phase>('start');
  const [items, setItems] = useState<GoodId[]>([]);
  const [idx, setIdx] = useState(0);
  const [tally, setTally] = useState<Record<GoodId, number>>(emptyTally);
  const [goats, setGoats] = useState<{ x: number; y: number; caught: boolean }[]>([]);
  const [answer, setAnswer] = useState<Record<GoodId, number>>(emptyTally);
  const [verdict, setVerdict] = useState<WarehouseVerdict | null>(null);
  const [solved, setSolved] = useState(false);
  const reported = useRef(false);

  // taśma dostaw
  useEffect(() => {
    if (phase !== 'dostawa') return;
    const t = window.setTimeout(() => {
      if (idx + 1 >= items.length) {
        setPhase('kozy');
      } else {
        setIdx(idx + 1);
      }
    }, STEP_MS[round - 1]);
    return () => window.clearTimeout(t);
  }, [phase, idx, items.length, round]);

  useEffect(() => {
    if (solved && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [solved, onDone]);

  const start = (r: 1 | 2) => {
    setRound(r);
    setItems(makeDelivery());
    setIdx(0);
    setTally(emptyTally());
    setAnswer(emptyTally());
    setVerdict(null);
    setGoats(
      // siatka 3 × 2 z losowym przesunięciem w kratce — kozy nigdy na sobie nie stoją
      Array.from({ length: GOATS }, (_, i) => ({
        x: Math.round((i % 3) * 32 + 4 + Math.random() * 14),
        y: Math.round(Math.floor(i / 3) * 48 + 6 + Math.random() * 18),
        caught: false,
      }))
    );
    setPhase('dostawa');
  };

  const catchGoat = (i: number) => {
    const next = goats.map((g, k) => (k === i ? { ...g, caught: true } : g));
    setGoats(next);
    if (next.every((g) => g.caught)) setPhase('pytanie');
  };

  const stamp = (id: GoodId) => {
    if (round !== 2 || phase !== 'dostawa') return;
    setTally((t) => ({ ...t, [id]: Math.min(t[id] + 1, 12) }));
  };

  const unstamp = (id: GoodId) => {
    if (round !== 2 || phase !== 'dostawa') return;
    setTally((t) => ({ ...t, [id]: Math.max(t[id] - 1, 0) }));
  };

  const submit = () => {
    const v = judgeWarehouse(items, answer, round === 2 ? tally : null);
    setVerdict(v);
    setPhase('werdykt');
    if (round === 2 && v.ok) setSolved(true);
  };

  const current = items[idx];
  const good = GOODS.find((g) => g.id === current);
  const showTablet = round === 2 && phase !== 'start' && phase !== 'kozy';

  return (
    <div className="space-y-4">
      {phase === 'start' && round === 1 && (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">
            Jesteś urzędnikiem przy magazynie świątyni. Rolnicy przynoszą dostawy: owce, worki
            jęczmienia, dzbany oliwy, ryby. Patrz uważnie — za chwilę ktoś cię o nie zapyta.
          </p>
          <button
            type="button"
            onClick={() => start(1)}
            className="border px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: color, borderColor: color }}
          >
            Otwórz bramę magazynu
          </button>
        </div>
      )}

      {phase === 'dostawa' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Dostawa {idx + 1} z {items.length}
            </span>
            {round === 2 && <span className="font-semibold" style={{ color }}>Odciskaj znak przy każdej dostawie!</span>}
          </div>
          <div className="relative flex h-28 items-center justify-center overflow-hidden border bg-amber-50 dark:bg-amber-950/30">
            <div className="absolute inset-x-0 bottom-5 border-t border-dashed border-amber-700/30" aria-hidden />
            <AnimatePresence mode="popLayout">
              {good && (
                <motion.div
                  key={idx}
                  initial={{ x: 160, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -160, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col items-center"
                  aria-live="polite"
                >
                  <span className="text-6xl leading-none" aria-hidden>
                    {good.icon}
                  </span>
                  <span className="mt-1 text-xs font-medium">{goodLabel(good.id, 1).replace(/^1 /, '')}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {phase === 'kozy' && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">
            Ojej! Z zagrody uciekły kozy. Złap wszystkie — stuknij każdą ({goats.filter((g) => g.caught).length} z {GOATS}).
          </p>
          <div className="relative h-44 overflow-hidden border bg-lime-50 dark:bg-lime-950/30">
            {goats.map((g, i) =>
              g.caught ? null : (
                <button
                  key={i}
                  type="button"
                  onClick={() => catchGoat(i)}
                  className="absolute text-4xl leading-none transition-transform hover:scale-110"
                  style={{ left: `${g.x}%`, top: `${g.y}%` }}
                  aria-label="Złap kozę"
                >
                  🐐
                </button>
              )
            )}
          </div>
        </div>
      )}

      {showTablet && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Twoja gliniana tabliczka — {phase === 'dostawa' ? 'stuknij przegródkę towaru, który właśnie przechodzi' : 'tyle odcisnąłeś/łaś'}
          </p>
          <div className="grid grid-cols-4 border-2 border-amber-800/40 bg-[#c9a77c] dark:bg-[#7a5f42]">
            {GOODS.map((g) => (
              <div key={g.id} className="border-r border-amber-900/20 last:border-r-0">
                <button
                  type="button"
                  onClick={() => stamp(g.id)}
                  disabled={phase !== 'dostawa'}
                  className="flex min-h-24 w-full flex-col items-center gap-1 p-1.5 disabled:cursor-default"
                  aria-label={`Odciśnij znak: ${g.one} (masz ${tally[g.id]})`}
                >
                  <span className="text-2xl grayscale-[40%]" aria-hidden>
                    {g.icon}
                  </span>
                  <span className="flex flex-wrap justify-center gap-0.5" aria-hidden>
                    {Array.from({ length: tally[g.id] }, (_, k) => (
                      <span key={k} className="block h-4 w-1.5 bg-amber-950/60" style={{ clipPath: 'polygon(0 0,100% 0,60% 100%,40% 100%)' }} />
                    ))}
                  </span>
                </button>
                {phase === 'dostawa' && tally[g.id] > 0 && (
                  <button
                    type="button"
                    onClick={() => unstamp(g.id)}
                    className="w-full border-t border-amber-900/20 py-0.5 text-[10px] text-amber-950/70 dark:text-amber-100/70"
                  >
                    zetrzyj jeden
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'pytanie' && (
        <div className="space-y-3 border p-3">
          <p className="text-sm leading-relaxed">
            <strong>Urzędnik:</strong> „Wszystkie kozy wróciły, dziękuję. A teraz powiedz: ile przyszło
            owiec i ile dzbanów oliwy?”{round === 1 ? ' Tabliczki nie masz — tylko pamięć.' : ' Spójrz na tabliczkę.'}
          </p>
          <div className="flex flex-wrap gap-4">
            {ASKED.map((id) => {
              const g = GOODS.find((x) => x.id === id)!;
              return (
                <div key={id} className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden>
                    {g.icon}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAnswer((a) => ({ ...a, [id]: Math.max(0, a[id] - 1) }))}
                    className="border p-1.5"
                    aria-label={`Mniej: ${g.many}`}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-mono text-xl font-bold tabular-nums" aria-live="polite">
                    {answer[id]}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAnswer((a) => ({ ...a, [id]: Math.min(12, a[id] + 1) }))}
                    className="border p-1.5"
                    aria-label={`Więcej: ${g.many}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={submit}
            className="border px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: color, borderColor: color }}
          >
            Odpowiedz urzędnikowi
          </button>
        </div>
      )}

      {phase === 'werdykt' && verdict && (
        <div className="space-y-3">
          <div
            className="space-y-1 border-l-2 pl-3 text-sm leading-relaxed"
            style={{ borderColor: verdict.ok ? color : 'hsl(var(--destructive))' }}
          >
            {verdict.lines.map((l) => (
              <p key={l}>{l}</p>
            ))}
            <p className="text-xs text-muted-foreground">
              Cała dostawa: {ASKED.concat(GOODS.map((g) => g.id).filter((id) => !ASKED.includes(id)))
                .map((id) => goodLabel(id, countGoods(items)[id]))
                .join(', ')}
              .
            </p>
          </div>

          {round === 1 && (
            <>
              <p className="text-sm leading-relaxed">
                {verdict.ok
                  ? 'Udało się — masz dobrą pamięć! Ale urzędnik w Sumerze przyjmował setki dostaw dziennie, a pytano go o nie po miesiącu, po roku, w sporze przed sądem.'
                  : 'Nic dziwnego: dwanaście dostaw i chwila zamieszania wystarczą, żeby pamięć zawiodła. A urzędnik w Sumerze przyjmował setki dostaw dziennie i pytano go o nie po miesiącu, po roku.'}{' '}
                Druga dostawa — tym razem dostajesz kawałek mokrej gliny.
              </p>
              <button
                type="button"
                onClick={() => start(2)}
                className="border px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: color, borderColor: color }}
              >
                Druga dostawa — z tabliczką
              </button>
            </>
          )}

          {round === 2 && !verdict.ok && (
            <button type="button" onClick={() => start(2)} className="inline-flex items-center gap-2 border px-4 py-2 text-sm font-semibold">
              <RotateCcw className="h-4 w-4" /> Nowa dostawa
            </button>
          )}

          {round === 2 && verdict.ok && (
            <div className="space-y-2 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
              <p>
                Tym razem kozy nie miały znaczenia: <strong>pamiętała glina, nie ty.</strong> Znak towaru
                i kreski — tak właśnie zaczęło się <strong>pismo</strong>. Pierwsze gliniane tabliczki
                Sumerów, sprzed ok. 3400 p.n.e., to nie wiersze ani listy, tylko spisy towarów:
                ile owiec, ile worków jęczmienia, kto przyniósł, kto zabrał.
              </p>
              <p>
                Pismo pozwoliło zapamiętać więcej, niż mieści się w jednej głowie — i przechować to dłużej
                niż jedno ludzkie życie.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
