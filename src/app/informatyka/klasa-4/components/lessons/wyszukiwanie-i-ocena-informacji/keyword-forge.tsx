'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Symulator lekcji i jej autorski akcent: piaskownica do układania zapytania.
 * Dziecko dostaje trzy potrzeby wyrażone zdaniem i za każdym razem składa z
 * klocków-słów zapytanie do wyszukiwarki. Miernik ocenia je na żywo według
 * jednej prostej reguły: dwa konkretne słowa, zero słów-wypełniaczy, a jeśli
 * pytanie dotyczy miejsca — nazwa tego miejsca.
 *
 * Realizuje „dobre słowa kluczowe” z `[4.3]`. Blok kończy się, gdy wszystkie
 * trzy zapytania osiągną werdykt „w sam raz”.
 */

type Role = 'core' | 'noise';

interface Chip {
  id: string;
  label: string;
  role: Role;
  /** Ten klocek jest nazwą miejsca wymaganą w tej potrzebie. */
  place?: boolean;
}

interface Need {
  id: string;
  text: string;
  requiresPlace?: boolean;
  chips: Chip[];
}

const NEEDS: Need[] = [
  {
    id: 'niebo',
    text: 'Chcesz się dowiedzieć, dlaczego niebo jest niebieskie.',
    chips: [
      { id: 'niebo', label: 'niebo', role: 'core' },
      { id: 'niebieskie', label: 'niebieskie', role: 'core' },
      { id: 'kolor', label: 'kolor', role: 'core' },
      { id: 'swiatlo', label: 'światło słoneczne', role: 'core' },
      { id: 'dlaczego', label: 'dlaczego', role: 'noise' },
      { id: 'prosze', label: 'proszę', role: 'noise' },
      { id: 'fajne', label: 'fajne', role: 'noise' },
    ],
  },
  {
    id: 'gra',
    text: 'Szukasz zasad gry w państwa-miasta.',
    chips: [
      { id: 'panstwa', label: 'państwa-miasta', role: 'core' },
      { id: 'zasady', label: 'zasady', role: 'core' },
      { id: 'gra', label: 'gra', role: 'core' },
      { id: 'jak-sie-gra', label: 'jak się w to gra na kartce', role: 'noise' },
      { id: 'nudne', label: 'nudne', role: 'noise' },
      { id: 'siostry', label: 'mojej siostry', role: 'noise' },
    ],
  },
  {
    id: 'zoo',
    text: 'Chcesz sprawdzić, ile kosztuje bilet do zoo we Wrocławiu.',
    requiresPlace: true,
    chips: [
      { id: 'bilet', label: 'bilet', role: 'core' },
      { id: 'zoo', label: 'zoo', role: 'core' },
      { id: 'wroclaw', label: 'Wrocław', role: 'core', place: true },
      { id: 'cena', label: 'cena', role: 'core' },
      { id: 'ile-kosztuje', label: 'ile to wszystko kosztuje', role: 'noise' },
      { id: 'chce-isc', label: 'bardzo chcę iść', role: 'noise' },
      { id: 'dzisiaj', label: 'no dzisiaj', role: 'noise' },
    ],
  },
];

type Verdict = 'empty' | 'place' | 'noise' | 'thin' | 'ok';

const VERDICT_COPY: Record<Exclude<Verdict, 'ok'>, string> = {
  empty: 'Wpisz konkretne rzeczowniki — to, o co pytasz, a nie całe zdanie.',
  place: 'Brakuje miejsca. Bez nazwy miasta dostaniesz ceny z całego świata.',
  noise: 'Wytnij zbędne słowa. Wyszukiwarka nie potrzebuje „proszę”, „fajne” ani całych zdań — zostaw same konkrety.',
  thin: 'Dołóż jeszcze jedno konkretne słowo, żeby zawęzić wyniki.',
};

