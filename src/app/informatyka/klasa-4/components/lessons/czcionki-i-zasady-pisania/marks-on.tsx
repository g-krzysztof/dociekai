'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Pilcrow } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Haczyk lekcji — **przełącznik, który zamienia niewidzialne w klikalne**.
 *
 * Błędy w pisaniu tekstu mają tę cechę, że ich nie widać: dwie spacje wyglądają
 * jak jedna, spacja przed przecinkiem jak nic, a Enter w środku zdania jak
 * zwykły koniec wiersza. Dlatego każdy edytor tekstu ma przycisk ¶ („pokaż znaki
 * niedrukowane”) i dlatego zaczynamy od niego: dziecko klika przełącznik i ten
 * sam list nagle pokazuje kropki, strzałki i pilcrowy. Dopiero wtedy jest co
 * poprawiać — i dopiero wtedy poprawianie ma sens.
 *
 * Nowa w kursie jest sama mechanika: **widoczność jest tu narzędziem, a nie
 * ozdobą**. Przy wyłączonych znakach nic nie da się kliknąć, bo nie ma w co
 * trafić.
 *
 * Usterki nie są wpisane listą pozycji — znajduje je `findDefects()`, czytając
 * strukturę dokumentu. Dzięki temu poprawka naprawdę zmienia dokument, a licznik
 * „zostało N” liczy się od nowa po każdej zmianie i nie da się go rozjechać.
 */

type Atom =
  | { kind: 'word'; text: string }
  | { kind: 'space'; n: number }
  | { kind: 'punct'; text: string }
  /** Twardy koniec akapitu — ten jest poprawny i zostaje. */
  | { kind: 'para' }
  /** Enter wciśnięty w środku zdania — ten jest błędem. */
  | { kind: 'break' };

const w = (text: string): Atom => ({ kind: 'word', text });
const sp = (n = 1): Atom => ({ kind: 'space', n });
const pt = (text: string): Atom => ({ kind: 'punct', text });

/**
 * List z pięcioma usterkami, każda innego rodzaju. Celowo krótki: chodzi o to,
 * żeby dziecko zobaczyło mechanizm, nie o wytrzymałość.
 */
const START: Atom[] = [
  w('Kochana'), sp(), w('Babciu'), sp(), pt(','), sp(2), w('dziękuję'), sp(), w('za'), sp(),
  w('prezent'), pt('.'), w('Bardzo'), sp(), w('mi'), sp(), w('się'), sp(), w('podoba'), pt('!'),
  { kind: 'para' },
  w('Jutro'), sp(), w('do'), sp(), w('Ciebie'), { kind: 'break' }, w('zadzwonię'), sp(), pt('.'),
];

const CLOSERS = [',', '.', '!', '?', ':', ';'];

interface Defect {
  /** Indeks atomu, w który trzeba kliknąć. */
  index: number;
  kind: 'podwojna-spacja' | 'spacja-przed' | 'brak-spacji' | 'enter-w-zdaniu';
  label: string;
  explain: string;
}

/** Wszystkie usterki wyczytane ze struktury dokumentu — nigdy z listy pozycji. */
function findDefects(atoms: Atom[]): Defect[] {
  const out: Defect[] = [];
  atoms.forEach((atom, i) => {
    const next = atoms[i + 1];
    if (atom.kind === 'space' && atom.n > 1) {
      out.push({
        index: i,
        kind: 'podwojna-spacja',
        label: 'dwie spacje zamiast jednej',
        explain:
          'Między wyrazami stawia się dokładnie jedną spację. Dwie wyglądają jak dziura i rozjeżdżają tekst, kiedy zmienisz czcionkę.',
      });
    }
    if (atom.kind === 'space' && next?.kind === 'punct' && CLOSERS.includes(next.text)) {
      out.push({
        index: i,
        kind: 'spacja-przed',
        label: `spacja przed znakiem „${next.text}”`,
        explain:
          'Przecinek, kropka i wykrzyknik przyklejają się do poprzedniego wyrazu — spacja idzie dopiero PO nich. Inaczej znak może zostać sam na początku następnego wiersza.',
      });
    }
    if (atom.kind === 'punct' && CLOSERS.includes(atom.text) && next?.kind === 'word') {
      out.push({
        index: i,
        kind: 'brak-spacji',
        label: `brak spacji po znaku „${atom.text}”`,
        explain: 'Po przecinku i kropce zawsze idzie spacja — bez niej wyrazy zlewają się w jeden.',
      });
    }
    if (atom.kind === 'break') {
      out.push({
        index: i,
        kind: 'enter-w-zdaniu',
        label: 'Enter w środku zdania',
        explain:
          'Enter kończy akapit, a nie wiersz. W środku zdania jest zwykłą spacją — i to o tym jest następny blok.',
      });
    }
  });
  return out;
}

/** Poprawka: usuwa nadmiar albo wstawia to, czego brakuje. */
function fix(atoms: Atom[], defect: Defect): Atom[] {
  const next = [...atoms];
  if (defect.kind === 'podwojna-spacja') next[defect.index] = sp(1);
  if (defect.kind === 'spacja-przed') next.splice(defect.index, 1);
  if (defect.kind === 'brak-spacji') next.splice(defect.index + 1, 0, sp(1));
  if (defect.kind === 'enter-w-zdaniu') next[defect.index] = sp(1);
  return next;
}

