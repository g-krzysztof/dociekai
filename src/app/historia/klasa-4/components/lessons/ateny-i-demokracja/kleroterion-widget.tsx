'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { FREE_SLOTS, KCOLS, KROWS, NAMES, WHITES, chosen, expectedOf, shakeTube, slotKey } from './losowanie';

/**
 * Blok 2 — **maszyna do losowania**. Dziecko wsuwa swoją tabliczkę w wolną
 * szczelinę, a potem pociąga dźwignię: za każdym pociągnięciem z rury wypada
 * kostka i rozstrzyga o jednym rzędzie. Potem przewiduje, ile razy na dziesięć
 * dni maszyna wybierze je na sędziego — i sprawdza.
 */
const DAYS = 10;

export function KleroterionWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [mySlot, setMySlot] = useState<[number, number] | null>(null);
  const [tube, setTube] = useState<boolean[]>(() => Array(KROWS).fill(false));
  const [fallen, setFallen] = useState(0);
  const [lever, setLever] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);
  const [guessDraft, setGuessDraft] = useState(5);
  const [history, setHistory] = useState<boolean[]>([]);
  const leverRef = useRef<HTMLDivElement>(null);
  const pulling = useRef<number | null>(null);
  const reported = useRef(false);

  const dayDone = fallen === KROWS;
  const allDays = history.length >= DAYS;

  const place = (c: number, r: number) => {
    setMySlot([c, r]);
    setTube(shakeTube());
    setFallen(0);
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: (_id, target) => {
      if (target?.startsWith('slot-')) {
        const [c, r] = target.slice(5).split('-').map(Number);
        place(c, r);
      }
    },
    onTap: () => {},
    disabled: mySlot !== null,
  });

  const release = () => {
    if (!mySlot || dayDone) return;
    const next = fallen + 1;
    setFallen(next);
    if (next === KROWS) setHistory((h) => (h.length === 0 ? [chosen(tube, mySlot[1])] : h));
  };

  const onLeverMove = (e: PointerEvent<HTMLDivElement>) => {
    if (pulling.current === null) return;
    const dy = Math.max(0, Math.min(60, e.clientY - pulling.current));
    setLever(dy);
    if (dy >= 56) {
      pulling.current = null;
      setLever(0);
      release();
    }
  };

  const runRest = () => {
    if (!mySlot) return;
    const more = Array.from({ length: DAYS - history.length }, () => chosen(shakeTube(), mySlot[1]));
    const all = [...history, ...more];
    setHistory(all);
    if (!reported.current) {
      reported.current = true;
      onDone();
    }
  };

  const wins = history.filter(Boolean).length;
  const myRowWhite = mySlot && fallen > mySlot[1] ? tube[mySlot[1]] : null;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        {!mySlot ? (
          <>
            Codziennie Ateny potrzebowały sędziów. Nie wybierano ich głosowaniem, tylko <strong>losowaniem</strong>.{' '}
            <strong>Wsuń swoją tabliczkę z imieniem w wolną szczelinę maszyny.</strong>
          </>
        ) : !dayDone ? (
          <>
            W rurze z boku leży {KROWS} kostek: {WHITES} białe i {KROWS - WHITES} czarnych.{' '}
            <strong>Pociągnij dźwignię w dół</strong> — wypadnie kostka dla kolejnego rzędu. Biała: cały rząd zostaje
            sędziami. Czarna: rząd idzie do domu.
          </>
        ) : (
          <>Wszystkie kostki wypadły.</>
        )}
      </p>

      <div className="flex items-start justify-center gap-3">
        <div className="border-2 border-[#b7a585] bg-[#e8dcc3] p-2 dark:bg-zinc-800">
          {Array.from({ length: KROWS }, (_, r) => {
            const decided = fallen > r;
            const white = decided && tube[r];
            return (
              <div key={r} className={cn('flex items-center gap-1 py-0.5 transition-opacity', decided && !white && 'opacity-35')}>
                {Array.from({ length: KCOLS }, (_, c) => {
                  const free = FREE_SLOTS.some(([fc, fr]) => fc === c && fr === r);
                  const mine = mySlot && mySlot[0] === c && mySlot[1] === r;
                  const name = NAMES[(r * KCOLS + c) % NAMES.length];
                  if (free && !mine) {
                    const id = `slot-${slotKey(c, r)}`;
                    return (
                      <div
                        key={c}
                        data-drop={mySlot ? undefined : id}
                        onClick={() => !mySlot && place(c, r)}
                        className={cn('h-5 w-11 border border-dashed border-[#7a6a4f] bg-[#3b2f20]/80 sm:w-16', hover === id && 'ring-2')}
                        style={hover === id ? { ['--tw-ring-color' as string]: color } : undefined}
                        aria-label="wolna szczelina"
                        role="button"
                      />
                    );
                  }
                  return (
                    <div
                      key={c}
                      className={cn('h-5 w-11 truncate border px-1 text-[10px] leading-5 sm:w-16', mine ? 'font-bold text-white' : 'border-[#9c8a69] bg-[#f6efe0] text-[#3b2f20]', white && !mine && 'bg-white font-semibold')}
                      style={mine ? { background: color, borderColor: color } : undefined}
                    >
                      {mine ? 'TY' : free ? '' : name}
                    </div>
                  );
                })}
                <span className={cn('ml-1 h-4 w-4 border', !decided && 'border-dashed border-[#7a6a4f]')} style={decided ? { background: tube[r] ? '#ffffff' : '#1f1f1f', borderColor: '#555' } : undefined} aria-hidden />
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-2 pt-2">
          <span className="text-xs text-muted-foreground">dźwignia</span>
          <div
            ref={leverRef}
            className={cn('relative h-24 w-10 border bg-muted/40', mySlot && !dayDone && 'cursor-ns-resize touch-none')}
            onPointerDown={(e) => {
              if (!mySlot || dayDone) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              pulling.current = e.clientY - lever;
            }}
            onPointerMove={onLeverMove}
            onPointerUp={() => {
              pulling.current = null;
              setLever(0);
            }}
            onPointerCancel={() => {
              pulling.current = null;
              setLever(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                release();
              }
            }}
            role="button"
            tabIndex={mySlot && !dayDone ? 0 : -1}
            aria-label="Dźwignia: pociągnij w dół, żeby wypadła kostka"
          >
            <div className="absolute left-1/2 top-2 h-[calc(100%-1rem)] w-1 -translate-x-1/2 bg-[#7a6a4f]" />
            <div className="absolute left-1/2 h-7 w-7 -translate-x-1/2 rounded-full border-2 bg-white dark:bg-zinc-900" style={{ top: 4 + lever, borderColor: color, transition: pulling.current === null ? 'top .25s' : undefined }} />
          </div>
          <span className="text-xs tabular-nums">{fallen}/{KROWS}</span>
        </div>
      </div>

      {!mySlot && (
        <div className="flex justify-center">
          <button type="button" {...bind('ty')} className="touch-none border-2 px-4 py-1.5 text-sm font-bold text-white" style={{ background: color, borderColor: color }}>
            tabliczka: TY
          </button>
        </div>
      )}
      <DragGhost drag={drag}>
        <span className="border-2 px-3 py-1 text-sm font-bold text-white" style={{ background: color, borderColor: color }}>TY</span>
      </DragGhost>

      {myRowWhite !== null && (
        <p className="text-sm font-semibold" role="status" style={{ color: myRowWhite ? color : undefined }}>
          {myRowWhite ? 'Biała kostka w twoim rzędzie — dziś jesteś sędzią!' : 'Czarna kostka w twoim rzędzie — dziś wracasz do domu.'}
        </p>
      )}

      {dayDone && history.length > 0 && (
        <div className="space-y-2 border-t pt-3 text-sm">
          {guess === null ? (
            <>
              <p>
                Losowanie było codziennie. <strong>Jak myślisz, ile razy na {DAYS} dni maszyna wybierze ciebie?</strong>
              </p>
              <div className="flex items-center gap-3">
                <input type="range" min={0} max={DAYS} value={guessDraft} onChange={(e) => setGuessDraft(Number(e.target.value))} className="w-40" style={{ accentColor: color }} aria-label="Przewidywanie" />
                <strong className="w-6 tabular-nums">{guessDraft}</strong>
                <button type="button" onClick={() => setGuess(guessDraft)} className="border-2 px-3 py-1.5 font-semibold" style={{ borderColor: color, color }}>
                  Zapisz
                </button>
              </div>
            </>
          ) : !allDays ? (
            <button type="button" onClick={runRest} className="border-2 px-3 py-1.5 font-semibold text-white" style={{ background: color, borderColor: color }}>
              Losuj kolejne {DAYS - history.length} dni
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-1" aria-label="Wyniki dziesięciu dni">
                {history.map((w, i) => (
                  <span key={i} className="h-5 w-5 border border-[#555]" style={{ background: w ? '#ffffff' : '#1f1f1f' }} title={`dzień ${i + 1}`} />
                ))}
              </div>
              <p className="border-l-4 p-3 leading-relaxed" style={{ borderColor: color }}>
                Przewidywałeś/łaś {guess}, wyszło {wins} {plural(wins, { one: 'raz', few: 'razy', many: 'razy' })} na {DAYS}. Przeciętnie
                wychodzi prawie {Math.round(expectedOf(DAYS))} na {DAYS} — bo białe kostki są {WHITES} na {KROWS}. Tyle samo
                szans miał każdy obywatel, bogaty i biedny, mądry i niemądry. Ateńczycy uważali, że to sprawiedliwsze niż
                wybory, które wygrywa ten, kogo wszyscy znają. Głosowaniem wybierali tylko dowódców — Perykles był wybierany
                na stratega piętnaście lat z rzędu.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
