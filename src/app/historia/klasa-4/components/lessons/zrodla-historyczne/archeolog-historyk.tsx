'use client';

import { Shovel, ScrollText } from 'lucide-react';

/**
 * Rozszerzenie (R) — „Archeolog kontra historyk”. Nie jest blokiem i nie
 * liczy się do postępu (powłoka nie ma jeszcze bloków `optional`, więc R
 * stoi pod blokiem wykopaliska jako dopisek — jak D w L1).
 *
 * Krótko: kto co robi i że pracują razem — z mostem do bloku 4 (moneta
 * wykopana przez archeologa, odczytana przez historyka).
 */
export function ArcheologHistoryk({ color }: { color: string }) {
  return (
    <aside className="space-y-4 border border-dashed p-5" aria-label="Rozszerzenie">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        <Shovel className="h-4 w-4" aria-hidden /> Rozszerzenie · nie liczy się do postępu
      </p>
      <div className="grid gap-3 text-sm leading-relaxed sm:grid-cols-2">
        <div className="bg-muted p-3">
          <p className="font-semibold">
            <Shovel className="mr-1 inline h-4 w-4" aria-hidden /> Archeolog
          </p>
          <p className="mt-1">
            Szuka pod ziemią: prowadzi wykopaliska, odsłania warstwy pędzelkiem, mierzy głębokości i opisuje
            znaleziska. Z ziemi wyciąga przedmioty — ale nie zawsze wie, co znaczą napisy.
          </p>
        </div>
        <div className="bg-muted p-3">
          <p className="font-semibold">
            <ScrollText className="mr-1 inline h-4 w-4" aria-hidden /> Historyk
          </p>
          <p className="mt-1">
            Czyta źródła: kroniki, listy, dokumenty i napisy — także te na monetach. Pyta, kto coś napisał,
            kiedy i po co, i układa z tego opowieść o przeszłości.
          </p>
        </div>
      </div>
      <p className="text-sm leading-relaxed">
        Najczęściej pracują razem: <strong>archeolog wykopuje monetę, a historyk odczytuje z niej napis</strong>.
        Twoją srebrną monetę z dna wykopaliska odczytasz sam/sama — w następnym bloku.
      </p>
    </aside>
  );
}