interface MarksOnProps {
  color: string;
  onComplete?: () => void;
}

export function MarksOn({ color, onComplete }: MarksOnProps) {
  const [atoms, setAtoms] = useState<Atom[]>(START);
  const [marks, setMarks] = useState(false);
  const [note, setNote] = useState<Defect | null>(null);
  const [fixed, setFixed] = useState<string[]>([]);

  const reported = useRef(false);
  const defects = findDefects(atoms);
  const total = findDefects(START).length;
  const done = defects.length === 0;
  const anchorRef = useSectionScrollAnchor(done ? 'koniec' : 'praca');

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const click = (index: number) => {
    if (!marks) return;
    const defect = defects.find((d) => d.index === index);
    if (!defect) {
      setNote(null);
      return;
    }
    setAtoms(fix(atoms, defect));
    setNote(defect);
    setFixed((prev) => (prev.includes(defect.kind) ? prev : [...prev, defect.kind]));
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setMarks(!marks)}
          aria-pressed={marks}
          className="inline-flex items-center gap-2 border-2 px-3 py-2 text-sm font-semibold transition hover:bg-black/5 dark:hover:bg-white/5"
          style={{ borderColor: marks ? color : `${color}44`, backgroundColor: marks ? `${color}14` : undefined }}
        >
          <Pilcrow className="h-4 w-4" style={{ color }} aria-hidden />
          {marks ? 'Ukryj znaki niedrukowane' : 'Pokaż znaki niedrukowane'}
        </button>
        <p className="text-xs tabular-nums text-muted-foreground">
          {marks ? (
            <>
              usterki: <strong className="text-foreground">{total - defects.length}</strong> / {total}
            </>
          ) : (
            'ten list ma pięć usterek — nie widać ani jednej'
          )}
        </p>
      </div>

      {/* Makieta kartki dokumentu — świadomie poza językiem wizualnym kursu,
          jak makieta pulpitu w teście diagnostycznym. */}
      <div className="border bg-white p-4 font-serif text-base leading-loose text-zinc-900 shadow-sm sm:p-6 sm:text-lg">
        {atoms.map((atom, i) => {
          const isDefect = marks && defects.some((d) => d.index === i);
          const clickable = marks && (atom.kind === 'space' || atom.kind === 'punct' || atom.kind === 'break');
          const common = cn(
            'rounded-sm',
            isDefect && 'cursor-pointer bg-amber-200/70 outline outline-1 outline-amber-500',
            clickable && !isDefect && 'cursor-default'
          );

          if (atom.kind === 'word') return <span key={i}>{atom.text}</span>;
          if (atom.kind === 'para')
            return (
              <span key={i}>
                {marks && <span className="text-sky-600">¶</span>}
                <br />
              </span>
            );
          if (atom.kind === 'break')
            return (
              <span key={i}>
                <button
                  type="button"
                  onClick={() => click(i)}
                  aria-label="Znak końca wiersza w środku zdania"
                  className={cn(common, 'align-baseline text-rose-600')}
                >
                  {marks ? '↵' : ''}
                </button>
                {marks ? <br /> : ' '}
              </span>
            );
          if (atom.kind === 'space')
            return (
              <button
                key={i}
                type="button"
                onClick={() => click(i)}
                aria-label={`${atom.n === 1 ? 'Spacja' : `${atom.n} spacje`}`}
                className={cn(common, 'align-baseline')}
              >
                {marks ? (
                  <span className="text-sky-600">{'·'.repeat(atom.n)}</span>
                ) : (
                  ' '.repeat(atom.n)
                )}
              </button>
            );
          return (
            <button
              key={i}
              type="button"
              onClick={() => click(i)}
              aria-label={`Znak ${atom.text}`}
              className={cn(common, 'align-baseline')}
            >
              {atom.text}
            </button>
          );
        })}
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
                Pięć usterek, których na początku nie było widać. Wszystkie dotyczyły{' '}
                <strong>spacji i Entera</strong> — czyli znaków, których nie widać na wydruku, a
                które decydują o tym, jak tekst się zachowa, gdy zmienisz czcionkę albo szerokość
                strony.
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Przycisk ¶ jest w każdym edytorze tekstu (w Wordzie i w LibreOffice wygląda dokładnie
              tak samo). Włącz go, kiedy coś w dokumencie „samo się rozjeżdża” — zwykle winna jest
              rzecz, której po prostu nie widać.
            </p>
          </motion.div>
        ) : note ? (
          <motion.p
            key={`${note.kind}-${note.index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 p-3 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Poprawione: {note.label}.</strong> {note.explain}
          </motion.p>
        ) : marks ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-sm leading-relaxed text-muted-foreground"
          >
            Podświetlone miejsca są do poprawienia — kliknij w nie. Kropka{' '}
            <span className="text-sky-600">·</span> to spacja, strzałka{' '}
            <span className="text-rose-600">↵</span> to Enter, a{' '}
            <span className="text-sky-600">¶</span> to koniec akapitu.
          </motion.p>
        ) : null}
      </AnimatePresence>

      {fixed.length > 0 && !done && (
        <p className="mt-3 text-xs text-muted-foreground">
          Rodzaje usterek, które już znasz: {fixed.length} z 4.
        </p>
      )}
    </div>
  );
}
