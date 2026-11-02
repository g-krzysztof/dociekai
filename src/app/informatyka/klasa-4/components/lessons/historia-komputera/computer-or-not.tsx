'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Cpu, Wrench, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Ćwiczenie zamykające historię: skoro maszyny przejmowały kolejne roboty, to
 * w którym momencie maszyna staje się komputerem? Dziecko dostaje dwa warunki
 * i sześć urządzeń do rozstrzygnięcia — cztery z nich są z tej lekcji, dwa
 * z jego własnego domu.
 *
 * To ćwiczenie, nie test: zła odpowiedź nie zamyka pozycji, tylko mówi, żeby
 * sprawdzić oba warunki po kolei, i pozwala odpowiedzieć jeszcze raz.
 * Wyjaśnienie pokazuje się dopiero przy trafionej odpowiedzi — inaczej byłoby
 * ściągą. Blok kończy się, gdy wszystkie sześć jest rozstrzygniętych poprawnie.
 *
 * Odpowiedzi są rozrzucone (nie, tak, nie, tak, tak, nie) — dziecko nie może
 * złapać rytmu pozycji zamiast myśleć.
 */

interface Device {
  id: string;
  name: string;
  note: string;
  isComputer: boolean;
  explanation: string;
}

const DEVICES: Device[] = [
  {
    id: 'liczydlo',
    name: 'Liczydło',
    note: 'drewniana rama i trzydzieści koralików',
    isComputer: false,
    explanation:
      'Nie spełnia żadnego z dwóch warunków. Samo nie wykonuje działań — dodajesz ty, razem z każdym przeniesieniem — i nie da się mu zmienić zadania, bo żadnego nie ma.',
  },
  {
    id: 'eniac',
    name: 'ENIAC',
    note: '27 ton, sala wielkości mieszkania, 1945 rok',
    isComputer: true,
    explanation:
      'Oba warunki spełnione. Liczył sam i dało się mu zmienić zadanie — choć zmiana programu oznaczała kilkudniowe przekładanie kabli, a nie kliknięcie.',
  },
  {
    id: 'kalkulator',
    name: 'Zwykły kalkulator z piórnika',
    note: 'ten za kilkanaście złotych, z pierwiastkiem i procentem',
    isComputer: false,
    explanation:
      'Pierwszy warunek spełnia: liczy sam. Drugiego nie — nie wgrasz do niego gry ani nie każesz mu narysować obrazka. Robi dokładnie to jedno, do czego został zbudowany, i tym różni się od komputera.',
  },
  {
    id: 'analityczna',
    name: 'Maszyna analityczna Babbage’a',
    note: 'zaprojektowana w 1837 roku, nigdy nie zbudowana',
    isComputer: true,
    explanation:
      'Choć nigdy nie powstała, w projekcie miała obie cechy: liczyła sama i czytała program z kart dziurkowanych. Dlatego mówi się o niej jako o pierwszym komputerze — pomyślanym sto lat przed ENIAC-iem.',
  },
  {
    id: 'konsola',
    name: 'Konsola do gier',
    note: 'ta pod telewizorem',
    isComputer: true,
    explanation:
      'To komputer w innej obudowie. Liczy sam i uruchamia różne programy — każda gra to inny program. Zamiast klawiatury ma pada, ale oba warunki spełnia.',
  },
  {
    id: 'pascalina',
    name: 'Maszyna Pascala',
    note: 'zębatki, koła nastawcze i okienka z cyframi, 1642 rok',
    isComputer: false,
    explanation:
      'Pierwszy warunek spełnia — dodaje sama, i to była wtedy wielka rzecz. Ale robi wyłącznie to jedno: nie da się jej powiedzieć, żeby zrobiła coś innego. Maszyna licząca to jeszcze nie komputer.',
  },
];

interface ComputerOrNotProps {
  color: string;
  onComplete?: () => void;
}

export function ComputerOrNot({ color, onComplete }: ComputerOrNotProps) {
  /** `null` = nierozstrzygnięte, `true`/`false` = ostatnia odpowiedź dziecka. */
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});

  const solved = DEVICES.filter((device) => answers[device.id] === device.isComputer).length;
  const finished = solved === DEVICES.length;

  const answer = (device: Device, said: boolean) => {
    if (answers[device.id] === device.isComputer) return;
    const next = { ...answers, [device.id]: said };
    setAnswers(next);
    const correct = DEVICES.filter((item) => next[item.id] === item.isComputer).length;
    if (correct === DEVICES.length) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm leading-relaxed sm:text-base">
            <strong>Komputerem nazywamy maszynę, która spełnia oba te warunki naraz:</strong>
          </p>
          <ol className="space-y-1.5 text-sm leading-relaxed sm:text-base">
            <li className="flex items-start gap-2">
              <span className="font-mono font-bold" style={{ color }}>
                1.
              </span>
              <span>wykonuje działania sama, bez człowieka przy każdym kroku;</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono font-bold" style={{ color }}>
                2.
              </span>
              <span>
                da się jej zmienić program — dzięki temu ta sama maszyna robi różne rzeczy.
              </span>
            </li>
          </ol>
        </div>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {solved}/{DEVICES.length}
        </p>
      </div>

      <ul className="divide-y border">
        {DEVICES.map((device) => {
          const said = answers[device.id] ?? null;
          const settled = said === device.isComputer;
          const wrong = said !== null && !settled;

          return (
            <li key={device.id} className="p-3 sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug">
                    {settled && (
                      <Check
                        className="mr-1.5 inline h-4 w-4 align-[-2px]"
                        style={{ color }}
                        aria-hidden
                      />
                    )}
                    {device.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{device.note}</p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {[
                    { value: true, label: 'To komputer', short: 'Komputer', icon: Cpu },
                    { value: false, label: 'Maszyna, ale nie komputer', short: 'Nie', icon: Wrench },
                  ].map(({ value, label, short, icon: Icon }) => {
                    const picked = said === value;
                    const isRight = settled && picked;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => answer(device, value)}
                        disabled={settled}
                        aria-label={label}
                        aria-pressed={picked}
                        className={cn(
                          'inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                          settled ? 'cursor-default' : 'cursor-pointer hover:bg-muted/60',
                          picked && !isRight && 'border-red-600 text-red-700 dark:text-red-400'
                        )}
                        style={
                          isRight
                            ? { borderColor: color, backgroundColor: `${color}14`, color }
                            : undefined
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="hidden sm:inline">{label}</span>
                        <span className="sm:hidden">{short}</span>
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
                        Sprawdź oba warunki po kolei: czy ta maszyna liczy sama i czy da się jej
                        zmienić program.
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
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Wszystkie sześć rozstrzygnięte.</strong> Granica nie biegnie tam, gdzie
            wszyscy jej szukają — nie po stronie „nowe i elektryczne”. Kalkulator jest od maszyny
            analitycznej nowszy o półtora wieku i komputerem nie jest, a projekt z 1837 roku jest.
            O wszystkim decyduje drugi warunek: <strong>czy da się tej maszynie zmienić program</strong>.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
