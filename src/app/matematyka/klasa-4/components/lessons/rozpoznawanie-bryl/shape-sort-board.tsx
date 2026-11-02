'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SolidGlyph } from '../../solid-glyph';
import { boxPolyhedron, type Polyhedron, type SolidKind, type SurfaceKind } from '../../../lib/solids';

/** Kostka do gry jest sześcianem — domyślny portret prostopadłościanu byłby tu myląco podłużny. */
const SZESCIAN: Polyhedron = boxPolyhedron({ width: 44, height: 44, depth: 44 });

interface Item {
  id: string;
  thing: string;
  glyph: SolidKind;
  /** Nadpisanie modelu, gdy rodzina nie oddaje kształtu przedmiotu. */
  model?: Polyhedron;
  surface: SurfaceKind;
  why: string;
}

/** Sześć przedmiotów, po trzy na każdą stronę — kolejność celowo naprzemienna. */
const ITEMS: Item[] = [
  {
    id: 'kostka',
    thing: 'kostka do gry',
    glyph: 'prostopadloscian',
    model: SZESCIAN,
    surface: 'plaskie',
    why: 'Sześć płaskich kwadratowych ścianek — dlatego kostka po rzucie zatrzymuje się na jednej z nich, zamiast toczyć się w nieskończoność.',
  },
  {
    id: 'puszka',
    thing: 'puszka',
    glyph: 'walec',
    surface: 'zaokraglone',
    why: 'Podstawy są płaskie, ale bok jest zaokrąglony — położona na bok puszka toczy się jak wałek.',
  },
  {
    id: 'namiot',
    thing: 'namiot dwuspadowy',
    glyph: 'graniastoslup',
    surface: 'plaskie',
    why: 'Dwie trójkątne ściany z przodu i z tyłu, prostokątne boki między nimi — sam płaski materiał, żadnego zaokrąglenia.',
  },
  {
    id: 'pilka',
    thing: 'piłka',
    glyph: 'kula',
    surface: 'zaokraglone',
    why: 'Cała powierzchnia jest zaokrąglona, nie ma na niej ani jednej płaskiej ścianki — dlatego piłka toczy się w każdą stronę.',
  },
  {
    id: 'piramida',
    thing: 'piramida z klocków',
    glyph: 'ostroslup',
    surface: 'plaskie',
    why: 'Kwadratowa podstawa i cztery trójkątne ściany schodzące się w szczycie — same płaskie kawałki.',
  },
  {
    id: 'pacholek',
    thing: 'pachołek drogowy',
    glyph: 'stozek',
    surface: 'zaokraglone',
    why: 'Podstawa jest płaskim kołem, ale bok jest zaokrąglony — położony pachołek toczy się w kółko, wokół swojego czubka.',
  },
];

const BINS: { id: SurfaceKind; label: string; hint: string }[] = [
  { id: 'plaskie', label: 'Same płaskie ściany', hint: 'nie toczy się' },
  { id: 'zaokraglone', label: 'Powierzchnia zaokrąglona', hint: 'toczy się' },
];

/**
 * Rozgrzewka: podziel sześć przedmiotów na te złożone z samych płaskich ścian
 * i te z powierzchnią zaokrągloną. Zła odpowiedź drga i tłumaczy — bez blokady,
 * bo cała wartość tego kroku jest w uzasadnieniu, nie w trafieniu.
 *
 * Podpowiedź „toczy się / nie toczy się" jest tu celowo: dziecko sprawdza
 * podział ręką na prawdziwych przedmiotach, zanim pozna nazwy rodzin.
 */
