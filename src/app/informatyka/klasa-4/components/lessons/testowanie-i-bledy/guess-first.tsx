'use client';

import { useState, type ReactNode } from 'react';
import { Check, Flag, MoveRight, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { Script } from '../../scratch/loop-stack';
import { StageView } from '../../scratch/stage-view';
import { useProgram } from '../../scratch/use-program';
import { HOME, make, type Block } from '../../scratch/engine';

/**
 * Blok 1 — **przepowiednia postawiona na scenie, zanim program ruszy**.
 *
 * Wymaganie `[2.2]` brzmi „porównuje działanie programu z przyjętymi
 * założeniami”. Założenie, które powstaje *po* uruchomieniu, nie jest założeniem
 * — dziecko zawsze uzna, że tak właśnie myślało. Dlatego tutaj przepowiednia
 * jest **przedmiotem na scenie**: bladym duszkiem postawionym palcem w miejscu,
 * w którym kot ma skończyć. Po uruchomieniu oba stoją obok siebie i różnicy nie
 * da się przegadać.
 *
 * Trzy rundy to trzy różne powody, dla których program robi co innego, niż się
 * wydaje: nic (rozgrzewka), kierunek (kroki idą tam, gdzie patrzy nos — lekcja
 * 25) i pętla (cztery razy „idź i skręć” to kwadrat, czyli powrót na start).
 * Rozgrzewka jest potrzebna: bez rundy, w której przepowiednia się zgadza,
 * blok uczyłby, że program zawsze oszukuje.
 */

interface Round {
  id: string;
  title: string;
  /** Co program ma robić — opis zamiaru autora, nigdy odpowiedzi. */
  plan: string;
  stack: Block[];
  /** Zdanie po odsłonięciu — wyjaśnia, skąd wziął się wynik. */
  reveal: ReactNode;
}

const ROUNDS: Round[] = [
  {
    id: 'prosto',
    title: 'Rozgrzewka',
    plan: 'Kot ma przejść kawałek w prawo, przystanąć i przejść jeszcze raz tyle samo.',
    stack: [make('flaga'), make('idz', 100), make('czekaj', 1), make('idz', 100)],
    reveal: (
      <>
        Dwa razy po sto kroków w prawo — czyli dokładnie to, co widać w klockach. Ten program nie
        ma w sobie żadnej pułapki. <strong>Dopóki program robi to, co mówią jego klocki, nie masz
        czego szukać</strong> — dlatego szukanie zaczyna się od przepowiedni, a nie od patrzenia na
        scenę.
      </>
    ),
  },
  {
    id: 'zakret',
    title: 'Zakręt',
    plan: 'Kot ma przejść w prawo, obrócić się i przejść jeszcze dalej.',
    stack: [make('flaga'), make('idz', 100), make('czekaj', 1), make('obroc', 90), make('idz', 120)],
    reveal: (
      <>
        Kroki idą <strong>tam, gdzie patrzy nos duszka</strong>. Po obrocie w prawo kot patrzy w
        dół, więc „przesuń o 120 kroków” zabiera go w dół, a nie dalej w prawo. Klocek zrobił
        dokładnie to, co miał zrobić — to <strong>zamiar</strong> był inny niż zapis.
      </>
    ),
  },
  {
    id: 'kwadrat',
    title: 'Cztery razy to samo',
    plan: 'Kot ma cztery razy przejść kawałek i za każdym razem skręcić w prawo.',
    stack: [
      make('flaga'),
      make('powtorz', 4, [make('idz', 80), make('obroc', 90)]),
      make('powiedz', 'koniec'),
    ],
    reveal: (
      <>
        Kot wrócił <strong>dokładnie tam, skąd wyszedł</strong>. Cztery razy „idź i skręć w prawo”
        to kwadrat, a kwadrat kończy się w punkcie startu. Program działa bez zarzutu — tylko po
        jego uruchomieniu wygląda to tak, jakby nic się nie stało.
      </>
    ),
  },
];

/** Dalej niż tyle od prawdziwego końca uznajemy za chybienie — to ćwierć szerokości sceny. */
const HIT = 45;

interface GuessFirstProps {
  color: string;
  onComplete?: () => void;
}

export function GuessFirst({ color, onComplete }: GuessFirstProps) {
  const [at, setAt] = useState(0);
  const [guess, setGuess] = useState<{ x: number; y: number } | null>(null);
  const [hits, setHits] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);

  const round = ROUNDS[at];
  const program = useProgram(round.stack, HOME);
  const anchorRef = useSectionScrollAnchor(`${at}-${done}`);

  const shown = program.finished;
  const end = program.sprite;
  const distance = guess ? Math.round(Math.hypot(guess.x - end.x, guess.y - end.y)) : 0;
  const hit = distance <= HIT;

  const check = () => {
    if (!guess) return;
    program.start();
  };

  /* Wynik rundy zapisujemy dopiero przy przejściu dalej — inaczej licznik rósłby przy każdym renderze. */
  const next = () => {
    setHits((current) => [...current, hit]);
    if (at + 1 < ROUNDS.length) {
      setAt(at + 1);
      setGuess(null);
      program.clear();
      return;
    }
    setDone(true);
    onComplete?.();
  };

  if (done) {
    const score = hits.filter(Boolean).length;
    return (
      <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/60 sm:p-5">
        <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
          <Check className="h-4 w-4 shrink-0" aria-hidden />
          Trzy programy za tobą. Trafione przepowiednie: {score} z {ROUNDS.length}.
        </p>
        <p className="mt-2 text-sm leading-relaxed">
          Liczba trafień nie ma tu znaczenia — liczy się to, że <strong>za każdym razem najpierw
          powiedziałeś/powiedziałaś, co ma się stać</strong>. To jest test. Uruchomienie programu i
          popatrzenie, co z tego wyszło, testem nie jest: cokolwiek się wydarzy, głowa zaraz uzna,
          że przecież tak właśnie miało być.
        </p>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/60 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm font-semibold">
          Program {at + 1} z {ROUNDS.length} — {round.title}
        </p>
        <p className="text-xs text-muted-foreground">postaw bladego kota tam, gdzie skończy</p>
      </div>

      <p className="mb-4 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
        <strong>Zamiar autora:</strong> {round.plan}
      </p>

      <div className="space-y-4 lg:grid lg:gap-5 lg:space-y-0 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div>
          <StageView
            actors={[{ id: 'kot', kind: 'kot', sprite: end }]}
            ghosts={guess ? [{ kind: 'kot', x: guess.x, y: guess.y }] : undefined}
            grid
            running={program.running}
            onStagePointer={
              shown || program.running
                ? undefined
                : (point) => setGuess({ x: point.x, y: point.y })
            }
            note={
              shown
                ? 'po uruchomieniu'
                : guess
                  ? 'przepowiednia postawiona'
                  : 'stuknij w scenę'
            }
          />
          {!shown && (
            <button
              type="button"
              onClick={check}
              disabled={!guess}
              className="mx-auto mt-2 flex w-full max-w-[340px] cursor-pointer items-center justify-center gap-1.5 border py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: color, borderColor: color }}
            >
              <Flag className="h-4 w-4" aria-hidden />
              {guess ? 'Teraz uruchom program' : 'Najpierw postaw przepowiednię'}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="overflow-x-auto pb-1">
            <Script blocks={round.stack} />
          </div>

          {shown && guess && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="border p-2">
                  <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <Target className="h-3 w-3 shrink-0" aria-hidden /> twoja przepowiednia
                  </p>
                  <p className="mt-0.5 font-mono tabular-nums">
                    x: {guess.x}, y: {guess.y}
                  </p>
                </div>
                <div className="border p-2">
                  <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <MoveRight className="h-3 w-3 shrink-0" aria-hidden /> naprawdę
                  </p>
                  <p className="mt-0.5 font-mono tabular-nums">
                    x: {Math.round(end.x)}, y: {Math.round(end.y)}
                  </p>
                </div>
              </div>

              <div
                className={cn('p-3', hit ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-amber-50 dark:bg-amber-950/30')}
              >
                <p className="text-sm font-semibold">
                  {hit
                    ? 'Trafione — program zrobił to, czego się spodziewałeś/spodziewałaś.'
                    : `Rozjechało się o ${distance} kroków.`}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed">{round.reveal}</p>
              </div>

              <button
                type="button"
                onClick={next}
                className="w-full cursor-pointer border py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
              >
                {at + 1 < ROUNDS.length ? 'Następny program' : 'Skończ blok'}
              </button>
            </div>
          )}

          {!shown && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Przeczytaj klocki i <strong className="text-foreground">powiedz z góry</strong>, gdzie
              kot stanie na końcu. Blady kot na scenie to twoja odpowiedź — możesz go przestawiać,
              dopóki nie uruchomisz programu.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
