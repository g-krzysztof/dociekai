'use client';

import type { ReactNode } from 'react';
import { Repeat } from 'lucide-react';

interface PrzypominajkaProps {
  /** Lekcja, do której pytanie wraca — jej `short` stoi w nagłówku karty. */
  from: { short: string };
  /** Ile lekcji wstecz (historia: 1, 3 albo 8 na przemian). */
  distance: number;
  color: string;
  /** Samo pytanie i gest odpowiedzi (przesuń na osi, wskaż w tekście) — z lekcji. */
  children: ReactNode;
}

/**
 * Przypominajka — karta powtórki na wejściu lekcji, wstawiana przez `entry`
 * powłoki kursu (`HistLessonShell`, `PolLessonShell`). **Nie jest blokiem**:
 * nie ma numeru i nie liczy się do postępu, bo powtórka ma być lekka, a nie
 * bramką przed nowym tematem. Wypromowana z historii w E1 kursu polskiego.
 *
 * Ramka jest pusta merytorycznie; pytanie i gest przynosi lekcja. Odpowiedź
 * to gest, nie wybór z trzech, tam gdzie się da — ta sama zasada co w blokach.
 */
export function Przypominajka({ from, distance, color, children }: PrzypominajkaProps) {
  return (
    <aside
      aria-label="Przypominajka"
      className="border-l-2 py-1 pl-4 sm:pl-5"
      style={{ borderColor: color }}
    >
      <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <Repeat className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden />
        <span className="font-semibold uppercase tracking-wide" style={{ color }}>
          Przypominajka
        </span>
        <span aria-hidden>·</span>
        <span>
          {distance === 1 ? 'z poprzedniej lekcji' : 'z wcześniejszej lekcji'}: {from.short}
        </span>
      </p>
      {children}
    </aside>
  );
}
