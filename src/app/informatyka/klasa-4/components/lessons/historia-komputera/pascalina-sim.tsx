'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Cog, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Symulator maszyny Pascala — celowo ten sam rachunek co w bloku z liczydłem
 * (47 + 68), żeby różnica dała się zobaczyć, a nie tylko przeczytać: tam
 * przeniesienia robiło dziecko, tu robi je mechanizm i pokazuje licznik.
 *
 * Obsługa jest wzięta z prawdziwej pascaliny: w kole każdej kolumny wkłada się
 * rysik w otwór z cyfrą i przekręca do oporu — czyli klika się cyfrę, a nie
 * kręci pokrętłem. Dlatego cyfry są zwykłymi przyciskami; zero nie jest
 * przyciskiem, bo dodanie zera niczego nie robi (to znacznik początku skali).
 *
 * Wygląd: orzechowa skrzynka, mosiężna płyta na czterech wkrętach, wpuszczone
 * okienka rejestru i toczone koła. Maszyna ma być **przedmiotem na stole**,
 * a nie panelem interfejsu — dlatego jako jedyna w lekcji nie bierze kolorów
 * kursu i nie zmienia się w trybie ciemnym (ta sama decyzja co przy makiecie
 * pulpitu w teście diagnostycznym). Cała faktura to gradienty i cienie w CSS:
 * zero obrazów do pobrania, ostrość na każdym ekranie.
 *
 * Pozycje cyfr liczą się raz, na poziomie modułu, ze stałych — ten sam wynik
 * po stronie serwera i klienta, więc rysunek nie migocze przy hydracji.
 */

/** Kolumny od najmłodszej: potęga dziesiątki = indeks. */
const COLUMNS = [
  { id: 'jednosci', label: 'jedności', weight: '×1' },
  { id: 'dziesiatki', label: 'dziesiątki', weight: '×10' },
  { id: 'setki', label: 'setki', weight: '×100' },
];

/**
 * Dziesięć otworów na obwodzie koła: 0 na górze, dalej zgodnie z ruchem
 * wskazówek. To ich liczba wymusza rozmiar celu — przy kole 128 px i otworach
 * na 38% promienia sąsiednie środki dzieli ~29 px, więc przycisk może mieć
 * 28 px i jeszcze nie nachodzić na sąsiada (mierzone, nie oszacowane).
 * Większe cele wymagałyby koła szerszego niż telefon, dlatego skrzynka
 * przewija się w poziomie, zamiast rosnąć.
 */
const HOLES = Array.from({ length: 10 }, (_, digit) => {
  const angle = ((digit * 36 - 90) * Math.PI) / 180;
  return {
    digit,
    x: 50 + 38 * Math.cos(angle),
    y: 50 + 38 * Math.sin(angle),
  };
});

/* ── Materiały ────────────────────────────────────────────────────────────
   Światło pada z góry z lewej i jest tak samo ustawione we wszystkich czterech
   powierzchniach — dlatego mosiądz wygląda na jedną bryłę, a nie na zestaw
   osobno cieniowanych elementów.                                           */

/** Orzechowa skrzynka: słoje jako gęste, ledwo widoczne pasy w poprzek. */
const CASE_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(96deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 6px),' +
    'linear-gradient(170deg, #7a5530 0%, #5b3c1e 46%, #402910 100%)',
  boxShadow:
    'inset 0 1px 0 rgba(255,226,178,0.35), inset 0 -2px 6px rgba(0,0,0,0.45), 0 14px 26px -14px rgba(59,39,17,0.75)',
} as const;

/** Mosiężna płyta: szlif w skos plus rozjaśnienie od strony światła. */
const PLATE_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(115deg, rgba(255,255,255,0.055) 0 1.5px, rgba(74,52,16,0.05) 1.5px 4px),' +
    'radial-gradient(135% 105% at 26% -12%, #f2d982 0%, #d9b23f 38%, #c19a24 66%, #9d7b17 100%)',
  boxShadow:
    'inset 0 1px 0 rgba(255,247,214,0.6), inset 0 -3px 9px rgba(74,52,16,0.5), 0 1px 2px rgba(0,0,0,0.35)',
} as const;

