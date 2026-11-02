'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, SpellCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Blok `debugowanie` — **narzędzie, które celowo nie kończy roboty**.
 *
 * Czerwone podkreślenie daje dziecku fałszywe poczucie bezpieczeństwa: skoro nic
 * nie jest podkreślone, to znaczy, że tekst jest dobry. Nie znaczy. Program
 * sprawdza jedną rzecz — **czy taki wyraz w ogóle istnieje** — i nie ma pojęcia,
 * czy pasuje do zdania. „Morze” zamiast „może” i „lud” zamiast „lód” przechodzą
 * przez każdy słownik świata, bo to poprawne polskie wyrazy postawione w złym
 * miejscu.
 *
 * Dlatego blok ma dwie fazy, a druga zaczyna się dopiero wtedy, gdy program
 * powie, że skończył: **trzy błędy znajduje maszyna, dwa musi znaleźć człowiek**.
 * To ta sama myśl, co w `GreenOnly` z poprzedniej lekcji (automat dopasowuje
 * napisy, nie znaczenia), ale postawiona tam, gdzie boli najbardziej — bo tu
 * narzędzie samo ogłasza, że jest gotowe.
 */

interface Word {
  text: string;
  /** Wyraz, którego w słowniku nie ma — program go podkreśli. */
  misspelled?: string;
  /** Poprawny wyraz istniejący w słowniku, ale nie ten, co trzeba. */
  wrongWord?: string;
  why?: string;
}

/** Tekst jako lista wyrazów i znaków — żeby dało się podkreślić pojedynczy wyraz. */
const TEXT: Word[] = [
  { text: 'Na' }, { text: 'wycieczkę' },
  { text: 'wogóle', misspelled: 'w ogóle', why: '„W ogóle” to dwa osobne wyrazy — takiego jednego słowa nie ma w słowniku.' },
  { text: 'nie' }, { text: 'trzeba' }, { text: 'brać' }, { text: 'dużo' }, { text: 'rzeczy.' },
  { text: 'Napewno', misspelled: 'Na pewno', why: '„Na pewno” też pisze się osobno, choć wymawiamy to jednym ciągiem.' },
  { text: 'przyda' }, { text: 'się' }, { text: 'butelka' }, { text: 'wody' }, { text: '—' }, { text: 'w' }, { text: 'upał' },
  { text: 'lud', wrongWord: 'lód', why: '„Lud” to gromada ludzi i jest w słowniku — dlatego program przepuścił. W szklance topi się „lód”.' },
  { text: 'w' }, { text: 'niej' }, { text: 'szybko' }, { text: 'się' }, { text: 'topi.' },
  { text: 'Jak' }, { text: 'ktoś' }, { text: 'chce,' },
  { text: 'morze', wrongWord: 'może', why: '„Morze” istnieje — to woda, nad którą jeździmy na wakacje. Tutaj chodziło o „może”, czyli „ma prawo”.' },
  { text: 'wziąć' }, { text: 'też' }, { text: 'kanapki.' },
  { text: 'W' }, { text: 'autokarze' }, { text: 'każdy' }, { text: 'ma' }, { text: 'swoje' },
  { text: 'kszesło,', misspelled: 'krzesło,', why: 'Zwykła literówka: „krzesło” przez „rz”. Program widzi, że takiego wyrazu nie ma.' },
  { text: 'więc' }, { text: 'plecak' }, { text: 'zmieści' }, { text: 'się' }, { text: 'pod' }, { text: 'nogami.' },
];

const MACHINE = TEXT.map((w, i) => (w.misspelled ? i : -1)).filter((i) => i >= 0);
const HUMAN = TEXT.map((w, i) => (w.wrongWord ? i : -1)).filter((i) => i >= 0);

type Phase = 'przed' | 'maszyna' | 'czlowiek' | 'koniec';

interface SpellPassProps {
  color: string;
  onComplete?: () => void;
}

