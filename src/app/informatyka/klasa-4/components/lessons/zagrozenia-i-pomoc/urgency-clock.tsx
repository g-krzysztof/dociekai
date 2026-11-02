'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Symulator lekcji: okno „wygrałeś telefon” z **prawdziwie tykającym zegarem**.
 *
 * Cała reszta kursu tłumaczyłaby to zdaniem „oszuści wywołują pośpiech”. Tutaj
 * dziecko ma ten pośpiech poczuć — a potem odkryć, że był na niby. Trzy drogi,
 * każda kończy się inną prawdą i każdą można sprawdzić osobno:
 *
 *  1. **Poczekaj** — po zerze licznik nie znika, tylko startuje od nowa
 *     („PRZEDŁUŻAMY!”). Termin był fałszywy; nic nie przepadło.
 *  2. **Kliknij nagrodę** — po każdym kroku żądają czegoś więcej (dane → numer
 *     karty rodzica). Żądania nie kończą się nigdy.
 *  3. **Zamknij krzyżykiem** — i nic się nie dzieje. Wyjście było w rogu od
 *     pierwszej sekundy.
 *
 * Okno jest celowo krzykliwe i **poza językiem wizualnym kursu** (jak makieta
 * pulpitu w teście diagnostycznym) — ma wyglądać jak prawdziwa reklama, nie jak
 * element lekcji. Pola formularza są nieaktywne: nic nie da się tu wpisać, bo
 * nigdy nie warto.
 */

type Reason = 'close' | 'timer' | 'chain';
type Stage = 'ad' | 'form' | 'card' | 'done';

const START_SECONDS = 20;
const EXTENDED_SECONDS = 15;

const REASON_HEADLINE: Record<Reason, string> = {
  close: 'Zamknięte. I to wszystko — nic się nie stało.',
  timer: 'Czas minął… i nic nie przepadło. Bo nie było czego stracić.',
  chain: 'Za każdym razem prosili o coś więcej. To się nigdy nie kończy.',
};

interface UrgencyClockProps {
  color: string;
  onComplete?: () => void;
}

