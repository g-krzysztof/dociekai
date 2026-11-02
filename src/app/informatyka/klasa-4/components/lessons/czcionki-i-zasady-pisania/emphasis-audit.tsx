'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Ćwiczenie o formatowaniu — **jedyny widżet w kursie, w którym pracuje się
 * przez odejmowanie**. Wszystkie dotychczasowe każą coś dodać, zbudować albo
 * ustawić; ten każe *zdjąć*, i dopiero to robi z formatowania narzędzie zamiast
 * ozdobnika.
 *
 * Ogłoszenie startuje wyróżnione w całości: pogrubienia, kursywy, podkreślenia i
 * kolory na przemian. Wygląda krzykliwie i — co ważniejsze — **nie da się z
 * niego wyłowić żadnej informacji**, bo wszystko krzyczy tak samo. Zadanie jest
 * jedno: zostawić wyróżnione dokładnie dwie rzeczy, których czytelnik nie może
 * przegapić (kiedy i gdzie).
 *
 * Werdykt nie jest opinią o guście: porównuje **zbiór wyróżnionych fragmentów ze
 * zbiorem fragmentów oznaczonych jako kluczowe**, więc „ładniej” nie wystarcza —
 * trzeba trafić dokładnie w te dwa i zdjąć wszystkie pozostałe.
 */

type Emphasis = 'none' | 'bold' | 'italic' | 'under' | 'color';

interface Run {
  text: string;
  start: Emphasis;
  /** Fragment, który naprawdę musi rzucić się w oczy — KIEDY i GDZIE. */
  key?: boolean;
}

const RUNS: Run[] = [
  { text: 'UWAGA!', start: 'color' },
  { text: ' W piątek ', start: 'italic' },
  { text: '14 marca o godzinie 16:00', start: 'under', key: true },
  { text: ' odbędzie się ', start: 'bold' },
  { text: 'szkolny turniej', start: 'color' },
  { text: ' gier planszowych ', start: 'italic' },
  { text: 'w sali gimnastycznej', start: 'bold', key: true },
  { text: '. Zapisy ', start: 'under' },
  { text: 'u wychowawcy', start: 'color' },
  { text: ' do środy. ', start: 'italic' },
  { text: 'Każdy uczestnik', start: 'bold' },
  { text: ' przynosi ', start: 'under' },
  { text: 'jedną grę', start: 'color' },
  { text: '.', start: 'none' },
];

const styleOf = (emphasis: Emphasis): React.CSSProperties => {
  if (emphasis === 'bold') return { fontWeight: 700 };
  if (emphasis === 'italic') return { fontStyle: 'italic' };
  if (emphasis === 'under') return { textDecoration: 'underline' };
  if (emphasis === 'color') return { color: '#c0392b', fontWeight: 600 };
  return {};
};

interface EmphasisAuditProps {
  color: string;
  onComplete?: () => void;
}

