'use client';

import { useEffect, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { useAuth } from '@/components/auth-context';
import { useTeczka } from '../lib/teczka';
import { TeczkaZawartosc, usePowrotZTeczka } from './teczka';

/**
 * Teczka wpięta w kolumnę „do druku” strony modułu. Pojawia się w chwili,
 * gdy gość odłoży pierwszy materiał — tuż pod przyciskiem, który kliknął —
 * i zostaje do końca wizyty, także po pobraniu wszystkiego.
 */
export function TeczkaKolumna() {
  const wpisy = useTeczka();
  const { isAuthenticated, loading } = useAuth();
  const [byla, setByla] = useState(false);
  usePowrotZTeczka();

  useEffect(() => {
    if (wpisy.length) setByla(true);
  }, [wpisy.length]);

  if (wpisy.length || byla) {
    return (
      <section aria-label="Twoja teczka" className="teczka-panel mt-5 p-4">
        <TeczkaZawartosc
          naglowek={
            <h3 className="flex items-center gap-2 text-sm font-extrabold tracking-tight">
              <FolderOpen aria-hidden className="h-4 w-4" />
              Twoja teczka
            </h3>
          }
        />
      </section>
    );
  }

  if (loading || isAuthenticated) return null;
  return (
    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
      Treść obejrzysz bez konta. Plik PDF pobierasz z darmowym kontem.
    </p>
  );
}
