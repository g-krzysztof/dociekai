'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Check, MessagesSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Refleksja lekcji: dziecko zaznacza, do czego samo używa internetu, a dwa
 * wskaźniki — „łączysz się z ludźmi" i „sięgasz po informacje" — pokazują na
 * żywo, że każda z tych rzeczy należy do jednej albo obu grup. To domyka `[4.2]`:
 * sieć w kontekście komunikacji i dostępu do informacji.
 *
 * Bez dobrze/źle — to nie ćwiczenie. Blok kończy się po zaznaczeniu co najmniej
 * trzech rzeczy; wtedy odsłania się kartka do zapamiętania.
 */

type Purpose = 'ludzie' | 'informacje' | 'oboje';

interface Use {
  id: string;
  label: string;
  purpose: Purpose;
}

const USES: Use[] = [
  { id: 'filmy', label: 'Oglądam filmy i bajki', purpose: 'informacje' },
  { id: 'rodzina', label: 'Piszę z rodziną albo znajomymi', purpose: 'ludzie' },
  { id: 'gry', label: 'Gram w gry z innymi osobami', purpose: 'oboje' },
  { id: 'szkola', label: 'Szukam rzeczy do szkoły', purpose: 'informacje' },
  { id: 'wideo', label: 'Rozmawiam przez wideo', purpose: 'ludzie' },
  { id: 'muzyka', label: 'Słucham muzyki', purpose: 'informacje' },
  { id: 'pogoda', label: 'Sprawdzam pogodę albo godziny autobusów', purpose: 'informacje' },
  { id: 'zdjecia', label: 'Wrzucam zdjęcia, żeby ktoś je zobaczył', purpose: 'ludzie' },
];

const MIN_PICKS = 3;

interface NetForYouProps {
  color: string;
  onComplete?: () => void;
}

export function NetForYou({ color, onComplete }: NetForYouProps) {
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (id: string) => {
    const next = picked.includes(id) ? picked.filter((item) => item !== id) : [...picked, id];
    setPicked(next);
    if (next.length >= MIN_PICKS && picked.length < MIN_PICKS) onComplete?.();
  };

  const chosen = USES.filter((use) => picked.includes(use.id));
  const peopleCount = chosen.filter((u) => u.purpose === 'ludzie' || u.purpose === 'oboje').length;
  const infoCount = chosen.filter((u) => u.purpose === 'informacje' || u.purpose === 'oboje').length;
  const max = Math.max(1, picked.length);
  const done = picked.length >= MIN_PICKS;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Pomyśl o sobie. <strong>Zaznacz to, do czego naprawdę używasz internetu</strong> — co
        najmniej trzy rzeczy.
      </p>

      <ul className="grid gap-2 sm:grid-cols-2">
        {USES.map((use) => {
          const isOn = picked.includes(use.id);
          return (
            <li key={use.id}>
              <button
                type="button"
                onClick={() => toggle(use.id)}
                aria-pressed={isOn}
                className={cn(
                  'flex h-full w-full items-start gap-3 border p-3 text-left text-sm leading-relaxed transition-colors',
                  isOn ? 'font-medium' : 'cursor-pointer hover:bg-muted/40'
                )}
                style={isOn ? { borderColor: color, backgroundColor: `${color}12` } : undefined}
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border"
                  style={isOn ? { backgroundColor: color, borderColor: color } : { borderColor: 'var(--border)' }}
                >
                  {isOn && <Check className="h-3.5 w-3.5 text-white" aria-hidden />}
                </span>
                <span className="min-w-0">{use.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Dwa wskaźniki */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Meter
          icon={MessagesSquare}
          label="Łączysz się z ludźmi"
          value={peopleCount}
          max={max}
          color={color}
        />
        <Meter
          icon={BookOpen}
          label="Sięgasz po informacje"
          value={infoCount}
          max={max}
          color={color}
        />
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto mt-6 max-w-md border-t-2 p-6 text-center"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color }}>
            Zapamiętaj
          </p>
          <p className="mt-3 text-base font-bold leading-snug sm:text-lg">
            Internet daje ci dwie rzeczy: <span style={{ color }}>kontakt z ludźmi</span> i{' '}
            <span style={{ color }}>dostęp do informacji</span>.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            O to właśnie chodzi w słowach „sieć komputerowa”. Cała reszta tego modułu jest o tym, jak
            robić obie te rzeczy bezpiecznie.
          </p>
        </motion.div>
      )}
    </div>
  );
}

function Meter({
  icon: Icon,
  label,
  value,
  max,
  color,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  return (
    <div className="border p-3" style={{ borderColor: `${color}55` }}>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
        {label}
        <span className="ml-auto font-mono tabular-nums" style={{ color }}>
          {value}
        </span>
      </p>
      <div className="h-2 overflow-hidden bg-muted">
        <motion.div
          className="h-full"
          style={{ backgroundColor: color }}
          animate={{ width: `${(value / max) * 100}%` }}
          initial={false}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
