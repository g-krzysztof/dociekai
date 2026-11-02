'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera,
  Cpu,
  Keyboard,
  Mic,
  Monitor,
  MousePointer2,
  Printer,
  Usb,
  Volume2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Wyjaśnienie lekcji: te same pojęcia co w haczyku, ale na całym zestawie naraz
 * i z trzecią możliwością, której w haczyku nie było — urządzenia działające
 * w obie strony. To nie test: kliknięcie karty tylko odsłania, czym dane
 * urządzenie jest (wzorzec „otwórz, żeby zobaczyć” z `MachineTimeline`).
 *
 * Nad kartami stoi pasek przepływu WEJŚCIA → KOMPUTER → WYJŚCIA. Liczniki w nim
 * rosną w miarę odsłaniania kart, więc widać, że wejść i wyjść jest podobnie
 * dużo, a pośrodku wszystko spina jedna jednostka centralna.
 *
 * Blok kończy się po odsłonięciu wszystkich dziewięciu urządzeń.
 */

type Flow = 'in' | 'out' | 'both';

interface Device {
  id: string;
  name: string;
  icon: LucideIcon;
  flow: Flow;
  /** Co to jest — widoczne od razu, pod nazwą. */
  what: string;
  /** Dlaczego taki przepływ — odsłaniane po kliknięciu. */
  detail: string;
}

const DEVICES: Device[] = [
  {
    id: 'klawiatura',
    name: 'Klawiatura',
    icon: Keyboard,
    flow: 'in',
    what: 'klawisze pod palcami',
    detail:
      'Każdy klawisz to znak wysłany do komputera. Litery, które widzisz na ekranie, rysuje już monitor — klawiatura tylko je podaje.',
  },
  {
    id: 'mysz',
    name: 'Mysz',
    icon: MousePointer2,
    flow: 'in',
    what: 'ruch po biurku i kliknięcia',
    detail:
      'Do komputera trafia informacja „przesunięto o tyle, kliknięto tutaj”. Strzałkę na ekranie dorysowuje monitor.',
  },
  {
    id: 'kamera',
    name: 'Kamera internetowa',
    icon: Camera,
    flow: 'in',
    what: 'oko nad ekranem',
    detail:
      'Obraz z twojego pokoju wchodzi do komputera. Dopiero stamtąd leci dalej — na przykład do babci podczas rozmowy.',
  },
  {
    id: 'mikrofon',
    name: 'Mikrofon',
    icon: Mic,
    flow: 'in',
    what: 'łapie dźwięk',
    detail: 'Twój głos zamieniony na sygnał wchodzi do komputera. Bez mikrofonu komputer cię nie słyszy.',
  },
  {
    id: 'monitor',
    name: 'Monitor',
    icon: Monitor,
    flow: 'out',
    what: 'ekran przed tobą',
    detail:
      'Komputer policzył obraz i ci go pokazuje. Zwykły monitor nic nie podaje z powrotem — ale ekran dotykowy już tak, i wtedy działa w obie strony.',
  },
  {
    id: 'glosniki',
    name: 'Głośniki',
    icon: Volume2,
    flow: 'out',
    what: 'dźwięk do pokoju',
    detail: 'Muzyka, głos z filmu, sygnał błędu — wszystko to wychodzi z komputera przez głośniki.',
  },
  {
    id: 'drukarka',
    name: 'Drukarka',
    icon: Printer,
    flow: 'out',
    what: 'plik na papier',
    detail:
      'Zwykła drukarka tylko drukuje: bierze plik z komputera i odkłada go na kartce. W drugą stronę nic przez nią nie wraca.',
  },
  {
    id: 'wielofunkcyjne',
    name: 'Urządzenie wielofunkcyjne',
    icon: Printer,
    flow: 'both',
    what: 'drukarka i skaner w jednej obudowie',
    detail:
      'Drukuje (plik → papier, czyli wyjście) i skanuje (papier → plik, czyli wejście). Dwa urządzenia w jednym pudełku — dlatego liczy się do obu grup.',
  },
  {
    id: 'pendrive',
    name: 'Pendrive',
    icon: Usb,
    flow: 'both',
    what: 'pamięć wielkości gumki',
    detail:
      'Kopiujesz na niego pliki — wtedy dane do niego wchodzą. Kopiujesz z niego — wtedy z niego wychodzą. Sam nic nie liczy, tylko przechowuje.',
  },
];

