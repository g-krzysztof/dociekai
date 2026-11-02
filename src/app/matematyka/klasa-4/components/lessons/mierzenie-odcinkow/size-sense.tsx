'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, CircleDot, Paperclip, Pencil, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SizeItem {
  id: string;
  label: string;
  icon: LucideIcon;
  lengthMm: number;
}

/** Cztery przedmioty o wyraźnie różnej skali — od kilku mm po kilka cm. */
const ITEMS: SizeItem[] = [
  { id: 'biedronka', label: 'Biedronka', icon: Bug, lengthMm: 7 },
  { id: 'guzik', label: 'Guzik', icon: CircleDot, lengthMm: 15 },
  { id: 'spinacz', label: 'Spinacz biurowy', icon: Paperclip, lengthMm: 30 },
  { id: 'kredka', label: 'Kredka', icon: Pencil, lengthMm: 70 },
];

/** Stała kolejność wyświetlania (celowo nie posortowana) — bez losowości w renderze, żeby SSR i klient dały ten sam DOM. */
const DISPLAY_ORDER = ['kredka', 'biedronka', 'spinacz', 'guzik'];
const ASCENDING_ORDER = [...ITEMS].sort((a, b) => a.lengthMm - b.lengthMm).map((item) => item.id);

interface SizeSenseProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: buduje intuicję skali przed wprowadzeniem milimetra — uporządkuj przedmioty od najmniejszego do największego. */
export function SizeSense({ color, onComplete }: SizeSenseProps) {
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const allSolved = solvedIds.length === ITEMS.length;
  const nextExpected = ASCENDING_ORDER[solvedIds.length];

  const pick = (id: string) => {
    if (allSolved || solvedIds.includes(id)) return;
    if (id === nextExpected) {
      setSolvedIds((prev) => [...prev, id]);
      return;
    }
    setShakeId(id);
    setTimeout(() => setShakeId(null), 400);
  };

  const byId = (id: string) => ITEMS.find((item) => item.id === id)!;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm text-muted-foreground">
        Kliknij przedmioty po kolei — od <strong>najmniejszego</strong> do{' '}
        <strong>największego</strong>.
      </p>

      {/* Rząd rozwiązanych, w kolejności rosnącej */}
      <div className="mb-4 flex min-h-10 flex-wrap items-center gap-2 border-b pb-4">
        {solvedIds.length === 0 && (
          <span className="text-xs text-muted-foreground">Tu pojawią się uporządkowane przedmioty.</span>
        )}
        {solvedIds.map((id, i) => {
          const item = byId(id);
          const Icon = item.icon;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-semibold"
              style={{ borderColor: `${color}55`, color }}
            >
              <span className="font-mono tabular-nums">{i + 1}</span>
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {item.label}
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {DISPLAY_ORDER.map((id) => {
          const item = byId(id);
          const Icon = item.icon;
          const solved = solvedIds.includes(id);
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => pick(id)}
              disabled={solved || allSolved}
              animate={shakeId === id ? { x: [0, -6, 6, -6, 6, 0] } : undefined}
              transition={{ duration: 0.4 }}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-2 border px-3 py-5 text-sm font-semibold transition-all disabled:cursor-not-allowed',
                !solved && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                solved && 'opacity-30'
              )}
            >
              <Icon className="h-7 w-7" style={{ color }} aria-hidden />
              {item.label}
            </motion.button>
          );
        })}
      </div>

      {allSolved && !revealed && (
        <div className="mt-5 flex justify-end">
          <Button onClick={() => setRevealed(true)}>Sprawdź prawdziwe długości</Button>
        </div>
      )}

      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 space-y-3 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          <p>Dobra kolejność! A oto ich mniej więcej prawdziwe długości:</p>
          <ul className="space-y-1 font-mono">
            {ASCENDING_ORDER.map((id) => (
              <li key={id}>
                {byId(id).label} — ok. {byId(id).lengthMm} mm
              </li>
            ))}
          </ul>
          <p>
            Milimetr to naprawdę mało — dopiero podziałka co 1 mm pozwala dokładnie zmierzyć coś tak
            małego jak biedronka.
          </p>
          <div className="flex justify-end pt-1">
            <Button onClick={onComplete}>Do linijki</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
