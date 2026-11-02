'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, Minus, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Zadanie praktyczne **wykonywane na stronie**, odbierane po werdykcie punkt po punkcie.
 *
 * Trzy etapy, jak w każdym zadaniu kursu:
 *
 * 1. **Zlecenie** — opis *wyniku* (nigdy listy kroków), opcjonalny podgląd celu i jawna
 *    lista kryteriów: dziecko z góry wie, z czym jego praca zostanie porównana.
 * 2. **Warsztat** — sama praca dziecka, `workshop`. To **strona**, nie cudzy program:
 *    nic tu nie każe wyjść z kursu ani do niczego wracać z plikiem.
 * 3. **Odbiór** — przycisk „Sprawdź”, werdykt punkt po punkcie z konkretem, raport z
 *    jego własnej pracy pokazanej z powrotem i „Przyjęte” dopiero, gdy **wszystkie**
 *    kryteria są na zielono. Poprawki są darmowe: liczy się ostatnia próba.
 *
 * Powłoka jest pusta merytorycznie. Stan pracy (klocki, tekst, slajdy) zostaje w lekcji,
 * która przekazuje `judge` — zamknięcie na jej stanie — i `workshop`. Werdykty liczą
 * czyste funkcje w folderze lekcji; powłoka nigdy nie wie, co sprawdza.
 *
 * Wspólne dla kursów blokowych (informatyka, historia) od 2026-09-25 — wypromowane
 * z `app/informatyka/klasa-4/components/` przy drugim konsumencie.
 *
 * Typy `Proof*` należą do tego pliku, bo stoją na nich sędziowie lekcji (`z3.ts`, `z10.ts`,
 * `judge.ts`…) — nie ma znaczenia, czy praca przyszła ze strony, czy (dawniej) z pliku.
 */

export interface ProofCriterion {
  id: string;
  /** Zdanie widoczne **przed** sprawdzeniem: czego dokładnie będziemy szukać. */
  label: string;
}

export interface ProofVerdict {
  ok: boolean;
  /** Konkret: co znaleziono, a czego brakuje. To jest cała wartość odbioru. */
  note?: ReactNode;
}

export type ProofVerdicts = Record<string, ProofVerdict>;

export interface ProofOutcome<T> {
  verdicts: ProofVerdicts;
  /** Dane dla `renderReport` — wszystko, co lekcja chce pokazać z wnętrza pracy. */
  data: T;
}

interface TaskShellProps<T> {
  color: string;
  /** Zlecenie: opis **wyniku**, nie kroków. */
  brief: ReactNode;
  /** Podgląd celu — zwykle działająca makieta tego, co ma powstać. */
  goal?: ReactNode;
  criteria: ProofCriterion[];
  /** Nagłówek listy kryteriów w zleceniu. */
  criteriaHeading?: string;
  /** Nazwa etapu 02 — domyślnie „Warsztat”. */
  workshopLabel?: string;
  /** Praca dziecka. Jej stan trzyma lekcja, nie powłoka. */
  workshop: ReactNode;
  /** Wołane przyciskiem „Sprawdź” — zawsze na bieżącym stanie pracy. */
  judge: () => ProofOutcome<T>;
  checkLabel?: string;
  /** `false`, gdy praca nie ma jeszcze z czego być sprawdzona (np. nie wybrano odbiorcy). */
  canCheck?: boolean;
  /** „Co znalazłam w twojej pracy” — rysowane pod werdyktem, z danych **z chwili sprawdzenia**. */
  renderReport?: (data: T) => ReactNode;
  /** Zdanie po przyjęciu pracy. */
  acceptedText: ReactNode;
  /** Nagroda pod „Przyjęte” — narzędzie z lekcji wycelowane w pracę dziecka, nie ptaszek. */
  reward?: ReactNode;
  /** Czyści pracę w lekcji; powłoka czyści przy tym werdykt. Bez tego nie ma przycisku. */
  onReset?: () => void;
  resetLabel?: string;
  onComplete?: () => void;
}

