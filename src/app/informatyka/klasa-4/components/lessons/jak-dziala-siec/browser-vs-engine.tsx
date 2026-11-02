'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Wyjaśnienie lekcji: makieta okna przeglądarki (świadomie poza językiem
 * wizualnym kursu — ma wyglądać jak prawdziwy program, tak jak `DesktopFinder`
 * w teście diagnostycznym). Dwie rzeczy do zrozumienia:
 *
 *  1. co jest PRZEGLĄDARKĄ (ramka, karty, przyciski, pasek adresu — program),
 *     a co STRONĄ (to, co przysłał serwer) — dziecko stuka po częściach okna;
 *  2. pasek adresu robi dwie różne rzeczy: dokładny adres → strona od razu;
 *     zwykłe słowa → oddaje je wyszukiwarce, która pokazuje listę.
 *
 * Blok kończy się po odsłonięciu wszystkich czterech części i wypróbowaniu obu
 * zachowań paska adresu.
 */

interface Part {
  id: string;
  label: string;
  note: string;
}

const PARTS: Part[] = [
  {
    id: 'karty',
    label: 'Karty',
    note: 'Każda karta to osobna otwarta strona. To część przeglądarki — strona nic o innych kartach nie wie.',
  },
  {
    id: 'nawigacja',
    label: 'Przyciski nawigacji',
    note: 'Wstecz, dalej, odśwież. Należą do przeglądarki. Żadna strona ich nie rysuje.',
  },
  {
    id: 'pasek',
    label: 'Pasek adresu',
    note: 'Tu wpisujesz, dokąd chcesz iść. Zaraz sprawdzisz, że robi dwie różne rzeczy.',
  },
  {
    id: 'strona',
    label: 'Obszar strony',
    note: 'Wszystko tutaj przysłał serwer. To jedyna część okna, której przeglądarka sama nie wymyśliła.',
  },
];

type Demo = 'adres' | 'slowa';

interface BrowserVsEngineProps {
  color: string;
  onComplete?: () => void;
}

