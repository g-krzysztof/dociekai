'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Czy media query pasuje teraz. Na serwerze i podczas hydratacji zwraca `false`,
 * potem React sam przełącza na wartość z przeglądarki — bez rozjazdu hydratacji
 * i bez `setState` w efekcie.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}