export function UrgencyClock({ color, onComplete }: UrgencyClockProps) {
  const [stage, setStage] = useState<Stage>('ad');
  const [seconds, setSeconds] = useState(START_SECONDS);
  /** Ile razy licznik zdążył dobić do zera. */
  const [expired, setExpired] = useState(0);
  const [reason, setReason] = useState<Reason | null>(null);
  /** Drogi sprawdzone w tym bloku — zachęta do odegrania pozostałych. */
  const [explored, setExplored] = useState<Reason[]>([]);

  // Zegar tyka, dopóki okno stoi otwarte.
  useEffect(() => {
    if (stage === 'done' || seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds, stage]);

  // Zero na liczniku: pierwszy raz „przedłużamy”, drugi raz — koniec zabawy.
  useEffect(() => {
    if (stage === 'done' || seconds > 0) return;
    if (expired === 0) {
      setExpired(1);
      setSeconds(EXTENDED_SECONDS);
      return;
    }
    finish('timer');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, stage, expired]);

  const finish = (why: Reason) => {
    setReason(why);
    setStage('done');
    setExplored((prev) => (prev.includes(why) ? prev : [...prev, why]));
    onComplete?.();
  };

  const advance = () => {
    if (stage === 'ad') setStage('form');
    else if (stage === 'form') setStage('card');
    else if (stage === 'card') finish('chain');
  };

  const replay = () => {
    setStage('ad');
    setSeconds(START_SECONDS);
    setExpired(0);
    setReason(null);
  };

  const total = expired === 0 ? START_SECONDS : EXTENDED_SECONDS;
  const pct = Math.max(0, (seconds / total) * 100);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Grasz i nagle wyskakuje takie okno. <strong>Zrób z nim, co chcesz</strong> — kliknij,
          zamknij albo po prostu poczekaj i zobacz, co się stanie.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {explored.length}/3 drogi
        </p>
      </div>

      {stage !== 'done' ? (
        <div
          role="group"
          aria-label="Okno reklamowe z licznikiem czasu"
          className="relative mx-auto max-w-md border-4 border-amber-400 bg-gradient-to-b from-amber-50 to-amber-100 p-5 text-center shadow-lg dark:from-amber-950/40 dark:to-amber-900/30"
        >
          {/* Wyjście — małe, ale było tu od pierwszej sekundy */}
          <button
            type="button"
            onClick={() => finish('close')}
            aria-label="Zamknij to okno"
            className="absolute right-1.5 top-1.5 flex h-8 w-8 cursor-pointer items-center justify-center text-amber-700/70 transition-colors hover:bg-amber-200/60 hover:text-amber-900 dark:text-amber-300/70"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>

          {/* Licznik */}
          <div className="mb-4">
            <p className="font-mono text-4xl font-black tabular-nums text-red-600 dark:text-red-400">
              0:{String(Math.max(0, seconds)).padStart(2, '0')}
            </p>
            <div className="mx-auto mt-1.5 h-1.5 w-40 overflow-hidden bg-amber-200 dark:bg-amber-900/60">
              <div
                className="h-full bg-red-500 transition-[width] duration-1000 ease-linear"
                style={{ width: `${pct}%` }}
              />
            </div>
            {expired > 0 && (
              <motion.p
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-2 text-xs font-black uppercase tracking-wide text-red-600 dark:text-red-400"
              >
                Przedłużamy! Tylko dla ciebie!
              </motion.p>
            )}
          </div>

          {stage === 'ad' && (
            <>
              <p className="text-lg font-black leading-tight text-amber-900 dark:text-amber-100">
                🎉 GRATULACJE! 🎉
              </p>
              <p className="mt-1.5 text-sm font-bold text-amber-900 dark:text-amber-100">
                Jesteś 1000. graczem w tym tygodniu!
              </p>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                Odbierz nowy telefon, zanim licznik dobije do zera.
              </p>
            </>
          )}

          {stage === 'form' && (
            <>
              <p className="text-base font-black leading-tight text-amber-900 dark:text-amber-100">
                Prawie gotowe! Podaj dane do wysyłki
              </p>
              <div className="mx-auto mt-3 max-w-[15rem] space-y-1.5">
                {['Imię i nazwisko', 'Adres', 'E-mail'].map((field) => (
                  <input
                    key={field}
                    disabled
                    placeholder={field}
                    className="w-full cursor-not-allowed border border-amber-300 bg-white/80 px-2 py-1.5 text-xs dark:bg-zinc-900/60"
                  />
                ))}
              </div>
            </>
          )}

          {stage === 'card' && (
            <>
              <p className="text-base font-black leading-tight text-amber-900 dark:text-amber-100">
                Ostatni krok!
              </p>
              <p className="mt-1.5 text-sm text-amber-800 dark:text-amber-200">
                Do potwierdzenia wysyłki potrzebujemy numeru karty rodzica. Pobierzemy tylko 1 zł.
              </p>
              <div className="mx-auto mt-3 max-w-[15rem] space-y-1.5">
                {['Numer karty', 'Data ważności'].map((field) => (
                  <input
                    key={field}
                    disabled
                    placeholder={field}
                    className="w-full cursor-not-allowed border border-amber-300 bg-white/80 px-2 py-1.5 text-xs dark:bg-zinc-900/60"
                  />
                ))}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={advance}
            className="mt-4 w-full cursor-pointer bg-red-600 px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-red-700"
          >
            {stage === 'ad' ? 'Odbierz nagrodę' : stage === 'form' ? 'Dalej' : 'Potwierdzam'}
          </button>
          <p className="mt-2 text-[10px] leading-tight text-amber-700/80 dark:text-amber-300/70">
            oferta ważna tylko teraz · pozostało 1 sztuka
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            key={reason ?? 'done'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-md border-l-4 p-5"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            <p className="text-lg font-bold leading-snug" style={{ color }}>
              {reason && REASON_HEADLINE[reason]}
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              {reason === 'timer' &&
                'Licznik nie zniknął po zerze — wystartował od nowa. Bo nie odmierzał niczego prawdziwego: miał tylko sprawić, żebyś kliknął/kliknęła szybciej, niż zdążysz pomyśleć.'}
              {reason === 'chain' &&
                'Najpierw imię, potem adres, na końcu numer karty rodzica. Każdy krok wyglądał na „ostatni”. Prawdziwa nagroda nie wymaga niczego — dlatego to nie była nagroda.'}
              {reason === 'close' &&
                'Nie było żadnej kary za zamknięcie. Żadna prawdziwa sprawa nie znika w 20 sekund, więc zamknięcie takiego okna zawsze jest bezpieczne.'}
            </p>
            <div className="mt-4 border-t pt-3 text-sm leading-relaxed">
              <p className="mb-2 font-semibold">Trzy rzeczy, które są prawdą o każdym takim oknie:</p>
              <ul className="space-y-1.5">
                {[
                  ['timer', 'Zegar jest na niby — po zerze nic nie przepada.'],
                  ['chain', 'Żądania nie kończą się nigdy, każde następne jest większe.'],
                  ['close', 'Krzyżyk w rogu działa od pierwszej sekundy.'],
                ].map(([id, text]) => {
                  const seen = explored.includes(id as Reason);
                  return (
                    <li key={id} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">
                        {seen ? (
                          <Check className="h-4 w-4" style={{ color }} aria-hidden />
                        ) : (
                          <span
                            className="block h-4 w-4 border"
                            style={{ borderColor: 'var(--border)' }}
                          />
                        )}
                      </span>
                      <span className={cn(!seen && 'text-muted-foreground')}>{text}</span>
                    </li>
                  );
                })}
              </ul>
              {explored.length < 3 && (
                <p className="mt-2.5 text-xs text-muted-foreground">
                  Sprawdziłeś/sprawdziłaś {explored.length} z 3. Otwórz okno jeszcze raz i wybierz
                  inaczej — pozostałe też warto zobaczyć na własne oczy.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={replay}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 border-2 px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
              style={{ borderColor: color, color }}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Otwórz to okno jeszcze raz
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