/** Listwa rejestru — płytkie wpuszczenie w płycie, w którym siedzą okienka. */
const REGISTER_STYLE = {
  backgroundImage: 'linear-gradient(180deg, rgba(74,52,16,0.17), rgba(74,52,16,0.04))',
  boxShadow: 'inset 0 2px 4px rgba(74,52,16,0.55), 0 1px 0 rgba(255,247,214,0.45)',
} as const;

/** Okienko wyniku: wycięcie w mosiądzu, w głębi ciemny bęben z cyfrą. */
const WINDOW_STYLE = {
  backgroundImage: 'linear-gradient(180deg, #1b1611 0%, #0b0907 55%, #17120c 100%)',
  boxShadow:
    'inset 0 3px 7px rgba(0,0,0,0.95), inset 0 0 0 2px #8a6a3b, 0 1px 0 rgba(255,247,214,0.5)',
} as const;

/** Koło nastawcze: toczony mosiądz, więc odblask biegnie po obwodzie. */
const DIAL_STYLE = {
  backgroundImage:
    'conic-gradient(from 205deg, #c39c26, #f3dd9c 9%, #cba82f 21%, #f7e3a8 32%, #b78e1d 44%, #efd990 57%, #bf9921 69%, #f5e0a1 83%, #c39c26)',
  boxShadow:
    'inset 0 0 0 3px #8a6a3b, inset 0 2px 4px rgba(255,247,214,0.45), inset 0 -4px 10px rgba(74,52,16,0.55), 0 4px 8px -3px rgba(0,0,0,0.5)',
} as const;

/** Piasta koła — ciemniejsza, wpuszczona, z wygrawerowaną wagą kolumny. */
const HUB_STYLE = {
  backgroundImage: 'radial-gradient(circle at 38% 30%, #e2c052 0%, #c69c27 58%, #ab8a1d 100%)',
  boxShadow:
    'inset 0 0 0 2px rgba(74,52,16,0.4), inset 0 3px 6px rgba(74,52,16,0.6), 0 1px 0 rgba(255,247,214,0.55)',
} as const;

/** Otwór na rysik: wywiercony w blasze, więc dolna krawędź łapie światło. */
const HOLE_STYLE = {
  backgroundImage: 'radial-gradient(circle at 50% 26%, #2c251a 0%, #100d09 72%)',
  boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.9), 0 1px 0 rgba(255,247,214,0.5)',
} as const;

/** Grawer w mosiądzu: ciemna rysa i jasna krawędź pod nią. */
const ENGRAVED = {
  color: '#2f2005',
  textShadow: '0 1px 0 rgba(255,247,214,0.5)',
} as const;

const TASKS = [
  {
    target: 47,
    prompt: (
      <>
        <strong>Wkręć na maszynie 47.</strong> Cztery na kole dziesiątek i siedem na kole
        jedności — kliknij cyfrę w otworze, tak jak wkładało się rysik w prawdziwej pascalinie.
      </>
    ),
  },
  {
    target: 115,
    prompt: (
      <>
        <strong>Dodaj 68 — nie zerując maszyny.</strong> Sześć na kole dziesiątek, osiem na kole
        jedności. Patrz na okienka: nigdzie nie musisz pilnować, żeby coś przeskoczyło do
        następnej kolumny.
      </>
    ),
  },
];

/** Które kolumny wykonają przeniesienie przy tym dodawaniu — do animacji i licznika. */
function carriesFor(before: number, add: number): number[] {
  const carried: number[] = [];
  let carry = 0;
  for (let i = 0; i < COLUMNS.length; i += 1) {
    const digit = Math.floor(before / 10 ** i) % 10;
    const added = Math.floor(add / 10 ** i) % 10;
    if (digit + added + carry > 9) {
      carried.push(i);
      carry = 1;
    } else {
      carry = 0;
    }
  }
  return carried;
}