export function TaskShell<T>({
  color,
  brief,
  goal,
  criteria,
  criteriaHeading = 'Czego będę szukać w twojej pracy',
  workshopLabel = 'Warsztat',
  workshop,
  judge,
  checkLabel = 'Sprawdź moją pracę',
  canCheck = true,
  renderReport,
  acceptedText,
  reward,
  onReset,
  resetLabel = 'Zacznij od nowa',
  onComplete,
}: TaskShellProps<T>) {
  const [outcome, setOutcome] = useState<ProofOutcome<T> | null>(null);
  const [attempts, setAttempts] = useState(0);
  const reported = useRef(false);

  const accepted = outcome !== null && criteria.every((item) => outcome.verdicts[item.id]?.ok);

  useEffect(() => {
    if (!accepted || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [accepted, onComplete]);

  const check = () => {
    setAttempts((value) => value + 1);
    setOutcome(judge());
  };

  return (
    <div className="border bg-white dark:bg-zinc-900/80">
      <TaskStage number="01" label="Zlecenie" color={color}>
        <div className="text-sm leading-relaxed sm:text-base">{brief}</div>
        {goal && <div className="mt-4">{goal}</div>}

        {outcome === null && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{criteriaHeading}</p>
            <CriteriaList criteria={criteria} color={color} />
          </div>
        )}
      </TaskStage>

      <TaskStage number="02" label={workshopLabel} color={color}>
        {workshop}
      </TaskStage>

      <TaskStage number="03" label="Odbiór" color={color} last>
        {outcome && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
              Wynik sprawdzenia
            </p>
            <CriteriaList criteria={criteria} color={color} verdicts={outcome.verdicts} />
            {renderReport && <div className="mt-4">{renderReport(outcome.data)}</div>}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={check}
            disabled={!canCheck}
            className="cursor-pointer border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: color, color }}
          >
            {checkLabel}
          </button>
          {attempts > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground">
              próba {attempts}
              {attempts > 1 && ' — poprawki nic nie kosztują, liczy się ostatnia'}
            </span>
          )}
          {attempts > 0 && !accepted && onReset && (
            <button
              type="button"
              onClick={() => {
                onReset();
                setOutcome(null);
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <RotateCcw className="h-3 w-3" aria-hidden />
              {resetLabel}
            </button>
          )}
        </div>

        {accepted && (
          <div className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3"
              style={{ backgroundColor: `${color}14` }}
            >
              <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
                <Check className="h-4 w-4 shrink-0" aria-hidden />
                Przyjęte.
              </p>
              <div className="mt-2 text-sm leading-relaxed">{acceptedText}</div>
            </motion.div>
            {reward && <div className="mt-3">{reward}</div>}
          </div>
        )}
      </TaskStage>
    </div>
  );
}

/**
 * Lista kryteriów. **Przed sprawdzeniem stoi w „Zleceniu”** („czego będę szukać”), a po nim
 * przenosi się do „Odbioru” — tuż nad raport i tuż przy przycisku, który ją odświeża.
 * Zostawiona w pierwszym etapie pokazywałaby werdykt o dwa ekrany wyżej niż akcja.
 */
export function CriteriaList({
  criteria,
  color,
  verdicts,
}: {
  criteria: ProofCriterion[];
  color: string;
  verdicts?: ProofVerdicts;
}) {
  return (
    <ul className="mt-2 space-y-1.5">
      {criteria.map((item) => {
        const verdict = verdicts?.[item.id];
        return (
          <li key={item.id} className="flex items-start gap-2.5">
            <VerdictMark verdict={verdict} color={color} />
            <span className="min-w-0 text-sm leading-snug">
              <span className={cn(verdict && !verdict.ok && 'font-medium')}>{item.label}</span>
              {verdict?.note && (
                <span
                  className={cn(
                    'mt-0.5 block text-xs leading-relaxed',
                    verdict.ok ? 'text-muted-foreground' : 'text-amber-700 dark:text-amber-400'
                  )}
                >
                  {verdict.note}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Jeden z trzech etapów. Numer jest tą samą typografią co numer bloku lekcji. */
export function TaskStage({
  number,
  label,
  color,
  last,
  children,
}: {
  number: string;
  label: string;
  color: string;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={cn('p-5 sm:p-6', !last && 'border-b')}>
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-mono text-lg font-bold leading-none tabular-nums" style={{ color }}>
          {number}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          {label}
        </span>
      </div>
      {children}
    </section>
  );
}

function VerdictMark({ verdict, color }: { verdict?: ProofVerdict; color: string }) {
  if (!verdict)
    return (
      <span
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-dashed text-muted-foreground"
        aria-hidden
      >
        <Minus className="h-2.5 w-2.5" />
      </span>
    );
  return (
    <span
      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-white"
      style={{ backgroundColor: verdict.ok ? color : '#d4643a' }}
      aria-hidden
    >
      {verdict.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
    </span>
  );
}
