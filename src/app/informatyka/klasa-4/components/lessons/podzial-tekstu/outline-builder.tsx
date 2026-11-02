'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bold, Check, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { DOC, type BlockRole } from './recipe';

/**
 * Haczyk lekcji — **panel nawigacji, który buduje się sam**.
 *
 * Dziecko, które chce zrobić nagłówek, pogrubia tekst i powiększa czcionkę.
 * Wygląda dobrze i przez cały rok nic złego się nie dzieje. Różnica wychodzi
 * dopiero w miejscu, którego nikt nie pokazuje: **program nie wie, że to
 * nagłówek**. Dlatego ten blok stawia obok dokumentu prawdziwy panel nawigacji —
 * taki, jaki ma Word i Dokumenty Google — i pozwala go zapełnić wyłącznie
 * stylami. Pogrubienie działa, zmienia wygląd i **nie dodaje do panelu ani
 * jednej pozycji**. Tego jednego obrazka nie da się odzobaczyć.
 *
 * Nowe w kursie: widżet, w którym **skutek działania pojawia się poza
 * dokumentem**, w osobnym oknie programu. We wszystkich wcześniejszych blokach
 * efekt był tam, gdzie kliknięcie.
 */

type Style = 'tekst' | 'naglowek1' | 'naglowek2';

const STYLE_LABEL: Record<Style, string> = {
  tekst: 'Tekst podstawowy',
  naglowek1: 'Nagłówek 1',
  naglowek2: 'Nagłówek 2',
};

/** Jaki styl jest poprawny dla danej roli bloku. */
const WANTED: Record<BlockRole, Style> = {
  tytul: 'naglowek1',
  naglowek: 'naglowek2',
  tekst: 'tekst',
};

interface OutlineBuilderProps {
  color: string;
  onComplete?: () => void;
}

export function OutlineBuilder({ color, onComplete }: OutlineBuilderProps) {
  const [styles, setStyles] = useState<Record<string, Style>>(
    Object.fromEntries(DOC.map((b) => [b.id, 'tekst' as Style]))
  );
  const [bold, setBold] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string>(DOC[0].id);
  const [done, setDone] = useState(false);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(done ? 'gotowe' : 'praca');

  const outline = DOC.filter((b) => styles[b.id] !== 'tekst');
  const correct = DOC.every((b) => styles[b.id] === WANTED[b.role]);
  /** Pogrubiony nagłówek, który wciąż jest „tekstem podstawowym” — sedno bloku. */
  const fakeHeading = DOC.some(
    (b) => b.role !== 'tekst' && styles[b.id] === 'tekst' && bold[b.id]
  );

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const apply = (style: Style) => setStyles((prev) => ({ ...prev, [selected]: style }));
  const toggleBold = () => setBold((prev) => ({ ...prev, [selected]: !prev[selected] }));

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm font-semibold sm:text-base">
        Zrób tak, żeby w panelu nawigacji po lewej pojawił się tytuł i trzy etapy przepisu.
      </p>
      <p className="mb-3 text-xs text-muted-foreground">
        Kliknij fragment dokumentu, żeby go wybrać, a potem nadaj mu styl na pasku narzędzi.
      </p>

      {/* Pasek narzędzi — świadomie wygląda jak pasek edytora, nie jak reszta kursu. */}
      <div className="flex flex-wrap items-center gap-1.5 border bg-zinc-50 p-2 dark:bg-zinc-800/60">
        {(Object.keys(STYLE_LABEL) as Style[]).map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => apply(style)}
            disabled={done}
            className={cn(
              'border px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50',
              styles[selected] === style ? 'text-white' : 'bg-white hover:bg-black/5 dark:bg-zinc-900'
            )}
            style={styles[selected] === style ? { backgroundColor: color, borderColor: color } : undefined}
          >
            {STYLE_LABEL[style]}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        <button
          type="button"
          onClick={toggleBold}
          disabled={done}
          aria-pressed={!!bold[selected]}
          aria-label="Pogrubienie"
          className={cn(
            'flex h-8 w-8 items-center justify-center border transition disabled:opacity-50',
            bold[selected] ? 'text-white' : 'bg-white hover:bg-black/5 dark:bg-zinc-900'
          )}
          style={bold[selected] ? { backgroundColor: color, borderColor: color } : undefined}
        >
          <Bold className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      <div className="mt-3 grid gap-4 md:grid-cols-[190px_minmax(0,1fr)]">
        {/* Panel nawigacji */}
        <div className="border bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <List className="h-3.5 w-3.5" aria-hidden />
            Nawigacja
          </p>
          {outline.length === 0 ? (
            <p className="text-xs italic leading-snug text-muted-foreground">
              Pusto. Program nie znalazł w dokumencie ani jednego nagłówka.
            </p>
          ) : (
            <ul className="space-y-1">
              {outline.map((b) => (
                <li
                  key={b.id}
                  className={cn(
                    'truncate text-xs',
                    styles[b.id] === 'naglowek2' && 'pl-3 text-muted-foreground'
                  )}
                  style={styles[b.id] === 'naglowek1' ? { color, fontWeight: 600 } : undefined}
                >
                  {b.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dokument */}
        <div className="border bg-white p-4 font-serif text-zinc-900 shadow-sm">
          {DOC.map((b) => {
            const style = styles[b.id];
            const isSelected = b.id === selected;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelected(b.id)}
                className={cn(
                  'block w-full rounded-sm text-left transition-colors',
                  style === 'naglowek1' && 'mb-2 mt-1 text-2xl font-bold',
                  style === 'naglowek2' && 'mb-1 mt-3 text-lg font-semibold',
                  style === 'tekst' && 'mb-1.5 text-base leading-relaxed',
                  isSelected ? 'bg-amber-100' : 'hover:bg-zinc-100'
                )}
                style={bold[b.id] ? { fontWeight: 700 } : undefined}
              >
                {b.text}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
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
                Panel zna teraz cały dokument. Nie dlatego, że nagłówki są większe — dlatego, że
                mają <strong>styl nagłówka</strong>.
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Pogrubienie mówi tylko drukarce, jak namalować litery. Styl mówi programowi,{' '}
              <strong>czym ten fragment jest</strong>. Dopiero wtedy da się po dokumencie skakać
              panelem, zrobić automatyczny spis treści i zmienić wygląd wszystkich nagłówków naraz —
              jednym kliknięciem, zamiast poprawiać każdy osobno.
            </p>
          </motion.div>
        ) : fakeHeading ? (
          <motion.p
            key="fake"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30"
          >
            Pogrubienie zadziałało — tekst jest grubszy. A panel nawigacji dalej go nie widzi, bo dla
            programu to wciąż zwykłe zdanie, tyle że grubo napisane. <strong>Nagłówek to styl, nie
            wygląd.</strong>
          </motion.p>
        ) : null}
      </AnimatePresence>

      {!done && (
        <button
          type="button"
          onClick={() => correct && setDone(true)}
          disabled={!correct}
          className="mt-3 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          {correct ? 'Gotowe — panel się zgadza' : `W panelu: ${outline.length} z 4 pozycji`}
        </button>
      )}
    </div>
  );
}
