'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Download, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  buildNote,
  DISCS,
  FILL_MS,
  fillAfter,
  FLOPPIES,
  FLOPPY_35_MM,
  floppiesAt,
  floppiesOn,
  judgeLine,
  noteAsText,
  pl,
  type Answers,
  type DiscId,
  type Floppy,
  type FloppyId,
  type Slot,
} from './pour';

/**
 * Zadanie obowiązkowe **Z-1** — w całości w lekcji, bez wychodzenia do
 * internetu, kalkulatora i Notatnika.
 *
 * Pierwsza wersja odbierała Z-1 plikiem z edytora tekstu i przeliczała rachunek
 * dziecka jego własną dyskietką. Użytkownik odrzucił ją jako za trudną dla
 * dziesięciolatka (2026-09-16) — i miał rację: szukanie w sieci, dzielenie
 * 25 000 przez 1,44, zapis pliku i jego wysłanie to cztery osobne umiejętności,
 * z których żadna nie jest tematem tej lekcji.
 *
 * Teraz trzy kroki, każdy z innym gestem:
 *
 * 1. **Gablota** — dziecko wybiera dwie dyskietki. Ich pojemności pochodzą z
 *    dwóch źródeł bloku `SourceScan` i przy każdej jest to napisane — to jest
 *    „znajdź w różnych źródłach” z treści zadania.
 * 2. **Sypanie** — przytrzymany przycisk sypie dyskietki do płyty, a liczniki
 *    przyspieszają. Dzielenia nie robi dziecko, tylko płyta: zapełnia się, a
 *    liczba wychodzi sama. Obie dyskietki sypią się naraz do dwóch jednakowych
 *    płyt, więc płyty zapełniają się równo, a liczniki — nie. To jest całe
 *    porównanie z Z-1 w jednym obrazku.
 * 3. **Notatnik** — spostrzeżenia w punktach, uzupełniane w makiecie edytora:
 *    dwie liczby do przepisania z pomiarów, słowa przestawiane stuknięciem i
 *    jedno zdanie od siebie. Każdy punkt jest sprawdzany, więc „zrobione” nie da
 *    się kliknąć — ale to wciąż praca na minuty, nie na wieczór.
 */

interface FloppyPourProps {
  color: string;
  onComplete?: () => void;
}

const ZERO: Record<DiscId, number> = { cd: 0, dvd: 0, bd: 0 };

