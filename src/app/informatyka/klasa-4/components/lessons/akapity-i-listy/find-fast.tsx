'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Haczyk lekcji — **stoper mierzący czytanie, a nie wiedzę**.
 *
 * „Dziel tekst na akapity” to rada, w którą dziecko nie ma powodu wierzyć: na
 * ekranie ściana tekstu i tekst z akapitami niosą przecież dokładnie te same
 * słowa. Różnicę widać dopiero wtedy, gdy trzeba coś w nich **znaleźć** — i
 * dlatego ten blok nie tłumaczy, tylko mierzy. Dziecko szuka trzech informacji
 * w ścianie tekstu (stoper chodzi), potem samo dzieli ten sam tekst na akapity,
 * a potem szuka trzech kolejnych. Na końcu widzi dwie liczby: swoje sekundy
 * przed i po.
 *
 * Nowe w kursie: `SteadyHand` mierzył rękę dziecka, tutaj mierzymy **jego
 * czytanie**. Wynik jest jego własny, więc nie da się go zbyć wzruszeniem
 * ramion — i jest uczciwie skomentowany, bo w drugiej rundzie tekst jest już
 * trochę znajomy (widżet mówi to wprost, zamiast udawać czysty eksperyment).
 *
 * Podział na akapity nie jest oceniany „na oko”: każde zdanie ma `group`, a
 * poprawne miejsca złamania wynikają z tych grup. Dzięki temu komunikat mówi,
 * czego konkretnie brakuje, a reguła („akapit to jedna myśl”) wychodzi z
 * układu, a nie z definicji.
 */

interface Sentence {
  text: string;
  /** Numer myśli — z niego liczą się poprawne miejsca podziału. */
  group: number;
  /** Id pytania, na które to zdanie odpowiada. */
  answers?: string;
}

const SENTENCES: Sentence[] = [
  { text: 'Wycieczka do Muzeum Techniki odbędzie się w czwartek 24 kwietnia.', group: 0 },
  {
    text: 'Zbiórka jest o 7:40 przed wejściem do szkoły, a wyjazd o 8:00.',
    group: 0,
    answers: 'zbiorka',
  },
  { text: 'Wracamy tego samego dnia około 16:30 pod szkołę.', group: 0, answers: 'powrot' },
  { text: 'Każdy zabiera ze sobą drugie śniadanie i butelkę wody.', group: 1 },
  { text: 'Wygodne buty są obowiązkowe, bo w muzeum sporo się chodzi.', group: 1 },
  { text: 'Nie zabieramy ze sobą pieniędzy ani drogiego sprzętu.', group: 1 },
  { text: 'Koszt wycieczki to 45 złotych od osoby.', group: 2, answers: 'koszt' },
  {
    text: 'Wpłaty przyjmuje pani Kowalska do poniedziałku 21 kwietnia.',
    group: 2,
    answers: 'wplata',
  },
  { text: 'W cenie jest przejazd autokarem i bilet wstępu.', group: 2 },
  { text: 'Do środy trzeba oddać podpisaną zgodę rodzica.', group: 3, answers: 'zgoda' },
  { text: 'Bez zgody uczeń zostaje w szkole na lekcjach.', group: 3 },
  {
    text: 'Formularz zgody jest na stronie szkoły w zakładce Wycieczki.',
    group: 3,
    answers: 'formularz',
  },
];

/** Miejsca podziału wynikające z grup — nigdy wpisane z ręki. */
const CORRECT_BREAKS = SENTENCES.slice(0, -1)
  .map((s, i) => (s.group !== SENTENCES[i + 1].group ? i : -1))
  .filter((i) => i >= 0);

interface Question {
  id: string;
  text: string;
}

const ROUND_A: Question[] = [
  { id: 'koszt', text: 'Ile kosztuje wycieczka?' },
  { id: 'zbiorka', text: 'O której jest zbiórka?' },
  { id: 'zgoda', text: 'Do kiedy trzeba oddać zgodę rodzica?' },
];

const ROUND_B: Question[] = [
  { id: 'powrot', text: 'O której wracamy pod szkołę?' },
  { id: 'wplata', text: 'Do kiedy trzeba wpłacić pieniądze?' },
  { id: 'formularz', text: 'Gdzie znajdziesz formularz zgody?' },
];

type Phase = 'sciana' | 'dziel' | 'akapity' | 'koniec';

