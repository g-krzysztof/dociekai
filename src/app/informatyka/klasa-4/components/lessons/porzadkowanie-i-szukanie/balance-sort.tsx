'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Haczyk lekcji — **informacja ukryta, zdobywana wyłącznie porównaniami**.
 *
 * Dziecko proszone o ustawienie rzeczy „od najlżejszej” patrzy na nie i ustawia.
 * Komputer tak nie umie: on nigdy nie widzi całego zbioru naraz, tylko potrafi
 * **porównać dwa elementy** i zapamiętać wynik. Dlatego pudełka w tym bloku są
 * nie do odróżnienia wzrokiem, a jedyne, co da się z nimi zrobić, to położyć dwa
 * na wadze. Po każdym ważeniu przybywa jeden fakt („C jest cięższe od A”) i z
 * tych faktów — nie z patrzenia — trzeba złożyć kolejność.
 *
 * To jest w kursie nowy rodzaj zadania: **nie „zrób”, tylko „dowiedz się”**. A
 * licznik ważeń robi z tego coś, o czym jest cała informatyka: to samo zadanie
 * da się wykonać taniej albo drożej, i to jest różnica między algorytmami.
 *
 * Wagi są prawdziwymi liczbami, ale dziecko nigdy ich nie widzi przed końcem —
 * werdykt porównuje ustawienie z faktycznym porządkiem, a nie z zapisaną z ręki
 * odpowiedzią.
 */

interface Crate {
  id: string;
  /** Ukryta masa — nigdy nie pokazywana przed końcem bloku. */
  weight: number;
}

const CRATES: Crate[] = [
  { id: 'A', weight: 420 },
  { id: 'B', weight: 180 },
  { id: 'C', weight: 640 },
  { id: 'D', weight: 95 },
  { id: 'E', weight: 310 },
];

/** Najkrótsze możliwe sortowanie pięciu elementów przez porównania. */
const BEST = 7;

const TRUE_ORDER = [...CRATES].sort((a, b) => a.weight - b.weight).map((c) => c.id);

interface Fact {
  lighter: string;
  heavier: string;
}

interface BalanceSortProps {
  color: string;
  onComplete?: () => void;
}

