'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Zamknięcie lekcji: dziecko wybiera trzy rzeczy, których o sobie nie zostawia
 * w sieci, i dostaje je jako kartkę do zapamiętania razem z jednym zdaniem
 * o hasłach. Bez dobrze/źle — każda z tych rzeczy warta jest ochrony, chodzi
 * o świadomy wybór własnych trzech (wzorzec `NetForYou` / `MyRuleCard`).
 */

const THINGS = [
  'Nazwisko',
  'Adres domu',
  'Numer telefonu',
  'Nazwa i numer szkoły',
  'Data urodzenia',
  'Gdzie i kiedy akurat jestem',
  'Moje hasła',
];

const PICK = 3;

interface MyDataCardProps {
  color: string;
  onComplete?: () => void;
}

export function MyDataCard({ color, onComplete }: MyDataCardProps) {
  const [picked, setPicked] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const toggle = (thing: string) => {
    if (saved) return;
    setPicked((prev) => {
      if (prev.includes(thing)) return prev.filter((item) => item !== thing);
      if (prev.length >= PICK) return prev;
      return [...prev, thing];
    });
  };

  const save = () => {
    if (saved || picked.length !== PICK) return;
    setSaved(true);
    onComplete?.();
  };

  const chosenInOrder = THINGS.filter((thing) => picked.includes(thing));

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Na koniec wybierz <strong>trzy rzeczy o sobie, których nie wpisujesz w sieci</strong> —
        te, na których tobie najbardziej zależy. Trzy, bo krótką listę łatwiej sobie przypomnieć.
      </p>

      <ul className="grid gap-2 sm:grid-cols-2">
        {THINGS.map((thing) => {
          const isOn = picked.includes(thing);
          const blocked = !isOn && picked.length >= PICK && !saved;
          return (
            <li key={thing}>
              <button
                type="button"
                onClick={() => toggle(thing)}
                disabled={saved || blocked}
                aria-pressed={isOn}
                className={cn(
                  'flex h-full w-full items-start gap-3 border p-3 text-left text-sm leading-relaxed transition-colors',
                  saved || blocked ? 'cursor-default' : 'cursor-pointer hover:bg-muted/40',
                  isOn && 'font-medium',
                  blocked && 'opacity-45'
                )}
                style={isOn ? { borderColor: color, backgroundColor: `${color}12` } : undefined}
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border"
                  style={
                    isOn
                      ? { backgroundColor: color, borderColor: color }
                      : { borderColor: 'var(--border)' }
                  }
                >
                  {isOn && <Check className="h-3.5 w-3.5 text-white" aria-hidden />}
                </span>
                <span className="min-w-0">{thing}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs text-muted-foreground">
        Wybrano {picked.length} z {PICK}.
      </p>

      {!saved && (
        <button
          type="button"
          onClick={save}
          disabled={picked.length !== PICK}
          className={cn(
            'mt-4 inline-flex items-center gap-2 border-2 px-4 py-2 text-sm font-semibold transition-colors',
            picked.length === PICK
              ? 'cursor-pointer hover:bg-muted/50'
              : 'cursor-not-allowed opacity-40'
          )}
          style={{ borderColor: color, color }}
        >
          To moja kartka
        </button>
      )}

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto mt-6 max-w-md border-t-2 p-6 text-center"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <p
            className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color }}
          >
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Zostawiam dla siebie
          </p>
          <p className="mt-3 text-base font-bold leading-snug sm:text-lg">
            {chosenInOrder.join(' · ')}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            A hasło buduję z trzech przypadkowych słów, długie, nigdy z imienia ani daty urodzenia —
            i nie podaję go nikomu.
          </p>
        </motion.div>
      )}
    </div>
  );
}
