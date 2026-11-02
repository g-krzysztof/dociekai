'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Ćwiczenie o listach — **maszyna psuje, a dziecko ocenia szkodę**.
 *
 * Różnicy między listą numerowaną a wypunktowaną nie da się zapamiętać z
 * definicji, bo obie wyglądają tak samo i obie „wyliczają”. Da się ją za to
 * **sprawdzić jednym ruchem**: przetasować pozycje. Jeśli po przetasowaniu lista
 * dalej ma sens — kolejność nie miała znaczenia i należą się kropki. Jeśli
 * wyszedł nonsens — kolejność jest treścią i należą się numery.
 *
 * To jest w kursie nowy rodzaj interakcji: **to widżet wykonuje destrukcyjną
 * operację, a dziecko ogląda skutek i wyciąga wniosek**. Nie ma tu pytania o
 * wiedzę — jest pytanie o to, co się właśnie stało na ekranie.
 *
 * Tasowanie jest deterministyczne (własny generator na `seed`), więc wynik jest
 * powtarzalny i identyczny na serwerze i w przeglądarce; funkcja pilnuje też,
 * żeby układ naprawdę różnił się od wyjściowego — przetasowanie, które niczego
 * nie zmieniło, zepsułoby cały sens bloku.
 */

interface ListCase {
  id: string;
  title: string;
  items: string[];
  /** Czy kolejność jest treścią tej listy. */
  ordered: boolean;
  /** Zdanie po trafieniu — mówi, co z tego wynika. */
  learned: string;
  /** Podpowiedź po nietrafieniu, wskazująca konkretne miejsce. */
  hint: string;
}

const CASES: ListCase[] = [
  {
    id: 'nalesniki',
    title: 'Jak zrobić naleśniki',
    items: [
      'Wymieszaj mąkę z mlekiem i jajkiem',
      'Rozgrzej patelnię',
      'Wylej porcję ciasta na patelnię',
      'Przewróć naleśnik na drugą stronę',
      'Zdejmij naleśnik na talerz',
    ],
    ordered: true,
    learned:
      'Kolejność JEST treścią: nie da się przewrócić naleśnika, zanim się go wyleje na patelnię. Taka lista dostaje numery — one mówią czytelnikowi „rób po kolei”.',
    hint: 'Spójrz na pozycję, która wylądowała jako pierwsza. Da się ją wykonać, zanim zrobisz wszystkie pozostałe?',
  },
  {
    id: 'plecak',
    title: 'Co zabrać na wycieczkę',
    items: [
      'drugie śniadanie',
      'butelka wody',
      'wygodne buty',
      'peleryna przeciwdeszczowa',
      'legitymacja szkolna',
    ],
    ordered: false,
    learned:
      'Nic się nie stało — do plecaka można pakować w dowolnej kolejności. Taka lista dostaje kropki (punktory), bo numery kłamałyby, że coś trzeba robić po kolei.',
    hint: 'Przeczytaj przetasowaną listę jeszcze raz. Czy cokolwiek się w niej zepsuło, czy to po prostu ta sama zawartość plecaka?',
  },
  {
    id: 'biblioteka',
    title: 'Zasady w bibliotece',
    items: [
      'Oddajemy książki na czas',
      'Nie zaginamy rogów stron',
      'Mówimy ciszej niż w klasie',
      'Jemy i pijemy poza czytelnią',
    ],
    ordered: false,
    learned:
      'Zasady obowiązują wszystkie naraz, nie jedna po drugiej — więc kropki. Gdyby stały pod numerami, ktoś mógłby pomyśleć, że zasada 1 jest ważniejsza od 4 albo że trzeba je stosować kolejno.',
    hint: 'Czy któraś z tych zasad przestaje obowiązywać przez to, że stoi teraz niżej?',
  },
  {
    id: 'dziennik',
    title: 'Jak zalogować się do dziennika',
    items: [
      'Wejdź na stronę szkoły',
      'Kliknij przycisk „Dziennik”',
      'Wpisz swój login i hasło',
      'Kliknij „Zaloguj”',
    ],
    ordered: true,
    learned:
      'Instrukcja to zawsze numery. Tu widać to najostrzej: nie da się wpisać hasła, zanim otworzy się okno logowania — a przetasowana lista każe właśnie tak zrobić.',
    hint: 'W którym miejscu przetasowana lista każe kliknąć coś, czego jeszcze nie ma na ekranie?',
  },
];

