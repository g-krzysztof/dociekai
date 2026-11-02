'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { DOC } from './recipe';

/**
 * Ćwiczenie o tytułach etapów — **egzamin, który dziecko układa samo sobie**.
 *
 * „Śródtytuły pomagają się połapać” to zdanie bez pokrycia, dopóki śródtytuły
 * brzmią „Etap 1”, „Etap 2”, „Etap 3”. Blok pokazuje to natychmiast: treść jest
 * zasłonięta, a pytanie normalne — i odpowiedzieć da się wyłącznie zgadując.
 * Potem dziecko **wpisuje własne tytuły** widząc treść etapów, a na końcu treść
 * znika ponownie i te same pytania wracają. Tym razem test zdaje się na własnej
 * robocie: dobre tytuły prowadzą prosto do celu, „Etap 2” dalej nie prowadzi
 * donikąd.
 *
 * Nowe w kursie: **tekst celowo nieczytelny**. Do tej pory każdy widżet dawał
 * wszystko do przeczytania; tutaj zasłonięcie treści jest narzędziem pomiaru, bo
 * tylko ono zmusza do korzystania wyłącznie ze struktury.
 *
 * Kontrole tytułu są pobłażliwe i wypisane obok (jak `verdict()` w `PasswordLab`):
 * sprawdzamy, że tytuł w ogóle coś mówi, a nie czy jest ładny. Jedyna twarda
 * reguła to zakaz „etapu z numerem” — bo to jest dokładnie ta wada, którą blok
 * leczy.
 */

const SECTION_IDS = ['h1', 'h2', 'h3'];

interface Quiz {
  /** Indeks etapu, w którym jest odpowiedź. */
  section: number;
  question: string;
}

const QUIZ: Quiz[] = [
  { section: 2, question: 'W którym etapie użyjesz blendera?' },
  { section: 0, question: 'W którym etapie sprawdzisz, czy masz w domu miód?' },
  { section: 1, question: 'W którym etapie potrzebny będzie nóż?' },
];

type Phase = 'slepy' | 'pisanie' | 'test' | 'koniec';

interface TitleTestProps {
  color: string;
  onComplete?: () => void;
}

