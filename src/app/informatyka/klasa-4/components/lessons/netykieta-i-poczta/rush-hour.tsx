'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Mail, MailOpen, Play, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Haczyk lekcji: dziecko siada po stronie **odbiorcy**, nie nadawcy.
 *
 * Sześć wiadomości, dwadzieścia sekund i polecenie: otwórz tę jedną, która jest
 * naprawdę pilna. Otwarcie kosztuje 4 sekundy z tych dwudziestu — i to jest
 * cała mechanika: **zły temat kosztuje czas, a czas widać na liczniku**.
 * Dziecko nie czyta, że dobry temat jest ważny; przegrywa przez zły temat albo
 * wygrywa dzięki dobremu.
 *
 * Nie da się przegrać na stałe: po każdym końcu dochodzi zestawienie, które
 * pokazuje, po których tematach dało się poznać treść, i scenę można powtórzyć.
 */

interface InboxMail {
  id: string;
  from: string;
  subject: string;
  body: string;
  /** Czy po samym temacie dało się poznać, o co chodzi. */
  readable: boolean;
}

const MAILS: InboxMail[] = [
  {
    id: 'kino',
    from: 'Kino Sokół',
    subject: '(brak tematu)',
    body: 'Dziękujemy za zapisanie się do naszego newslettera. Do zobaczenia na seansach!',
    readable: false,
  },
  {
    id: 'pilne',
    from: 'Olek',
    subject: 'PILNE!!! przeczytaj natychmiast!!!',
    body: 'prześlij to 10 osobom w ciągu godziny albo ominie cię szczęście przez cały rok!!!',
    readable: false,
  },
  {
    id: 'zbiorka',
    from: 'Wychowawczyni 4b',
    subject: 'Zbiórka na wycieczkę — wpłata do piątku 12.09',
    body: 'Przypominam o wpłacie 45 zł na wycieczkę do Wrocławia. Ostateczny termin to piątek 12 września.',
    readable: true,
  },
  {
    id: 'hej',
    from: 'Zosia',
    subject: 'hej',
    body: 'nudzi ci się? 😄',
    readable: false,
  },
  {
    id: 'znowu',
    from: 'Bartek',
    subject: 'to znowu ja',
    body: 'zapomniałem, jaka była praca domowa z polskiego. napiszesz?',
    readable: false,
  },
  {
    id: 'biblioteka',
    from: 'Biblioteka szkolna',
    subject: 'Przypomnienie: zwrot książki do 30 września',
    body: 'Termin zwrotu książki „Felix, Net i Nika” mija 30 września.',
    readable: true,
  },
];

const TOTAL_MS = 20000;
const OPEN_COST_MS = 4000;

interface RushHourProps {
  color: string;
  onComplete?: () => void;
}