export function BrowserVsEngine({ color, onComplete }: BrowserVsEngineProps) {
  const [open, setOpen] = useState<string | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const [demo, setDemo] = useState<Demo | null>(null);

  const total = PARTS.length + 2;
  const finished = seen.length === total;

  const mark = (id: string) => {
    if (seen.includes(id)) return;
    const next = [...seen, id];
    setSeen(next);
    if (next.length === total) onComplete?.();
  };

  const tapPart = (id: string) => {
    setOpen((prev) => (prev === id ? null : id));
    mark(id);
  };

  const runDemo = (which: Demo) => {
    setDemo(which);
    mark(`demo-${which}`);
  };

  const openPart = PARTS.find((part) => part.id === open);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Oto okno przeglądarki. <strong>Stuknij po kolei jego części</strong> i sprawdź, co należy
          do programu, a co jest samą stroną.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {seen.length}/{total}
        </p>
      </div>

      {/* Makieta okna przeglądarki */}
      <div className="overflow-x-auto">
        <div className="mx-auto min-w-[320px] max-w-xl border bg-zinc-100 dark:bg-zinc-800">
          {/* Pasek kart */}
          <button
            type="button"
            onClick={() => tapPart('karty')}
            className={cn(
              'flex w-full cursor-pointer items-end gap-1 px-2 pt-2 text-left transition-colors',
              open === 'karty' && 'bg-amber-100/60 dark:bg-amber-500/10'
            )}
          >
            <span
              className="border border-b-0 bg-white px-3 py-1.5 text-xs font-medium dark:bg-zinc-900"
              style={open === 'karty' ? { color } : undefined}
            >
              dociekai.pl
              {seen.includes('karty') && <Check className="ml-1 inline h-3 w-3" style={{ color }} aria-hidden />}
            </span>
            <span className="border border-b-0 bg-zinc-200/70 px-3 py-1.5 text-xs text-muted-foreground dark:bg-zinc-700/60">
              +
            </span>
          </button>

          {/* Pasek nawigacji + adresu */}
          <div className="flex items-center gap-2 border-y bg-white px-2 py-2 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => tapPart('nawigacja')}
              aria-label="Przyciski nawigacji"
              className={cn(
                'flex shrink-0 cursor-pointer items-center gap-1 border px-1.5 py-1 transition-colors',
                open === 'nawigacja' && 'bg-amber-100/60 dark:bg-amber-500/10'
              )}
              style={open === 'nawigacja' ? { borderColor: color, color } : undefined}
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              <RotateCw className="h-3.5 w-3.5" aria-hidden />
              {seen.includes('nawigacja') && <Check className="h-3 w-3" style={{ color }} aria-hidden />}
            </button>
            <button
              type="button"
              onClick={() => tapPart('pasek')}
              className={cn(
                'flex-1 cursor-pointer truncate border px-3 py-1.5 text-left font-mono text-xs transition-colors',
                open === 'pasek' && 'bg-amber-100/60 dark:bg-amber-500/10'
              )}
              style={open === 'pasek' ? { borderColor: color, color } : undefined}
            >
              {demo === 'adres'
                ? 'dociekai.pl'
                : demo === 'slowa'
                  ? 'gry matematyczne dla dzieci'
                  : 'wpisz adres albo słowa…'}
              {seen.includes('pasek') && <Check className="ml-1 inline h-3 w-3" style={{ color }} aria-hidden />}
            </button>
          </div>

          {/* Obszar strony */}
          <button
            type="button"
            onClick={() => tapPart('strona')}
            className={cn(
              'block w-full cursor-pointer bg-white p-4 text-left transition-colors dark:bg-zinc-900',
              open === 'strona' && 'bg-amber-100/50 dark:bg-amber-500/10'
            )}
          >
            <PageArea demo={demo} color={color} />
            {seen.includes('strona') && (
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium" style={{ color }}>
                <Check className="h-3 w-3" aria-hidden /> obszar strony
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Wyjaśnienie klikniętej części */}
      <AnimatePresence mode="wait">
        {openPart && (
          <motion.p
            key={openPart.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 pl-3 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>{openPart.label}.</strong> {openPart.note}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Dwa zachowania paska adresu */}
      <div className="mt-6 border-t pt-5">
        <p className="mb-3 text-sm font-semibold">Pasek adresu robi dwie rzeczy. Wypróbuj obie:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'adres' as Demo, label: 'Wpisz dokładny adres: dociekai.pl' },
            { id: 'slowa' as Demo, label: 'Wpisz słowa: gry matematyczne dla dzieci' },
          ].map((option) => {
            const isOn = demo === option.id;
            const tried = seen.includes(`demo-${option.id}`);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => runDemo(option.id)}
                aria-pressed={isOn}
                className={cn(
                  'inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                  isOn ? 'font-semibold' : 'cursor-pointer hover:bg-muted/60'
                )}
                style={isOn ? { borderColor: color, backgroundColor: `${color}14`, color } : undefined}
              >
                {tried && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                {option.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {demo && (
            <motion.p
              key={demo}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 border-l-2 pl-3 text-sm leading-relaxed"
              style={{ borderColor: color }}
            >
              {demo === 'adres' ? (
                <>
                  Znasz adres → przeglądarka idzie <strong>prosto</strong> pod ten adres. Żadnej
                  listy, od razu ta jedna strona.
                </>
              ) : (
                <>
                  Nie podałeś/podałaś adresu, tylko słowa → przeglądarka oddała je{' '}
                  <strong>wyszukiwarce</strong> (osobna strona, jak Google, Bing czy DuckDuckGo), a ta
                  pokazała listę pasujących stron.
                </>
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Domknięcie */}
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 border-t-2 pt-4"
            style={{ borderColor: color }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border p-3" style={{ borderColor: `${color}55` }}>
                <p className="mb-1 font-bold" style={{ color }}>
                  Przeglądarka
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Program na twoim urządzeniu. Otwiera strony i pokazuje je w oknie. Przykłady: Chrome,
                  Firefox, Safari, Edge.
                </p>
              </div>
              <div className="border p-3" style={{ borderColor: `${color}55` }}>
                <p className="mb-1 font-bold" style={{ color }}>
                  Wyszukiwarka
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Strona internetowa, którą otwierasz w przeglądarce, żeby znaleźć inne strony.
                  Przykłady: Google, Bing, DuckDuckGo.
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed">
              Możesz mieć <strong>Firefoksa</strong> (przeglądarka) i szukać w nim przez{' '}
              <strong>DuckDuckGo</strong> (wyszukiwarka). To dwie różne rzeczy, choć jedna działa w
              drugiej.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Zawartość „obszaru strony": neutralny placeholder albo wynik demo paska adresu. */
function PageArea({ demo, color }: { demo: Demo | null; color: string }) {
  if (demo === 'adres') {
    return (
      <div>
        <div className="mb-2 h-2 w-1/2" style={{ backgroundColor: color }} />
        <div className="mb-1.5 h-1.5 w-full bg-muted" />
        <div className="mb-1.5 h-1.5 w-full bg-muted" />
        <div className="mb-3 h-1.5 w-2/3 bg-muted" />
        <p className="text-[11px] text-muted-foreground">jedna strona, otwarta wprost spod adresu</p>
      </div>
    );
  }
  if (demo === 'slowa') {
    return (
      <div className="space-y-2.5">
        {[0, 1, 2, 3].map((row) => (
          <div key={row}>
            <div className="mb-1 h-1.5 w-1/2" style={{ backgroundColor: color }} />
            <div className="h-1 w-3/4 bg-muted" />
          </div>
        ))}
        <p className="pt-1 text-[11px] text-muted-foreground">
          lista wyników z wyszukiwarki — każdy to link do innej strony
        </p>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-2 h-2 w-2/5 bg-muted" />
      <div className="mb-1.5 h-1.5 w-full bg-muted" />
      <div className="h-1.5 w-3/4 bg-muted" />
      <p className="mt-3 text-[11px] text-muted-foreground">
        tu pojawi się to, co przyśle serwer po użyciu paska adresu
      </p>
    </div>
  );
}
