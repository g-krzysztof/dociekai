'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Wyjaśnienie wyrównania — **przez narysowanie drogi, którą przebywa oko**.
 *
 * Reguła „tekst do czytania wyrównuj do lewej” brzmi jak kwestia gustu i
 * dziecko nie ma powodu w nią wierzyć. Powód jest mechaniczny: kończąc wiersz,
 * oko wraca do początku następnego — a jeśli wszystkie wiersze zaczynają się w
 * tym samym miejscu, wie, dokąd skoczyć, nie patrząc. Przy wyśrodkowaniu każdy
 * wiersz zaczyna się gdzie indziej i za każdym razem trzeba go **poszukać**.
 *
 * Dlatego ten widżet nie rysuje ilustracji do reguły, tylko **mierzy prawdziwy
 * układ tekstu w przeglądarce**: `Range.getClientRects()` zwraca po jednym
 * prostokącie na wiersz, więc początki wierszy są faktem, a nie deklaracją.
 * Z nich powstaje i strzałka powrotu oka, i liczba „rozrzut początków”. Zmiana
 * wyrównania natychmiast zmienia obie — bo obie liczą się od nowa z tego, co
 * naprawdę jest na ekranie.
 *
 * Drugi tekst (zaproszenie o krótkich wierszach) jest tu po to, żeby reguła nie
 * zamieniła się w zabobon: przy trzech krótkich wierszach wyśrodkowanie nie
 * przeszkadza i widać to na tej samej liczbie.
 */

type Align = 'left' | 'center' | 'right' | 'justify';

const ALIGNS: { id: Align; label: string; icon: LucideIcon }[] = [
  { id: 'left', label: 'Do lewej', icon: AlignLeft },
  { id: 'center', label: 'Wyśrodkuj', icon: AlignCenter },
  { id: 'right', label: 'Do prawej', icon: AlignRight },
  { id: 'justify', label: 'Wyjustuj', icon: AlignJustify },
];

const SAMPLES = {
  akapit: {
    label: 'Akapit do czytania',
    text: 'W sobotę idziemy z klasą do lasu na wycieczkę. Zbiórka jest o dziewiątej przy szkole, a wracamy przed obiadem. Trzeba wziąć kanapki, wodę i coś przeciwdeszczowego, bo pogoda ma być zmienna.',
  },
  zaproszenie: {
    label: 'Zaproszenie (krótkie wiersze)',
    text: 'Zapraszam Cię na moje urodziny w sobotę o czwartej u mnie w domu',
  },
};

type SampleId = keyof typeof SAMPLES;

interface EyePathProps {
  color: string;
  onComplete?: () => void;
}