/** Deterministyczny generator — ten sam wynik na serwerze i w przeglądarce. */
function shuffle(items: string[], seed: number): string[] {
  const out = [...items];
  let state = seed;
  const next = () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  /* Przetasowanie, które niczego nie zmieniło, zepsułoby cały sens bloku. */
  if (out.every((item, i) => item === items[i])) return shuffle(items, seed + 7);
  return out;
}

type Stage = 'przed' | 'po' | 'wyjasnione';

interface ShuffleTestProps {
  color: string;
  onComplete?: () => void;
}

export function ShuffleTest({ color, onComplete }: ShuffleTestProps) {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('przed');
  const [note, setNote] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(`${index}-${stage}-${done}`);
  const item = CASES[index];
  const mixed = shuffle(item.items, index * 31 + 17);

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const judge = (stillMakesSense: boolean) => {
    /* „Ma sens po przetasowaniu” znaczy dokładnie „kolejność nie jest treścią”. */
    if (stillMakesSense === !item.ordered) {
      setStage('wyjasnione');
      setNote(null);
      return;
    }
    setNote(item.hint);
  };

  const nextCase = () => {
    if (index === CASES.length - 1) {
      setDone(true);
      return;
    }
    setIndex(index + 1);
    setStage('przed');
    setNote(null);
  };

  if (done) {
    return (
      <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <p className="text-sm font-semibold sm:text-base" style={{ color }}>
          Cztery listy, jeden test.
        </p>
        <p className="mt-2 text-sm leading-relaxed sm:text-base">
          Zanim wybierzesz rodzaj listy, zrób w głowie to samo, co robił tu przycisk:{' '}
          <strong>przetasuj pozycje</strong>.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="border-l-2 p-3" style={{ borderColor: color }}>
            <p className="text-sm font-semibold">Wyszedł nonsens → numery</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Przepisy, instrukcje, etapy pracy. Numer jest tu informacją: „to robisz jako trzecie”.
            </p>
          </div>
          <div className="border-l-2 p-3" style={{ borderColor: color }}>
            <p className="text-sm font-semibold">Dalej ma sens → kropki</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Spisy rzeczy, zasady, składniki, cechy. Kropka mówi tylko „to osobna pozycja” i niczego
              nie obiecuje.
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Dlatego numerowanie listy zakupów jest drobnym kłamstwem — sugeruje, że chleb trzeba kupić
          przed mlekiem. A instrukcja z kropkami zamiast numerów zabiera czytelnikowi jedyną rzecz,
          której naprawdę potrzebuje.
        </p>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">{item.title}</p>
        <p className="text-xs tabular-nums text-muted-foreground">
          lista {index + 1} z {CASES.length}
        </p>
      </div>

      <div className="border bg-white p-4 font-serif text-base text-zinc-900 shadow-sm sm:p-5">
        <ul className="space-y-1.5">
          {(stage === 'przed' ? item.items : mixed).map((text, i) => (
            <li key={text} className="flex gap-2.5">
              <span
                className="shrink-0 tabular-nums"
                style={{ color: stage === 'wyjasnione' ? color : '#71717a' }}
              >
                {stage === 'wyjasnione' ? (item.ordered ? `${i + 1}.` : '•') : '—'}
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {stage === 'przed' && (
        <button
          type="button"
          onClick={() => setStage('po')}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          <Shuffle className="h-4 w-4" aria-hidden />
          Przetasuj pozycje
        </button>
      )}

      {stage === 'po' && (
        <div className="mt-3">
          <p className="mb-2 text-sm font-semibold">
            Przetasowane. Czy ta lista nadal ma sens?
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => judge(true)}
              className={cn('border-2 px-3 py-2 text-sm font-medium transition hover:bg-black/5 dark:hover:bg-white/5')}
              style={{ borderColor: `${color}55` }}
            >
              Tak, dalej ma sens
            </button>
            <button
              type="button"
              onClick={() => judge(false)}
              className={cn('border-2 px-3 py-2 text-sm font-medium transition hover:bg-black/5 dark:hover:bg-white/5')}
              style={{ borderColor: `${color}55` }}
            >
              Nie, wyszedł nonsens
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {stage === 'wyjasnione' ? (
          <motion.div
            key="wyjasnione"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>{item.learned}</span>
            </p>
            <button
              type="button"
              onClick={nextCase}
              className="mt-3 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {index === CASES.length - 1 ? 'Podsumowanie' : 'Następna lista'}
            </button>
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