export function EmphasisAudit({ color, onComplete }: EmphasisAuditProps) {
  const [state, setState] = useState<Emphasis[]>(RUNS.map((run) => run.start));
  const [checked, setChecked] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(checked ? 'gotowe' : 'praca');

  const highlighted = state.filter((e) => e !== 'none').length;
  const correct =
    state.every((emphasis, i) => (RUNS[i].key ? emphasis !== 'none' : emphasis === 'none'));

  useEffect(() => {
    if (!checked || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [checked, onComplete]);

  /** Jedno kliknięcie zdejmuje dowolne wyróżnienie; kolejne nakłada pogrubienie. */
  const toggle = (index: number) => {
    if (checked) return;
    setState((prev) => prev.map((e, i) => (i === index ? (e === 'none' ? 'bold' : 'none') : e)));
    setNote(null);
  };

  const judge = () => {
    if (correct) {
      setChecked(true);
      setNote(null);
      return;
    }
    const extra = state.filter((e, i) => e !== 'none' && !RUNS[i].key).length;
    const missing = state.filter((e, i) => e === 'none' && RUNS[i].key).length;
    if (extra > 0 && missing === 0)
      setNote(
        `Wyróżnionych fragmentów jest ${extra} za dużo. Przy każdym zapytaj: czy ktoś, kto przeczyta samo to, będzie wiedział, kiedy i gdzie ma przyjść? Jeśli nie — zdejmij wyróżnienie.`
      );
    else if (missing > 0 && extra === 0)
      setNote(
        'Zdjęte jest już prawie wszystko — ale zniknęła też jedna z dwóch rzeczy, które miały zostać. Ogłoszenie musi krzyczeć KIEDY i GDZIE.'
      );
    else
      setNote(
        `Jeszcze nie: ${extra} fragmentów wyróżnionych niepotrzebnie i ${missing} potrzebnych bez wyróżnienia.`
      );
  };

  const reset = () => {
    setState(RUNS.map((run) => run.start));
    setNote(null);
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm font-semibold sm:text-base">
        To ogłoszenie ma wisieć na drzwiach klasy. Zostaw wyróżnione dokładnie dwie rzeczy:{' '}
        <span style={{ color }}>KIEDY</span> i <span style={{ color }}>GDZIE</span>.
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        Kliknij fragment, żeby zdjąć z niego wyróżnienie. Kliknij jeszcze raz, żeby je nałożyć.
      </p>

      {/* Makieta kartki ogłoszenia. */}
      <div className="border bg-white p-4 font-serif text-base leading-relaxed text-zinc-900 shadow-sm sm:p-6 sm:text-lg">
        {RUNS.map((run, i) => {
          /* Spacje z brzegu fragmentu renderujemy POZA przyciskiem. Wewnątrz
             przepadają: przycisk jest polem inline-block, a przeglądarka usuwa
             białe znaki z początku i końca takiego pola — wyrazy skleiłyby się
             w jeden ciąg. Przy okazji podświetlenie obejmuje wtedy sam wyraz,
             a nie margines wokół niego. */
          const lead = run.text.match(/^\s*/)?.[0] ?? '';
          const tail = run.text.match(/\s*$/)?.[0] ?? '';
          const core = run.text.trim();
          return (
            <span key={i}>
              {lead}
              <button
                type="button"
                onClick={() => toggle(i)}
                className={cn(
                  'rounded-sm text-left align-baseline transition-colors',
                  !checked && 'cursor-pointer hover:bg-amber-100'
                )}
                style={styleOf(state[i])}
                aria-pressed={state[i] !== 'none'}
                aria-label={`Fragment „${core}” — ${state[i] === 'none' ? 'bez wyróżnienia' : 'wyróżniony'}`}
              >
                {core}
              </button>
              {tail}
            </span>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="text-sm tabular-nums text-muted-foreground">
          wyróżnionych fragmentów:{' '}
          <strong className={cn('text-foreground', highlighted > 4 && 'text-amber-700 dark:text-amber-500')}>
            {highlighted}
          </strong>{' '}
          z {RUNS.length}
        </p>
        {!checked && (
          <>
            <button
              type="button"
              onClick={judge}
              className="px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              Powieś ogłoszenie
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-muted-foreground underline underline-offset-4"
            >
              Przywróć jak było
            </button>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {checked ? (
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
                Teraz z odległości dwóch metrów widać dokładnie to, co trzeba: termin i miejsce.
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Wyróżnienie działa przez <strong>kontrast</strong>, a kontrast jest zawsze{' '}
              <em>względem czegoś</em>. Kiedy pogrubisz całe zdanie, nie masz już czym pogrubić tego
              jednego wyrazu, na którym ci zależy. Dlatego w dokumencie obowiązuje zasada odwrotna
              do odruchu: <strong>wyróżniaj mało</strong>.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Drugi nawyk, który warto sobie wyrobić: <strong>jeden sposób naraz</strong>. Pogrubione
              i podkreślone, i jeszcze na czerwono — to nie jest trzy razy ważniejsze, tylko trzy
              razy trudniejsze do czytania.
            </p>
          </motion.div>
        ) : note ? (
          <motion.p
            key={note}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30"
          >
            {note}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