/** Wkręt mocujący płytę — cztery narożniki, każdy z rowkiem pod śrubokręt. */
function Screw({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn('absolute h-3 w-3 rounded-full', className)}
      style={{
        backgroundImage: 'radial-gradient(circle at 34% 28%, #f7e7b0 0%, #b08d22 58%, #6f5510 100%)',
        boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.55), 0 1px 0 rgba(255,247,214,0.45)',
      }}
    >
      <span className="absolute left-1/2 top-1/2 h-px w-2 -translate-x-1/2 -translate-y-1/2 rotate-[35deg] bg-[#4a3410]/75" />
    </span>
  );
}

interface PascalinaSimProps {
  color: string;
  onComplete?: () => void;
}

export function PascalinaSim({ color, onComplete }: PascalinaSimProps) {
  const [value, setValue] = useState(0);
  const [task, setTask] = useState(0);
  const [finished, setFinished] = useState(false);
  const [machineCarries, setMachineCarries] = useState(0);
  /** Ostatnie przeniesienia — trzymają `id`, żeby animacja ruszała też przy powtórce. */
  const [flash, setFlash] = useState<{ id: number; columns: number[] } | null>(null);
  const [overflow, setOverflow] = useState(false);
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Na telefonie maszyna jest szersza niż ekran, więc pokazujemy jej prawą
  // stronę: tam stoją koła jedności i dziesiątek, czyli dokładnie te, których
  // wymaga zadanie. Rejestr jest pośrodku i zostaje widoczny tak czy inaczej.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollLeft = el.scrollWidth - el.clientWidth;
  }, []);

  const current = TASKS[Math.min(task, TASKS.length - 1)];
  const digits = COLUMNS.map((_, i) => Math.floor(value / 10 ** i) % 10);

  const dial = (columnIndex: number, digit: number) => {
    if (finished) return;
    const add = digit * 10 ** columnIndex;
    const carried = carriesFor(value, add);
    const raw = value + add;
    /** Trzy koła to najwyżej 999 — dalej maszyna przekręca się na zero, jak prawdziwa. */
    const next = raw % 1000;

    setValue(next);
    setMachineCarries((prev) => prev + carried.length);
    setFlash(carried.length > 0 ? { id: Date.now(), columns: carried } : null);
    setOverflow(raw > 999);

    if (next === 0 && task === 1) {
      setTask(0);
      return;
    }
    if (next !== current.target) return;

    if (task === 0) {
      setTask(1);
    } else {
      setFinished(true);
      onComplete?.();
    }
  };

  const reset = () => {
    setValue(0);
    setFlash(null);
    setOverflow(false);
    if (!finished) setTask(0);
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <Cog className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <div className="min-w-0 text-sm leading-relaxed sm:text-base">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            Polecenie {Math.min(task + 1, TASKS.length)} z {TASKS.length}
          </p>
          <p>{current.prompt}</p>
        </div>
      </div>

      <div ref={scrollerRef} className="-mx-1 overflow-x-auto px-1 py-2">
        {/* Skrzynka trzyma się szerokości trzech kół — ma wyglądać jak maszyna
            postawiona na stole, nie jak złoty pas przez całą stronę. */}
        <div
          className="mx-auto w-fit min-w-[408px] select-none p-1.5 sm:p-3"
          style={CASE_STYLE}
        >
          <div className="relative px-2.5 py-3 sm:px-6 sm:py-4" style={PLATE_STYLE}>
            <Screw className="left-1.5 top-1.5" />
            <Screw className="right-1.5 top-1.5" />
            <Screw className="bottom-1.5 left-1.5" />
            <Screw className="bottom-1.5 right-1.5" />

            <p
              className="mb-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em]"
              style={ENGRAVED}
            >
              Machine d’arithmétique · 1642
            </p>

            {/* Rejestr — wpuszczona listwa z trzema okienkami, cyframi do góry */}
            <div className="mx-auto flex w-fit gap-1.5 px-2.5 pb-2 pt-3 sm:gap-2 sm:px-3" style={REGISTER_STYLE}>
              {[...COLUMNS].reverse().map((column, reversedIndex) => {
                const index = COLUMNS.length - 1 - reversedIndex;
                const carrying = flash?.columns.includes(index - 1);
                return (
                  <div key={column.id} className="relative">
                    {/* Znacznik przeniesienia: „+1” przyjeżdża z prawej, czyli
                        stamtąd, skąd w maszynie idzie ząb do sąsiedniego koła. */}
                    <AnimatePresence>
                      {carrying && (
                        <motion.span
                          key={`${flash?.id}-${index}`}
                          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 14 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="pointer-events-none absolute -top-[18px] left-1/2 flex -translate-x-1/2 items-center gap-0.5 whitespace-nowrap font-mono text-[10px] font-bold"
                          style={{ color: '#5c1d06', textShadow: '0 1px 0 rgba(255,247,214,0.5)' }}
                        >
                          <ArrowLeft className="h-3 w-3" aria-hidden />
                          +1
                        </motion.span>
                      )}
                    </AnimatePresence>

                    <div
                      className="relative flex h-14 w-12 items-center justify-center overflow-hidden"
                      style={WINDOW_STYLE}
                    >
                      {/* Bęben z cyframi: nowa wjeżdża od dołu, stara wyjeżdża górą */}
                      <AnimatePresence initial={false}>
                        <motion.span
                          key={`${column.id}-${digits[index]}`}
                          initial={reduceMotion ? { opacity: 0 } : { y: '95%' }}
                          animate={reduceMotion ? { opacity: 1 } : { y: '0%' }}
                          exit={reduceMotion ? { opacity: 0 } : { y: '-95%' }}
                          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute inset-0 flex items-center justify-center font-mono text-3xl font-bold tabular-nums"
                          style={{ color: '#f7d488', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                        >
                          {digits[index]}
                        </motion.span>
                      </AnimatePresence>

                      {/* Odblask szkiełka — stała plamka światła w lewym górnym rogu */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{
                          backgroundImage:
                            'linear-gradient(158deg, rgba(255,247,214,0.16) 0%, rgba(255,247,214,0.03) 42%, transparent 62%)',
                        }}
                      />

                      {/* Błysk okienka w chwili, gdy maszyna wrzuca do niego przeniesienie */}
                      <AnimatePresence>
                        {carrying && (
                          <motion.span
                            key={`${flash?.id}-glow-${index}`}
                            aria-hidden
                            initial={{ opacity: 0.85 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                            className="pointer-events-none absolute inset-0"
                            style={{ boxShadow: 'inset 0 0 14px 3px rgba(247,212,136,0.75)' }}
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    <p
                      className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-wide"
                      style={ENGRAVED}
                    >
                      {column.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Koła nastawcze — kolejność jak w okienkach: setki, dziesiątki, jedności */}
            <div className="mt-5 flex justify-center gap-2 sm:gap-3">
              {[...COLUMNS].reverse().map((column, reversedIndex) => {
                const index = COLUMNS.length - 1 - reversedIndex;
                return (
                  <div key={column.id} className="relative h-32 w-32 rounded-full" style={DIAL_STYLE}>
                    {/* Toczony rowek, po którym biegną otwory — cienka rysa
                        i jasna krawędź pod nią, jak na obtaczanym mosiądzu. */}
                    <span
                      aria-hidden
                      className="absolute inset-[7px] rounded-full"
                      style={{
                        boxShadow:
                          'inset 0 0 0 1px rgba(74,52,16,0.55), inset 0 1px 0 rgba(255,247,214,0.55)',
                      }}
                    />

                    {/* Piasta z wagą kolumny — ×1, ×10, ×100 to jest to, co koło dodaje */}
                    <span
                      className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-mono text-xs font-bold"
                      style={{ ...HUB_STYLE, ...ENGRAVED }}
                    >
                      {column.weight}
                    </span>

                    {/* Zapadka, o którą opierał się rysik — na prawdziwej maszynie
                        to ona wyznaczała, o ile koło się przekręci. Stoi między
                        zerem a jedynką, żeby nie zasłaniać żadnej cyfry. */}
                    <span
                      aria-hidden
                      className="absolute h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-[72deg] rounded-[1px]"
                      style={{
                        left: '65.5%',
                        top: '7%',
                        backgroundImage: 'linear-gradient(90deg, #6f5510, #f0d98a 45%, #6f5510)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      }}
                    />

                    {HOLES.map((hole) =>
                      hole.digit === 0 ? (
                        <span
                          key={hole.digit}
                          aria-hidden
                          className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center font-mono text-sm font-bold"
                          style={{ left: `${hole.x}%`, top: `${hole.y}%`, ...ENGRAVED }}
                        >
                          0
                        </span>
                      ) : (
                        <button
                          key={hole.digit}
                          type="button"
                          onClick={() => dial(index, hole.digit)}
                          aria-label={`Wkręć ${hole.digit} w kolumnie ${column.label}`}
                          className={cn(
                            'absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full',
                            'font-mono text-sm font-bold text-[#f7d488]',
                            'transition-transform duration-150 ease-out hover:scale-[1.14] active:scale-95',
                            // Obwódka focusa musi być `outline`, nie `ring`: pierścień
                            // Tailwinda jedzie na `box-shadow`, a ten jest tu ustawiony
                            // inline (wywiercony otwór) i nadpisałby go bez śladu.
                            'focus-visible:scale-[1.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fff3c4]',
                            'motion-reduce:transition-none motion-reduce:hover:scale-100'
                          )}
                          style={{ left: `${hole.x}%`, top: `${hole.y}%`, ...HOLE_STYLE }}
                        >
                          {hole.digit}
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground sm:hidden">
        Maszyna jest szersza niż ekran telefonu — przesuwaj ją palcem w bok.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-sm text-muted-foreground">
          Na maszynie stoi{' '}
          <span className="font-mono text-2xl font-bold tabular-nums" style={{ color }}>
            {value}
          </span>
          <span className="ml-3">
            Przeniesienia wykonane przez maszynę:{' '}
            <span className="font-mono font-bold tabular-nums" style={{ color }}>
              {machineCarries}
            </span>
          </span>
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Wyzeruj maszynę
        </button>
      </div>

      {overflow && !finished && (
        <p className="mt-4 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: '#b91c1c' }}>
          <strong>Maszyna przekręciła się na zero.</strong> Trzy koła to najwyżej 999 — dalej nie
          ma dokąd przenosić. Prawdziwa pascalina miała ich sześć albo osiem, ale kończyła tak
          samo, tylko wyżej.
        </p>
      )}

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <p>
              <strong>115 — ten sam wynik co na liczydle.</strong> Tylko że tym razem nie
              pilnowałeś/pilnowałaś ani jednego przeniesienia: dziesiątka przeskoczyła do
              następnej kolumny sama, bo za każdym kołem siedzi zębatka, która po przejściu
              z 9 na 0 popycha koło obok o jeden ząb.
            </p>
            <p className="mt-2">
              To jest cała różnica między liczydłem a maszyną liczącą, i zajęła ludzkości około
              czterech tysięcy lat. Blaise Pascal zbudował swoją maszynę w 1642 roku, mając 19 lat,
              dla ojca — poborcy podatkowego, który całe dnie dodawał kolumny liczb.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
