'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Lock, ShieldQuestion, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Ćwiczenie lekcji: dziecko sortuje dane o sobie do trzech koszy — „mogę podać”,
 * „tylko za zgodą rodzica”, „zostawiam dla siebie”. Mechanika tap-tap (stuknij
 * dane → stuknij kosz), jak w `TidyDesktop` — nic nie udaje przeciągalnego.
 *
 * Zła odpowiedź: kosz się „otrząsa” i pada podpowiedź, ale pozycja nie znika.
 * Blok kończy się po rozłożeniu wszystkich dziewięciu. Realizuje pierwszą część
 * `[5.5]` — świadome rozróżnianie danych do ochrony.
 */

type Bucket = 'podac' | 'zgoda' | 'sobie';

interface Item {
  id: string;
  label: string;
  bucket: Bucket;
  hint: string;
}

const ITEMS: Item[] = [
  {
    id: 'nick',
    label: 'Twój nick / pseudonim w grze',
    bucket: 'podac',
    hint: 'Nick nie prowadzi do ciebie w prawdziwym świecie. Po to się go wymyśla.',
  },
  {
    id: 'imie',
    label: 'Samo imię',
    bucket: 'podac',
    hint: 'Samo imię nosi pół klasy. Bez nazwiska i szkoły nikt cię po nim nie znajdzie.',
  },
  {
    id: 'gra',
    label: 'Ulubiona gra albo książka',
    bucket: 'podac',
    hint: 'To gust, nie dane o tobie. Można o tym rozmawiać spokojnie.',
  },
  {
    id: 'wiek',
    label: 'Twój dokładny wiek',
    bucket: 'zgoda',
    hint: 'Wiek sam w sobie nie jest groźny, ale łączony z resztą pomaga cię namierzyć. Zapytaj rodzica, zanim podasz.',
  },
  {
    id: 'email',
    label: 'Adres e-mail do kontaktu',
    bucket: 'zgoda',
    hint: 'E-mail to furtka do wiadomości od obcych. Zakładaj go i podawaj razem z rodzicem.',
  },
  {
    id: 'adres',
    label: 'Adres domu (ulica i numer)',
    bucket: 'sobie',
    hint: 'Po adresie ktoś trafia pod twoje drzwi. To nie jest coś, co się podaje w sieci — nikomu.',
  },
  {
    id: 'telefon',
    label: 'Numer telefonu',
    bucket: 'sobie',
    hint: 'Numer telefonu = bezpośredni kontakt z tobą i sposób na dalsze wyłudzanie. Trzymaj przy sobie.',
  },
  {
    id: 'szkola',
    label: 'Nazwa i numer twojej szkoły',
    bucket: 'sobie',
    hint: 'Szkoła mówi, gdzie jesteś co dzień rano i po co komuś czekać przy wejściu. Nie podawaj w sieci.',
  },
  {
    id: 'haslo',
    label: 'Hasło do konta',
    bucket: 'sobie',
    hint: 'Hasła nie podaje się NIKOMU — ani znajomemu, ani „pomocy technicznej”. Prawdziwa firma nigdy o nie nie prosi.',
  },
];

const BUCKETS: { id: Bucket; label: string; icon: typeof Lock; desc: string }[] = [
  {
    id: 'podac',
    label: 'Mogę podać spokojnie',
    icon: UserCheck,
    desc: 'nie prowadzi do ciebie w realnym świecie',
  },
  {
    id: 'zgoda',
    label: 'Tylko za zgodą rodzica',
    icon: ShieldQuestion,
    desc: 'zależnie od miejsca i sytuacji',
  },
  {
    id: 'sobie',
    label: 'Zostawiam dla siebie',
    icon: Lock,
    desc: 'po tym ktoś mógłby cię namierzyć',
  },
];

interface KeepOrShareProps {
  color: string;
  onComplete?: () => void;
}

export function KeepOrShare({ color, onComplete }: KeepOrShareProps) {
  const [placed, setPlaced] = useState<Record<string, Bucket>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [shake, setShake] = useState<Bucket | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const done = Object.keys(placed).length;
  const finished = done === ITEMS.length;
  const pending = ITEMS.filter((item) => !placed[item.id]);

  const drop = (bucket: Bucket) => {
    if (!selected) return;
    const item = ITEMS.find((entry) => entry.id === selected);
    if (!item) return;

    if (item.bucket !== bucket) {
      setShake(bucket);
      setHint(item.hint);
      window.setTimeout(() => setShake(null), 400);
      return;
    }

    const next = { ...placed, [item.id]: bucket };
    setPlaced(next);
    setSelected(null);
    setHint(null);
    if (Object.keys(next).length === ITEMS.length) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Dziewięć rzeczy o tobie. <strong>Stuknij jedną, potem stuknij kosz</strong>, do którego
          pasuje.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {done}/{ITEMS.length}
        </p>
      </div>

      {/* Dane do rozłożenia */}
      <div className="mb-5 flex flex-wrap gap-2">
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">Wszystko rozłożone.</p>
        ) : (
          pending.map((item) => {
            const isSelected = selected === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(isSelected ? null : item.id)}
                aria-pressed={isSelected}
                className={cn(
                  'cursor-pointer border px-3 py-2 text-left text-xs font-medium transition-colors sm:text-sm',
                  isSelected ? 'font-semibold' : 'hover:bg-muted/60'
                )}
                style={
                  isSelected
                    ? { borderColor: color, backgroundColor: `${color}14`, color }
                    : undefined
                }
              >
                {item.label}
              </button>
            );
          })
        )}
      </div>

      {/* Trzy kosze */}
      <div className="grid gap-3 sm:grid-cols-3">
        {BUCKETS.map((bucket) => {
          const Icon = bucket.icon;
          const inside = ITEMS.filter((item) => placed[item.id] === bucket.id);
          return (
            <motion.div
              key={bucket.id}
              animate={shake === bucket.id ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <button
                type="button"
                onClick={() => drop(bucket.id)}
                disabled={!selected}
                className={cn(
                  'flex h-full w-full flex-col border p-3 text-left transition-colors',
                  selected ? 'cursor-pointer hover:bg-muted/40' : 'cursor-default'
                )}
                style={{ borderColor: `${color}55` }}
              >
                <span className="flex items-center gap-2 text-sm font-bold" style={{ color }}>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {bucket.label}
                </span>
                <span className="mt-0.5 text-[11px] text-muted-foreground">{bucket.desc}</span>

                <span className="mt-3 space-y-1">
                  {inside.map((item) => (
                    <span
                      key={item.id}
                      className="flex items-start gap-1.5 text-xs leading-snug"
                    >
                      <Check className="mt-0.5 h-3 w-3 shrink-0" style={{ color }} aria-hidden />
                      {item.label}
                    </span>
                  ))}
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {hint && !finished && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 border-red-500 pl-3 text-sm leading-relaxed text-muted-foreground"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {finished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Jedna zasada wystarczy:</strong> im łatwiej kogoś po danej rzeczy odnaleźć albo
            zaszkodzić mu w prawdziwym świecie, tym bardziej ją chroń. Nick i imię — spokojnie.
            Adres, telefon, szkoła, hasło — tylko dla ciebie.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