function judge(need: Need, selected: Set<string>): Verdict {
  const chosen = need.chips.filter((chip) => selected.has(chip.id));
  const core = chosen.filter((chip) => chip.role === 'core').length;
  const noise = chosen.filter((chip) => chip.role === 'noise').length;
  const placeOk = !need.requiresPlace || chosen.some((chip) => chip.place);

  if (core === 0) return 'empty';
  if (!placeOk) return 'place';
  if (noise >= 1) return 'noise';
  if (core < 2) return 'thin';
  return 'ok';
}

interface KeywordForgeProps {
  color: string;
  onComplete?: () => void;
}

export function KeywordForge({ color, onComplete }: KeywordForgeProps) {
  const [picked, setPicked] = useState<Record<string, Set<string>>>(() =>
    Object.fromEntries(NEEDS.map((need) => [need.id, new Set<string>()]))
  );

  const verdicts = NEEDS.map((need) => judge(need, picked[need.id]));
  const solvedCount = verdicts.filter((verdict) => verdict === 'ok').length;
  const finished = solvedCount === NEEDS.length;

  const toggle = (need: Need, chipId: string) => {
    if (judge(need, picked[need.id]) === 'ok') return;
    const nextSet = new Set(picked[need.id]);
    if (nextSet.has(chipId)) nextSet.delete(chipId);
    else nextSet.add(chipId);
    const next = { ...picked, [need.id]: nextSet };
    setPicked(next);
    if (NEEDS.every((item) => judge(item, next[item.id]) === 'ok')) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Wyszukiwarka nie czyta w myślach — dostaje tylko słowa, które jej dasz.{' '}
          <strong>Ułóż z klocków dobre zapytanie</strong> dla każdej z trzech sytuacji.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {solvedCount}/{NEEDS.length}
        </p>
      </div>

      <div className="space-y-5">
        {NEEDS.map((need, needIndex) => {
          const selected = picked[need.id];
          const verdict = verdicts[needIndex];
          const query = need.chips
            .filter((chip) => selected.has(chip.id))
            .map((chip) => chip.label)
            .join(' ');
          const ok = verdict === 'ok';

          return (
            <div key={need.id} className="border p-3 sm:p-4">
              <p className="mb-3 flex gap-2 text-sm leading-relaxed sm:text-base">
                <span className="font-mono font-bold" style={{ color }}>
                  {needIndex + 1}.
                </span>
                <span>{need.text}</span>
              </p>

              {/* Pasek wyszukiwarki z ułożonym zapytaniem */}
              <div
                className="mb-3 flex items-center gap-2 border px-3 py-2 font-mono text-xs sm:text-sm"
                style={ok ? { borderColor: color, color } : undefined}
              >
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className={cn('truncate', !query && 'text-muted-foreground')}>
                  {query || 'ułóż zapytanie z klocków poniżej…'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {need.chips.map((chip) => {
                  const isOn = selected.has(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => toggle(need, chip.id)}
                      disabled={ok}
                      aria-pressed={isOn}
                      className={cn(
                        'inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm',
                        ok ? 'cursor-default' : 'cursor-pointer hover:bg-muted/60',
                        isOn && !ok && 'font-semibold'
                      )}
                      style={
                        isOn
                          ? { borderColor: color, backgroundColor: `${color}14`, color }
                          : undefined
                      }
                    >
                      {isOn && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={verdict}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 border-l-2 pl-3 text-sm leading-relaxed"
                  style={{ borderColor: ok ? color : 'var(--border)' }}
                >
                  {ok ? (
                    <span className="font-medium" style={{ color }}>
                      W sam raz — same konkrety, nic zbędnego. Tak zapytana wyszukiwarka trafi od
                      razu.
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{VERDICT_COPY[verdict]}</span>
                  )}
                </motion.p>
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {finished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Dobre zapytanie to 2–4 konkretne słowa.</strong> Rzeczowniki zamiast całych
            zdań, żadnych „proszę” i „fajne”, a przy pytaniu o miejsce — zawsze nazwa tego miejsca.
            Za mało wyników? Dołóż słowo. Za dużo nie na temat? Zabierz jedno.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
