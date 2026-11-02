'use client';

import { cn } from '@/lib/utils';
import { LetterArt } from '../../scratch/stage-view';
import type { StageRun } from '../../scratch/stage-engine';

/**
 * Oś czasu sceny — **przyrząd tej lekcji**, wracający w czterech z pięciu bloków
 * i w raporcie z jego własnego programu.
 *
 * Cała lekcja mieści się w różnicy między „po kolei” a „jednocześnie”, a ta
 * różnica jest **geometryczna**: zdarzenia w tej samej chwili układają się w
 * jedną pionową kreskę, a rozłożone w czasie — w schodki. Zdanie „znikają
 * jednocześnie” da się w ten sposób **zobaczyć**, zamiast brać na słowo; i to
 * samo widać potem w raporcie z jego własnego programu.
 *
 * Znaczki są trzy i różnią się kształtem, nie tylko kolorem: kropka to
 * pokazanie, obwódka — ukrycie, romb — nadany komunikat. Kolor bierze się z
 * litery, więc wiersz i znaczek na scenie mówią o tym samym duszku.
 */

export interface TrackRow {
  id: string;
  /** Litera duszka, gdy ją ma — wtedy wiersz jest podpisany kafelkiem ze sceny. */
  letter?: string;
  label: string;
}

interface TimeTrackProps {
  rows: TrackRow[];
  run: StageRun | null;
  /** Bieżąca chwila odtwarzania — rysuje suwak nad osią. */
  now?: number;
  /** Zdanie pod osią; domyślne tłumaczy, co znaczy kreska, a co schodki. */
  note?: string;
  className?: string;
}

/** Oś nigdy nie jest krótsza niż to, żeby pojedyncze zdarzenie nie siedziało w rogu. */
const MIN_SPAN = 2000;

export function TimeTrack({ rows, run, now, note, className }: TimeTrackProps) {
  const span = Math.max(run?.duration ?? 0, MIN_SPAN);
  const seconds = Math.ceil(span / 1000);
  const at = (t: number) => `${Math.min(100, (t / span) * 100)}%`;

  return (
    <div className={cn('border bg-white p-3 dark:bg-zinc-900/80', className)}>
      <div className="grid gap-x-2 gap-y-1.5" style={{ gridTemplateColumns: 'auto minmax(0,1fr)' }}>
        <span />
        <div className="relative h-4">
          {/* Ostatnia podziałka trzyma się prawej krawędzi — wyśrodkowana zawijałaby „s” do nowej linijki. */}
          {Array.from({ length: seconds + 1 }).map((_tick, i) => (
            <span
              key={i}
              className={cn(
                'absolute top-0 whitespace-nowrap text-[10px] tabular-nums text-muted-foreground',
                i === seconds ? 'right-0' : '-translate-x-1/2'
              )}
              style={i === seconds ? undefined : { left: at(i * 1000) }}
            >
              {i} s
            </span>
          ))}
        </div>

        {rows.map((row) => (
          <RowLine key={row.id} row={row} run={run} at={at} />
        ))}
      </div>

      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
        {note ?? (
          <>
            Znaczki w <strong className="text-foreground">jednej pionowej kresce</strong> znaczą „w
            tej samej chwili”. Rozsunięte w <strong className="text-foreground">schodki</strong> —
            „po kolei”.
          </>
        )}
      </p>

      {now != null && run?.started && (
        <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
          zegar: {(now / 1000).toFixed(1)} s
        </p>
      )}
    </div>
  );
}

function RowLine({
  row,
  run,
  at,
}: {
  row: TrackRow;
  run: StageRun | null;
  at: (t: number) => string;
}) {
  const marks = (run?.log ?? []).filter(
    (step) =>
      step.actorId === row.id &&
      (step.kind === 'pokazanie' || step.kind === 'ukrycie' || step.kind === 'komunikat')
  );

  return (
    <>
      <div className="flex items-center justify-end">
        {row.letter ? (
          <LetterArt letter={row.letter} className="h-6 w-6 rounded-[5px] text-xs sm:h-6 sm:w-6 sm:text-xs" />
        ) : (
          <span className="text-[11px] font-medium text-muted-foreground">{row.label}</span>
        )}
      </div>
      <div className="relative h-6 border-b border-dashed">
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden />
        {marks.map((mark, index) => (
          <span
            key={index}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: at(mark.t) }}
            title={`${row.label}: ${labelOf(mark.kind)} w ${(mark.t / 1000).toFixed(1)} s`}
          >
            <Mark kind={mark.kind} />
          </span>
        ))}
        <span className="sr-only">
          {row.label}:{' '}
          {marks.length === 0
            ? 'nic się nie dzieje'
            : marks
                .map((mark) => `${labelOf(mark.kind)} w ${(mark.t / 1000).toFixed(1)} s`)
                .join(', ')}
        </span>
      </div>
    </>
  );
}

function labelOf(kind: string): string {
  if (kind === 'pokazanie') return 'pokazuje się';
  if (kind === 'ukrycie') return 'znika';
  return 'nadaje komunikat';
}

function Mark({ kind }: { kind: string }) {
  if (kind === 'pokazanie')
    return <span className="block h-2.5 w-2.5 rounded-full bg-[#4cbb17]" aria-hidden />;
  if (kind === 'ukrycie')
    return (
      <span
        className="block h-2.5 w-2.5 rounded-full border-2 border-[#e2564a] bg-white dark:bg-zinc-900"
        aria-hidden
      />
    );
  return <span className="block h-2 w-2 rotate-45 bg-[#ffbf00]" aria-hidden />;
}
