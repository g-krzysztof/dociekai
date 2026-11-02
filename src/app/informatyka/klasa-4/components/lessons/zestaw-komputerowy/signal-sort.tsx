'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Check,
  Keyboard,
  Mic,
  Monitor,
  Printer,
  ScanLine,
  Volume2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Haczyk lekcji: dziecko dzieli sześć urządzeń na dwie grupy, zanim ktokolwiek
 * powie mu, że nazywają się „wejście” i „wyjście”. Podział ma wyjść z myślenia
 * o tym, którędy płynie informacja, a nie z definicji do zapamiętania.
 *
 * To ćwiczenie, nie test — zła odpowiedź nie zamyka pozycji, tylko podpowiada
 * jedno pytanie („podaje coś komputerowi, czy komputer przez to coś ci pokazuje?”)
 * i pozwala odpowiedzieć jeszcze raz. Nazwy obu grup pojawiają się dopiero
 * w podsumowaniu, po rozstrzygnięciu wszystkich sześciu.
 *
 * Poprawne odpowiedzi są rozrzucone (DO, OD, DO, OD, OD, DO), żeby dziecko nie
 * łapało rytmu pozycji zamiast myśleć — ta sama zasada co w całym kursie.
 */

interface Device {
  id: string;
  name: string;
  icon: LucideIcon;
  /** `true` = niesie informację DO komputera; `false` = OD komputera do człowieka. */
  toComputer: boolean;
  explanation: string;
}

const DEVICES: Device[] = [
  {
    id: 'klawiatura',
    name: 'Klawiatura',
    icon: Keyboard,
    toComputer: true,
    explanation:
      'Każdy klawisz to jeden znak wysłany do komputera. Klawiatura niczego ci nie pokazuje — tylko podaje.',
  },
  {
    id: 'monitor',
    name: 'Monitor',
    icon: Monitor,
    toComputer: false,
    explanation:
      'Komputer policzył obraz i wyświetla ci go na ekranie. Informacja płynie z komputera do twoich oczu.',
  },
  {
    id: 'mikrofon',
    name: 'Mikrofon',
    icon: Mic,
    toComputer: true,
    explanation:
      'Twój głos zamieniony na sygnał wchodzi do komputera. Dopiero potem może polecieć dalej — na przykład do kolegi.',
  },
  {
    id: 'glosnik',
    name: 'Głośnik',
    icon: Volume2,
    toComputer: false,
    explanation:
      'Dźwięk wychodzi z komputera do pokoju. Głośnik nic nie nagrywa i nic nie podaje z powrotem.',
  },
  {
    id: 'drukarka',
    name: 'Drukarka',
    icon: Printer,
    toComputer: false,
    explanation:
      'Plik z komputera wychodzi na papier. Zwykła drukarka tylko drukuje — w drugą stronę nic przez nią nie wraca.',
  },
  {
    id: 'skaner',
    name: 'Skaner',
    icon: ScanLine,
    toComputer: true,
    explanation:
      'Skaner zamienia kartkę w plik: obraz z papieru wchodzi do komputera. To odwrotność drukowania.',
  },
];

interface SignalSortProps {
  color: string;
  onComplete?: () => void;
}

export function SignalSort({ color, onComplete }: SignalSortProps) {
  /** `null` = nierozstrzygnięte, `true`/`false` = ostatnia odpowiedź dziecka. */
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});

  const solved = DEVICES.filter((device) => answers[device.id] === device.toComputer).length;
  const finished = solved === DEVICES.length;

  const answer = (device: Device, said: boolean) => {
    if (answers[device.id] === device.toComputer) return;
    const next = { ...answers, [device.id]: said };
    setAnswers(next);
    const correct = DEVICES.filter((item) => next[item.id] === item.toComputer).length;
    if (correct === DEVICES.length) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="flex items-start gap-2 text-sm leading-relaxed sm:text-base">
          <ArrowLeftRight className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
          <span>
            Te sześć urządzeń dzieli się na dwie grupy. Nie po tym, jak wyglądają — po tym,{' '}
            <strong>którędy przez nie płynie informacja</strong>. Przy każdym wybierz: niesie coś{' '}
            <strong>do</strong> komputera, czy komputer przez nie coś <strong>oddaje</strong> tobie.
          </span>
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {solved}/{DEVICES.length}
        </p>
      </div>

      <ul className="divide-y border">
        {DEVICES.map((device) => {
          const said = answers[device.id] ?? null;
          const settled = said === device.toComputer;
          const wrong = said !== null && !settled;
          const Icon = device.icon;

          return (
            <li key={device.id} className="p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <p className="flex min-w-0 flex-1 items-center gap-2.5 font-semibold leading-snug">
                  <Icon className="h-5 w-5 shrink-0" style={{ color }} aria-hidden />
                  {settled && (
                    <Check className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  )}
                  {device.name}
                </p>

                <div className="flex shrink-0 gap-2">
                  {[
                    { value: true, label: 'Do komputera' },
                    { value: false, label: 'Od komputera' },
                  ].map(({ value, label }) => {
                    const picked = said === value;
                    const isRight = settled && picked;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => answer(device, value)}
                        disabled={settled}
                        aria-pressed={picked}
                        className={cn(
                          'inline-flex items-center border px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                          settled ? 'cursor-default' : 'cursor-pointer hover:bg-muted/60',
                          picked && !isRight && 'border-red-600 text-red-700 dark:text-red-400'
                        )}
                        style={
                          isRight
                            ? { borderColor: color, backgroundColor: `${color}14`, color }
                            : undefined
                        }
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence>
                {said !== null && (
                  <motion.p
                    key={settled ? 'ok' : 'nope'}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 border-l-2 pl-3 text-sm leading-relaxed"
                    style={{ borderColor: settled ? color : '#dc2626' }}
                  >
                    {wrong ? (
                      <>
                        <span className="mr-1 inline-flex items-center font-semibold text-red-700 dark:text-red-400">
                          <X className="mr-1 h-4 w-4" aria-hidden />
                          Jeszcze nie.
                        </span>
                        Zadaj sobie jedno pytanie: czy ta rzecz coś komputerowi <strong>podaje</strong>,
                        czy komputer przez nią coś <strong>ci pokazuje</strong>?
                      </>
                    ) : (
                      device.explanation
                    )}
                  </motion.p>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <p>
              <strong>Rozstrzygnięte.</strong> Grupa, która coś komputerowi <strong>podaje</strong> —
              klawiatura, mikrofon, skaner — to <strong>urządzenia wejścia</strong>. Grupa, przez
              którą komputer coś <strong>oddaje</strong> — monitor, głośnik, drukarka — to{' '}
              <strong>urządzenia wyjścia</strong>.
            </p>
            <p className="mt-2">
              W następnym bloku zobaczysz to na całym zestawie naraz — i poznasz urządzenia, które
              robią jedno i drugie.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
