'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Check, ChevronLeft, ChevronRight, Eye, Flag, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { Script } from '../../scratch/loop-stack';
import { StageView } from '../../scratch/stage-view';
import { HOME, applyBlock, make, type Block, type Sprite } from '../../scratch/engine';

/**
 * Blok 3 — **program przewijany jak film**, klocek po klocku, z podglądem
 * stanu duszka obok sceny.
 *
 * Dwie rzeczy, których nie da się zobaczyć przy zwykłym uruchomieniu, a od
 * których zależy całe szukanie usterki:
 *
 * 1. **Zmiana, po której na scenie nic się nie dzieje.** „Ustaw styl obrotu”
 *    wygląda jak klocek, który nic nie robi — skutek widać dopiero cztery klocki
 *    dalej, gdy kot pierwszy raz idzie w lewo. Dlatego obok sceny stoi tabliczka
 *    ze stanem duszka (x, y, kierunek, styl) i **podświetla to, co się właśnie
 *    zmieniło**. Objaw i przyczyna leżą w dwóch różnych miejscach i to jest
 *    pierwsza rzecz, jakiej uczy debugowanie.
 * 2. **Drugie uruchomienie.** Oś czasu drugiej rundy obejmuje **dwa przebiegi
 *    tego samego skryptu**, bo zielona flaga w prawdziwym Scratchu niczego nie
 *    ustawia na start: duszek zostaje tam, gdzie zostawił go poprzedni przebieg.
 *    (Nasza makieta z lekcji 24 robi inaczej i mówi o tym wprost — tutaj
 *    liczymy przebieg sami, właśnie po to, żeby pokazać prawdę o Scratchu.)
 *
 * Odpowiedź ma dwa kroki i to jest cała metoda: najpierw **gdzie** pierwszy raz
 * się nie zgadza, potem **przez co**. W drugiej rundzie winnego klocka nie ma —
 * jest brak klocka, i taka odpowiedź też musi być do wybrania, bo w prawdziwym
 * programie zdarza się częściej niż klocek zepsuty.
 */

interface Tick {
  run: number;
  /** Indeks klocka w stosie; kapelusz (0) to moment kliknięcia flagi. */
  at: number;
  sprite: Sprite;
}

type Answer = number | 'brak';

interface Round {
  id: string;
  title: string;
  plan: ReactNode;
  stack: Block[];
  /** Stan duszka zastany w projekcie — nie zawsze jest nim `HOME`. */
  home?: Sprite;
  runs: number;
  /** Pierwszy tick, na którym scena rozjeżdża się z planem. */
  firstWrong: number;
  /** Poprawna odpowiedź na pytanie „przez co”. */
  culprit: Answer;
  /** Zdanie po wskazaniu właściwego miejsca rozjazdu. */
  foundNote: ReactNode;
  /** Zdanie po wskazaniu winnego. */
  culpritNote: ReactNode;
  /** Co powiedzieć, gdy dziecko wskaże niewinny klocek. */
  wrongCulprit: (block: Block) => ReactNode;
}