export function TitleTest({ color, onComplete }: TitleTestProps) {
  const [phase, setPhase] = useState<Phase>('slepy');
  const [titles, setTitles] = useState<string[]>(['Etap 1', 'Etap 2', 'Etap 3']);
  const [asked, setAsked] = useState(0);
  const [blindTries, setBlindTries] = useState(0);
  const [hits, setHits] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(`${phase}-${asked}`);

  useEffect(() => {
    if (phase !== 'koniec' || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [phase, onComplete]);

  /** Warunki tytułu — pobłażliwe, poza jednym: „Etap 2” to nie tytuł. */
  const checkTitle = (value: string) => {
    const text = value.trim();
    const words = text.split(/\s+/).filter(Boolean);
    if (text.length < 3) return 'Tytuł jest pusty albo za krótki.';
    if (words.length > 5) return 'Tytuł ma być krótki — najwyżej pięć słów.';
    if (/^(etap|punkt|krok|część)\s*\d*$/i.test(text))
      return 'To jest numer, nie tytuł. Napisz, co się w tym etapie dzieje.';
    return null;
  };

  const titleErrors = titles.map(checkTitle);
  const titlesOk = titleErrors.every((e) => e === null);

  const pickSection = (index: number) => {
    const target = QUIZ[asked];
    if (phase === 'slepy') {
      setBlindTries(blindTries + 1);
      setNote(
        index === target.section
          ? 'Trafione — ale zgadywaniem. „Etap 3” nie mówi, że to tam jest blender; równie dobrze mógł być w pierwszym.'
          : 'Nietrafione. I nie ma się czym przejmować: po samym „Etapie 1” nie da się tego poznać.'
      );
      return;
    }
    if (index === target.section) {
      setHits(hits + 1);
      if (asked + 1 < QUIZ.length) {
        setAsked(asked + 1);
        setNote(null);
      } else {
        setPhase('koniec');
      }
      return;
    }
    setNote('Nie w tym etapie — przeczytaj swoje tytuły jeszcze raz.');
  };

  const startWriting = () => {
    setPhase('pisanie');
    setNote(null);
  };

  const startTest = () => {
    if (!titlesOk) return;
    setPhase('test');
    setAsked(0);
    setHits(0);
    setNote(null);
  };

  const sectionBody = (index: number) => DOC.filter((b) => b.section === index && b.role === 'tekst');

  if (phase === 'koniec') {
    return (
      <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <p className="flex items-start gap-2 text-sm font-semibold sm:text-base">
          <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
          <span>Trzy pytania, trzy trafienia — z zasłoniętą treścią.</span>
        </p>
        <div className="mt-3 border bg-white p-4 font-serif text-zinc-900 shadow-sm">
          {titles.map((title, i) => (
            <p key={i} className="mb-1 text-lg font-semibold">
              {title}
            </p>
          ))}
        </div>
        <p className="mt-3 text-sm leading-relaxed sm:text-base">
          Na początku ten sam dokument miał tytuły „Etap 1”, „Etap 2”, „Etap 3” i nie dało się z nim
          zrobić nic poza zgadywaniem. Teraz da się go używać, nie czytając —{' '}
          <strong>i to jest cała robota, którą wykonuje śródtytuł</strong>.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Test, który możesz zrobić każdemu swojemu dokumentowi: zasłoń treść i zostaw same tytuły.
          Jeśli dalej wiadomo, gdzie czego szukać — tytuły są dobre. Jeśli nie, to są tylko ozdobą.
        </p>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">
          {phase === 'pisanie'
            ? 'Przeczytaj etapy i nadaj im tytuły, które coś mówią.'
            : QUIZ[asked].question}
        </p>
        {phase !== 'pisanie' && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <EyeOff className="h-3.5 w-3.5" aria-hidden />
            treść zasłonięta
          </span>
        )}
      </div>

      <div className="border bg-white p-4 font-serif text-zinc-900 shadow-sm sm:p-5">
        <p className="mb-3 border-b pb-2 text-xl font-bold">{DOC[0].text}</p>
        {SECTION_IDS.map((_, index) => (
          <div key={index} className="mb-4 last:mb-0">
            {phase === 'pisanie' ? (
              <>
                <label className="block">
                  <span className="mb-1 block font-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tytuł etapu {index + 1}
                  </span>
                  <input
                    type="text"
                    value={titles[index]}
                    maxLength={40}
                    onChange={(event) =>
                      setTitles((prev) => prev.map((t, i) => (i === index ? event.target.value : t)))
                    }
                    className="w-full border bg-white px-2 py-1.5 text-lg font-semibold"
                  />
                </label>
                {titleErrors[index] && (
                  <p className="mt-1 font-sans text-xs text-amber-700 dark:text-amber-500">
                    {titleErrors[index]}
                  </p>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => pickSection(index)}
                className="block w-full rounded-sm text-left text-lg font-semibold transition-colors hover:bg-amber-100"
              >
                {titles[index]}
              </button>
            )}

            {/* Treść etapu: w fazie pisania widoczna, w testach zasłonięta paskami. */}
            <div className="mt-1.5 space-y-1.5">
              {sectionBody(index).map((block) =>
                phase === 'pisanie' ? (
                  <p key={block.id} className="leading-relaxed">
                    {block.text}
                  </p>
                ) : (
                  <div key={block.id} className="flex flex-wrap gap-1.5" aria-hidden>
                    {block.text.split(' ').map((word, w) => (
                      <span
                        key={w}
                        className="inline-block h-3 rounded-sm bg-zinc-200"
                        style={{ width: Math.max(14, word.length * 6) }}
                      />
                    ))}
                  </div>
                )
              )}
              {phase !== 'pisanie' && (
                <span className="sr-only">Treść etapu {index + 1} jest zasłonięta.</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {note && (
          <motion.p
            key={note}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'mt-3 border-l-2 p-3 text-sm leading-relaxed',
              phase === 'slepy'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                : 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
            )}
          >
            {note}
          </motion.p>
        )}
      </AnimatePresence>

      {phase === 'slepy' && blindTries >= 1 && (
        <button
          type="button"
          onClick={startWriting}
          className="mt-3 px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          Pokaż treść — chcę to naprawić
        </button>
      )}

      {phase === 'pisanie' && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={startTest}
            disabled={!titlesOk}
            className="px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ backgroundColor: color }}
          >
            Zasłoń treść i sprawdź moje tytuły
          </button>
          <span className="text-xs text-muted-foreground">
            Tytuł ma mówić, co się w etapie dzieje — najwyżej pięć słów.
          </span>
        </div>
      )}

      {phase === 'test' && (
        <p className="mt-3 text-xs tabular-nums text-muted-foreground">
          pytanie {asked + 1} z {QUIZ.length} · trafienia: {hits}
        </p>
      )}
    </div>
  );
}