export function EyePath({ color, onComplete }: EyePathProps) {
  const [sample, setSample] = useState<SampleId>('akapit');
  const [align, setAlign] = useState<Align>('left');
  const [tried, setTried] = useState<Align[]>(['left']);
  const [lines, setLines] = useState<{ left: number; right: number; top: number; bottom: number }[]>(
    []
  );

  const boxRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(sample);

  /**
   * Pomiar prawdziwych wierszy. `getClientRects()` na zakresie obejmującym całą
   * treść akapitu daje po jednym prostokącie na wiersz — tego nie da się
   * policzyć z długości tekstu, bo o łamaniu decyduje przeglądarka.
   */
  const measure = useCallback(() => {
    const box = boxRef.current;
    const node = textRef.current?.firstChild;
    if (!box || !node) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    const origin = box.getBoundingClientRect();
    const rects = Array.from(range.getClientRects())
      .filter((r) => r.width > 1)
      .map((r) => ({
        left: r.left - origin.left,
        right: r.right - origin.left,
        top: r.top - origin.top,
        bottom: r.bottom - origin.top,
      }));
    setLines(rects);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, align, sample]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(box);
    return () => observer.disconnect();
  }, [measure]);

  /** Rozrzut początków wierszy — im większy, tym dalej oko musi szukać. */
  const spread =
    lines.length > 1
      ? Math.round(Math.max(...lines.map((l) => l.left)) - Math.min(...lines.map((l) => l.left)))
      : 0;

  const allTried = ALIGNS.every((a) => tried.includes(a.id));
  const done = allTried && spread <= 2 && lines.length > 1;

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const choose = (next: Align) => {
    setAlign(next);
    setTried((prev) => (prev.includes(next) ? prev : [...prev, next]));
  };

  const multiline = lines.length > 1;

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">
          Przełączaj wyrównanie i patrz na strzałki — to droga, którą przebywa oko.
        </p>
        <div className="flex gap-1.5">
          {(Object.keys(SAMPLES) as SampleId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setSample(id)}
              aria-pressed={sample === id}
              className="border px-2 py-1 text-xs"
              style={{
                borderColor: sample === id ? color : undefined,
                backgroundColor: sample === id ? `${color}12` : undefined,
              }}
            >
              {SAMPLES[id].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {ALIGNS.map((item) => {
          const Icon = item.icon;
          const active = align === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => choose(item.id)}
              aria-pressed={active}
              className={cn(
                'inline-flex items-center gap-1.5 border-2 px-2.5 py-1.5 text-xs font-medium transition',
                !active && 'hover:bg-black/5 dark:hover:bg-white/5'
              )}
              style={{
                borderColor: active ? color : `${color}33`,
                backgroundColor: active ? `${color}14` : undefined,
              }}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden />
              {item.label}
              {tried.includes(item.id) && !active && (
                <Check className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
              )}
            </button>
          );
        })}
      </div>

      {/* Makieta strony dokumentu ze stałą szerokością kolumny. */}
      <div
        ref={boxRef}
        className="relative mx-auto max-w-[420px] border bg-white p-4 font-serif text-base leading-loose text-zinc-900 shadow-sm"
      >
        <p ref={textRef} style={{ textAlign: align }}>
          {SAMPLES[sample].text}
        </p>

        {/* Warstwa strzałek powrotu oka — rysowana z prawdziwych prostokątów wierszy. */}
        {lines.length > 1 && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden
            style={{ overflow: 'visible' }}
          >
            {lines.slice(0, -1).map((line, i) => {
              const next = lines[i + 1];
              /* Łuk prowadzimy przez ODSTĘP między wierszami, nie przez nie —
                 poprowadzony na poziomie linii pisma wyglądał jak przekreślenie
                 tekstu (złapane dopiero na zrzucie ekranu, nie przez typy). */
              const mid = (line.bottom + next.top) / 2;
              const x1 = line.right + 1;
              const y1 = line.bottom - 2;
              const x2 = next.left - 1;
              const y2 = next.top + 2;
              return (
                <g key={i}>
                  <path
                    d={`M ${x1} ${y1} C ${x1 + 26} ${mid}, ${x2 - 26} ${mid}, ${x2} ${y2}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.4}
                    strokeDasharray="3 3"
                    opacity={0.9}
                  />
                  <circle cx={x2} cy={y2} r={2.6} fill={color} />
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <p className="mt-3 text-sm tabular-nums">
        {multiline ? (
          <>
            Rozrzut początków wierszy:{' '}
            <strong
              className={cn(spread > 2 && 'text-amber-700 dark:text-amber-500')}
              style={spread <= 2 ? { color } : undefined}
            >
              {spread} px
            </strong>
            <span className="text-muted-foreground">
              {' '}
              — {spread <= 2
                ? 'każdy wiersz zaczyna się w tym samym miejscu, oko trafia tam bez patrzenia.'
                : 'każdy wiersz zaczyna się gdzie indziej, więc oko musi go za każdym razem znaleźć.'}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">
            Ten tekst mieści się w jednym wierszu — nie ma tu żadnego powrotu oka, więc wyrównanie
            nikomu nie przeszkadza.
          </span>
        )}
      </p>

      <AnimatePresence>
        {done && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Cztery wyrównania sprawdzone. Zasada nie jest kwestią gustu — wynika z tego, jak
                działa oko.
              </span>
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
              <li>
                <strong>Do lewej</strong> — wszystko, co się czyta zdanie po zdaniu. To ustawienie
                domyślne i w dziewięciu przypadkach na dziesięć właściwe.
              </li>
              <li>
                <strong>Wyśrodkuj</strong> — tylko krótkie rzeczy: tytuł, zaproszenie, podpis pod
                zdjęciem. Wyśrodkowany akapit męczy, bo oko szuka początku każdego wiersza.
              </li>
              <li>
                <strong>Do prawej</strong> — data i miejscowość w piśmie, liczby w tabeli. Rzadko
                coś więcej.
              </li>
              <li>
                <strong>Wyjustuj</strong> — równo z obu stron, jak w gazecie. Ładne przy szerokiej
                kolumnie, ale w wąskiej robi w tekście białe „rzeki”, bo program musi gdzieś
                upchnąć brakujące miejsce.
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
