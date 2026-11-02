'use client';

import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CookingPot,
  Gem,
  Image as ImageIcon,
  Landmark,
  Mail,
  MessagesSquare,
  Music,
  ScrollText,
  Sword,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import {
  CATEGORY_LABEL,
  GATE_ITEMS,
  itemById,
  judgeTouch,
  judgeWriting,
  type GateCategory,
} from './bramki';

const ITEM_ICON: Record<string, LucideIcon> = {
  miecz: Sword,
  list: Mail,
  hymn: Music,
  garnek: CookingPot,
  pomnik: Landmark,
  opowiesc: MessagesSquare,
  kronika: ScrollText,
  bursztyn: Gem,
  fotografia: ImageIcon,
};

/**
 * Blok 3 — **„Dwie bramki”** (ćwiczenie).
 *
 * Gest nowy w kursie: **dziecko przepuszcza przedmioty przez dwie bramki
 * z pytaniami** („Da się tego dotknąć?” → „Jest na tym pismo?”). Kartę
 * przeciąga na strefę Tak/Nie (stuknięcie w strefę też działa). Bramki same
 * rozkładają źródła na pisane / niepisane / niematerialne — dziecko stosuje
 * regułę, a nie zgaduje kategorię (F-I.2-04…07). Pomyłka: strefa się trzęsie,
 * a pod spodem pada wskazówka z samego przedmiotu.
 */
