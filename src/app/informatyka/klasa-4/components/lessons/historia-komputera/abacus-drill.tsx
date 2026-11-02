'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Hand, RotateCcw } from 'lucide-react';

/**
 * Haczyk lekcji: dziecko dodaje 47 + 68 na liczydle, zanim ktokolwiek powie mu,
 * czym różni się liczydło od komputera. Różnica ma wyjść z palców, nie z definicji.
 *
 * Cała pointa siedzi w przeniesieniu: rząd ma dziesięć koralików, więc przy
 * dodawaniu dwa razy braknie miejsca i dwa razy trzeba samemu zamienić dziesięć
 * koralików na jeden w rzędzie wyżej. Liczydło nie robi z tego nic — ono tylko
 * pamięta liczbę. W następnym bloku ten sam rachunek robi maszyna Pascala i to
 * ona wykonuje przeniesienia; te dwa bloki mają być czytane razem.
 *
 * Koraliki zachowują się jak na prawdziwym liczydle: kliknięcie koralika numer
 * `i` dosuwa do lewej wszystkie koraliki od pierwszego do `i` (albo odsuwa je,
 * jeśli już tam były). Dlatego jeden klik potrafi ustawić cały rząd — tak samo
 * jak jeden ruch palca po drucie.
 */

const ROWS = [
  { id: 'setki', label: 'setki', unit: 100 },
  { id: 'dziesiatki', label: 'dziesiątki', unit: 10 },
  { id: 'jednosci', label: 'jedności', unit: 1 },
] as const;

type RowId = (typeof ROWS)[number]['id'];
type Beads = Record<RowId, number>;

const EMPTY: Beads = { setki: 0, dziesiatki: 0, jednosci: 0 };

/** Geometria drutu: średnica koralika, odstęp między gniazdami i luz na końcu. */
const BEAD = 22;
const SLOT = 25;
const SLACK = 52;
const TRACK = 10 * SLOT + SLACK;

const STEPS = [
  {
    target: 47,
    prompt: (
      <>
        <strong>Ustaw na liczydle 47.</strong> Cztery koraliki w rzędzie dziesiątek i siedem
        w rzędzie jedności — kliknij koralik, a razem z nim przesuną się wszystkie przed nim.
      </>
    ),
  },
  {
    target: 115,
    prompt: (
      <>
        <strong>Teraz dodaj 68 — nie zsuwając tego, co już stoi.</strong> Dokładaj koraliki:
        osiem w jednościach i sześć w dziesiątkach. W każdym rzędzie jest ich tylko dziesięć,
        więc w pewnym momencie zabraknie ci miejsca. Wtedy zdecyduj sam/sama, co z tym zrobić.
      </>
    ),
  },
];

const valueOf = (beads: Beads) =>
  ROWS.reduce((sum, row) => sum + beads[row.id] * row.unit, 0);

interface AbacusDrillProps {
  color: string;
  onComplete?: () => void;
}

