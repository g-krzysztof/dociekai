'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Mic, Play, SkipForward, Timer, Trash2 } from 'lucide-react';

import { SlideContentView, SlideStage, words, type SlideContent } from './slide-view';

/**
 * Blok 3 — **próba generalna**, czyli jedyny sposób, żeby „plan wystąpienia”
 * przestał być słowem.
 *
 * Dziecko czyta notatki mówcy **na głos** i samo klika „następny slajd”. Nikt
 * mu tempa nie narzuca — i o to chodzi: **rytm nadaje jego własny palec**, a
 * strona tylko mierzy. Na końcu dostaje oś czasu swojego wystąpienia, na której
 * widać to, czego przy pisaniu slajdów nie widać nigdy: ile naprawdę trwa
 * powiedzenie tego, co się ma do powiedzenia.
 *
 * Dwie rzeczy, które ten blok robi inaczej niż „zmierz sobie czas”:
 *
 * - **Porównanie z długością notatek.** Każdy slajd ma policzone, ile sekund
 *   trwa wypowiedzenie tego, co przy nim napisano (2,5 wyrazu na sekundę). Slajd,
 *   na którym dziecko stało 3 sekundy, mając 12 sekund tekstu, dostaje osobne
 *   zdanie — bez oceniania, bo strona nie wie, czy ktoś naprawdę mówił. Liczby
 *   mówią same.
 * - **Slajd bez ani jednego zdania do powiedzenia nie jest slajdem.** Przed próbą
 *   dziecko wyrzuca z pokazu „Dziękuję za uwagę!”, na którym mówca nie ma nic do
 *   roboty. To jest cała nauka o planie: plan robi się z tego, co powiesz, a
 *   slajdy dokłada się dopiero potem.
 */

/**
 * Slajd w próbie generalnej. **Ten sam kształt niesie prezentacja z lekcji i
 * prezentacja dziecka wczytana z pliku** — dzięki temu zegar z tego bloku da się
 * w zadaniu wycelować w jego własną pracę, zamiast pisać go drugi raz.
 */
export interface TalkSlide {
  id: string;
  title: string;
  lines: string[];
  picture?: SlideContent['picture'];
  /** To, co mówca mówi przy tym slajdzie. Pusto = slajd bez treści. */
  notes: string;
}

interface DeckSlide extends TalkSlide {
  role: string;
}

const DECK: DeckSlide[] = [
  {
    id: 'tytul',
    role: 'Slajd tytułowy — kto mówi i o czym',
    title: 'Jeż w naszym ogrodzie',
    lines: ['Opowiada: Ty', 'Dla klasy 4'],
    notes:
      'Cześć! Opowiem wam dzisiaj o jeżu, który od wiosny mieszka w naszym ogrodzie. Widziałem go trzy razy, zawsze wieczorem.',
  },
  {
    id: 'plan',
    role: 'O czym powiem — plan dla widza',
    title: 'O czym powiem',
    lines: ['Jak wygląda', 'Co je', 'Jak mu pomóc'],
    notes: 'Powiem wam trzy rzeczy: jak jeż wygląda, co je i czego nigdy nie wolno mu dawać.',
  },
  {
    id: 'wyglad',
    role: 'Treść — jedna myśl',
    title: 'Jak wygląda',
    lines: ['Nocne zwierzę', '7000 kolców'],
    picture: 'jez',
    notes:
      'Jeż jest zwierzęciem nocnym — w dzień śpi, a po ogrodzie chodzi dopiero po zmroku. Na grzbiecie ma około siedmiu tysięcy kolców i wymienia je przez całe życie, tak jak my wymieniamy włosy.',
  },
  {
    id: 'jedzenie',
    role: 'Treść — jedna myśl',
    title: 'Co je',
    lines: ['Ślimaki, dżdżownice, owady', 'Zimą śpi i nic nie je'],
    picture: 'ogrod',
    notes:
      'Najchętniej zjada ślimaki, dżdżownice i owady, dlatego ogrodnicy bardzo się z niego cieszą. Od listopada do marca zapada w sen zimowy i przez całą zimę nic nie je, więc jesienią musi porządnie przytyć.',
  },
  {
    id: 'dziekuje',
    role: 'Slajd, przy którym mówca milczy',
    title: 'Dziękuję za uwagę!',
    lines: [],
    notes: '',
  },
  {
    id: 'koniec',
    role: 'Jedno zdanie, które ma zostać w głowie',
    title: 'Nigdy mleka',
    lines: ['Jeżowi postaw miskę z wodą'],
    notes:
      'Na koniec jedna rzecz, o której chcę, żebyście pamiętali: jeżowi nie wolno dawać mleka. Wypije je, ale potem bardzo choruje. Jeśli chcecie mu pomóc, postawcie miskę z czystą wodą.',
  },
];

