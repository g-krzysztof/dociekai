'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { convertArea, formatArea } from '../../../lib/area-units';

interface AreaCard {
  id: string;
  amount: number;
  code: string;
}

interface Round {
  id: string;
  question: string;
  /** Jednostka, w której wygodnie porównać całą trójkę — to ona jest odpowiedzią na „jak to zrobić”. */
  commonCode: string;
  cards: AreaCard[];
  note: string;
}

const ROUNDS: Round[] = [
  {
    id: 'pokoj',
    question: 'Trzy powierzchnie w jednym mieszkaniu. Ustaw je od najmniejszej do największej.',
    commonCode: 'dm²',
    cards: [
      { id: 'kafelek', amount: 3, code: 'dm²' },
      { id: 'pocztowka', amount: 200, code: 'cm²' },
      { id: 'dywanik', amount: 1, code: 'm²' },
    ],
    note: 'Liczba 200 wygląda na największą, a jest najmniejszym polem z całej trójki. Dopóki jednostki są różne, same liczby nic nie mówią.',
  },
  {
    id: 'dzialka',
    question: 'Teraz trzy większe powierzchnie. Znowu od najmniejszej do największej.',
    commonCode: 'm²',
    cards: [
      { id: 'taras', amount: 4, code: 'm²' },
      { id: 'ogrod', amount: 2, code: 'a' },
      { id: 'pokoj', amount: 50_000, code: 'cm²' },
    ],
    note: 'Pięćdziesiąt tysięcy centymetrów kwadratowych brzmi ogromnie, a to zaledwie 5 m² — mniej niż dwa ary ogrodu.',
  },
];

const SLOT_LABELS = ['najmniejsze pole', 'średnie pole', 'największe pole'];

const areaOf = (card: AreaCard, commonCode: string): number =>
  convertArea(card.amount, card.code, commonCode);

/** Kolejność poprawna — liczona z kart, nigdy wpisana obok nich. */
const correctOrder = (round: Round): string[] =>
  [...round.cards]
    .sort((a, b) => areaOf(a, round.commonCode) - areaOf(b, round.commonCode))
    .map((card) => card.id);

interface UnitOrderRailProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: trzy pola podane w różnych jednostkach trzeba ustawić w kolejności.
 * Nie da się tego zrobić „na liczbę” — 200 cm² stoi przed 3 dm², choć 200 > 3 —
 * więc dziecko samo natrafia na potrzebę zamiany jednostek, zanim lekcja o niej
 * powie. Pomyłka nie kosztuje nic poza odsłonięciem podpowiedzi: wszystkie trzy
 * pola przeliczone na tę samą jednostkę, czyli dokładnie to narzędzie, którego
 * zabrakło.
 *
 * Mechanika to „wybierz kartę, wskaż miejsce” (ta sama, co w `DecimalStack`),
 * z luką widoczną w spoczynku, nie dopiero po najechaniu.
 */