interface FindFastProps {
  color: string;
  onComplete?: () => void;
}

export function FindFast({ color, onComplete }: FindFastProps) {
  const [phase, setPhase] = useState<Phase>('sciana');
  const [asked, setAsked] = useState(0);
  const [breaks, setBreaks] = useState<number[]>([]);
  const [timeA, setTimeA] = useState(0);
  const [timeB, setTimeB] = useState(0);
  const [miss, setMiss] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const startedAt = useRef<number>(0);
  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(phase);

  const round = phase === 'sciana' ? ROUND_A : ROUND_B;
  const question = round[asked];
  const searching = (phase === 'sciana' || phase === 'akapity') && asked < round.length;

  /* Stoper rusza z każdym nowym pytaniem i zatrzymuje się na trafieniu. */
  useEffect(() => {
    if (searching) startedAt.current = Date.now();
  }, [searching, asked, phase]);

  useEffect(() => {
    if (phase !== 'koniec' || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [phase, onComplete]);

  const pickSentence = useCallback(
    (index: number) => {
      if (!searching || !question) return;
      const elapsed = (Date.now() - startedAt.current) / 1000;
      if (SENTENCES[index].answers !== question.id) {
        setMiss(true);
        return;
      }
      setMiss(false);
      if (phase === 'sciana') setTimeA((t) => t + elapsed);
      else setTimeB((t) => t + elapsed);

      if (asked + 1 < round.length) {
        setAsked(asked + 1);
        return;
      }
      setAsked(0);
      setPhase(phase === 'sciana' ? 'dziel' : 'koniec');
    },
    [searching, question, phase, asked, round.length]
  );

  const toggleBreak = (index: number) => {
    setBreaks((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index].sort((a, b) => a - b)
    );
    setNote(null);
  };

  const checkBreaks = () => {
    const missing = CORRECT_BREAKS.filter((i) => !breaks.includes(i)).length;
    const extra = breaks.filter((i) => !CORRECT_BREAKS.includes(i)).length;
    if (missing === 0 && extra === 0) {
      setPhase('akapity');
      setNote(null);
      return;
    }
    if (extra > 0 && missing === 0)
      setNote(
        `Podziałów jest ${extra} za dużo. Akapit to jedna myśl — a te zdania mówią jeszcze o tym samym, co poprzednie.`
      );
    else if (missing > 0 && extra === 0)
      setNote(
        `Brakuje jeszcze ${missing} ${missing === 1 ? 'podziału' : 'podziałów'}. Przeczytaj zdania po kolei i zaznacz miejsce wszędzie tam, gdzie ogłoszenie przechodzi do nowej sprawy.`
      );
    else
      setNote(
        `Jeszcze nie: ${missing} ${missing === 1 ? 'podziału brakuje' : 'podziałów brakuje'}, a ${extra} jest w złym miejscu.`
      );
  };

  /* Zdania pogrupowane w akapity wg wstawionych podziałów. */
  const paragraphs: Sentence[][] = [];
  let current: Sentence[] = [];
  SENTENCES.forEach((sentence, i) => {
    current.push(sentence);
    if (breaks.includes(i) || i === SENTENCES.length - 1) {
      paragraphs.push(current);
      current = [];
    }
  });

  const fmt = (s: number) => `${s.toFixed(1).replace('.', ',')} s`;

  if (phase === 'koniec') {
    const faster = timeA > timeB;
    const diff = Math.abs(timeA - timeB);
    return (
      <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <Stat label="Ściana tekstu" value={fmt(timeA)} color="#d97706" note="trzy informacje" />
          <Stat label="Ten sam tekst w akapitach" value={fmt(timeB)} color={color} note="trzy inne informacje" />
        </div>
        <p className="text-sm font-semibold sm:text-base" style={{ color }}>
          {faster
            ? `Z akapitami było o ${fmt(diff)} szybciej.`
            : 'Tym razem wyszło podobnie — ale popatrz na sam wygląd obu wersji.'}
        </p>
        <p className="mt-2 text-sm leading-relaxed sm:text-base">
          Słowa były dokładnie te same. Zmieniło się tylko to, że tekst{' '}
          <strong>miał kształt</strong>: cztery akapity, a każdy o czymś innym. Oko nie musi czytać
          wszystkiego — przelatuje po akapitach, dopóki nie trafi na ten właściwy. Nazywa się to
          <strong> skanowaniem</strong> i tak czyta się prawie wszystko w internecie.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Uczciwie: w drugiej rundzie tekst był ci już trochę znajomy, więc część różnicy bierze się
          stąd. Ale zauważ, że pytania były o co innego — i że w ścianie tekstu i tak trzeba było
          wodzić wzrokiem od początku.
        </p>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">
          {phase === 'sciana' && `Znajdź w ogłoszeniu: ${question?.text ?? ''}`}
          {phase === 'dziel' && 'Teraz podziel to samo ogłoszenie na akapity.'}
          {phase === 'akapity' && `Znajdź jeszcze raz: ${question?.text ?? ''}`}
        </p>
        {searching && (
          <span className="inline-flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
            <Timer className="h-3.5 w-3.5" aria-hidden />
            pytanie {asked + 1} z {round.length}
          </span>
        )}
      </div>

      <p className="mb-3 text-xs text-muted-foreground">
        {phase === 'dziel'
          ? 'Kliknij w odstęp między zdaniami wszędzie tam, gdzie ogłoszenie przechodzi do nowej sprawy. Akapit to jedna myśl.'
          : 'Kliknij zdanie, w którym jest odpowiedź. Stoper chodzi.'}
      </p>

      {/* Makieta kartki ogłoszenia — jak w poprzedniej lekcji. */}
      <div className="border bg-white p-4 font-serif text-base leading-relaxed text-zinc-900 shadow-sm sm:p-5">
        {phase === 'sciana' || phase === 'dziel' ? (
          <p>
            {SENTENCES.map((sentence, i) => (
              <span key={i}>
                <button
                  type="button"
                  onClick={() => (phase === 'dziel' ? undefined : pickSentence(i))}
                  className={cn(
                    'text-left align-baseline',
                    phase === 'sciana' && 'cursor-pointer rounded-sm hover:bg-amber-100'
                  )}
                >
                  {sentence.text}
                </button>
                {i < SENTENCES.length - 1 &&
                  (phase === 'dziel' ? (
                    <button
                      type="button"
                      onClick={() => toggleBreak(i)}
                      aria-label={`Podziel akapit po zdaniu ${i + 1}`}
                      aria-pressed={breaks.includes(i)}
                      className={cn(
                        'mx-0.5 inline-block h-5 w-5 rounded-sm align-middle text-xs font-bold leading-5',
                        breaks.includes(i)
                          ? 'text-white'
                          : 'bg-zinc-200 text-zinc-500 hover:bg-amber-200'
                      )}
                      style={breaks.includes(i) ? { backgroundColor: color } : undefined}
                    >
                      ¶
                    </button>
                  ) : (
                    ' '
                  ))}
              </span>
            ))}
          </p>
        ) : (
          <div className="space-y-3">
            {paragraphs.map((para, p) => (
              <p key={p}>
                {para.map((sentence, i) => (
                  <span key={i}>
                    <button
                      type="button"
                      onClick={() => pickSentence(SENTENCES.indexOf(sentence))}
                      className="cursor-pointer rounded-sm text-left align-baseline hover:bg-amber-100"
                    >
                      {sentence.text}
                    </button>{' '}
                  </span>
                ))}
              </p>
            ))}
          </div>
        )}
      </div>

      {phase === 'dziel' && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={checkBreaks}
            className="px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            Gotowe, podziel tekst
          </button>
          <span className="text-xs tabular-nums text-muted-foreground">
            wstawione podziały: {breaks.length}
          </span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {note && (
          <motion.p
            key={note}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30"
          >
            {note}
          </motion.p>
        )}
        {miss && searching && (
          <motion.p
            key="miss"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-muted-foreground"
          >
            Nie w tym zdaniu — szukaj dalej. Stoper nadal chodzi.
          </motion.p>
        )}
        {phase === 'akapity' && asked === 0 && !miss && (
          <motion.p
            key="po"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex items-start gap-2 text-sm leading-relaxed"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            <span>
              Ten sam tekst, te same słowa — tylko w czterech akapitach. Trzy ostatnie pytania i
              porównamy czasy.
            </span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
  note,
}: {
  label: string;
  value: string;
  color: string;
  note: string;
}) {
  return (
    <div className="border-l-2 p-3" style={{ borderColor: color }}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tabular-nums" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