export function SpellPass({ color, onComplete }: SpellPassProps) {
  const [phase, setPhase] = useState<Phase>('przed');
  const [fixed, setFixed] = useState<number[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [misses, setMisses] = useState(0);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(phase);

  const machineLeft = MACHINE.filter((i) => !fixed.includes(i));
  const humanLeft = HUMAN.filter((i) => !fixed.includes(i));

  useEffect(() => {
    if (phase !== 'koniec' || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [phase, onComplete]);

  const click = (index: number) => {
    const word = TEXT[index];
    if (phase === 'maszyna') {
      if (!word.misspelled) {
        setNote('Ten wyraz nie jest podkreślony — program nie ma do niego zastrzeżeń. Popraw te z czerwoną falką.');
        return;
      }
      const next = [...fixed, index];
      setFixed(next);
      setNote(word.why ?? null);
      if (MACHINE.every((i) => next.includes(i))) setPhase('czlowiek');
      return;
    }
    if (phase !== 'czlowiek') return;
    if (!word.wrongWord) {
      setMisses(misses + 1);
      setNote(
        misses >= 1
          ? 'Nie ten. Szukaj wyrazu, który sam w sobie jest poprawny, ale w tym zdaniu znaczy coś zupełnie innego — na przykład nazwę czegoś, co nie ma tu prawa być.'
          : 'Ten wyraz jest na swoim miejscu. Czytaj zdanie po zdaniu i pytaj: czy to na pewno TEN wyraz?'
      );
      return;
    }
    const next = [...fixed, index];
    setFixed(next);
    setNote(word.why ?? null);
    if (HUMAN.every((i) => next.includes(i))) setPhase('koniec');
  };

  const display = (index: number) => {
    const word = TEXT[index];
    if (!fixed.includes(index)) return word.text;
    return word.misspelled ?? word.wrongWord ?? word.text;
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">
          {phase === 'przed' && 'W tym ogłoszeniu jest pięć błędów. Najpierw niech poszuka program.'}
          {phase === 'maszyna' && 'Kliknij każdy podkreślony wyraz, żeby go poprawić.'}
          {phase === 'czlowiek' && 'Program skończył — a błędy nie. Znajdź dwa, których nie zobaczył.'}
          {phase === 'koniec' && 'Pięć błędów poprawionych: trzy przez program, dwa przez ciebie.'}
        </p>
        {phase !== 'przed' && (
          <span className="text-xs tabular-nums text-muted-foreground">
            poprawione: {fixed.length} z {MACHINE.length + HUMAN.length}
          </span>
        )}
      </div>

      {/* Makieta dokumentu z czerwonymi falkami — jak w prawdziwym edytorze. */}
      <div className="border bg-white p-4 font-serif text-base leading-loose text-zinc-900 shadow-sm sm:p-5">
        {TEXT.map((word, i) => {
          const flagged = phase === 'maszyna' && word.misspelled && !fixed.includes(i);
          const repaired = fixed.includes(i);
          const clickable = phase === 'maszyna' || phase === 'czlowiek';
          return (
            <span key={i}>
              <button
                type="button"
                onClick={() => click(i)}
                disabled={!clickable}
                className={cn(
                  'rounded-sm align-baseline',
                  clickable && 'cursor-pointer hover:bg-amber-100',
                  repaired && 'bg-emerald-100'
                )}
                style={
                  flagged
                    ? {
                        textDecoration: 'underline wavy #dc2626',
                        textUnderlineOffset: '4px',
                      }
                    : undefined
                }
                aria-label={flagged ? `${word.text} — podkreślone przez program` : word.text}
              >
                {display(i)}
              </button>{' '}
            </span>
          );
        })}
      </div>

      {phase === 'przed' && (
        <button
          type="button"
          onClick={() => setPhase('maszyna')}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          <SpellCheck className="h-4 w-4" aria-hidden />
          Sprawdź pisownię
        </button>
      )}

      <AnimatePresence mode="wait">
        {phase === 'koniec' ? (
          <motion.div
            key="koniec"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Zwróć uwagę, czego program <strong>nie</strong> zrobił: nie zauważył ani „lud”
                zamiast „lód”, ani „morze” zamiast „może”.
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Sprawdzanie pisowni odpowiada tylko na jedno pytanie:{' '}
              <strong>czy taki wyraz istnieje?</strong> Nie na pytanie, czy pasuje do zdania — bo do
              tego trzeba zrozumieć, o czym jest zdanie. „Morze” i „lud” to poprawne polskie wyrazy
              postawione w złym miejscu, więc żaden słownik ich nie zatrzyma.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Stąd nawyk, który warto sobie wyrobić: <strong>po sprawdzeniu pisowni przeczytaj
              tekst jeszcze raz sam</strong>, najlepiej na głos. Brak czerwonych falek nie znaczy, że
              tekst jest dobry — znaczy tylko, że wszystkie wyrazy są w słowniku.
            </p>
          </motion.div>
        ) : note ? (
          <motion.p
            key={note}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'mt-3 border-l-2 p-3 text-sm leading-relaxed',
              phase === 'czlowiek' && humanLeft.length === HUMAN.length
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                : ''
            )}
            style={
              phase !== 'czlowiek' || humanLeft.length < HUMAN.length ? { borderColor: color } : undefined
            }
          >
            {note}
          </motion.p>
        ) : phase === 'czlowiek' ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30"
          >
            Program zgłasza: <strong>„Sprawdzanie pisowni zakończone”</strong>. W tekście zostały
            jednak dwa wyrazy, które są poprawne — tylko nie w tym zdaniu. Kliknij je.
          </motion.p>
        ) : null}
      </AnimatePresence>

      {phase === 'maszyna' && machineLeft.length > 0 && !note && (
        <p className="mt-3 text-xs text-muted-foreground">
          Podkreślonych wyrazów: {machineLeft.length}.
        </p>
      )}
    </div>
  );
}
