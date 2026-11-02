'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  Cog,
  Cpu,
  Hand,
  Monitor,
  ScrollText,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Wyjaśnienie lekcji: sześć maszyn ustawionych w jedną historię, w której każda
 * kolejna przejmuje od człowieka jedną robotę więcej — pamiętanie liczby,
 * wykonanie działania, kolejność kroków, szybkość, miejsce, wszystko naraz.
 * To jest oś tej lekcji; daty są tylko wieszakiem.
 *
 * Nad kartami stoi pasek skali w **prawdziwej proporcji** (3000 p.n.e. → dziś).
 * Liczydło ląduje na nim przy samym początku, a wszystkie pozostałe maszyny
 * mieszczą się w ostatnich ośmiu procentach paska — i o to chodzi: cztery
 * tysiące lat nic, potem wszystko w czterysta. Pasek jest wyłącznie rysunkiem
 * (kliknięcia i tak trafiałyby w siebie przy tej skali), więc niesie opis
 * tekstowy dla czytnika ekranu, a interakcja siedzi w kartach niżej.
 */

interface Machine {
  id: string;
  year: string;
  name: string;
  icon: LucideIcon;
  /** Jedno zdanie: co ta maszyna przejęła od człowieka. */
  took: string;
  body: string;
}

const MACHINES: Machine[] = [
  {
    id: 'liczydlo',
    year: 'ok. 2700 p.n.e.',
    name: 'Liczydło',
    icon: Hand,
    took: 'Nic. Pamięta liczbę — liczysz ty.',
    body:
      'Pierwszych liczydeł używano w Mezopotamii ponad cztery i pół tysiąca lat temu, później w Rzymie, Chinach i Japonii. Wprawiony rachmistrz potrafi na liczydle dodawać szybciej niż ktoś obok wstukujący te same liczby w kalkulator — ale to on liczy, nie liczydło. Właśnie dlatego ten wynalazek przetrwał cztery tysiące lat bez zmian: nie ma w nim niczego, co mogłoby się zepsuć.',
  },
  {
    id: 'pascalina',
    year: '1642',
    name: 'Maszyna Pascala',
    icon: Cog,
    took: 'Samo dodawanie. Przeniesienie robi mechanizm.',
    body:
      'Blaise Pascal zbudował ją w wieku 19 lat dla ojca, poborcy podatkowego, który całe dnie dodawał kolumny liczb. Nowością były zębatki: koło po przejściu z 9 na 0 popychało sąsiednie o jeden ząb, więc dziesiątka przenosiła się sama. Powstało około dwudziestu takich maszyn, kosztowały majątek i umiały tylko dodawać oraz odejmować.',
  },
  {
    id: 'analityczna',
    year: '1837',
    name: 'Maszyna analityczna i Ada Lovelace',
    icon: ScrollText,
    took: 'Kolejność kroków. Maszyna czyta program z kart.',
    body:
      'Charles Babbage zaprojektował maszynę, która miała odczytywać polecenia z kart dziurkowanych — jedno urządzenie mogło więc wykonywać różne zadania, wystarczyło zmienić karty. W 1843 roku Ada Lovelace opisała, jak kazać jej obliczyć ciąg liczb Bernoulliego; ten opis uznaje się dziś za pierwszy program komputerowy w historii. Maszyny nigdy nie zbudowano: była za droga i za trudna jak na ówczesne warsztaty.',
  },
  {
    id: 'eniac',
    year: '1945',
    name: 'ENIAC',
    icon: Cpu,
    took: 'Szybkość. Liczy prądem, a nie zębatkami.',
    body:
      'Ważył 27 ton, zajmował salę wielkości mieszkania i miał w środku 17 468 lamp elektronowych; światu pokazano go w lutym 1946 roku. Program zmieniało się przez przekładanie kabli i przestawianie setek przełączników — potrafiło to zająć kilka dni. Robiło to sześć kobiet: Kay McNulty, Betty Jennings, Betty Snyder, Marlyn Wescoff, Fran Bilas i Ruth Lichterman, pierwsze programistki w historii.',
  },
  {
    id: 'pc',
    year: '1977',
    name: 'Komputer osobisty',
    icon: Monitor,
    took: 'Miejsce. Komputer schodzi z sali na biurko.',
    body:
      'W jednym roku pojawiły się od razu trzy komputery, które można było po prostu kupić: Apple II, Commodore PET i TRS-80. Po raz pierwszy komputer nie należał do instytucji, tylko do zwykłego człowieka. Do polskich domów trafił kilka lat później — w latach 80. królowały ZX Spectrum i Commodore 64, a program wczytywało się z kasety magnetofonowej, czasem kwadrans.',
  },
  {
    id: 'smartfon',
    year: '2007',
    name: 'Smartfon',
    icon: Smartphone,
    took: 'Resztę. Komputer mieści się w kieszeni i przestaje być komputerem.',
    body:
      'Telefon z 2007 roku był już pełnym komputerem z ekranem dotykowym. Ten, który dziś leży na stole, ma więcej pamięci i liczy szybciej niż komputer pokładowy, który w 1969 roku sprowadził lądownik Apollo 11 na Księżyc. Najciekawsze jest to, że przestaliśmy o nim myśleć jak o komputerze — a to jest dokładnie ta sama maszyna, tylko mniejsza.',
  },
];

/* ── Pasek skali ──────────────────────────────────────────────────────────
   Oś od 3000 p.n.e. do dziś. Wszystko, co w tej lekcji nie jest liczydłem,
   mieści się w prawym skrawku — dlatego skrawek jest podświetlony i podpisany,
   a nie rozciągnięty na siłę.                                              */