export function ShapeSortBoard({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState<SurfaceKind | null>(null);
  const [sorted, setSorted] = useState<Record<string, SurfaceKind>>({});
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const item = ITEMS[Math.min(index, ITEMS.length - 1)];
  const finished = index >= ITEMS.length;
  const answered = sorted[item.id] !== undefined;

  const pick = (bin: SurfaceKind) => {
    if (answered) return;
    if (bin !== item.surface) {
      setWrong(bin);
      return;
    }
    setWrong(null);
    setSorted({ ...sorted, [item.id]: bin });
  };

  const next = () => {
    setWrong(null);
    const nextIndex = index + 1;
    setIndex(nextIndex);
    if (nextIndex >= ITEMS.length) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        {ITEMS.map((entry, i) => (
          <span
            key={entry.id}
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: sorted[entry.id] ? color : `${color}33`,
              outline: i === index && !finished ? `2px solid ${color}` : undefined,
              outlineOffset: '2px',
            }}
            aria-hidden
          />
        ))}
        <span className="ml-2 text-xs font-semibold text-muted-foreground">
          {Object.keys(sorted).length} z {ITEMS.length}
        </span>
      </div>

      {finished ? (
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Check className="h-8 w-8 shrink-0" style={{ color }} aria-hidden />
          <p className="text-base leading-relaxed sm:text-lg">
            Podział wyszedł dokładnie po połowie — i pokrywa się z tym, co widać gołym okiem:{' '}
            <strong style={{ color: textColor }}>toczy się tylko to, co ma zaokrągloną
            powierzchnię</strong>. Teraz nadamy obu stronom prawdziwe nazwy.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-5 text-base leading-relaxed sm:text-lg">
            Gdzie trafia <strong style={{ color: textColor }}>{item.thing}</strong>?
          </p>

          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <SolidGlyph
              kind={item.glyph}
              polyhedron={item.model}
              color={color}
              className="mx-auto h-auto w-full max-w-[120px]"
            />

            <div className="grid gap-2 sm:grid-cols-2">
              {BINS.map((bin) => {
                const isWrong = wrong === bin.id;
                const isRight = answered && bin.id === item.surface;
                return (
                  <motion.button
                    key={bin.id}
                    type="button"
                    onClick={() => pick(bin.id)}
                    animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.35 }}
                    className={cn(
                      'cursor-pointer border p-4 text-left transition-all',
                      !answered && 'hover:-translate-y-0.5 hover:shadow-md'
                    )}
                    style={
                      isRight
                        ? { borderColor: color, backgroundColor: `${color}14` }
                        : isWrong
                          ? { borderColor: '#dc2626', color: '#b91c1c' }
                          : { borderColor: `${color}40` }
                    }
                  >
                    <span className="block text-sm font-bold" style={isRight ? { color: textColor } : undefined}>
                      {bin.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{bin.hint}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {answered ? (
              <motion.div
                key="why"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 border-l-4 pl-4"
                style={{ borderColor: color }}
              >
                <p className="text-sm leading-relaxed sm:text-base">{item.why}</p>
                <button
                  type="button"
                  onClick={next}
                  className="mt-3 cursor-pointer border px-4 py-2 text-sm font-semibold transition-colors hover:opacity-70"
                  style={{ borderColor: color, color: textColor }}
                >
                  {index === ITEMS.length - 1 ? 'Zakończ' : 'Następny przedmiot'}
                </button>
              </motion.div>
            ) : wrong ? (
              <motion.p
                key="wrong"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-sm leading-relaxed text-muted-foreground"
              >
                Jeszcze nie ta strona. Wyobraź sobie, że kładziesz ten przedmiot na pochyłej desce —
                poturla się czy zostanie w miejscu?
              </motion.p>
            ) : null}
          </AnimatePresence>
        </>
      )}

      {/* Uzasadnienia zawsze w DOM — krok odsłania je po kolei, ale treść nie może
          istnieć wyłącznie w stanie po kliknięciu. */}
      <ul className="sr-only">
        {ITEMS.map((entry) => (
          <li key={entry.id}>
            {entry.thing}: {entry.why}
          </li>
        ))}
      </ul>
    </div>
  );
}
