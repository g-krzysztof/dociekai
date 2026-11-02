'use client';

import { useEffect, useRef } from 'react';

/**
 * Dla widżetów z wieloma rundami/pytaniami w jednym kroku (quiz, warsztat błędów…):
 * runda zwykle kończy się wyższą kartą wyniku/feedbacku niż zaczyna się następna,
 * więc bez korekty przeglądarka zostawia scrollTop bez zmian i widok ląduje w środku
 * nowej treści — ucięta góra, wygląda jak przejście do innego kroku/modułu.
 * Zwraca ref na kontener widgetu; przy każdej zmianie `trigger` (np. `${index}-${finished}`,
 * pomijając pierwsze wyrenderowanie) przewija do rodzica `<section id>` (nagłówek kroku
 * albo bloku zostaje widoczny) — to samo miejsce, do którego prowadzą linki w bocznym planie lekcji.
 *
 * Wspólny dla kursów matematyki i informatyki (przeniesiony z
 * `matematyka/klasa-4/components/lesson-shell.tsx`, który re-eksportuje go dalej,
 * żeby kilkadziesiąt tamtejszych widżetów nie musiało zmieniać importu).
 */
export function useSectionScrollAnchor(trigger: string | number | boolean) {
  const ref = useRef<HTMLDivElement>(null);
  // Poprzednia wartość triggera, nie flaga "czy to pierwszy render" — flaga
  // psuje się pod React StrictMode (dev), które w trybie deweloperskim
  // wywołuje efekty mountujące dwukrotnie na tej samej instancji: pierwsze
  // wywołanie zdążało ustawić flagę na `false`, więc drugie (wciąż część
  // tego samego logicznego mountu) już przechodziło dalej i odpalało
  // scrollIntoView na starcie — w lekcji z kilkoma widgetami korzystającymi
  // z tego hooka naraz każdy z nich przewijał do siebie, a wygrywał ten
  // zamontowany jako ostatni (efektywnie: strona ładowała się od razu na
  // dole). Porównanie z poprzednią wartością jest idempotentne niezależnie
  // od tego, ile razy React wywoła efekt dla tego samego triggera.
  const prevTrigger = useRef(trigger);

  useEffect(() => {
    if (prevTrigger.current === trigger) return;
    prevTrigger.current = trigger;
    const section = ref.current?.closest('section[id]');
    (section ?? ref.current)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [trigger]);

  return ref;
}
