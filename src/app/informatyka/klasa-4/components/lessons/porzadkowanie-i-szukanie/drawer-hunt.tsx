'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Ćwiczenie odpowiadające na pytanie, którego poprzedni blok nie zadał:
 * **po co w ogóle ten porządek?**
 *
 * Szesnaście zamkniętych szuflad, w każdej numerek. Dziecko ma znaleźć jeden
 * konkretny i płaci za każde otwarcie. W rundzie pierwszej numerki leżą byle
 * jak i nie da się nic wymyślić — trzeba otwierać po kolei, a licznik rośnie.
 * W rundzie drugiej **te same szuflady są uporządkowane** i po każdym otwarciu
 * wiadomo, w którą stronę szukać dalej; cztery otwarcia wystarczą na zawsze.
 *
 * Nowy w kursie jest sam kształt zadania: **liczy się nie to, czy trafisz, tylko
 * ile cię to kosztowało**. Dwa liczniki obok siebie na końcu są całym wnioskiem
 * i nie trzeba ich komentować — dziecko widzi różnicę, którą samo wypracowało.
 *
 * Podpowiedź „dalej w prawo / w lewo” nie jest ułatwieniem dorysowanym do gry:
 * to dokładnie ta informacja, którą **daje sam porządek**. W rundzie pierwszej
 * jej nie ma, bo nie ma jej skąd wziąć.
 */

const UNSORTED = [37, 12, 68, 5, 91, 24, 57, 3, 80, 46, 19, 73, 61, 8, 29, 52];
const SORTED = [...UNSORTED].sort((a, b) => a - b);

/** Cele dobrane tak, żeby przy liniowym szukaniu leżały daleko od początku. */
const TARGET_A = 61;
const TARGET_B = 73;

type Round = 'bez-porzadku' | 'po-kolei' | 'koniec';

interface DrawerHuntProps {
  color: string;
  onComplete?: () => void;
}

export function DrawerHunt({ color, onComplete }: DrawerHuntProps) {
  const [round, setRound] = useState<Round>('bez-porzadku');
  const [opened, setOpened] = useState<number[]>([]);
  const [costA, setCostA] = useState(0);
  const [costB, setCostB] = useState(0);
  const [found, setFound] = useState(false);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(round);

  const drawers = round === 'bez-porzadku' ? UNSORTED : SORTED;
  const target = round === 'bez-porzadku' ? TARGET_A : TARGET_B;
  const targetIndex = drawers.indexOf(target);

  useEffect(() => {
    if (round !== 'koniec' || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [round, onComplete]);

  const open = (index: number) => {
    if (found || opened.includes(index)) return;
    const next = [...opened, index];
    setOpened(next);
    if (round === 'bez-porzadku') setCostA(next.length);
    else setCostB(next.length);
    if (drawers[index] === target) setFound(true);
  };

  const nextRound = () => {
    if (round === 'bez-porzadku') {
      setRound('po-kolei');
      setOpened([]);
      setFound(false);
      return;
    }
    setRound('koniec');
  };

  /** Ostatnie otwarcie decyduje o podpowiedzi — i tylko w rundzie z porządkiem. */
  const last = opened.length > 0 ? opened[opened.length - 1] : null;
  const hint =
    round === 'po-kolei' && last !== null && !found
      ? drawers[last] < target
        ? 'dalej w prawo →'
        : '← dalej w lewo'
      : null;

  if (round === 'koniec') {
    return (
      <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Szuflady byle jak" value={costA} color="#d97706" />
          <Stat label="Szuflady po kolei" value={costB} color={color} />
        </div>
        <p className="mt-4 text-sm leading-relaxed sm:text-base">
          Te same szesnaście szuflad i to samo zadanie. Różnica jest jedna:{' '}
          <strong>w drugiej rundzie po każdym otwarciu wiedziałeś/wiedziałaś, w którą stronę iść</strong>
          — a tę wiedzę daje wyłącznie porządek.
        </p>
        <p className="mt-3 text-sm leading-relaxed">
          Najlepszy sposób szukania w uporządkowanych szufladach nazywa się{' '}
          <strong>szukaniem połówkowym</strong>: otwierasz środkową, dowiadujesz się, w której
          połowie jest to, czego szukasz, i połowę wyrzucasz. Z 16 zostaje 8, potem 4, potem 2,
          potem 1. <strong>Cztery otwarcia i koniec</strong> — zawsze, niezależnie od szczęścia.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Przy tysiącu szuflad byle jak ustawionych trzeba by ich średnio otworzyć pięćset. Po kolei
          ustawionych — <strong>dziesięć</strong>. Dlatego porządkowanie z pierwszego bloku nie jest
          sprzątaniem dla samego sprzątania: to inwestycja, która zwraca się przy każdym szukaniu.
        </p>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">
          Runda {round === 'bez-porzadku' ? '1' : '2'} z 2 — znajdź numerek{' '}
          <span style={{ color }}>{target}</span>.
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          otwarć: <strong className="text-foreground">{opened.length}</strong>
        </p>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        {round === 'bez-porzadku'
          ? 'Numerki w szufladach leżą byle jak. Otwarcie kosztuje — otwieraj rozważnie.'
          : 'Te same numerki, ale teraz szuflady są ułożone po kolei, od najmniejszego do największego.'}
      </p>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {drawers.map((value, index) => {
          const isOpen = opened.includes(index);
          const isTarget = index === targetIndex && found;
          return (
            <button
              key={index}
              type="button"
              onClick={() => open(index)}
              disabled={found}
              className={cn(
                'flex aspect-[4/3] items-center justify-center border-2 font-mono text-base font-bold transition',
                !isOpen && !found && 'hover:bg-black/5 dark:hover:bg-white/5'
              )}
              style={{
                borderColor: isTarget ? color : isOpen ? `${color}55` : `${color}33`,
                backgroundColor: isTarget ? `${color}22` : isOpen ? `${color}0c` : undefined,
              }}
              aria-label={isOpen ? `Szuflada ${index + 1}: ${value}` : `Szuflada ${index + 1}: zamknięta`}
            >
              {isOpen ? (
                <span style={isTarget ? { color } : undefined}>{value}</span>
              ) : (
                <span className="text-muted-foreground">·</span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {found ? (
          <motion.div
            key="found"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Znalezione po <strong>{opened.length}</strong>{' '}
                {opened.length === 1 ? 'otwarciu' : 'otwarciach'}.
                {round === 'bez-porzadku'
                  ? ' Nie dało się lepiej — przy bałaganie każda szuflada jest tak samo prawdopodobna.'
                  : ' Zauważ, że tym razem po każdym otwarciu wiedziałeś/wiedziałaś, gdzie szukać dalej.'}
              </span>
            </p>
            <button
              type="button"
              onClick={nextRound}
              className="mt-3 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {round === 'bez-porzadku' ? 'A gdyby były po kolei?' : 'Porównaj oba wyniki'}
            </button>
          </motion.div>
        ) : hint ? (
          <motion.p
            key={hint + opened.length}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 p-3 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            W tej szufladzie jest <strong>{drawers[last as number]}</strong>, a szukasz{' '}
            <strong>{target}</strong> — czyli <strong>{hint}</strong>. Przy uporządkowanych
            szufladach jedno otwarcie mówi ci coś o wszystkich pozostałych.
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="border-l-2 p-3" style={{ borderColor: color }}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tabular-nums" style={{ color }}>
        {value} {value === 1 ? 'otwarcie' : value < 5 ? 'otwarcia' : 'otwarć'}
      </p>
    </div>
  );
}