const ROUNDS: Round[] = [
  {
    id: 'na-glowie',
    title: 'Kot na głowie',
    plan: (
      <>
        Kot ma przejść w prawo, zawrócić i pójść w lewo — <strong>i przez cały czas iść normalnie,
        na łapach</strong>.
      </>
    ),
    /*
     * Duszek przychodzi ze stylem „lewo-prawo” ustawionym w panelu duszka, a
     * skrypt zmienia go na „dowolny” — inaczej pierwszy klocek nie zmieniałby
     * niczego i tabliczka stanu nie miałaby czego podświetlić, czyli cała runda
     * straciłaby sens.
     */
    home: { ...HOME, rotationStyle: 'lewo-prawo' },
    stack: [
      make('flaga'),
      make('styl', 'dowolny'),
      make('wroc'),
      make('idz', 120),
      make('czekaj', 1),
      make('kierunek', -90),
      make('idz', 200),
      make('powiedz', 'koniec'),
    ],
    runs: 1,
    /* Tick 5 to wykonanie klocka nr 5 — kot pierwszy raz stoi głową w dół. */
    firstWrong: 5,
    culprit: 1,
    foundNote: (
      <>
        Tak. Kot stanął na głowie dokładnie po klocku „ustaw kierunek na -90”. Ale{' '}
        <strong>ten klocek nie jest winny</strong> — kot ma iść w lewo, więc ustawienie kierunku
        było w porządku. Winny jest inny, wcześniejszy: ten, po którym{' '}
        <strong>na scenie nie było widać nic</strong>.
      </>
    ),
    culpritNote: (
      <>
        „Ustaw styl obrotu <strong>dowolny</strong>” — klocek, który przy wykonaniu nie ruszył ani
        jednego piksela sceny. Zmienił tylko <strong>stan</strong> duszka: od tej chwili kot ma się
        obracać w dowolną stronę. Skutek pojawił się cztery klocki później.{' '}
        <strong>Objaw i przyczyna prawie nigdy nie leżą w tym samym miejscu</strong> — dlatego
        szuka się, cofając od objawu, a nie patrząc tam, gdzie boli.
      </>
    ),
    wrongCulprit: (block) =>
      block.type === 'kierunek' ? (
        <>
          To ten klocek <em>pokazał</em> usterkę, ale jej nie spowodował — kot naprawdę ma iść w
          lewo. Szukaj wyżej: czegoś, co zmieniło stan duszka, choć na scenie nic po tym nie
          było widać.
        </>
      ) : (
        <>
          Przewiń do tego klocka i popatrz na tabliczkę stanu obok sceny: po nim nic się nie
          zmieniło albo zmieniło się to, co miało. Winny klocek zmienia coś, czego{' '}
          <strong>nie widać na scenie</strong>.
        </>
      ),
  },
  {
    id: 'drugi-raz',
    title: 'Drugie kliknięcie flagi',
    plan: (
      <>
        <strong>Po każdym</strong> kliknięciu zielonej flagi kot rusza z lewej krawędzi, przechodzi
        scenę w trzech krokach i melduje, że dotarł.
      </>
    ),
    stack: [
      make('flaga'),
      make('idz', 90),
      make('czekaj', 1),
      make('idz', 90),
      make('czekaj', 1),
      make('idz', 90),
      make('powiedz', 'dotarłem na miejsce'),
    ],
    runs: 2,
    /* Tick 7 to kapelusz drugiego przebiegu: flaga kliknięta, a kot stoi po prawej. */
    firstWrong: 7,
    culprit: 'brak',
    foundNote: (
      <>
        Tu. Flaga kliknięta drugi raz, a kot <strong>nie stoi już na lewej krawędzi</strong> —
        stoi tam, gdzie zostawił go poprzedni przebieg. W prawdziwym Scratchu zielona flaga{' '}
        <strong>niczego nie ustawia na start</strong>; to bardzo częste zaskoczenie.
      </>
    ),
    culpritNote: (
      <>
        Dokładnie tak: <strong>żaden klocek nie jest zepsuty</strong> — brakuje jednego. Program
        nigdy nie mówi kotu, gdzie ma zacząć, więc zaczyna tam, gdzie akurat stoi. Lekarstwem jest
        klocek ustawiający miejsce startu <strong>na samej górze skryptu</strong>, zaraz pod flagą:
        „wróć na start”, a w prawdziwym Scratchu „idź do x: … y: …”.
      </>
    ),
    wrongCulprit: () => (
      <>
        Przewiń jeszcze raz przez pierwszy przebieg: każdy z tych klocków robi dokładnie to, co ma
        robić, i za pierwszym razem wszystko się zgadza. Usterka nie jest w żadnym z nich.
      </>
    ),
  },
];

