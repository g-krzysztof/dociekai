'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MINI_SHELVES, TECZKA_FINDS, TECZKA_NAME, judgeMiniShelf, type MiniShelf } from './przypominajka-l2';

/**
 * Przypominajka L2 — skrót gestu archiwum z L1 (dystans 1): jedna wymyślona
 * teczka (rycerz Dobromir), trzy półki podpisane regułą. Poza postępem
 * (slot `entry` w powłoce lekcji).
 */
export function TeczkaDobromira({ color }: { color: string }) {
  const [verdict, setVerdict] = useState<{ shelf: MiniShelf; ok: boolean; why: string } | null>(null);

  const put = (shelf: MiniShelf) => setVerdict({ shelf, ...judgeMiniShelf(shelf) });

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        W poprzedniej lekcji odkładałeś/łaś teczki na półki według tego, co było w środku. Szybka próba: teczka{' '}
        <strong>„{TECZKA_NAME}”</strong> — na którą półkę ją odłożyć?
      </p>
      <ul className="space-y-1 text-sm leading-relaxed">
        {TECZKA_FINDS.map((find) => (
          <li key={find.text} className="flex items-start gap-2">
            {find.found ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label="znalezione" />
            ) : (
              <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-label="brak" />
            )}
            <span>{find.text}</span>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Półki archiwum">
        {MINI_SHELVES.map((shelf) => {
          const chosen = verdict?.shelf === shelf.id;
          return (
            <button
              key={shelf.id}
              type="button"
              onClick={() => put(shelf.id)}
              className={cn(
                'border px-2 py-2 text-sm transition-colors',
                chosen && verdict.ok
                  ? 'font-semibold text-white'
                  : 'bg-white hover:bg-muted dark:bg-zinc-900'
              )}
              style={chosen && verdict.ok ? { backgroundColor: color, borderColor: color } : undefined}
            >
              <span className="block text-xs text-muted-foreground">{shelf.rule}</span>
            </button>
          );
        })}
      </div>
      {verdict && (
        <p
          className={cn('text-sm leading-relaxed', verdict.ok ? 'font-semibold' : 'font-medium text-destructive')}
          style={verdict.ok ? { color } : undefined}
          aria-live="polite"
        >
          {verdict.why}
        </p>
      )}
    </div>
  );
}
