'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Haczyk lekcji — **obrazek, który ucieka**.
 *
 * Każdy, kto wstawiał zdjęcie do dokumentu, zna tę scenę: obrazek jest na
 * swoim miejscu, dopisujesz zdanie wyżej i wszystko się rozjeżdża. Wina nie leży
 * po stronie „głupiego programu” — leży w jednej nastawie, której nikt nie
 * pokazuje: **jak obraz jest związany z tekstem**. Blok pozwala przestawić ją na
 * trzy sposoby i za każdym razem dopisać zdanie.
 *
 * Werdykt nie jest opinią. Po każdym renderze mierzymy **prawdziwe prostokąty
 * wierszy** (`Range.getClientRects()`, ta sama technika co w `EyePath`) i
 * liczymy, ile z nich nachodzi na obrazek. Przy „za tekstem” litery naprawdę
 * lądują na zdjęciu i widżet podaje, ile ich jest; przy dwóch pozostałych trybach
 * przeglądarka sama robi miejsce i licznik pokazuje zero. Dziecko nie musi w to
 * wierzyć — widzi liczbę.
 */

type Wrap = 'w-tekscie' | 'obok' | 'za-tekstem';

const WRAPS: { id: Wrap; label: string; about: string }[] = [
  {
    id: 'w-tekscie',
    label: 'W tekście',
    about: 'Obraz stoi w akapicie jak bardzo duża litera — tekst nigdy na niego nie wejdzie.',
  },
  {
    id: 'obok',
    label: 'Obok tekstu',
    about: 'Tekst opływa obraz z boku. Dobre, gdy zdjęcie jest małe, a akapit długi.',
  },
  {
    id: 'za-tekstem',
    label: 'Za tekstem',
    about: 'Obraz leży pod literami i zostaje tam, gdzie go położono — cokolwiek zrobisz z tekstem.',
  },
];

const EXTRA = [
  'Przypominamy o wycieczce do muzeum.',
  'Prosimy o punktualność — autokar nie czeka.',
  'Kto nie oddał zgody, niech zrobi to dziś.',
];

const BASE = [
  'Koktajl truskawkowy robi się w kwadrans i wychodzą z niego dwie duże szklanki. Potrzebujesz blendera, noża i deski do krojenia.',
  'Truskawki umyj i odetnij im szypułki, banana obierz i pokrój na grube plastry. Wrzuć wszystko do blendera, dolej jogurt z miodem i miksuj pół minuty.',
];

interface FloatLabProps {
  color: string;
  onComplete?: () => void;
}

