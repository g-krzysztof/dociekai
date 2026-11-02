'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Zamknięcie lekcji: dziecko wybiera jedno zastosowanie, w którym u niego w domu
 * używa się płatnego (albo nielegalnie skopiowanego) programu, i dostaje kartkę
 * z darmowym odpowiednikiem. Jedno, a nie wszystkie — ten sam wzorzec co
 * `MyRuleCard` w pierwszej lekcji kursu.
 *
 * Pole na „który sprawdzę pierwszy" jest opcjonalne i nie blokuje ukończenia
 * bloku.
 */

interface Swap {
  id: string;
  paid: string;
  free: string;
  card: string;
}

const SWAPS: Swap[] = [
  {
    id: 'tekst',
    paid: 'Do pisania — Microsoft Word',
    free: 'LibreOffice Writer albo Dokumenty Google',
    card: 'Zamiast Worda: LibreOffice Writer lub Dokumenty Google — za darmo i legalnie.',
  },
  {
    id: 'obraz',
    paid: 'Do rysowania i zdjęć — Adobe Photoshop',
    free: 'GIMP, Krita albo Photopea',
    card: 'Zamiast Photoshopa: GIMP, Krita lub Photopea — za darmo i legalnie.',
  },
  {
    id: 'liczby',
    paid: 'Do tabel i obliczeń — Microsoft Excel',
    free: 'LibreOffice Calc albo Arkusze Google',
    card: 'Zamiast Excela: LibreOffice Calc lub Arkusze Google — za darmo i legalnie.',
  },
  {
    id: 'pokaz',
    paid: 'Do prezentacji — Microsoft PowerPoint',
    free: 'LibreOffice Impress albo Prezentacje Google',
    card: 'Zamiast PowerPointa: LibreOffice Impress lub Prezentacje Google — za darmo i legalnie.',
  },
  {
    id: 'kupione',
    paid: 'U mnie w domu wszystko jest kupione i legalne',
    free: 'to najlepsza sytuacja',
    card: 'U mnie wszystko jest legalne — ale znam darmowy program, który mogę polecić komuś, kogo nie stać na płatny.',
  },
  {
    id: 'nie-wiem',
    paid: 'Nie wiem, z czego u nas się korzysta',
    free: 'zapytaj rodzica',
    card: 'Zapytam rodzica, jakie programy są na naszym komputerze i czy są za nie zapłacone.',
  },
];

interface SwapForFreeProps {
  color: string;
  onComplete?: () => void;
}

export function SwapForFree({ color, onComplete }: SwapForFreeProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const [first, setFirst] = useState('');

  const choose = (id: string) => {
    setPicked(id);
    onComplete?.();
  };

  const swap = SWAPS.find((s) => s.id === picked) ?? null;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Prawie do każdego płatnego programu jest darmowy odpowiednik. <strong>Wybierz jedno
        zastosowanie</strong> — to, w którym u ciebie w domu przydałaby się zmiana.
      </p>

      <ul className="grid gap-2 sm:grid-cols-2">
        {SWAPS.map((s) => {
          const isPicked = picked === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => choose(s.id)}
                aria-pressed={isPicked}
                className={cn(
                  'flex h-full w-full cursor-pointer items-start gap-3 border p-3 text-left text-sm leading-relaxed transition-colors',
                  isPicked ? 'font-semibold' : 'hover:bg-muted/40'
                )}
                style={isPicked ? { borderColor: color, backgroundColor: `${color}12` } : undefined}
              >
                <Repeat
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: isPicked ? color : 'var(--muted-foreground)' }}
                  aria-hidden
                />
                {s.paid}
              </button>
            </li>
          );
        })}
      </ul>

      {swap && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <div
            className="mx-auto max-w-md border-t-2 p-6 text-center"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color }}>
              Twoja kartka
            </p>
            <p className="mt-3 text-base font-bold leading-snug sm:text-lg">{swap.card}</p>
          </div>

          <div className="mt-5 max-w-md">
            <label htmlFor="swap-first" className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
              <ArrowRight className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              Który program sprawdzisz jako pierwszy?{' '}
              <span className="font-normal text-muted-foreground">(nieobowiązkowe)</span>
            </label>
            <input
              id="swap-first"
              type="text"
              value={first}
              onChange={(event) => setFirst(event.target.value)}
              placeholder="np. LibreOffice Writer — pobiorę ze strony libreoffice.org"
              className="w-full border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
            />
            {first.trim().length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Pobierz go tylko z oficjalnej strony twórcy — to jedyne bezpieczne źródło.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