const AXIS_FROM = -3000;
const AXIS_TO = 2026;
const pct = (year: number) => ((year - AXIS_FROM) / (AXIS_TO - AXIS_FROM)) * 100;

const TICKS = [
  { year: -3000, label: '3000 p.n.e.' },
  { year: -2000, label: '2000 p.n.e.' },
  { year: -1000, label: '1000 p.n.e.' },
  { year: 0, label: 'rok 0' },
  { year: 1000, label: '1000' },
  { year: 2026, label: 'dziś' },
];

function ScaleStrip({ color }: { color: string }) {
  return (
    <div className="-mx-1 mb-8 overflow-x-auto px-1">
      <div
        className="min-w-[520px]"
        role="img"
        aria-label="Oś czasu od 3000 roku p.n.e. do dziś: liczydło pojawia się na samym początku osi, a maszyna Pascala, maszyna analityczna, ENIAC, komputer osobisty i smartfon mieszczą się w ostatnich ośmiu procentach jej długości."
      >
        <div className="relative h-16">
          {/* Skrawek ostatnich 400 lat — cała reszta tej lekcji */}
          <span
            aria-hidden
            className="absolute bottom-6 top-0"
            style={{
              left: `${pct(1600)}%`,
              width: `${100 - pct(1600)}%`,
              backgroundColor: `${color}1f`,
              borderLeft: `2px solid ${color}`,
            }}
          />

          <span aria-hidden className="absolute bottom-6 left-0 right-0 h-0.5 bg-foreground/25" />

          {/* Liczydło — jedyny znacznik, który na tej skali stoi osobno */}
          <span
            aria-hidden
            className="absolute bottom-6 h-4 w-0.5 -translate-x-1/2"
            style={{ left: `${pct(-2700)}%`, backgroundColor: color }}
          />
          <span
            className="absolute bottom-[42px] -translate-x-1/2 whitespace-nowrap text-xs font-bold"
            style={{ left: `${pct(-2700)}%`, color }}
          >
            liczydło
          </span>

          <span
            className="absolute bottom-[42px] whitespace-nowrap text-xs font-bold"
            style={{ left: `${pct(1600)}%`, color, transform: 'translateX(-88%)' }}
          >
            cała reszta ↓
          </span>

          {TICKS.map((tick) => (
            <span
              key={tick.label}
              aria-hidden
              className="absolute bottom-0 whitespace-nowrap text-[10px] text-muted-foreground"
              style={{
                left: `${pct(tick.year)}%`,
                transform:
                  tick.year === AXIS_FROM
                    ? 'translateX(0)'
                    : tick.year === AXIS_TO
                      ? 'translateX(-100%)'
                      : 'translateX(-50%)',
              }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface MachineTimelineProps {
  color: string;
  onComplete?: () => void;
}

export function MachineTimeline({ color, onComplete }: MachineTimelineProps) {
  const [open, setOpen] = useState<string[]>([]);
  const [seen, setSeen] = useState<string[]>([]);

  const toggle = (id: string) => {
    setOpen((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    if (seen.includes(id)) return;
    const next = [...seen, id];
    setSeen(next);
    if (next.length === MACHINES.length) onComplete?.();
  };

  const finished = seen.length === MACHINES.length;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Cztery tysiące lat ludzie liczyli na liczydle. Potem, w niecałe czterysta lat, maszyny
          przejęły od nas wszystko po kolei. <strong>Otwórz każdą z sześciu maszyn</strong> i patrz
          na jedno: co ta maszyna zaczęła robić za człowieka.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {seen.length}/{MACHINES.length}
        </p>
      </div>

      <ScaleStrip color={color} />

      <ol className="relative border-l-2" style={{ borderColor: `${color}40` }}>
        {MACHINES.map((machine) => {
          const isOpen = open.includes(machine.id);
          const isSeen = seen.includes(machine.id);
          const Icon = machine.icon;
          return (
            <li key={machine.id} className="relative pb-3 pl-5 last:pb-0">
              <span
                aria-hidden
                className="absolute -left-[7px] top-3 h-3 w-3 rounded-full border-2 bg-background"
                style={{ borderColor: isSeen ? color : 'var(--border)' }}
              />
              <button
                type="button"
                onClick={() => toggle(machine.id)}
                aria-expanded={isOpen}
                className={cn(
                  'flex w-full cursor-pointer items-start gap-3 border p-3 text-left transition-colors',
                  isOpen ? '' : 'hover:bg-muted/40'
                )}
                style={
                  isOpen ? { borderColor: color, backgroundColor: `${color}0f` } : undefined
                }
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-xs font-bold tabular-nums text-muted-foreground">
                    {machine.year}
                  </span>
                  <span className="block font-bold leading-snug">{machine.name}</span>
                </span>
                <ChevronDown
                  className={cn('mt-1 h-4 w-4 shrink-0 transition-transform', isOpen && 'rotate-180')}
                  style={{ color }}
                  aria-hidden
                />
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
                    <div className="border border-t-0 p-4" style={{ borderColor: color }}>
                      <p
                        className="mb-2 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
                      >
                        Co przejęła od człowieka
                      </p>
                      <p className="mb-3 font-semibold leading-snug">{machine.took}</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">{machine.body}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      <AnimatePresence>
        {finished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Przeczytaj jeszcze raz same zdania „co przejęła”.</strong> Wychodzi z nich
            cała historia komputera: maszyny zabierały nam kolejne roboty, ale ani jedna nie
            zabrała ostatniej — <strong>decyzji, co ma być zrobione</strong>. To dalej należy do
            człowieka, także wtedy, gdy tym człowiekiem jesteś ty przy swoim komputerze.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