export function BalanceSort({ color, onComplete }: BalanceSortProps) {
  const [pan, setPan] = useState<string[]>([]);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [shelf, setShelf] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<'ok' | 'zle' | null>(null);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(verdict === 'ok' ? 'gotowe' : 'praca');

  useEffect(() => {
    if (verdict !== 'ok' || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [verdict, onComplete]);

  const weigh = (id: string) => {
    if (verdict === 'ok') return;
    const next = pan.includes(id) ? pan.filter((x) => x !== id) : [...pan, id];
    if (next.length < 2) {
      setPan(next);
      return;
    }
    const [a, b] = next;
    const wa = CRATES.find((c) => c.id === a) as Crate;
    const wb = CRATES.find((c) => c.id === b) as Crate;
    const fact: Fact =
      wa.weight < wb.weight ? { lighter: a, heavier: b } : { lighter: b, heavier: a };
    setFacts((prev) =>
      prev.some((f) => f.lighter === fact.lighter && f.heavier === fact.heavier)
        ? prev
        : [...prev, fact]
    );
    setPan([]);
  };

  const place = (id: string) => {
    if (verdict === 'ok') return;
    setShelf((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setVerdict(null);
  };

  const check = () => {
    if (shelf.length !== CRATES.length) return;
    setVerdict(shelf.every((id, i) => id === TRUE_ORDER[i]) ? 'ok' : 'zle');
  };

  const waiting = CRATES.filter((c) => !shelf.includes(c.id));

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm font-semibold sm:text-base">
        Pięć jednakowych skrzynek. Ustaw je od najlżejszej do najcięższej.
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        Podnieść ich nie możesz — tak samo jak komputer, który nigdy nie widzi całego zbioru naraz.
        Możesz tylko położyć dwie na wadze i zapamiętać, która przeważyła.
      </p>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_210px]">
        <div className="min-w-0">
          {/* Waga: dwie szalki i skrzynki do położenia. */}
          <div className="border bg-zinc-50 p-3 dark:bg-zinc-800/60">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Scale className="h-3.5 w-3.5" aria-hidden />
              Waga — wybierz dwie skrzynki
            </p>
            <div className="flex flex-wrap gap-2">
              {CRATES.map((crate) => (
                <button
                  key={crate.id}
                  type="button"
                  onClick={() => weigh(crate.id)}
                  disabled={verdict === 'ok'}
                  aria-pressed={pan.includes(crate.id)}
                  className={cn(
                    'flex h-14 w-14 items-center justify-center border-2 font-mono text-lg font-bold transition disabled:opacity-60',
                    !pan.includes(crate.id) && verdict !== 'ok' && 'hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                  style={{
                    borderColor: pan.includes(crate.id) ? color : `${color}44`,
                    backgroundColor: pan.includes(crate.id) ? `${color}18` : undefined,
                  }}
                >
                  {crate.id}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs tabular-nums text-muted-foreground">
              ważeń: <strong className="text-foreground">{facts.length}</strong>
              {facts.length > 0 && ` · najkrócej da się w ${BEST}`}
            </p>
          </div>

          {/* Półka — kolejność składana przez dziecko. */}
          <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Półka: od najlżejszej do najcięższej
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: CRATES.length }).map((_, slot) => {
              const id = shelf[slot];
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => id && place(id)}
                  disabled={!id || verdict === 'ok'}
                  className={cn(
                    'flex h-14 w-14 items-center justify-center border-2 font-mono text-lg font-bold',
                    !id && 'border-dashed text-muted-foreground'
                  )}
                  style={{
                    borderColor:
                      verdict === 'ok'
                        ? color
                        : verdict === 'zle'
                          ? '#d97706'
                          : id
                            ? `${color}88`
                            : `${color}33`,
                  }}
                  aria-label={id ? `Miejsce ${slot + 1}: skrzynka ${id} — kliknij, aby zdjąć` : `Miejsce ${slot + 1}: puste`}
                >
                  {id ?? slot + 1}
                </button>
              );
            })}
          </div>
          {waiting.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs text-muted-foreground">Do postawienia:</p>
              <div className="flex flex-wrap gap-2">
                {waiting.map((crate) => (
                  <button
                    key={crate.id}
                    type="button"
                    onClick={() => place(crate.id)}
                    className="flex h-11 w-11 items-center justify-center border-2 font-mono font-bold transition hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ borderColor: `${color}44` }}
                  >
                    {crate.id}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Kartoteka faktów — to jedyna wiedza, jaką dziecko ma. */}
        <div className="border bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Co już wiesz
          </p>
          {facts.length === 0 ? (
            <p className="text-xs italic leading-snug text-muted-foreground">
              Nic. Na razie wszystkie skrzynki są dla ciebie takie same.
            </p>
          ) : (
            <ul className="space-y-1 text-sm">
              {facts.map((fact, i) => (
                <li key={i} className="font-mono tabular-nums">
                  {fact.lighter} &lt; {fact.heavier}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {shelf.length === CRATES.length && verdict !== 'ok' && (
        <button
          type="button"
          onClick={check}
          className="mt-4 px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          Sprawdź kolejność
        </button>
      )}

      <AnimatePresence mode="wait">
        {verdict === 'ok' ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Kolejność się zgadza — ustalona w <strong>{facts.length}</strong>{' '}
                {facts.length === 1 ? 'ważeniu' : 'ważeniach'}.
              </span>
            </p>
            <p className="mt-2 text-sm tabular-nums">
              Prawdziwe masy:{' '}
              {TRUE_ORDER.map((id) => `${id} — ${CRATES.find((c) => c.id === id)?.weight} g`).join(
                ' · '
              )}
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Tak właśnie porządkuje komputer: <strong>nie patrzy, tylko porównuje parami</strong> i
              zapamiętuje wyniki. Każde porównanie kosztuje, więc pytanie „ile ich potrzeba” jest
              prawdziwym pytaniem — pięć skrzynek da się ustawić już w{' '}
              <strong>{BEST} ważeniach</strong>, a przy nieuważnym szukaniu łatwo zrobić dwa razy
              tyle.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Właśnie dlatego komputery mają na sortowanie osobne, wymyślone przez ludzi sposoby —
              algorytmy. Różnią się dokładnie tym: ile porównań zużywają.
            </p>
          </motion.div>
        ) : verdict === 'zle' ? (
          <motion.p
            key="zle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30"
          >
            Coś stoi nie na swoim miejscu. Sprawdź swoją kartotekę: czy z zapisanych faktów naprawdę
            wynika ta kolejność? Jeśli o którejś parze nic nie wiesz —{' '}
            <strong>trzeba ją zważyć</strong>.
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
