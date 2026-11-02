'use client';

import { useEffect, useState } from 'react';

type Filtr = 'wszystko' | 'sciaga' | 'fiszki';

const OPCJE: { id: Filtr; nazwa: string }[] = [
  { id: 'wszystko', nazwa: 'Wszystko' },
  { id: 'sciaga', nazwa: 'Ściągi' },
  { id: 'fiszki', nazwa: 'Fiszki' },
];

/**
 * Filtr nad listą materiałów. Lista renderuje się na serwerze (z kodami QR
 * i miniaturami), a filtr tylko ukrywa pozycje przez `data-filtr` w CSS.
 * Stan w adresie (`?rodzaj=fiszki`), bez przeładowania.
 */
export function FiltrRodzaju({ children }: { children: React.ReactNode }) {
  const [filtr, setFiltr] = useState<Filtr>('wszystko');

  useEffect(() => {
    const z = new URLSearchParams(window.location.search).get('rodzaj');
    if (z === 'sciaga' || z === 'fiszki') setFiltr(z);
  }, []);

  const ustaw = (f: Filtr) => {
    setFiltr(f);
    const params = new URLSearchParams(window.location.search);
    if (f === 'wszystko') params.delete('rodzaj');
    else params.set('rodzaj', f);
    const q = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${q ? `?${q}` : ''}`);
  };

  return (
    <div data-filtr={filtr}>
      <div role="group" aria-label="Rodzaj materiału" className="mb-10 inline-flex rounded-lg border border-[var(--mata-linia-mocna)] bg-[var(--mata-gleboka)] p-1">
        {OPCJE.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={filtr === o.id}
            onClick={() => ustaw(o.id)}
            className="rounded-md px-4 py-2 text-sm font-semibold text-[var(--mata-tekst-cichy)] transition-colors hover:text-[var(--mata-tekst)] aria-pressed:bg-[var(--mata-tekst)] aria-pressed:text-[var(--mata-gleboka)]"
          >
            {o.nazwa}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