export function FloppyPour({ color, onComplete }: FloppyPourProps) {
  const [chosen, setChosen] = useState<FloppyId[]>([]);
  const [disc, setDisc] = useState<DiscId>('cd');
  const [heldMs, setHeldMs] = useState<Record<DiscId, number>>(ZERO);
  const [answers, setAnswers] = useState<Answers>({});
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);

  const pair = useMemo(
    () =>
      chosen.length === 2
        ? (FLOPPIES.filter((floppy) => chosen.includes(floppy.id)) as [Floppy, Floppy])
        : null,
    [chosen]
  );

  const allFull = DISCS.every((item) => fillAfter(item.id, heldMs[item.id]) >= 1);

  const choose = (id: FloppyId) => {
    setChosen((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      /* Trzecia dyskietka wypycha pierwszą — dziecko nie musi najpierw niczego odznaczać. */
      return prev.length === 2 ? [prev[1], id] : [...prev, id];
    });
    /* Płyty zostają zapełnione (liczą się w MB), ale zdania notatki zależą od pary. */
    setAnswers({});
    setChecked(false);
    setDone(false);
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="text-sm leading-relaxed sm:text-base">
        <p>
          <strong>Zadanie Z-1.</strong> Znajdź w różnych źródłach informację na temat dyskietek.
          Porównaj pojemność dwóch wybranych rodzajów dyskietek z pojemnością płyt CD, DVD, BD.
          Zapisz spostrzeżenia w kilku punktach w edytorze tekstowym.
        </p>
        <p className="mt-2 text-muted-foreground">
          Wszystko zrobisz tutaj, w trzech krokach: wybierzesz dyskietki, nasypiesz ich do płyt i
          uzupełnisz notatkę tym, co zobaczysz.
        </p>
      </div>

      {/* 01 — gablota */}
      <Step n="01" title="Wybierz dwie dyskietki" color={color} aside={`${chosen.length}/2`}>
        <p className="mb-3 text-sm text-muted-foreground">
          Pojemności znasz już ze źródeł z bloku wyżej — przy każdej dyskietce jest napisane, skąd.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {FLOPPIES.map((floppy) => {
            const picked = chosen.includes(floppy.id);
            return (
              <button
                key={floppy.id}
                type="button"
                onClick={() => choose(floppy.id)}
                aria-pressed={picked}
                className={cn(
                  'relative flex cursor-pointer flex-col items-center border-2 px-1.5 pb-2.5 pt-3 text-center transition-colors',
                  !picked && 'hover:bg-muted/40'
                )}
                style={
                  picked
                    ? { borderColor: color, backgroundColor: `${color}10` }
                    : { borderColor: 'var(--border)' }
                }
              >
                {picked && (
                  <span
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center text-white"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
                <span className="flex h-[66px] items-end" aria-hidden>
                  <FloppyGlyph floppy={floppy} width={floppy.body === '525' ? 64 : 43} />
                </span>
                <span className="mt-2 text-xs font-bold leading-tight sm:text-sm">
                  {floppy.name}
                </span>
                <span className="mt-0.5 font-mono text-xs font-bold tabular-nums" style={{ color }}>
                  {floppy.capacityLabel}
                </span>
                <span className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                  {floppy.source}
                </span>
              </button>
            );
          })}
        </div>
      </Step>

      {/* 02 — sypanie */}
      {pair && (
        <Step n="02" title="Nasyp dyskietek do płyt" color={color}>
          <Pour
            color={color}
            pair={pair}
            disc={disc}
            setDisc={setDisc}
            heldMs={heldMs}
            setHeldMs={setHeldMs}
          />
        </Step>
      )}

      {/* 03 — notatnik */}
      {pair && allFull && (
        <Step n="03" title="Uzupełnij notatkę" color={color}>
          <Notebook
            color={color}
            pair={pair}
            answers={answers}
            setAnswers={setAnswers}
            checked={checked}
            onCheck={(allOk) => {
              setChecked(true);
              if (allOk && !done) {
                setDone(true);
                onComplete?.();
              }
            }}
            done={done}
          />
        </Step>
      )}

      <AnimatePresence>
        {done && pair && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 border-t-2 pt-5"
            style={{ borderColor: color }}
          >
            <Reward color={color} pair={pair} answers={answers} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Kroki                                                               */
/* ------------------------------------------------------------------ */

function Step({
  n,
  title,
  color,
  aside,
  children,
}: {
  n: string;
  title: string;
  color: string;
  aside?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 border-t pt-4"
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="flex items-baseline gap-2.5">
          <span className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
            {n}
          </span>
          <span className="font-bold">{title}</span>
        </p>
        {aside && (
          <span className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
            {aside}
          </span>
        )}
      </div>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* 02 — sypanie                                                        */
/* ------------------------------------------------------------------ */

function Pour({
  color,
  pair,
  disc,
  setDisc,
  heldMs,
  setHeldMs,
}: {
  color: string;
  pair: [Floppy, Floppy];
  disc: DiscId;
  setDisc: (disc: DiscId) => void;
  heldMs: Record<DiscId, number>;
  setHeldMs: (value: Record<DiscId, number>) => void;
}) {
  const [holding, setHolding] = useState(false);
  const heldRef = useRef(heldMs);
  const discRef = useRef(disc);
  const frame = useRef<number | null>(null);
  const last = useRef(0);

  const fill = fillAfter(disc, heldMs[disc]);
  const full = fill >= 1;
  const current = DISCS.find((item) => item.id === disc)!;
  const nextEmpty = DISCS.find((item) => fillAfter(item.id, heldMs[item.id]) < 1);

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setHolding(false);
  }, []);

  useEffect(() => stop, [stop]);

  const tick = useCallback(
    (now: number) => {
      /* Ograniczony krok chroni przed skokiem po powrocie do karty przeglądarki. */
      const dt = Math.max(0, Math.min(now - last.current, 50));
      last.current = now;
      const id = discRef.current;
      const next = Math.min(FILL_MS[id], heldRef.current[id] + dt);
      heldRef.current = { ...heldRef.current, [id]: next };
      setHeldMs(heldRef.current);
      if (next >= FILL_MS[id]) {
        stop();
        return;
      }
      frame.current = requestAnimationFrame(tick);
    },
    [setHeldMs, stop]
  );

  const start = () => {
    if (frame.current !== null || full) return;
    last.current = performance.now();
    setHolding(true);
    frame.current = requestAnimationFrame(tick);
  };

  const pick = (id: DiscId) => {
    stop();
    discRef.current = id;
    setDisc(id);
  };

  /* Tempo spadania dyskietek rośnie razem z licznikiem — trzy biegi zamiast płynnej zmiany, żeby animacja nie restartowała się co klatkę. */
  const progress = heldMs[disc] / FILL_MS[disc];
  const gear = progress < 0.4 ? 0 : progress < 0.75 ? 1 : 2;

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        <strong className="text-foreground">Przytrzymaj przycisk</strong> i patrz, ile dyskietek
        wejdzie na jedną płytę. Obie dyskietki sypią się naraz, każda do swojej płyty.
      </p>

      {/* Wybór płyty */}
      <div className="mb-4 grid grid-cols-3 border" role="group" aria-label="Płyta">
        {DISCS.map((item, index) => {
          const active = item.id === disc;
          const itemFull = fillAfter(item.id, heldMs[item.id]) >= 1;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => pick(item.id)}
              aria-pressed={active}
              className={cn(
                'flex cursor-pointer flex-col items-center px-2 py-2 text-center transition-colors',
                index > 0 && 'border-l',
                !active && 'hover:bg-muted/50'
              )}
              style={active ? { backgroundColor: color, color: 'white' } : undefined}
            >
              <span className="flex items-center gap-1 text-sm font-bold">
                {itemFull && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                {item.short}
              </span>
              <span
                className={cn('font-mono text-xs tabular-nums', !active && 'text-muted-foreground')}
              >
                {item.capacityLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dwie płyty, dwie dyskietki */}
      <div className="grid grid-cols-2 gap-3">
        {pair.map((floppy) => (
          <Lane
            key={floppy.id}
            color={color}
            disc={disc}
            floppy={floppy}
            fill={fill}
            falling={holding}
            gear={gear}
          />
        ))}
      </div>

      {/*
        Przycisk sypania zostaje na miejscu także po zapełnieniu płyty. Gdyby w
        tym samym miejscu wyrastał przycisk „następna płyta”, puszczenie
        trzymanego palca od razu by go kliknęło (przeglądarka oddaje kliknięcie
        elementowi pod palcem, gdy ten wciśnięty zniknął) i dziecko nie
        zobaczyłoby wyniku — tak było w pierwszej wersji.
      */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          type="button"
          disabled={full}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            start();
          }}
          onPointerUp={stop}
          onPointerCancel={stop}
          onLostPointerCapture={stop}
          onKeyDown={(event) => {
            if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
              event.preventDefault();
              start();
            }
          }}
          onKeyUp={(event) => {
            if (event.key === ' ' || event.key === 'Enter') stop();
          }}
          onBlur={stop}
          onContextMenu={(event) => event.preventDefault()}
          className="w-full max-w-xs cursor-pointer select-none px-5 py-3.5 text-base font-bold text-white transition-transform active:scale-[0.98] disabled:cursor-default disabled:opacity-60 disabled:active:scale-100"
          style={{ backgroundColor: color, touchAction: 'none', WebkitTouchCallout: 'none' }}
        >
          {full
            ? `${current.short} pełna!`
            : holding
              ? 'Sypię… trzymaj!'
              : heldMs[disc] > 0
                ? 'Trzymaj dalej'
                : 'Przytrzymaj, żeby sypać'}
        </button>
        {!full ? (
          <p className="text-xs text-muted-foreground">Puść, żeby zatrzymać. Działa też spacja.</p>
        ) : nextEmpty ? (
          <button
            type="button"
            onClick={() => pick(nextEmpty.id)}
            className="inline-flex cursor-pointer items-center gap-2 border-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
            style={{ borderColor: color, color }}
          >
            Teraz płyta {nextEmpty.short} →
          </button>
        ) : (
          <p className="text-center text-sm font-semibold" style={{ color }}>
            Wszystkie trzy płyty pełne — zajrzyj do pomiarów i uzupełnij notatkę.
          </p>
        )}
      </div>

      <Measurements color={color} pair={pair} heldMs={heldMs} />
    </div>
  );
}

const DROP_SECONDS = [0.75, 0.42, 0.2];

function Lane({
  color,
  disc,
  floppy,
  fill,
  falling,
  gear,
}: {
  color: string;
  disc: DiscId;
  floppy: Floppy;
  fill: number;
  falling: boolean;
  gear: number;
}) {
  const count = floppiesAt(disc, fill, floppy);
  const glyph = floppy.body === '525' ? 30 : 20;

  return (
    <div className="flex flex-col items-center border px-2 pb-3 pt-2">
      <p className="flex items-center gap-1.5 text-xs font-bold sm:text-sm">
        <FloppyGlyph floppy={floppy} width={floppy.body === '525' ? 18 : 12} />
        {floppy.short}
      </p>

      {/* Strumień dyskietek nad otworem płyty */}
      <div className="relative h-11 w-full overflow-hidden" aria-hidden>
        {falling &&
          [0, 1, 2].map((index) => (
            <motion.span
              key={`${gear}-${index}`}
              className="absolute left-1/2 top-0"
              style={{ marginLeft: -glyph / 2 + (index - 1) * 6 }}
              initial={{ y: -glyph, opacity: 0 }}
              animate={{ y: [-glyph, 30, 44], opacity: [0, 1, 0], scale: [1, 0.9, 0.35] }}
              transition={{
                duration: DROP_SECONDS[gear],
                repeat: Infinity,
                delay: (DROP_SECONDS[gear] / 3) * index,
                ease: 'easeIn',
              }}
            >
              <FloppyGlyph floppy={floppy} width={glyph} />
            </motion.span>
          ))}
      </div>

      <DiscGlyph disc={disc} fill={fill} color={color} size={120} />

      <p
        className="mt-2 font-mono text-2xl font-bold tabular-nums sm:text-3xl"
        style={{ color: fill >= 1 ? color : undefined }}
      >
        {pl(count)}
      </p>
      <p className="text-xs text-muted-foreground">
        {fill >= 1 ? 'płyta pełna' : 'dyskietek w środku'}
      </p>
    </div>
  );
}

function Measurements({
  color,
  pair,
  heldMs,
}: {
  color: string;
  pair: [Floppy, Floppy];
  heldMs: Record<DiscId, number>;
}) {
  return (
    <div className="mt-5">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Twoje pomiary · ile dyskietek weszło na jedną płytę
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-muted/40 text-xs">
              <th className="border-b px-2 py-1.5 text-left font-semibold">płyta</th>
              {pair.map((floppy) => (
                <th
                  key={floppy.id}
                  className="border-b border-l px-2 py-1.5 text-right font-semibold"
                >
                  dyskietki {floppy.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DISCS.map((item) => {
              const full = fillAfter(item.id, heldMs[item.id]) >= 1;
              return (
                <tr key={item.id} className="border-b last:border-b-0">
                  <td className="px-2 py-1.5">
                    <span className="font-medium">{item.short}</span>{' '}
                    <span className="font-mono text-xs text-muted-foreground">
                      {item.capacityLabel}
                    </span>
                  </td>
                  {pair.map((floppy) => (
                    <td
                      key={floppy.id}
                      className="border-l px-2 py-1.5 text-right font-mono font-bold tabular-nums"
                      style={full ? { color } : undefined}
                    >
                      {full ? (
                        pl(floppiesOn(item.mb, floppy.mb))
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 03 — notatnik                                                       */
/* ------------------------------------------------------------------ */

function Notebook({
  color,
  pair,
  answers,
  setAnswers,
  checked,
  onCheck,
  done,
}: {
  color: string;
  pair: [Floppy, Floppy];
  answers: Answers;
  setAnswers: (update: (prev: Answers) => Answers) => void;
  checked: boolean;
  onCheck: (allOk: boolean) => void;
  done: boolean;
}) {
  const lines = useMemo(() => buildNote(pair), [pair]);
  const verdicts = lines.map((line) => judgeLine(line, answers, pair));
  const okCount = verdicts.filter((verdict) => verdict.ok).length;

  const set = (id: string, value: string | number) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Wpisz liczby ze swoich pomiarów, <strong className="text-foreground">stuknij kropki</strong>
        , żeby wybrać słowo, i dopisz ostatni punkt od siebie.
      </p>

      {/* Makieta edytora tekstu — świadomie poza językiem wizualnym kursu, jak `DesktopFinder`. */}
      <div className="overflow-hidden rounded-md border border-zinc-300 shadow-sm dark:border-zinc-700">
        <div className="flex items-center gap-2 border-b border-zinc-300 bg-zinc-100 px-3 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">moje-nosniki.txt — Notatnik</span>
          {done && (
            <span className="ml-auto flex items-center gap-1 font-semibold" style={{ color }}>
              <Check className="h-3.5 w-3.5" aria-hidden />
              gotowe
            </span>
          )}
        </div>
        <ul className="space-y-1 bg-white px-3 py-3 text-[15px] leading-9 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-4">
          {lines.map((line, index) => {
            const verdict = verdicts[index];
            const mark = checked && line.parts.some((part) => typeof part !== 'string');
            return (
              <li key={`${line.id}-${pair.map((floppy) => floppy.id).join()}`}>
                <div className="flex items-start gap-2">
                  <span className="flex h-9 w-4 shrink-0 items-center justify-center" aria-hidden>
                    {mark ? (
                      verdict.ok ? (
                        <Check className="h-4 w-4" style={{ color }} />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )
                    ) : (
                      <span className="text-zinc-400">–</span>
                    )}
                  </span>
                  <span className={cn('min-w-0 flex-1', line.id === 'para' && 'text-zinc-500')}>
                    {line.parts.map((part, partIndex) =>
                      typeof part === 'string' ? (
                        <span key={partIndex}>{part}</span>
                      ) : (
                        <SlotInput
                          key={part.id}
                          slot={part}
                          value={answers[part.id]}
                          onChange={(value) => set(part.id, value)}
                          color={color}
                          wrong={
                            checked && !judgeLine({ id: part.id, parts: [part] }, answers, pair).ok
                          }
                        />
                      )
                    )}
                  </span>
                </div>
                {checked && !verdict.ok && verdict.hint && (
                  <p className="-mt-1 mb-1 pl-6 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                    {verdict.hint}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {!done && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onCheck(verdicts.every((verdict) => verdict.ok))}
            className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            Sprawdź notatkę
          </button>
          {checked && (
            <span className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
              {okCount}/{lines.length} punktów w porządku
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function SlotInput({
  slot,
  value,
  onChange,
  color,
  wrong,
}: {
  slot: Slot;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  color: string;
  wrong: boolean;
}) {
  const underline = wrong ? '#dc2626' : color;

  if (slot.kind === 'choice') {
    const index = typeof value === 'number' ? value : -1;
    return (
      <button
        type="button"
        onClick={() => onChange((index + 1) % slot.options.length)}
        aria-label={`Wybierz słowo: ${slot.options.join(' / ')}`}
        className="mx-0.5 inline cursor-pointer border-b-2 border-dashed px-1 font-semibold leading-normal transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
        style={{
          borderColor: underline,
          color: index >= 0 ? undefined : 'var(--muted-foreground)',
        }}
      >
        {index >= 0 ? slot.options[index] : '• • •'}
      </button>
    );
  }

  if (slot.kind === 'number') {
    return (
      <input
        type="text"
        inputMode="numeric"
        value={String(value ?? '')}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`Liczba dyskietek ${slot.floppy.short} na płycie ${slot.disc === 'bd' ? 'Blu-ray' : slot.disc.toUpperCase()}`}
        placeholder="?"
        className="mx-0.5 w-20 border-b-2 bg-transparent px-1 text-center font-mono font-bold leading-normal outline-none placeholder:text-zinc-400"
        style={{ borderColor: underline }}
      />
    );
  }

  return (
    <input
      type="text"
      value={String(value ?? '')}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Twoje własne spostrzeżenie"
      placeholder="Moje spostrzeżenie: …"
      className="w-full border-b-2 bg-transparent px-1 leading-normal outline-none placeholder:text-zinc-400"
      style={{ borderColor: underline }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Nagroda                                                             */
/* ------------------------------------------------------------------ */

/** Wzrost dziesięciolatka — punkt odniesienia dla stosu dyskietek. */
const KID_M = 1.4;

function Reward({
  color,
  pair,
  answers,
}: {
  color: string;
  pair: [Floppy, Floppy];
  answers: Answers;
}) {
  /* Każda para ma co najmniej jedną dyskietkę 3,5″ — tylko jej grubość jest pewna. */
  const floppy = pair.find((item) => item.id === 'd35') ?? pair.find((item) => item.body === '35')!;
  const cdStack = (floppiesOn(700, floppy.mb) * FLOPPY_35_MM) / 1000;
  const bdStack = (floppiesOn(25_000, floppy.mb) * FLOPPY_35_MM) / 1000;
  const floors = Math.round(bdStack / 3);
  const meters = (value: number) =>
    value >= 10 ? `${Math.round(value)} m` : `${value.toFixed(1).replace('.', ',')} m`;

  const download = () => {
    const text = noteAsText(buildNote(pair), answers);
    const url = URL.createObjectURL(new Blob(['﻿', text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'moje-nosniki.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_170px] sm:items-end">
      <div className="text-sm leading-relaxed">
        <p className="text-base font-bold">Zadanie Z-1 zaliczone.</p>
        <p className="mt-2">
          Każdy punkt twojej notatki się zgadza. A teraz coś, czego tabela nie pokazuje: dyskietka{' '}
          {floppy.short} ma <strong>{pl(FLOPPY_35_MM)} mm</strong> grubości.
        </p>
        <p className="mt-2">
          Stos z {pl(floppiesOn(700, floppy.mb))} dyskietek na jedną płytę CD miałby{' '}
          <strong>{meters(cdStack)}</strong> —{' '}
          {cdStack > KID_M ? 'byłby wyższy od ciebie' : 'sięgałby ci mniej więcej do pasa'}. Stos na
          jedną płytę Blu-ray: <strong>{meters(bdStack)}</strong>, czyli mniej więcej{' '}
          <strong>blok z {floors} piętrami</strong>. A płyta Blu-ray waży tyle, co kilka kartek.
        </p>
        <button
          type="button"
          onClick={download}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 border-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
          style={{ borderColor: color, color }}
        >
          <Download className="h-4 w-4 shrink-0" aria-hidden />
          Zapisz notatkę na komputerze (.txt)
        </button>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Nieobowiązkowe — plik otworzysz w Notatniku albo w TextEdit.
        </p>
      </div>

      <StackPicture color={color} stackM={cdStack} />
    </div>
  );
}

/** Stos dyskietek na jedną płytę CD obok sylwetki dziecka — w tej samej skali. */
function StackPicture({ color, stackM }: { color: string; stackM: number }) {
  const scale = 90; // px na metr
  const ground = 170;
  const kidH = KID_M * scale;
  const stackH = stackM * scale;
  const rows = Math.round(stackH / 4);

  return (
    <svg
      viewBox="0 0 170 190"
      className="mx-auto w-full max-w-[170px]"
      role="img"
      aria-label={`Stos dyskietek wysoki na ${pl(Math.round(stackM * 100))} cm obok dziecka mającego ok. 140 cm`}
    >
      <line x1="4" y1={ground} x2="166" y2={ground} stroke="currentColor" strokeOpacity="0.35" />
      {/* dziecko */}
      <g fill="currentColor" fillOpacity="0.28">
        <circle cx="45" cy={ground - kidH + 12} r="12" />
        <rect x="31" y={ground - kidH + 27} width="28" height={kidH * 0.42} rx="9" />
        <rect x="34" y={ground - kidH + 27 + kidH * 0.4} width="9" height={kidH * 0.4 - 1} rx="4" />
        <rect x="47" y={ground - kidH + 27 + kidH * 0.4} width="9" height={kidH * 0.4 - 1} rx="4" />
      </g>
      {/* stos */}
      <rect x="95" y={ground - stackH} width="50" height={stackH} fill="#2f3542" />
      {Array.from({ length: rows }, (_, row) => (
        <line
          key={row}
          x1="95"
          x2="145"
          y1={ground - row * 4}
          y2={ground - row * 4}
          stroke="#8b93a1"
          strokeWidth="0.6"
        />
      ))}
      <text x="45" y="186" textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity="0.7">
        ty · 1,4 m
      </text>
      <text x="120" y="186" textAnchor="middle" fontSize="10" fill={color} fontWeight="700">
        stos · {pl(Math.round(stackM * 10) / 10)} m
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Rysunki                                                             */
/* ------------------------------------------------------------------ */

/** Dyskietka w prawdziwych proporcjach: 5,25″ to kwadrat 133 mm, 3,5″ — 90 × 94 mm. */
function FloppyGlyph({ floppy, width }: { floppy: Floppy; width: number }) {
  if (floppy.body === '525') {
    return (
      <svg
        viewBox="0 0 133 133"
        width={width}
        height={width}
        aria-hidden
        className="block shrink-0"
      >
        <rect width="133" height="133" rx="3" fill="#1c1c1e" />
        <rect x="14" y="8" width="78" height="22" rx="1.5" fill="#ecebe6" />
        <circle cx="66.5" cy="66.5" r="20" fill="#7a5c3e" />
        <circle cx="66.5" cy="66.5" r="12" fill="#1c1c1e" />
        <circle cx="66.5" cy="66.5" r="7" fill="#f4f4f5" />
        <rect x="58" y="94" width="17" height="33" rx="8" fill="#7a5c3e" />
        <circle cx="92" cy="58" r="3" fill="#7a5c3e" />
      </svg>
    );
  }
  const body = floppy.id === 'd35ed' ? '#27468a' : '#2f3542';
  return (
    <svg
      viewBox="0 0 90 94"
      width={width}
      height={(width * 94) / 90}
      aria-hidden
      className="block shrink-0"
    >
      <path d="M0 2 Q0 0 2 0 H84 L90 6 V92 Q90 94 88 94 H2 Q0 94 0 92 Z" fill={body} />
      <rect x="22" y="0" width="46" height="31" fill="#c3c8cf" />
      <rect x="48" y="5" width="11" height="21" fill={body} />
      <rect x="11" y="44" width="68" height="46" rx="2" fill="#f4f4f5" />
    </svg>
  );
}

const DISC_TINT: Record<DiscId, [string, string]> = {
  cd: ['#e7e9ec', '#c9ced6'],
  dvd: ['#ebe4f2', '#cdc2dc'],
  bd: ['#e1ebf5', '#bccfe3'],
};

/** Płyta z zapełnieniem rysowanym jako wycinek pierścienia, zgodnie z ruchem wskazówek zegara. */
function DiscGlyph({
  disc,
  fill,
  color,
  size,
}: {
  disc: DiscId;
  fill: number;
  color: string;
  size: number;
}) {
  const gradient = useId();
  const c = 50;
  const outer = 48;
  const inner = 17;
  const [light, dark] = DISC_TINT[disc];

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className="block">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="0.5" stopColor="#fafafa" />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      <circle
        cx={c}
        cy={c}
        r={outer}
        fill={`url(#${gradient})`}
        stroke="#a1a1aa"
        strokeWidth="0.6"
      />
      <path
        d={ringSector(c, inner, outer - 1, fill)}
        fill={color}
        fillOpacity="0.72"
        fillRule="evenodd"
      />
      <circle cx={c} cy={c} r={inner} fill="#f4f4f5" stroke="#a1a1aa" strokeWidth="0.6" />
      <circle
        cx={c}
        cy={c}
        r="6"
        className="fill-white dark:fill-zinc-900"
        stroke="#a1a1aa"
        strokeWidth="0.6"
      />
    </svg>
  );
}

function ringSector(c: number, r0: number, r1: number, fill: number): string {
  if (fill <= 0) return '';
  const f = (value: number) => value.toFixed(2);
  if (fill >= 0.9999) {
    return [
      `M ${f(c + r1)} ${c} A ${r1} ${r1} 0 1 1 ${f(c - r1)} ${c} A ${r1} ${r1} 0 1 1 ${f(c + r1)} ${c} Z`,
      `M ${f(c + r0)} ${c} A ${r0} ${r0} 0 1 0 ${f(c - r0)} ${c} A ${r0} ${r0} 0 1 0 ${f(c + r0)} ${c} Z`,
    ].join(' ');
  }
  const a0 = -Math.PI / 2;
  const a1 = a0 + 2 * Math.PI * fill;
  const large = fill > 0.5 ? 1 : 0;
  const x = (r: number, a: number) => f(c + r * Math.cos(a));
  const y = (r: number, a: number) => f(c + r * Math.sin(a));
  return [
    `M ${x(r1, a0)} ${y(r1, a0)}`,
    `A ${r1} ${r1} 0 ${large} 1 ${x(r1, a1)} ${y(r1, a1)}`,
    `L ${x(r0, a1)} ${y(r0, a1)}`,
    `A ${r0} ${r0} 0 ${large} 0 ${x(r0, a0)} ${y(r0, a0)}`,
    'Z',
  ].join(' ');
}
