'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Zamknięcie lekcji: nośniki mają sens dopiero wtedy, gdy dziecko pomyśli
 * o własnych plikach. Wybiera, gdzie leży teraz jego najważniejszy plik, i
 * dostaje jedno zdanie zwrotne — a potem opcjonalnie wpisuje plik, którego
 * druga kopia powstanie dziś.
 *
 * Główna myśl: „jedna kopia to żadna kopia”. To samo, co robi `MyRuleCard`
 * w pierwszej lekcji kursu — wybór z listy + kartka do zapamiętania.
 */

interface Spot {
  id: string;
  label: string;
  /** `true` = są co najmniej dwie kopie w różnych miejscach. */
  safe: boolean;
  verdict: string;
}

const SPOTS: Spot[] = [
  {
    id: 'jeden',
    label: 'Tylko w jednym miejscu na moim laptopie albo telefonie.',
    safe: false,
    verdict:
      'To najczęstszy wybór — i najbardziej ryzykowny. Zgubiony telefon, zalany laptop, skasowany plik: bez drugiej kopii nie ma go już nigdzie. Jedna kopia to tak naprawdę żadna kopia.',
  },
  {
    id: 'laptop-pendrive',
    label: 'Na laptopie i na pendrivie albo dysku zewnętrznym.',
    safe: true,
    verdict:
      'Dobrze — dwie kopie w dwóch różnych miejscach. Jedno może paść, a plik dalej istnieje. Pamiętaj tylko, żeby od czasu do czasu skopiować nowszą wersję.',
  },
  {
    id: 'laptop-chmura',
    label: 'Na laptopie i w chmurze.',
    safe: true,
    verdict:
      'Dobrze — a do tego chmura sama pilnuje kopii i sięgniesz po nią z innego urządzenia. Warunek: internet i pamiętane hasło do konta.',
  },
  {
    id: 'nie-wiem',
    label: 'Szczerze? Nie wiem, gdzie leży.',
    safe: false,
    verdict:
      'To też odpowiedź — i dobrze, że szczera. Plik, którego nie umiesz odnaleźć, jest prawie tak samo stracony jak skasowany. Zacznij od jednego folderu, w którym trzymasz to, co ważne.',
  },
];

interface WhereMyFilesProps {
  color: string;
  onComplete?: () => void;
}

export function WhereMyFiles({ color, onComplete }: WhereMyFilesProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const [file, setFile] = useState('');

  const choose = (id: string) => {
    setPicked(id);
    onComplete?.();
  };

  const spot = SPOTS.find((s) => s.id === picked) ?? null;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Pomyśl o jednym pliku, którego <strong>naprawdę nie chcesz stracić</strong> — rysunku,
        projekcie, zdjęciach z wakacji. <strong>Gdzie on teraz jest?</strong>
      </p>

      <ul className="grid gap-2">
        {SPOTS.map((s) => {
          const isPicked = picked === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => choose(s.id)}
                aria-pressed={isPicked}
                className={cn(
                  'flex w-full cursor-pointer items-start gap-3 border p-3 text-left text-sm leading-relaxed transition-colors',
                  isPicked ? 'font-semibold' : 'hover:bg-muted/40'
                )}
                style={isPicked ? { borderColor: color, backgroundColor: `${color}12` } : undefined}
              >
                <HardDrive
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: isPicked ? color : 'var(--muted-foreground)' }}
                  aria-hidden
                />
                {s.label}
              </button>
            </li>
          );
        })}
      </ul>

      {spot && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-5"
        >
          <p
            className="border-l-2 pl-3 text-sm leading-relaxed"
            style={{ borderColor: spot.safe ? color : '#dc2626' }}
          >
            {spot.verdict}
          </p>

          <div
            className="mt-5 max-w-md border-t-2 p-6 text-center"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color }}>
              Zasada
            </p>
            <p className="mt-3 text-base font-bold leading-snug sm:text-lg">
              Jedna kopia to żadna kopia.
            </p>
          </div>

          <div className="mt-5 max-w-md">
            <label htmlFor="where-my-files-file" className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
              <Copy className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              Jaki plik skopiujesz dziś w drugie miejsce?{' '}
              <span className="font-normal text-muted-foreground">(nieobowiązkowe)</span>
            </label>
            <input
              id="where-my-files-file"
              type="text"
              value={file}
              onChange={(event) => setFile(event.target.value)}
              placeholder="np. folder ze zdjęciami z wakacji → na pendrive"
              className="w-full border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
            />
            {file.trim().length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Zrób to zaraz po lekcji, póki pamiętasz. Druga kopia, której nie ma, nikogo nie
                uratowała.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