const FLOW_LABEL: Record<Flow, string> = {
  in: 'WEJŚCIE',
  out: 'WYJŚCIE',
  both: 'WEJŚCIE i WYJŚCIE',
};

interface IoMapProps {
  color: string;
  onComplete?: () => void;
}

export function IoMap({ color, onComplete }: IoMapProps) {
  const [seen, setSeen] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  const reveal = (id: string) => {
    setOpen((prev) => (prev === id ? null : id));
    if (seen.includes(id)) return;
    const next = [...seen, id];
    setSeen(next);
    if (next.length === DEVICES.length) onComplete?.();
  };

  const seenDevices = DEVICES.filter((device) => seen.includes(device.id));
  const inCount = seenDevices.filter((d) => d.flow === 'in' || d.flow === 'both').length;
  const outCount = seenDevices.filter((d) => d.flow === 'out' || d.flow === 'both').length;
  const finished = seen.length === DEVICES.length;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Oto typowy zestaw. <strong>Stuknij każde urządzenie</strong> i sprawdź, do której grupy
          należy. Trzy z nich robią jedno i drugie — zobacz które.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {seen.length}/{DEVICES.length}
        </p>
      </div>

      {/* Pasek przepływu: wejścia po lewej, wyjścia po prawej, jednostka centralna w środku. */}
      <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 text-center">
        <div
          className="flex flex-col justify-center border p-3"
          style={{ borderColor: `${color}55`, backgroundColor: `${color}0d` }}
        >
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>
            Wejścia
          </span>
          <span className="font-mono text-2xl font-black tabular-nums" style={{ color }}>
            {inCount}
          </span>
          <span className="text-[11px] text-muted-foreground">niosą coś do komputera</span>
        </div>

        <div className="flex flex-col items-center justify-center px-1">
          <span aria-hidden style={{ color }}>→</span>
          <div
            className="my-1 flex flex-col items-center justify-center border-2 px-3 py-2"
            style={{ borderColor: color }}
          >
            <Cpu className="h-6 w-6" style={{ color }} aria-hidden />
            <span className="mt-1 text-[11px] font-bold leading-tight" style={{ color }}>
              JEDNOSTKA
              <br />
              CENTRALNA
            </span>
          </div>
          <span aria-hidden style={{ color }}>→</span>
        </div>

        <div
          className="flex flex-col justify-center border p-3"
          style={{ borderColor: `${color}55`, backgroundColor: `${color}0d` }}
        >
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>
            Wyjścia
          </span>
          <span className="font-mono text-2xl font-black tabular-nums" style={{ color }}>
            {outCount}
          </span>
          <span className="text-[11px] text-muted-foreground">komputer coś przez nie oddaje</span>
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {DEVICES.map((device) => {
          const Icon = device.icon;
          const isSeen = seen.includes(device.id);
          const isOpen = open === device.id;
          return (
            <li key={device.id} className={cn(isOpen && 'sm:col-span-2')}>
              <button
                type="button"
                onClick={() => reveal(device.id)}
                aria-expanded={isOpen}
                className={cn(
                  'flex w-full cursor-pointer items-start gap-3 border p-3 text-left transition-colors',
                  isOpen ? '' : 'hover:bg-muted/40'
                )}
                style={isOpen ? { borderColor: color, backgroundColor: `${color}0f` } : undefined}
              >
                <Icon
                  className="mt-0.5 h-5 w-5 shrink-0"
                  style={{ color: isSeen ? color : 'var(--muted-foreground)' }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold leading-snug">{device.name}</span>
                  {isSeen ? (
                    <span
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
                    >
                      {FLOW_LABEL[device.flow]}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">{device.what}</span>
                  )}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p
                      className="border border-t-0 p-3 text-sm leading-relaxed text-muted-foreground"
                      style={{ borderColor: color }}
                    >
                      {device.detail}
                    </p>
                  </motion.div>
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
              <strong>Cały zestaw rozpisany.</strong> Zapamiętaj środek paska: <strong>jednostka
              centralna</strong> to nie wejście ani wyjście — to część, która wszystko spina.
              Przyjmuje z wejść, przetwarza i oddaje na wyjścia. W laptopie, tablecie i telefonie
              siedzi schowana w obudowie, a ekran dotykowy łączy wejście z wyjściem w jednej szybce.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
