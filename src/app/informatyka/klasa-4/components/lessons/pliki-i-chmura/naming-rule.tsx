'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Zamknięcie lekcji: dziecko samo składa swoją zasadę nazywania plików,
 * włączając kolejne części nazwy i widząc na żywo, jak rośnie przykładowa nazwa.
 * Potem dostaje ją jako kartkę do zapamiętania.
 *
 * W odróżnieniu od „wybierz jedną z listy" (jak `MyRuleCard`) tutaj dziecko
 * buduje regułę z klocków — to celowy, nowy w tym module akcent. Pole na własną
 * nazwę pliku jest opcjonalne i nie blokuje ukończenia bloku.
 */

interface Part {
  id: string;
  label: string;
  example: string;
  locked?: boolean;
}

const PARTS: Part[] = [
  { id: 'przedmiot', label: 'przedmiot', example: 'przyroda' },
  { id: 'temat', label: 'temat', example: 'pszczoly', locked: true },
  { id: 'data', label: 'data (rok-miesiąc-dzień)', example: '2026-05-12' },
  { id: 'wersja', label: 'wersja', example: 'v2' },
];

interface NamingRuleProps {
  color: string;
  onComplete?: () => void;
}

export function NamingRule({ color, onComplete }: NamingRuleProps) {
  const [on, setOn] = useState<Record<string, boolean>>({ temat: true });
  const [saved, setSaved] = useState(false);
  const [own, setOwn] = useState('');

  const toggle = (part: Part) => {
    if (part.locked || saved) return;
    setOn((prev) => ({ ...prev, [part.id]: !prev[part.id] }));
  };

  const activeParts = PARTS.filter((part) => on[part.id]);
  const preview = `${activeParts.map((part) => part.example).join('_')}.docx`;

  const save = () => {
    if (saved) return;
    setSaved(true);
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Złóż swoją zasadę nazywania plików. <strong>Włącz te części</strong>, które twoja nazwa
        będzie mieć zawsze — temat jest obowiązkowy, resztę wybierasz sam/sama.
      </p>

      <ul className="grid gap-2 sm:grid-cols-2">
        {PARTS.map((part) => {
          const isOn = Boolean(on[part.id]);
          return (
            <li key={part.id}>
              <button
                type="button"
                onClick={() => toggle(part)}
                disabled={part.locked || saved}
                aria-pressed={isOn}
                className={cn(
                  'flex h-full w-full items-start gap-3 border p-3 text-left text-sm leading-relaxed transition-colors',
                  part.locked || saved ? 'cursor-default' : 'cursor-pointer hover:bg-muted/40',
                  isOn && 'font-semibold'
                )}
                style={isOn ? { borderColor: color, backgroundColor: `${color}12` } : undefined}
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border"
                  style={isOn ? { backgroundColor: color, borderColor: color } : { borderColor: 'var(--border)' }}
                >
                  {isOn && <Check className="h-3.5 w-3.5 text-white" aria-hidden />}
                </span>
                <span className="min-w-0">
                  <span className="block">
                    {part.label}
                    {part.locked && (
                      <span className="ml-1.5 font-normal text-muted-foreground">(obowiązkowo)</span>
                    )}
                  </span>
                  <span className="block font-mono text-xs text-muted-foreground">{part.example}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-5">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tak wygląda twoja nazwa
        </p>
        <p
          className="break-all border-l-2 py-2 pl-3 font-mono text-sm font-semibold sm:text-base"
          style={{ borderColor: color, color }}
        >
          {preview}
        </p>
      </div>

      {!saved && (
        <button
          type="button"
          onClick={save}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 border-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
          style={{ borderColor: color, color }}
        >
          To moja zasada
        </button>
      )}

      {saved && (
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
              Moja zasada
            </p>
            <p className="mt-3 text-base font-bold leading-snug sm:text-lg">
              Nazwa pliku zawsze mówi:{' '}
              {activeParts.map((part) => part.label.replace(/ \(.*\)/, '')).join(' · ')}.
            </p>
          </div>

          <div className="mt-5 max-w-md">
            <label htmlFor="naming-own" className="mb-1.5 block text-sm font-semibold">
              Nazwij według niej plik z tą lekcją{' '}
              <span className="font-normal text-muted-foreground">(nieobowiązkowe)</span>
            </label>
            <input
              id="naming-own"
              type="text"
              value={own}
              onChange={(event) => setOwn(event.target.value)}
              placeholder="np. informatyka_pliki-i-foldery_2026-05-20_v1.docx"
              className="w-full border bg-transparent px-3 py-2 font-mono text-sm outline-none transition-colors focus:border-primary"
            />
            {own.trim().length > 0 && (
              <p className="mt-2 font-sans text-sm text-muted-foreground">
                Użyj tej nazwy naprawdę, gdy będziesz zapisywać plik w zadaniu obok — i trzymaj się
                jej do końca kursu.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
