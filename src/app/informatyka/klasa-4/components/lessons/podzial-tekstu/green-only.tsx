'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Highlighter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Ćwiczenie o wyróżnianiu kolorem — **automat zaznacza słowa, a nie znaczenia**.
 *
 * Czwarty podpunkt Z-10 brzmi „wyróżnij na zielono nazwy przedmiotów” i ma w
 * sobie pułapkę, której dziecko samo nie zauważy: w przepisie ta sama *nazwa*
 * raz jest przedmiotem, a raz miarą. „Dwie szklanki” w zdaniu o wydajności to
 * ilość, a nie naczynia, których potrzebujesz; „łyżeczka miodu” to miara, a nie
 * sztuciec do pracy.
 *
 * Blok pokazuje to przez narzędzie, którego dzieci naprawdę używają: zaznaczanie
 * **wszystkich wystąpień słowa** naraz. Automat robi dokładnie to, o co go
 * poprosisz — dopasowuje napisy — i dlatego łapie o dwa słowa za dużo. Poprawia
 * je człowiek, klikając.
 *
 * Trzecia opcja („składniki i przedmioty”) jest tu celowo: po jej wybraniu
 * zielone jest prawie wszystko i **kolor przestaje cokolwiek znaczyć**. To ta
 * sama myśl, co w `EmphasisAudit` z lekcji 18, ale postawiona od drugiej strony —
 * tam wyróżnień było za dużo, tu jedno wyróżnienie ma za dużo znaczeń.
 */

type Kind = 'skladnik' | 'przedmiot';
type Choice = Kind | 'oba';

interface Token {
  text: string;
  /** Do której listy słów pasuje ten fragment (`undefined` — do żadnej). */
  matchedBy?: Kind;
  /** Czy to naprawdę przedmiot potrzebny do pracy. */
  isTool?: boolean;
  /** Dlaczego automat się tu pomylił — pokazywane po kliknięciu. */
  trap?: string;
}

/** Przepis rozbity na fragmenty; zaznaczalne są tylko te z `matchedBy`. */
const TOKENS: Token[] = [
  { text: 'Z tego przepisu wychodzą dwie duże ' },
  {
    text: 'szklanki',
    matchedBy: 'przedmiot',
    isTool: false,
    trap: 'Tu „szklanki” to ilość koktajlu, a nie naczynia, które musisz przygotować. Automat tego nie odróżnia — dopasował samo słowo.',
  },
  { text: ' koktajlu. Do pracy potrzebujesz: ' },
  { text: 'blender', matchedBy: 'przedmiot', isTool: true },
  { text: ', ' },
  { text: 'nóż', matchedBy: 'przedmiot', isTool: true },
  { text: ', ' },
  { text: 'deskę', matchedBy: 'przedmiot', isTool: true },
  { text: ' do krojenia i dwie ' },
  { text: 'szklanki', matchedBy: 'przedmiot', isTool: true },
  { text: '. Składniki: ' },
  { text: 'truskawki', matchedBy: 'skladnik' },
  { text: ', ' },
  { text: 'banan', matchedBy: 'skladnik' },
  { text: ', ' },
  { text: 'jogurt', matchedBy: 'skladnik' },
  { text: ' naturalny i ' },
  {
    text: 'łyżeczka',
    matchedBy: 'przedmiot',
    isTool: false,
    trap: 'Tu „łyżeczka” to miara — tyle miodu, ile się mieści na łyżeczce. Nie jest to narzędzie, którym robisz koktajl.',
  },
  { text: ' ' },
  { text: 'miodu', matchedBy: 'skladnik' },
  { text: '. ' },
  { text: 'Nóż', matchedBy: 'przedmiot', isTool: true },
  { text: ' przyda się też do odcięcia szypułek truskawkom.' },
];

const CHOICES: { id: Choice; label: string }[] = [
  { id: 'skladnik', label: 'składniki' },
  { id: 'przedmiot', label: 'przedmioty' },
  { id: 'oba', label: 'składniki i przedmioty' },
];

/** Indeksy fragmentów, które naprawdę są przedmiotami do pracy. */
const TRUE_TOOLS = TOKENS.map((t, i) => (t.isTool ? i : -1)).filter((i) => i >= 0);

interface GreenOnlyProps {
  color: string;
  onComplete?: () => void;
}