export function DwieBramki({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [gate, setGate] = useState<1 | 2>(1);
  const [sorted, setSorted] = useState<Record<GateCategory, string[]>>({
    pisane: [],
    niepisane: [],
    niematerialne: [],
  });
  const [note, setNote] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [shake, setShake] = useState<0 | 1 | 2>(0);
  /** Ile razy bramka zatrzymała dziecko — podsumowanie mówi prawdę. */
  const [mistakes, setMistakes] = useState(0);

  const done = index >= GATE_ITEMS.length;
  const item = done ? null : GATE_ITEMS[index];

  const fail = (gateNumber: 1 | 2, message: string) => {
    setHint(message);
    setMistakes((n) => n + 1);
    setShake(gateNumber);
    window.setTimeout(() => setShake(0), 500);
  };

  const answer = (value: boolean) => {
    if (!item || done) return;
    if (gate === 1) {
      if (!judgeTouch(item.id, value)) {
        fail(1, item.hintTouch);
        return;
      }
      setHint(null);
      if (!value) {
        // Nie da się dotknąć — od razu do niematerialnych, bez drugiej bramki.
        setSorted((prev) => ({ ...prev, niematerialne: [...prev.niematerialne, item.id] }));
        setNote(item.note);
        setIndex(index + 1);
      } else {
        setGate(2);
      }
      return;
    }
    if (!judgeWriting(item.id, value)) {
      fail(2, item.hintWriting);
      return;
    }
    setHint(null);
    const category: GateCategory = value ? 'pisane' : 'niepisane';
    setSorted((prev) => ({ ...prev, [category]: [...prev[category], item.id] }));
    setNote(item.note);
    setGate(1);
    const next = index + 1;
    setIndex(next);
    if (next >= GATE_ITEMS.length) onComplete();
  };

  return (
    <div className="space-y-5">
      <p className="text-base leading-relaxed">
        Historycy dzielą źródła na trzy skrzynie: <strong>pisane, niepisane i niematerialne</strong>
        . Nie zgaduj — przepuść każdy przedmiot przez <strong>dwie bramki</strong>. Najpierw:{' '}
        <strong>da się tego dotknąć?</strong>
        {gate === 2 && (
          <>
            {' '}
            Potem: <strong>jest na tym pismo?</strong>
          </>
        )}
      </p>

      {!done && item && (
        <GateQuestion
          key={`${item.id}-${gate}`}
          color={color}
          gate={gate}
          itemId={item.id}
          itemName={item.name}
          itemAbout={item.about}
          hint={hint}
          shake={shake}
          onAnswer={answer}
        />
      )}

      {note && !done && (
        <p className="bg-muted p-3 text-sm leading-relaxed" aria-live="polite">
          {note}
        </p>
      )}

      <SortingYard color={color} sorted={sorted} current={index} total={GATE_ITEMS.length} />

      {done && (
        <div className="space-y-2 border-2 p-4" style={{ borderColor: color }}>
          <p className="text-base leading-relaxed">
            {mistakes === 0 ? (
              <strong>Wszystkie przedmioty w skrzyniach — bez ani jednej pomyłki.</strong>
            ) : (
              <strong>
                {mistakes === 1
                  ? 'Wszystkie przedmioty w skrzyniach. Bramka zatrzymała cię raz — i powiedziała dlaczego.'
                  : `Wszystkie przedmioty w skrzyniach. Bramka zatrzymała cię ${mistakes} ${plural(mistakes, { one: 'raz', few: 'razy', many: 'razy' })} — i za każdym razem powiedziała dlaczego.`}
              </strong>
            )}{' '}
            Nie trzeba zgadywać, wystarczy reguła: czego nie da się dotknąć, to niematerialne; co da
            się dotknąć i ma pismo, to pisane; co da się dotknąć i pisma nie ma, to niepisane.
          </p>
          <p className="text-sm leading-relaxed">
            Pisane i niepisane razem to <strong>źródła materialne</strong> — wszystkie, które da się
            dotknąć. Wśród niepisanych są też <strong>źródła obrazowe</strong>: obrazy, zdjęcia,
            mapy — jak stara fotografia pradziadków.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Pytanie bramki ───

function GateQuestion({
  color,
  gate,
  itemId,
  itemName,
  itemAbout,
  hint,
  shake,
  onAnswer,
}: {
  color: string;
  gate: 1 | 2;
  itemId: string;
  itemName: string;
  itemAbout: string;
  hint: string | null;
  shake: 0 | 1 | 2;
  onAnswer: (value: boolean) => void;
}) {
  const yesRef = useRef<HTMLButtonElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const Icon = ITEM_ICON[itemId] ?? ScrollText;

  const zoneAt = (x: number, y: number): boolean | null => {
    for (const [ref, value] of [
      [yesRef, true],
      [noRef, false],
    ] as const) {
      const rect = ref.current?.getBoundingClientRect();
      if (rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)
        return value;
    }
    return null;
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x: e.clientX, y: e.clientY });
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (drag) setDrag({ x: e.clientX, y: e.clientY });
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    setDrag(null);
    const hit = zoneAt(e.clientX, e.clientY);
    if (hit !== null) onAnswer(hit);
  };

  const question = gate === 1 ? 'Da się tego dotknąć?' : 'Jest na tym pismo?';

  return (
    <div className="space-y-3">
      {/* Karta przedmiotu — przeciągnij ją na Tak albo Nie. */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDrag(null)}
        className={cn(
          'mx-auto w-fit max-w-full cursor-grab touch-none border-2 bg-white px-5 py-4 text-center shadow-sm select-none active:cursor-grabbing dark:bg-zinc-900',
          drag && 'opacity-60'
        )}
        style={{ borderColor: color }}
        role="img"
        aria-label={`${itemName}: ${itemAbout}. Przeciągnij kartę na Tak albo Nie, albo stuknij strefę.`}
      >
        <Icon className="mx-auto h-8 w-8" style={{ color }} aria-hidden />
        <p className="mt-1 font-semibold">{itemName}</p>
        <p className="mt-0.5 max-w-[16rem] text-sm text-muted-foreground">{itemAbout}</p>
      </div>
      {drag && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 border-2 bg-white px-5 py-3 font-semibold shadow-lg dark:bg-zinc-900"
          style={{ left: drag.x, top: drag.y, borderColor: color }}
        >
          {itemName}
        </div>
      )}

      <p className="text-center text-base font-semibold">{question}</p>
      <div className="grid grid-cols-2 gap-3">
        <GateZone
          ref={yesRef}
          label="Tak"
          color={color}
          shaking={shake === gate}
          onAnswer={() => onAnswer(true)}
        />
        <GateZone
          ref={noRef}
          label="Nie"
          color={color}
          shaking={shake === gate}
          onAnswer={() => onAnswer(false)}
        />
      </div>
      {hint && (
        <p className="text-center text-sm font-medium text-destructive" aria-live="polite">
          {hint}
        </p>
      )}
    </div>
  );
}

function GateZone({
  label,
  color,
  shaking,
  onAnswer,
  ref,
}: {
  label: string;
  color: string;
  shaking: boolean;
  onAnswer: () => void;
  ref: React.Ref<HTMLButtonElement>;
}) {
  const inner: ReactNode = (
    <button
      ref={ref}
      type="button"
      onClick={onAnswer}
      className="w-full border-2 border-dashed px-4 py-4 text-lg font-bold hover:bg-muted"
      style={{ borderColor: color }}
    >
      {label}
    </button>
  );
  if (!shaking) return inner;
  return (
    <motion.div animate={{ x: [0, -8, 8, -4, 4, 0] }} transition={{ duration: 0.4 }}>
      {inner}
    </motion.div>
  );
}

// ─── Plac sortowania ───

function SortingYard({
  color,
  sorted,
  current,
  total,
}: {
  color: string;
  sorted: Record<GateCategory, string[]>;
  current: number;
  total: number;
}) {
  const categories: GateCategory[] = ['pisane', 'niepisane', 'niematerialne'];
  return (
    <div className="space-y-2">
      <p className="text-sm tabular-nums text-muted-foreground" aria-live="polite">
        Przepuszczone: {Math.min(current, total)} z {total}.
      </p>
      <div>
        <div className="grid grid-cols-3 gap-x-2">
          <p className="col-span-2 border-x border-t px-2 py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            materialne — da się dotknąć
          </p>
          <p className="px-2 py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            nie da się dotknąć
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((category) => (
            <div key={category} className="min-h-[5rem] border p-2">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color }}>
                {CATEGORY_LABEL[category]} ({sorted[category].length})
              </p>
              <ul className="mt-1 space-y-1">
                {sorted[category].map((id) => (
                  <li key={id} className="bg-muted px-1.5 py-1 text-xs leading-tight">
                    {itemById(id).name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {current < total && (
        <p className="text-sm">
          Następny: <strong>{GATE_ITEMS[current]?.name}</strong>{' '}
          <ArrowRight className="inline h-3.5 w-3.5" aria-hidden />
        </p>
      )}
    </div>
  );
}