export function AbacusDrill({ color, onComplete }: AbacusDrillProps) {
  const [beads, setBeads] = useState<Beads>(EMPTY);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  /** Ile razy rząd zapełnił się do dziesięciu — tyle razy trzeba było zrobić przeniesienie. */
  const [fullRuns, setFullRuns] = useState(0);
  const [fullRow, setFullRow] = useState<RowId | null>(null);

  const value = valueOf(beads);
  const current = STEPS[Math.min(step, STEPS.length - 1)];

  const move = (rowId: RowId, index: number) => {
    if (finished) return;
    const count = beads[rowId];
    /** Kliknięty koralik już dosunięty → odsuwamy jego i wszystkie za nim. */
    const nextCount = count >= index + 1 ? index : index + 1;
    const next: Beads = { ...beads, [rowId]: nextCount };
    setBeads(next);

    if (nextCount === 10 && count !== 10) {
      setFullRuns((prev) => prev + 1);
      setFullRow(rowId);
    } else if (nextCount < 10) {
      setFullRow((prev) => (prev === rowId ? null : prev));
    }

    const nextValue = valueOf(next);

    // Zsunięcie wszystkiego w trakcie dodawania cofa do pierwszego polecenia —
    // z pustego liczydła nie da się „dodać 68”.
    if (nextValue === 0 && step === 1) {
      setStep(0);
      return;
    }
    if (nextValue !== current.target) return;

    if (step === 0) {
      setStep(1);
    } else {
      setFinished(true);
      onComplete?.();
    }
  };

  const clearAll = () => {
    setBeads(EMPTY);
    setFullRow(null);
    if (!finished) setStep(0);
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <Hand className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <div className="min-w-0 text-sm leading-relaxed sm:text-base">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            Polecenie {Math.min(step + 1, STEPS.length)} z {STEPS.length}
          </p>
          <p>{current.prompt}</p>
        </div>
      </div>

      {/* Poniżej ~400 px koraliki zaczęłyby na siebie nachodzić, więc rama nie
          skaluje się w dół — na wąskim ekranie przewija się w poziomie. */}
      <div className="-mx-1 overflow-x-auto px-1">
        {/* Rama trzyma się szerokości koralików, a nie kolumny tekstu — ma wyglądać
            jak przedmiot leżący na stole, nie jak pasek na całą stronę. */}
        <div className="mx-auto w-fit min-w-[392px] select-none border-4 border-[#a8794b] bg-[#f4e3cd] p-3 dark:bg-[#e8d5bb]">
          {ROWS.map((row) => {
            const count = beads[row.id];
            return (
              <div key={row.id} className="flex items-center gap-3 py-1.5">
                <span className="w-[74px] shrink-0 text-right text-[11px] font-semibold uppercase tracking-wide text-[#7c5a34]">
                  {row.label}
                </span>

                <div className="relative shrink-0" style={{ width: TRACK, height: BEAD + 6 }}>
                  {/* Drut i kreska za piątym koralikiem — jak na liczydle szkolnym,
                      żeby dało się odczytać rząd bez liczenia po jednym. */}
                  <span
                    aria-hidden
                    className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 bg-[#c9a06a]"
                  />
                  <span
                    aria-hidden
                    className="absolute top-0 h-full w-px bg-[#c9a06a]"
                    style={{ left: 5 * SLOT - 1 }}
                  />

                  {Array.from({ length: 10 }, (_, i) => {
                    const active = i < count;
                    return (
                      <motion.button
                        key={i}
                        type="button"
                        onClick={() => move(row.id, i)}
                        aria-label={`Rząd ${row.label}, koralik ${i + 1} z 10`}
                        aria-pressed={active}
                        animate={{ x: i * SLOT + (active ? 0 : SLACK) }}
                        initial={false}
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute top-1/2 cursor-pointer rounded-full border-2 shadow-sm"
                        style={{
                          width: BEAD,
                          height: BEAD,
                          marginTop: -BEAD / 2,
                          backgroundColor: active ? color : '#d9c3a3',
                          borderColor: active
                            ? `color-mix(in oklch, ${color} 70%, black)`
                            : '#b99a72',
                        }}
                      />
                    );
                  })}
                </div>

                <span
                  className="w-6 shrink-0 font-mono text-base font-bold tabular-nums"
                  style={{ color: count === 10 ? '#b91c1c' : '#7c5a34' }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-sm text-muted-foreground">
          Na liczydle stoi teraz{' '}
          <span className="font-mono text-2xl font-bold tabular-nums" style={{ color }}>
            {value}
          </span>
          {step === 1 && !finished && (
            <span className="ml-2">
              — do <span className="font-bold">115</span> brakuje {115 - value}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Zsuń wszystkie koraliki
        </button>
      </div>

      <AnimatePresence>
        {fullRow && !finished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 pl-3 text-sm leading-relaxed"
            style={{ borderColor: '#b91c1c' }}
          >
            <strong>Rząd „{ROWS.find((row) => row.id === fullRow)?.label}” jest pełny.</strong>{' '}
            Jedenastego koralika nie ma i nie będzie. Dziesięć koralików w tym rzędzie znaczy
            dokładnie tyle samo, co jeden koralik w rzędzie wyżej — zsuń te dziesięć z powrotem
            i dołóż jeden wyżej. To się nazywa <strong>przeniesienie</strong> i właśnie robisz je
            ręcznie.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <p>
              <strong>115 — zgadza się.</strong> Teraz najważniejsze pytanie tej lekcji:{' '}
              <strong>ile z tego zrobiło liczydło?</strong> Nic. Ono przez cały czas tylko trzymało
              koraliki tam, gdzie je postawiłeś/postawiłaś. Dodawanie, pilnowanie rzędów
              i przeniesienia — wszystko to była twoja robota.
            </p>
            {fullRuns >= 2 && (
              <p className="mt-2">
                Dwa razy zabrakło ci miejsca w rzędzie i dwa razy sam/sama zamieniłeś/zamieniłaś
                dziesięć koralików na jeden. Zapamiętaj tę liczbę: <strong>dwa przeniesienia</strong>.
                Za chwilę ten sam rachunek zrobi maszyna sprzed prawie czterystu lat — i to ona
                wykona je za ciebie.
              </p>
            )}
            {fullRuns < 2 && (
              <p className="mt-2">
                Za chwilę ten sam rachunek — 47 dodać 68 — zrobi maszyna sprzed prawie czterystu
                lat. Zwróć uwagę na jedną rzecz: <strong>kto pilnuje przeniesień</strong>.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