export function RushHour({ color, onComplete }: RushHourProps) {
  const [phase, setPhase] = useState<'ready' | 'running' | 'over'>('ready');
  const [msLeft, setMsLeft] = useState(TOTAL_MS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tried, setTried] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<'found' | 'timeout' | null>(null);

  // Zegar idzie, dopóki scena trwa.
  useEffect(() => {
    if (phase !== 'running') return;
    const timer = window.setTimeout(() => setMsLeft((prev) => Math.max(0, prev - 100)), 100);
    return () => window.clearTimeout(timer);
  }, [phase, msLeft]);

  useEffect(() => {
    if (phase !== 'running' || msLeft > 0) return;
    setPhase('over');
    setOutcome('timeout');
    onComplete?.();
  }, [phase, msLeft, onComplete]);

  const open = (mail: InboxMail) => {
    if (phase !== 'running') return;
    setOpenId(mail.id);
    setTried((prev) => (prev.includes(mail.id) ? prev : [...prev, mail.id]));
    if (mail.id === 'zbiorka') {
      setPhase('over');
      setOutcome('found');
      onComplete?.();
      return;
    }
    setMsLeft((prev) => Math.max(0, prev - OPEN_COST_MS));
  };

  const start = () => {
    setPhase('running');
    setMsLeft(TOTAL_MS);
    setOpenId(null);
    setTried([]);
    setOutcome(null);
  };

  const seconds = Math.ceil(msLeft / 1000);
  const openMail = MAILS.find((mail) => mail.id === openId) ?? null;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <p className="max-w-lg text-sm leading-relaxed sm:text-base">
          Za chwilę wychodzisz do szkoły i zaglądasz do skrzynki. <strong>Otwórz tę jedną
          wiadomość, która jest naprawdę pilna</strong> — masz 20 sekund, a każde otwarcie kosztuje
          4 z nich.
        </p>
        <div className="shrink-0 text-right">
          <p
            className={cn(
              'font-mono text-3xl font-black tabular-nums',
              msLeft <= 5000 && phase === 'running' ? 'text-red-600 dark:text-red-400' : ''
            )}
            style={msLeft > 5000 || phase !== 'running' ? { color } : undefined}
          >
            0:{String(Math.max(0, seconds)).padStart(2, '0')}
          </p>
          <div className="mt-1 h-1.5 w-28 overflow-hidden bg-muted">
            <div
              className="h-full transition-[width] duration-100 ease-linear"
              style={{ width: `${(msLeft / TOTAL_MS) * 100}%`, backgroundColor: color }}
            />
          </div>
        </div>
      </div>

      {/* Skrzynka odbiorcza — makieta programu pocztowego, poza językiem kursu */}
      <div className="border bg-zinc-100 dark:bg-zinc-800">
        <div className="flex items-center gap-1.5 border-b bg-zinc-200 px-3 py-2 dark:bg-zinc-700">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
          <span className="ml-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Odebrane · 6 nieprzeczytanych
          </span>
        </div>

        <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {MAILS.map((mail) => {
            const wasTried = tried.includes(mail.id);
            return (
              <li key={mail.id}>
                <button
                  type="button"
                  onClick={() => open(mail)}
                  disabled={phase !== 'running'}
                  className={cn(
                    'flex w-full items-baseline gap-3 px-3 py-2.5 text-left transition-colors',
                    phase === 'running'
                      ? 'cursor-pointer hover:bg-white dark:hover:bg-zinc-900/60'
                      : 'cursor-default',
                    wasTried && 'opacity-50'
                  )}
                >
                  {wasTried ? (
                    <MailOpen className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                  ) : (
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                  )}
                  <span className="w-28 shrink-0 truncate text-xs font-semibold sm:text-sm">
                    {mail.from}
                  </span>
                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate text-xs sm:text-sm',
                      mail.subject === '(brak tematu)' && 'italic text-muted-foreground'
                    )}
                  >
                    {mail.subject}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Podgląd otwartej wiadomości */}
        <AnimatePresence mode="wait">
          {openMail && (
            <motion.div
              key={openMail.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t bg-white dark:bg-zinc-900"
            >
              <div className="p-3 text-sm leading-relaxed">
                <p className="mb-1 text-xs text-muted-foreground">od: {openMail.from}</p>
                <p>{openMail.body}</p>
                {phase === 'running' && (
                  <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">
                    − 4 sekundy
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === 'ready' && (
        <button
          type="button"
          onClick={start}
          className="mt-4 inline-flex cursor-pointer items-center gap-1.5 border-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
          style={{ borderColor: color, color }}
        >
          <Play className="h-3.5 w-3.5" aria-hidden />
          Start — masz 20 sekund
        </button>
      )}

      <AnimatePresence>
        {phase === 'over' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <p className="text-base font-bold" style={{ color }}>
              {outcome === 'found'
                ? 'Trafione — i mogłeś/mogłaś to poznać, nie otwierając niczego.'
                : 'Czas minął. Wiadomość o wpłacie została nieprzeczytana.'}
            </p>

            <p className="mt-3 mb-2">
              Spójrz na te tematy jeszcze raz. Tylko po dwóch dało się poznać, co jest w środku:
            </p>
            <ul className="space-y-1.5">
              {MAILS.map((mail) => (
                <li key={mail.id} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">
                    {mail.readable ? (
                      <Check className="h-4 w-4" style={{ color }} aria-hidden />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" aria-hidden />
                    )}
                  </span>
                  <span className={cn('font-mono text-xs sm:text-sm', !mail.readable && 'text-muted-foreground')}>
                    {mail.subject}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4">
              <strong>Zwróć uwagę na jedno:</strong> temat „PILNE!!! przeczytaj natychmiast!!!”
              krzyczał najgłośniej, a był zwykłym łańcuszkiem. <strong>Głośny to nie to samo co
              ważny</strong> — ważny to taki, po którym wiadomo, o co chodzi i do kiedy.
            </p>
            <p className="mt-2 text-muted-foreground">
              Po drugiej stronie każdej twojej wiadomości siedzi ktoś, kto ma tak samo mało czasu
              jak ty przed chwilą. Cała reszta tej lekcji jest o tym, jak mu to ułatwić.
            </p>

            <button
              type="button"
              onClick={start}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 border-2 px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
              style={{ borderColor: color, color }}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Jeszcze raz
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
