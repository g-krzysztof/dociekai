'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Czy wolno odpalić scrubowaną, przypiętą choreografię przewodnika.
 *
 * Zwraca `false` na serwerze i w pierwszej klatce po stronie klienta — ta sama
 * filozofia co flaga `ready` w `useMathProgress`: domyślny render jest zawsze
 * wersją statyczną, więc nie ma szansy na hydration mismatch.
 *
 * Pinowanie wyłączamy poniżej `lg` (na telefonie przypięta scena jest wroga)
 * oraz zawsze przy `prefers-reduced-motion`. To pierwsza obsługa reduced-motion
 * w tym repo — używaj tego hooka, nie własnego `matchMedia`.
 */
export function useCinematic(minWidth = 1024): boolean {
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${minWidth}px)`);
    const apply = () => setWide(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, [minWidth]);

  return wide && !reduced;
}