export function UnitOrderRail({ color, onComplete }: UnitOrderRailProps) {
  const [index, setIndex] = useState(0);
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState<'none' | 'wrong' | 'ok'>('none');
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  const round = ROUNDS[index] ?? ROUNDS[ROUNDS.length - 1];
  const containerRef = useSectionScrollAnchor(`${index}-${checked}-${finished}`);

  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const cardById = (id: string) => round.cards.find((card) => card.id === id);
  const tray = round.cards.filter((card) => !slots.includes(card.id));

  const evaluate = (next: (string | null)[]) => {
    const ok = correctOrder(round).every((id, position) => next[position] === id);
    setChecked(ok ? 'ok' : 'wrong');
    if (!ok) setRevealed(true);
  };

  const place = (slotIndex: number) => {
    if (checked === 'ok' || !selected) return;
    const next = slots.map((id) => (id === selected ? null : id));
    next[slotIndex] = selected;
    setSlots(next);
    setSelected(null);
    setChecked('none');
    if (next.every(Boolean)) evaluate(next);
  };

  const takeBack = (slotIndex: number) => {
    if (checked === 'ok') return;
    const next = [...slots];
    next[slotIndex] = null;
    setSlots(next);
    setChecked('none');
  };

  const goNext = () => {
    if (index + 1 < ROUNDS.length) {
      setIndex((value) => value + 1);
      setSlots([null, null, null]);
      setSelected(null);
      setChecked('none');
      setRevealed(false);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Kolejność ustawiona</h3>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Za każdym razem trzeba było najpierw sprowadzić wszystkie trzy pola do jednej jednostki.
          Ta lekcja jest właśnie o tym: jak wybrać sensowną jednostkę i jak przechodzić między nimi
          bez zgadywania.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: textColor }}>
        Runda {index + 1} z {ROUNDS.length}
      </p>
      <h3 className="mb-5 text-lg font-bold leading-snug sm:text-xl">{round.question}</h3>

      {/* Taca z kartami */}
      <div className="mb-5 border-2 border-dashed p-3" style={{ borderColor: `${color}59` }}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Twoje karty
        </p>
        <div className="flex min-h-[64px] flex-wrap items-center gap-3">
          {tray.length === 0 ? (
            <p className="text-sm text-muted-foreground">Wszystkie karty ustawione.</p>
          ) : (
            tray.map((card) => (
              <button
                key={card.id}
                type="button"
                data-card={card.id}
                onClick={() => setSelected(selected === card.id ? null : card.id)}
                className={cn(
                  'border-2 px-4 py-2 font-mono text-lg font-bold tabular-nums transition-colors',
                  selected === card.id ? 'text-white' : 'bg-white dark:bg-zinc-900'
                )}
                style={{
                  borderColor: color,
                  backgroundColor: selected === card.id ? color : undefined,
                  color: selected === card.id ? '#fff' : textColor,
                }}
              >
                {formatArea(card.amount)} {card.code}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Trzy miejsca */}
      <ol className="grid gap-3 sm:grid-cols-3">
        {slots.map((id, slotIndex) => {
          const card = id ? cardById(id) : undefined;
          const isWrong = checked === 'wrong';
          return (
            <li key={SLOT_LABELS[slotIndex]}>
              <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {slotIndex + 1}. {SLOT_LABELS[slotIndex]}
              </p>
              <motion.button
                type="button"
                data-slot={slotIndex}
                onClick={() => (card ? takeBack(slotIndex) : place(slotIndex))}
                disabled={checked === 'ok' || (!card && !selected)}
                animate={isWrong && card ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.35 }}
                className={cn(
                  'flex h-[68px] w-full items-center justify-center border-2 text-center transition-colors',
                  card ? 'font-mono text-lg font-bold tabular-nums' : 'border-dashed text-sm'
                )}
                style={{
                  borderColor: checked === 'ok' ? color : `${color}${card ? '' : '59'}`,
                  backgroundColor: card ? `${color}14` : `${color}0a`,
                  color: card ? textColor : undefined,
                }}
              >
                {card ? (
                  <span>
                    {formatArea(card.amount)} {card.code}
                  </span>
                ) : (
                  <span className="text-muted-foreground">＋ wstaw tutaj</span>
                )}
              </motion.button>
            </li>
          );
        })}
      </ol>

      {/* Podpowiedź: te same pola w jednej jednostce */}
      <AnimatePresence initial={false}>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 border p-4" style={{ backgroundColor: `${color}0f` }}>
              <p className="mb-3 text-sm font-semibold" style={{ color: textColor }}>
                Te same trzy pola, wszystkie w {round.commonCode}:
              </p>
              <ul className="grid gap-2 sm:grid-cols-3">
                {round.cards.map((card) => (
                  <li key={card.id} className="border bg-white px-3 py-2 text-sm dark:bg-zinc-900">
                    <span className="font-mono tabular-nums">
                      {formatArea(card.amount)} {card.code}
                    </span>
                    <span className="mx-1 text-muted-foreground">=</span>
                    <span className="font-mono font-bold tabular-nums" style={{ color: textColor }}>
                      {formatArea(areaOf(card, round.commonCode))} {round.commonCode}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Werdykt */}
      <div className="mt-5 min-h-[52px]">
        {checked === 'wrong' && (
          <p className="text-sm leading-relaxed">
            Jeszcze nie ta kolejność. Porównaj je w jednej jednostce — podpowiedź wyżej — i poprzestawiaj
            karty.
          </p>
        )}
        {checked === 'ok' && (
          <div className="flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: `${color}12` }}>
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>{round.note}</span>
            </p>
            <Button onClick={goNext} style={{ backgroundColor: color }} className="shrink-0 text-white">
              {index + 1 < ROUNDS.length ? 'Następna runda' : 'Zakończ rozgrzewkę'}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </div>
        )}
        {checked === 'none' && (
          <p className="text-sm text-muted-foreground">
            {selected
              ? 'Teraz wskaż miejsce, w którym ta karta ma stanąć.'
              : 'Wybierz kartę z tacy, potem wskaż jej miejsce. Kartę ustawioną w miejscu możesz kliknąć, żeby ją cofnąć.'}
          </p>
        )}
      </div>
    </div>
  );
}