/** Mowa idzie ~2,5 wyrazu na sekundę — ta sama stała co przy notatkach w bloku 2. */
const WORDS_PER_SECOND = 2.5;

export function speechSeconds(slide: TalkSlide): number {
  return Math.round(words(slide.notes) / WORDS_PER_SECOND);
}

export function clock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds) % 60).padStart(2, '0')}`;
}

/**
 * Blok 3 w całości: najpierw plan (wyrzucenie slajdu bez treści), potem próba.
 */
export function DressRehearsal({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [dropped, setDropped] = useState<string[]>([]);
  const [planned, setPlanned] = useState(false);
  const deck = DECK.filter((slide) => !dropped.includes(slide.id));
  const emptyGone = dropped.includes('dziekuje');

  if (!planned)
    return (
      <PlanView
        color={color}
        dropped={dropped}
        emptyGone={emptyGone}
        onDrop={(id) => setDropped((current) => [...current, id])}
        onStart={() => setPlanned(true)}
      />
    );

  return (
    <RehearsalRunner
      color={color}
      slides={deck}
      onFinish={onComplete}
      note="Pięć slajdów z twoimi notatkami to tyle mówienia, ile pokazuje zegar — a przerwa między lekcjami trwa 10 minut."
    />
  );
}

/**
 * Silnik próby generalnej: pokaz slajd po slajdzie, zegar na każdym i oś czasu
 * na końcu. **Bierze dowolne slajdy**, więc w zadaniu praktycznym wchodzi w
 * prezentację dziecka wczytaną z pliku — tym samym narzędziem, którym ćwiczyło
 * w tym bloku.
 */
export function RehearsalRunner({
  color,
  slides,
  onFinish,
  note,
  startLabel = 'Zacznij próbę generalną',
}: {
  color: string;
  slides: TalkSlide[];
  onFinish?: () => void;
  note?: string;
  startLabel?: string;
}) {
  const [phase, setPhase] = useState<'ready' | 'running' | 'done'>('ready');
  const [index, setIndex] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [now, setNow] = useState(0);
  const started = useRef(0);
  const reported = useRef(false);

  useEffect(() => {
    if (phase !== 'running') return;
    const id = window.setInterval(() => setNow(Date.now() - started.current), 100);
    return () => window.clearInterval(id);
  }, [phase, index]);

  const start = () => {
    setTimes([]);
    setIndex(0);
    setNow(0);
    started.current = Date.now();
    setPhase('running');
  };

  const next = () => {
    const spent = (Date.now() - started.current) / 1000;
    setTimes((current) => [...current, spent]);
    if (index + 1 >= slides.length) {
      setPhase('done');
      if (!reported.current) {
        reported.current = true;
        onFinish?.();
      }
      return;
    }
    setIndex(index + 1);
    setNow(0);
    started.current = Date.now();
  };

  if (phase === 'ready')
    return (
      <div className="border bg-white p-5 text-center dark:bg-zinc-900/80 sm:p-6">
        <p className="text-sm leading-relaxed">
          Pokaz idzie slajd po slajdzie. Przy każdym <strong>przeczytaj notatki na głos</strong>, tak jakbyś naprawdę
          mówił/mówiła do sali, a potem kliknij „następny slajd”. Tempo ustalasz ty — ja tylko mierzę.
        </p>
        <button
          type="button"
          onClick={start}
          className="mx-auto mt-3 flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          style={{ borderColor: color, color }}
        >
          <Play className="h-4 w-4" aria-hidden />
          {startLabel}
        </button>
      </div>
    );

  if (phase === 'running') {
    const slide = slides[index];
    return (
      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            Slajd {index + 1} z {slides.length}
          </p>
          <p className="flex items-center gap-1.5 font-mono text-lg font-bold tabular-nums" style={{ color }}>
            <Timer className="h-4 w-4" aria-hidden />
            {clock(now / 1000)}
          </p>
        </div>

        <SlideStage maxWidth={560}>
          <SlideContentView title={slide.title} lines={slide.lines} picture={slide.picture} accent={color} />
        </SlideStage>

        <div className="mx-auto mt-3 max-w-[560px] border-l-2 bg-muted/40 p-3" style={{ borderColor: color }}>
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            <Mic className="h-3.5 w-3.5" aria-hidden />
            Mówisz
          </p>
          <p className="text-sm leading-relaxed">
            {slide.notes || <span className="text-muted-foreground">Przy tym slajdzie nie masz nic zapisanego.</span>}
          </p>
        </div>

        <button
          type="button"
          onClick={next}
          className="mx-auto mt-4 flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          style={{ borderColor: color, color }}
        >
          {index + 1 >= slides.length ? 'Koniec wystąpienia' : 'Powiedziałem/powiedziałam — następny slajd'}
          <SkipForward className="h-4 w-4" aria-hidden />
        </button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Czytaj na głos, nie po cichu. Zegar nie ma czego mierzyć, jeśli nic nie mówisz.
        </p>
      </div>
    );
  }

  return <ResultView color={color} slides={slides} times={times} note={note} onAgain={start} />;
}

function PlanView({
  color,
  dropped,
  emptyGone,
  onDrop,
  onStart,
}: {
  color: string;
  dropped: string[];
  emptyGone: boolean;
  onDrop: (id: string) => void;
  onStart: () => void;
}) {
  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        Tak wygląda gotowa prezentacja o jeżu — sześć slajdów, każdy z notatkami mówcy. Zanim ją wygłosisz, jedna rzecz
        do zrobienia: <strong>wyrzuć slajd, przy którym nie masz nic do powiedzenia</strong>. Taki slajd zabiera widzowi
        czas i nie daje nic w zamian.
      </p>

      <ul className="mt-4 space-y-2">
        {DECK.filter((slide) => !dropped.includes(slide.id)).map((slide, position) => {
          const seconds = speechSeconds(slide);
          return (
            <li key={slide.id} className="flex items-start gap-3 border p-3">
              <span className="w-6 shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
                {String(position + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{slide.title}</span>
                <span className="block text-xs text-muted-foreground">{slide.role}</span>
                <span className="mt-1 block text-xs">
                  {seconds > 0 ? (
                    <>
                      Do powiedzenia: <strong className="tabular-nums">{seconds} s</strong>
                    </>
                  ) : (
                    <strong style={{ color: '#c2410c' }}>Notatki mówcy: pusto</strong>
                  )}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onDrop(slide.id)}
                aria-label={`Wyrzuć slajd „${slide.title}”`}
                className="shrink-0 cursor-pointer border p-1.5 text-muted-foreground transition-colors hover:border-current hover:text-primary"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      {dropped.length > 0 && !emptyGone && (
        <p className="mt-3 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30">
          Ten slajd akurat miał co mówić — wyrzucanie treści to nie to samo co wyrzucanie pustego miejsca. Szukaj tego,
          przy którym <strong>mówca stoi i milczy</strong>.
        </p>
      )}

      {emptyGone && (
        <p className="mt-3 p-3 text-sm leading-relaxed" style={{ backgroundColor: `${color}12` }}>
          „Dziękuję za uwagę” to zdanie, które <strong>się mówi</strong>, a nie slajd. Widz patrzy wtedy na ekran
          zamiast na ciebie — a ty akurat wtedy mówisz swoją najważniejszą rzecz.
        </p>
      )}

      <button
        type="button"
        onClick={onStart}
        disabled={!emptyGone}
        className="mt-4 flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        style={{ borderColor: color, color }}
      >
        <Play className="h-4 w-4" aria-hidden />
        Przejdź do próby generalnej
      </button>
    </div>
  );
}

function ResultView({
  color,
  slides,
  times,
  note,
  onAgain,
}: {
  color: string;
  slides: TalkSlide[];
  times: number[];
  note?: string;
  onAgain: () => void;
}) {
  const total = times.reduce((sum, value) => sum + value, 0);
  const longest = times.indexOf(Math.max(...times));
  const rushed = slides
    .map((slide, position) => ({ slide, spent: times[position] ?? 0, need: speechSeconds(slide) }))
    .filter((row) => row.need >= 6 && row.spent < row.need * 0.45);
  const scale = Math.max(...times, ...slides.map(speechSeconds), 1);

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
        <Check className="h-4 w-4 shrink-0" aria-hidden />
        Twoje wystąpienie trwało {clock(total)}.
      </p>

      <div className="mt-4 space-y-3">
        {slides.map((slide, position) => {
          const spent = times[position] ?? 0;
          const need = speechSeconds(slide);
          return (
            <div key={slide.id}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium">
                  {position + 1}. {slide.title}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {Math.round(spent)} s <span className="opacity-60">/ tekst na {need} s</span>
                </span>
              </div>
              <div className="mt-1 space-y-[3px]">
                <div
                  className="h-2.5"
                  style={{ width: `${(spent / scale) * 100}%`, backgroundColor: color, minWidth: 2 }}
                />
                <div className="h-1 bg-muted-foreground/35" style={{ width: `${(need / scale) * 100}%`, minWidth: 2 }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Gruby pasek — ile stałeś/stałaś na slajdzie. Cienki pod nim — ile trwa wypowiedzenie tego, co przy nim
        napisano.
      </p>

      <div className="mt-4 space-y-2 p-4 text-sm leading-relaxed" style={{ backgroundColor: `${color}12` }}>
        {rushed.length > 0 ? (
          <p>
            Przez {rushed.length === 1 ? 'slajd' : 'slajdy'}{' '}
            <strong>{rushed.map((row) => `„${row.slide.title}”`).join(', ')}</strong> przeleciałeś/przeleciałaś
            szybciej, niż da się wypowiedzieć to, co masz przy nich do powiedzenia. Jeśli czytałeś/czytałaś po cichu —
            powtórz próbę na głos, bo <strong>widz słucha w tempie mowy, nie czytania</strong>.
          </p>
        ) : (
          <p>
            Tempo się zgadza: na każdym slajdzie byłeś/byłaś mniej więcej tyle, ile trwa powiedzenie tego, co przy nim
            napisane. <strong>To jest cała próba generalna</strong> — nie sprawdza slajdów, tylko ciebie przy nich.
          </p>
        )}
        <p>
          Najdłużej stałeś/stałaś przy slajdzie <strong>„{slides[longest]?.title}”</strong>.{' '}
          {note ?? 'Slajdów nie liczy się na sztuki, tylko na sekundy.'}
        </p>
      </div>

      <button
        type="button"
        onClick={onAgain}
        className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
      >
        <Play className="h-3 w-3" aria-hidden />
        Zrób próbę jeszcze raz
      </button>
    </div>
  );
}