export function GreenOnly({ color, onComplete }: GreenOnlyProps) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [removed, setRemoved] = useState<number[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(done ? 'gotowe' : String(choice));

  const isHighlighted = (index: number) => {
    const token = TOKENS[index];
    if (!token.matchedBy || choice === null) return false;
    if (removed.includes(index)) return false;
    return choice === 'oba' || token.matchedBy === choice;
  };

  const highlighted = TOKENS.map((_, i) => i).filter(isHighlighted);
  const perfect =
    choice === 'przedmiot' &&
    highlighted.length === TRUE_TOOLS.length &&
    highlighted.every((i) => TRUE_TOOLS.includes(i));

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const pick = (next: Choice) => {
    setChoice(next);
    setRemoved([]);
    setNote(
      next === 'oba'
        ? 'Zielone jest teraz prawie całe zdanie. Kiedy jeden kolor znaczy dwie rzeczy naraz, przestaje znaczyć cokolwiek — czytelnik nie wie, czego szuka.'
        : next === 'skladnik'
          ? 'Automat zaznaczył składniki. Polecenie mówi jednak wyraźnie: na zielono mają być PRZEDMIOTY potrzebne do zrobienia koktajlu.'
          : null
    );
  };

  const toggle = (index: number) => {
    if (choice !== 'przedmiot' || done) return;
    const token = TOKENS[index];
    if (!token.matchedBy || token.matchedBy !== 'przedmiot') return;
    if (removed.includes(index)) {
      setRemoved(removed.filter((i) => i !== index));
      setNote(null);
      return;
    }
    setRemoved([...removed, index]);
    setNote(
      token.isTool
        ? `„${token.text}” to naprawdę przedmiot, którego potrzebujesz do pracy — ten powinien zostać na zielono.`
        : (token.trap ?? null)
    );
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm font-semibold sm:text-base">
        Polecenie: wyróżnij na zielono nazwy <strong>przedmiotów</strong> potrzebnych do zrobienia
        koktajlu.
      </p>
      <p className="mb-3 text-xs text-muted-foreground">
        Najpierw powiedz edytorowi, czego ma szukać. Zaznaczy wszystkie wystąpienia naraz.
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Highlighter className="h-3.5 w-3.5" aria-hidden />
          Zielony oznacza:
        </span>
        {CHOICES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => pick(item.id)}
            disabled={done}
            aria-pressed={choice === item.id}
            className={cn(
              'border-2 px-2.5 py-1.5 text-sm transition disabled:opacity-60',
              choice !== item.id && !done && 'hover:bg-black/5 dark:hover:bg-white/5'
            )}
            style={{
              borderColor: choice === item.id ? color : `${color}33`,
              backgroundColor: choice === item.id ? `${color}14` : undefined,
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="border bg-white p-4 font-serif text-base leading-loose text-zinc-900 shadow-sm sm:p-5">
        {TOKENS.map((token, i) => {
          const on = isHighlighted(i);
          const clickable = choice === 'przedmiot' && token.matchedBy === 'przedmiot' && !done;
          if (!token.matchedBy) return <span key={i}>{token.text}</span>;
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={on}
              aria-label={`${token.text} — ${on ? 'wyróżnione na zielono' : 'bez wyróżnienia'}`}
              className={cn(
                'rounded-sm align-baseline transition-colors',
                clickable && 'cursor-pointer underline decoration-dotted underline-offset-4'
              )}
              style={on ? { backgroundColor: '#bbf7d0', boxShadow: '0 0 0 2px #bbf7d0' } : undefined}
            >
              {token.text}
            </button>
          );
        })}
      </div>

      {choice === 'przedmiot' && !done && (
        <p className="mt-3 text-sm leading-relaxed">
          Automat zaznaczył <strong>{highlighted.length + removed.length}</strong> wystąpień. Przeczytaj
          je po kolei i kliknij te, które wcale nie są przedmiotami do pracy.
        </p>
      )}

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
                Pięć wyróżnień i ani jednego za dużo. Zielony znaczy teraz w tym dokumencie dokładnie
                jedno: <strong>to trzeba mieć pod ręką, zanim zaczniesz</strong>.
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Dwa wnioski na cały moduł. Po pierwsze:{' '}
              <strong>jeden kolor — jedno znaczenie</strong>. Jeśli zielony oznacza i przedmioty, i
              składniki, to nie oznacza nic. Po drugie: program dopasowuje{' '}
              <strong>napisy, nie znaczenia</strong> — „szklanka” raz jest naczyniem, a raz miarą, i
              rozróżnić to potrafi tylko człowiek, który czyta zdanie.
            </p>
          </motion.div>
        ) : note ? (
          <motion.p
            key={note}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30"
          >
            {note}
          </motion.p>
        ) : null}
      </AnimatePresence>

      {!done && (
        <button
          type="button"
          onClick={() => perfect && setDone(true)}
          disabled={!perfect}
          className="mt-3 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          {perfect ? 'Gotowe — zielony znaczy jedno' : 'Zatwierdź wyróżnienia'}
        </button>
      )}
    </div>
  );
}