export function FloatLab({ color, onComplete }: FloatLabProps) {
  const [wrap, setWrap] = useState<Wrap>('za-tekstem');
  const [added, setAdded] = useState(0);
  const [tried, setTried] = useState<Wrap[]>(['za-tekstem']);
  const [collisions, setCollisions] = useState(0);

  const pageRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLElement | null>(null);
  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(wrap);

  /** Ile wierszy tekstu nachodzi na obrazek — liczone z prawdziwego układu strony. */
  const measure = useCallback(() => {
    const page = pageRef.current;
    const figure = imageRef.current;
    if (!page || !figure) return;
    const img = figure.getBoundingClientRect();
    let hits = 0;
    page.querySelectorAll('[data-line]').forEach((node) => {
      /* Mierzymy WYŁĄCZNIE węzły tekstowe. Przy oblewaniu obraz jest dzieckiem
         akapitu, więc `firstChild` byłby samą ilustracją — i widżet liczyłby jej
         nachodzenie na siebie samą (realny błąd: tryb „obok tekstu” pokazywał
         trzy kolizje, choć przeglądarka poprawnie opływała obraz). */
      node.childNodes.forEach((child) => {
        if (child.nodeType !== 3) return;
        const range = document.createRange();
        range.selectNodeContents(child);
        Array.from(range.getClientRects()).forEach((r) => {
          if (r.width < 2) return;
          const overlap =
            r.left < img.right && r.right > img.left && r.top < img.bottom && r.bottom > img.top;
          if (overlap) hits += 1;
        });
      });
    });
    setCollisions(hits);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, wrap, added]);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(page);
    return () => observer.disconnect();
  }, [measure]);

  const allTried = WRAPS.every((w) => tried.includes(w.id));
  const done = allTried && added > 0 && collisions === 0;

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const choose = (next: Wrap) => {
    setWrap(next);
    setTried((prev) => (prev.includes(next) ? prev : [...prev, next]));
  };

  const lead = EXTRA.slice(0, added);

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm font-semibold sm:text-base">
        Ustaw, jak obrazek ma być związany z tekstem — a potem dopisz zdanie na początku.
      </p>
      <p className="mb-3 text-xs text-muted-foreground">
        Dokładnie to robisz, kiedy po tygodniu dopisujesz coś na górze gotowego dokumentu.
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        {WRAPS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => choose(item.id)}
            aria-pressed={wrap === item.id}
            className={cn(
              'border-2 px-3 py-1.5 text-sm font-medium transition',
              wrap !== item.id && 'hover:bg-black/5 dark:hover:bg-white/5'
            )}
            style={{
              borderColor: wrap === item.id ? color : `${color}33`,
              backgroundColor: wrap === item.id ? `${color}14` : undefined,
            }}
          >
            {item.label}
            {tried.includes(item.id) && wrap !== item.id && (
              <Check className="ml-1.5 inline h-3 w-3 text-muted-foreground" aria-hidden />
            )}
          </button>
        ))}
      </div>

      {/* Makieta strony dokumentu. */}
      <div
        ref={pageRef}
        className="relative mx-auto max-w-[440px] overflow-hidden border bg-white p-4 font-serif text-[15px] leading-relaxed text-zinc-900 shadow-sm"
      >
        {wrap === 'za-tekstem' && (
          <Figure ref={imageRef} color={color} className="absolute left-6 top-10 w-[140px]" />
        )}

        {/* Akapity makiety to `div`, nie `p`: w trybie „obok tekstu” ilustracja
            jest ich dzieckiem, a `<figure>` wewnątrz `<p>` to niepoprawny HTML
            i błąd hydracji. */}
        {lead.map((sentence, i) => (
          <div key={i} data-line className="mb-2">
            {sentence}
          </div>
        ))}

        {wrap === 'w-tekscie' && <Figure ref={imageRef} color={color} className="mx-auto my-3 w-[140px]" />}

        <div data-line className="mb-2">
          {wrap === 'obok' && <Figure ref={imageRef} color={color} className="float-right ml-3 mb-2 w-[130px]" />}
          {BASE[0]}
        </div>
        <div data-line>{BASE[1]}</div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setAdded(Math.min(EXTRA.length, added + 1))}
          disabled={added >= EXTRA.length}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Dopisz zdanie na początku
        </button>
        {added > 0 && (
          <button
            type="button"
            onClick={() => setAdded(0)}
            className="text-xs text-muted-foreground underline underline-offset-4"
          >
            Usuń dopisane zdania
          </button>
        )}
        <span className="text-sm tabular-nums">
          {collisions === 0 ? (
            <span className="text-muted-foreground">żaden wiersz nie leży na obrazku</span>
          ) : (
            <strong className="text-amber-700 dark:text-amber-500">
              wierszy na obrazku: {collisions}
            </strong>
          )}
        </span>
      </div>

      <p className="mt-2 text-xs leading-snug text-muted-foreground">
        {WRAPS.find((w) => w.id === wrap)?.about}
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
                Trzy ustawienia sprawdzone. Obrazek „ucieka” nie dlatego, że program jest głupi —
                tylko dlatego, że <strong>nie jest przywiązany do żadnego akapitu</strong>.
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              „W tekście” i „obok tekstu” wiążą obraz z konkretnym akapitem: dopisujesz coś wyżej,
              akapit się przesuwa i obraz jedzie razem z nim. „Za tekstem” kładzie obraz na stronie
              jak naklejkę — zostaje tam, gdzie go położono, a litery wchodzą na niego.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Praktyczna zasada: dopóki nie robisz plakatu, używaj <strong>„w tekście”</strong>.
              Nudne, ale nigdy się nie rozjeżdża. „Za tekstem” zostaw na tło okładki — i tylko wtedy,
              gdy tekstu jest mało.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Prosta ilustracja rysowana w SVG — żeby blok nie zależał od żadnego pliku. */
function Figure({
  color,
  className,
  ref,
}: {
  color: string;
  className?: string;
  ref?: React.Ref<HTMLElement>;
}) {
  return (
    <figure ref={ref} className={className}>
      <svg viewBox="0 0 120 96" className="block h-auto w-full" role="img" aria-label="Zdjęcie koktajlu w dokumencie">
        <rect x={0} y={0} width={120} height={96} fill="#fde8ef" />
        <path d="M42 26 h36 l-5 46 a13 13 0 0 1 -26 0 z" fill="#f5a3bd" stroke="#c9527c" strokeWidth={2} />
        <rect x={40} y={22} width={40} height={5} rx={2} fill="#c9527c" />
        <line x1={84} y1={18} x2={72} y2={46} stroke="#8a6d3b" strokeWidth={3} strokeLinecap="round" />
        <circle cx={56} cy={16} r={7} fill="#e5484d" />
        <circle cx={68} cy={13} r={5} fill="#e5484d" />
        <rect x={0} y={0} width={120} height={96} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
      </svg>
      <figcaption className="mt-1 text-center font-sans text-[11px] text-zinc-500">
        Gotowy koktajl
      </figcaption>
    </figure>
  );
}