/** Stan duszka po każdej instrukcji — łącznie z kapeluszem, czyli kliknięciem flagi. */
function trace(stack: Block[], runs: number, home: Sprite = HOME): Tick[] {
  const sprite: Sprite = { ...home };
  const ticks: Tick[] = [];
  for (let run = 0; run < runs; run += 1) {
    for (let at = 0; at < stack.length; at += 1) {
      applyBlock(stack[at], sprite);
      ticks.push({ run, at, sprite: { ...sprite } });
    }
  }
  return ticks;
}

interface StepScrubProps {
  color: string;
  onComplete?: () => void;
}

export function StepScrub({ color, onComplete }: StepScrubProps) {
  const [at, setAt] = useState(0);
  const [pos, setPos] = useState(0);
  const [phase, setPhase] = useState<'szukaj' | 'winny' | 'gotowe'>('szukaj');
  const [miss, setMiss] = useState<ReactNode>(null);
  const [done, setDone] = useState(false);

  const round = ROUNDS[at];
  const ticks = useMemo(() => trace(round.stack, round.runs, round.home), [round]);
  const anchorRef = useSectionScrollAnchor(`${at}-${phase}`);

  const tick = ticks[Math.min(pos, ticks.length - 1)];
  const previous = pos > 0 ? ticks[pos - 1] : null;
  const changed = (read: (sprite: Sprite) => string | number | boolean) =>
    previous != null && read(previous.sprite) !== read(tick.sprite);

  const go = (next: number) => {
    setPos(Math.max(0, Math.min(ticks.length - 1, next)));
    setMiss(null);
  };

  const markHere = () => {
    if (pos === round.firstWrong) {
      setPhase('winny');
      setMiss(null);
      return;
    }
    setMiss(
      pos < round.firstWrong ? (
        <>
          Do tego miejsca wszystko zgadza się z planem — popatrz na scenę i na tabliczkę stanu.
          Przewiń dalej.
        </>
      ) : (
        <>
          Tu już nie gra, ale <strong>nie po raz pierwszy</strong>. Cofnij się i znajdź pierwszy
          taki moment — dalej szukałbyś/szukałabyś usterki w klockach, które są w porządku.
        </>
      )
    );
  };

  const pick = (answer: Answer, block?: Block) => {
    if (answer === round.culprit) {
      setMiss(null);
      setPhase('gotowe');
      if (at + 1 === ROUNDS.length && !done) {
        setDone(true);
        onComplete?.();
      }
      return;
    }
    setMiss(
      answer === 'brak' ? (
        <>Nie tym razem — klocek, który psuje ten program, naprawdę tu jest. Stoi wysoko i po jego wykonaniu na scenie nic się nie dzieje.</>
      ) : (
        round.wrongCulprit(block ?? round.stack[answer])
      )
    );
  };

  const next = () => {
    setAt(at + 1);
    setPos(0);
    setPhase('szukaj');
    setMiss(null);
  };

  const runLabel = round.runs > 1 ? (tick.run === 0 ? 'pierwsze uruchomienie' : 'drugie uruchomienie') : null;

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/60 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm font-semibold">
          Usterka {at + 1} z {ROUNDS.length} — {round.title}
        </p>
        <p className="text-xs text-muted-foreground">nie poprawiaj — najpierw znajdź</p>
      </div>

      <p className="mb-4 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
        <strong>Plan autora:</strong> {round.plan}
      </p>

      <div className="space-y-4 lg:grid lg:gap-5 lg:space-y-0 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div>
          <StageView
            actors={[{ id: 'kot', kind: 'kot', sprite: tick.sprite }]}
            grid
            note={runLabel ?? `klocek ${tick.at}`}
          />

          {/* Tabliczka stanu — pokazuje to, czego scena nie pokazuje. */}
          <div className="mx-auto mt-2 grid max-w-[340px] grid-cols-4 gap-px bg-border">
            {[
              { label: 'x', value: Math.round(tick.sprite.x), read: (s: Sprite) => Math.round(s.x) },
              { label: 'y', value: Math.round(tick.sprite.y), read: (s: Sprite) => Math.round(s.y) },
              { label: 'kierunek', value: tick.sprite.direction, read: (s: Sprite) => s.direction },
              { label: 'styl obrotu', value: tick.sprite.rotationStyle, read: (s: Sprite) => s.rotationStyle },
            ].map((cell) => (
              <div
                key={cell.label}
                className={cn(
                  'bg-white px-1.5 py-1 dark:bg-zinc-900',
                  changed(cell.read) && 'bg-amber-100 dark:bg-amber-900/50'
                )}
              >
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{cell.label}</p>
                <p className="truncate font-mono text-xs font-semibold tabular-nums">{cell.value}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-3 max-w-[340px]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(pos - 1)}
                disabled={pos === 0}
                aria-label="Klocek w tył"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <input
                type="range"
                min={0}
                max={ticks.length - 1}
                value={pos}
                onChange={(event) => go(Number(event.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: color }}
                aria-label="Przewiń program klocek po klocku"
              />
              <button
                type="button"
                onClick={() => go(pos + 1)}
                disabled={pos === ticks.length - 1}
                aria-label="Klocek w przód"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <p className="mt-1 text-center text-[11px] text-muted-foreground">
              krok {pos + 1} z {ticks.length}
              {runLabel ? ` · ${runLabel}` : ''}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="overflow-x-auto pb-1">
            <Script
              blocks={round.stack}
              onBlockDown={
                phase === 'winny' ? (path, block) => pick(Number(path), block) : undefined
              }
              decorate={(path) => {
                const index = Number(path);
                if (phase === 'gotowe' && round.culprit !== 'brak' && index === round.culprit)
                  return { marked: true };
                if (index === tick.at) return { running: true };
                return undefined;
              }}
            />
          </div>

          {phase === 'szukaj' && (
            <>
              <p className="flex items-start gap-1.5 text-sm leading-relaxed">
                <Search className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                <span>
                  Przewijaj program klocek po klocku i po każdym porównuj scenę z planem. Zatrzymaj
                  się w <strong>pierwszym</strong> miejscu, w którym coś się nie zgadza.
                </span>
              </p>
              <button
                type="button"
                onClick={markHere}
                className="w-full cursor-pointer border py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: color, borderColor: color }}
              >
                Tu pierwszy raz się nie zgadza
              </button>
            </>
          )}

          {phase === 'winny' && (
            <>
              <div className="p-3" style={{ backgroundColor: `${color}14` }}>
                <p className="text-sm leading-relaxed">{round.foundNote}</p>
              </div>
              <p className="flex items-start gap-1.5 text-sm leading-relaxed">
                <Eye className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                <span>
                  A teraz drugie pytanie: <strong>przez co</strong>? Stuknij w skrypcie klocek,
                  który to spowodował.
                </span>
              </p>
              <button
                type="button"
                onClick={() => pick('brak')}
                className="w-full cursor-pointer border py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
              >
                Żaden z nich — tu brakuje klocka
              </button>
            </>
          )}

          {phase === 'gotowe' && (
            <div className="space-y-3">
              <div className="p-3" style={{ backgroundColor: `${color}14` }}>
                <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
                  <Check className="h-4 w-4 shrink-0" aria-hidden /> Znalezione.
                </p>
                <p className="mt-1.5 text-sm leading-relaxed">{round.culpritNote}</p>
              </div>
              {at + 1 < ROUNDS.length ? (
                <button
                  type="button"
                  onClick={next}
                  className="w-full cursor-pointer border py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
                >
                  Następna usterka
                </button>
              ) : (
                <p className="flex items-start gap-1.5 text-sm leading-relaxed">
                  <Flag className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  <span>
                    Zapamiętaj ten drugi przebieg — w zadaniu na końcu lekcji sprawdzę twój program
                    dokładnie tak samo: <strong>uruchomię go dwa razy pod rząd</strong>.
                  </span>
                </p>
              )}
            </div>
          )}

          {miss && (
            <div className="border-l-2 border-amber-500 bg-amber-50 p-3 dark:bg-amber-950/30">
              <p className="text-sm leading-relaxed">{miss}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
