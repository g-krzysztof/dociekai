'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Eraser, Play } from 'lucide-react';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { Script } from '../../scratch/loop-stack';
import { make, type Block } from '../../scratch/engine';
import { TrackView } from './track-view';
import {
  FOLLOW,
  TRACK_WIDTH,
  atFinish,
  followTick,
  inside,
  type Bot,
  type Point,
  type Track,
} from './robot';

/**
 * „Narysuj trasę, robot ją przejedzie” — blok, w którym **świat programu rysuje
 * dziecko**, a program zostaje ten sam.
 *
 * To jest odpowiedź na haczyk: trzy polecenia, które dziecko przed chwilą
 * klikało na ślepo, stoją tu obok jako **prawdziwy skrypt Scratcha** — jedź,
 * sprawdź czujnik, skręć w tę albo w tamtą stronę — i robot wykonuje je
 * trzydzieści razy na sekundę. Pętla z warunkiem z lekcji 27 dostaje tu swoje
 * najpoważniejsze zastosowanie.
 *
 * **Nagrodą jest własna kreska.** Robot jedzie po torze, którego nikt nie
 * przygotował: po tym, co dziecko przed chwilą narysowało palcem. Dlatego
 * niepowodzenie też musi mówić o jego rysunku, a nie o programie — i mówi:
 * liczymy **najostrzejszy zakręt** i porównujemy go z tym, ile robot umie
 * skręcić na jednym obiegu pętli.
 */

const TICK = 30;
const MAX_TICKS = 900;

/**
 * Skrypt pokazany obok — musi zgadzać się **co do liczby** z `FOLLOW` w
 * symulacji. Eksportujemy go, bo ten sam program wraca w bloku czwartym; dwie
 * kopie rozjechałyby się przy pierwszej zmianie i strona zaczęłaby pokazywać co
 * innego, niż wykonuje.
 */
export const FOLLOW_SCRIPT: Block[] = [
  make('flaga'),
  make('zawsze', undefined, [
    make('idz', FOLLOW.steps),
    make(
      'jezeli_inaczej',
      'dotykasz czarnej linii?',
      [make('obroc', -FOLLOW.degrees)],
      [make('obroc', FOLLOW.degrees)]
    ),
  ]),
];

type Phase = 'rysuje' | 'gotowy' | 'jedzie' | 'meta' | 'zgubil';

/** Najostrzejszy zakręt narysowanej trasy, w stopniach na odcinek. */
function sharpest(points: Point[]): number {
  let worst = 0;
  for (let i = 2; i < points.length; i += 1) {
    const a = Math.atan2(points[i - 1].y - points[i - 2].y, points[i - 1].x - points[i - 2].x);
    const b = Math.atan2(points[i].y - points[i - 1].y, points[i].x - points[i - 1].x);
    let diff = ((b - a) * 180) / Math.PI;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    worst = Math.max(worst, Math.abs(diff));
  }
  return Math.round(worst);
}

function length(points: Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1)
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  return Math.round(total);
}

interface LineDrawProps {
  color: string;
  onComplete?: () => void;
}

export function LineDraw({ color, onComplete }: LineDrawProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [phase, setPhase] = useState<Phase>('rysuje');
  const [bot, setBot] = useState<Bot | null>(null);
  const [trail, setTrail] = useState<Point[]>([]);
  const [done, setDone] = useState(false);
  const drawing = useRef(false);
  const ticks = useRef(0);
  const anchorRef = useSectionScrollAnchor(done ? 1 : 0);

  const track = useMemo<Track>(() => ({ points, width: TRACK_WIDTH }), [points]);
  const ready = points.length > 3 && length(points) >= 110;

  useEffect(() => {
    if (phase !== 'jedzie' || !bot) return;
    const timer = window.setTimeout(() => {
      const next = followTick(bot, track);
      ticks.current += 1;
      setBot(next);
      setTrail((current) => [...current, { x: next.x, y: next.y }]);
      if (atFinish(next, track)) {
        setPhase('meta');
        if (!done) {
          setDone(true);
          onComplete?.();
        }
      } else if (!inside(next) || ticks.current > MAX_TICKS) setPhase('zgubil');
    }, TICK);
    return () => window.clearTimeout(timer);
  }, [phase, bot, track, done, onComplete]);


  /*
   * Zabezpieczenie na wypadek gestu zakończonego poza stroną (przeglądarka
   * potrafi anulować wskaźnik przy przełączeniu okna). Samo przejęcie wskaźnika
   * w `TrackView` wystarcza w normalnym użyciu, ale rysowanie „za najechaniem”
   * jest na tyle dokuczliwe, że warto mieć drugi zamek.
   */
  useEffect(() => {
    const stop = () => {
      drawing.current = false;
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, []);

  const draw = (point: Point, event: 'down' | 'move' | 'up') => {
    if (phase === 'jedzie') return;
    if (event === 'down') {
      drawing.current = true;
      setPoints([point]);
      setPhase('rysuje');
      setBot(null);
      setTrail([]);
      return;
    }
    if (event === 'up') {
      drawing.current = false;
      if (points.length > 3 && length(points) >= 110) setPhase('gotowy');
      return;
    }
    if (!drawing.current) return;
    setPoints((current) => {
      const last = current[current.length - 1];
      if (last && Math.hypot(point.x - last.x, point.y - last.y) < 7) return current;
      return [...current, point];
    });
  };

  const start = () => {
    const first = points[0];
    const second = points[1];
    if (!first || !second) return;
    const angle = (Math.atan2(second.y - first.y, second.x - first.x) * 180) / Math.PI;
    ticks.current = 0;
    setBot({ x: first.x, y: first.y, angle });
    setTrail([{ x: first.x, y: first.y }]);
    setPhase('jedzie');
  };

  const clear = () => {
    setPoints([]);
    setBot(null);
    setTrail([]);
    setPhase('rysuje');
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed">
        Teraz to samo, tylko że robota poprowadzi <strong>program</strong>. Ten obok po prawej to
        prawdziwy skrypt Scratcha i robi dokładnie to, co robiłeś/robiłaś palcem: jedzie kawałek,
        sprawdza czujnik i skręca w jedną albo w drugą stronę.{' '}
        <strong>Narysuj palcem trasę</strong> — od startu do mety — i puść go na nią.
      </p>

      <div className="mt-4 space-y-4 lg:grid lg:gap-4 lg:space-y-0 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="contents lg:block">
          <div className="sticky top-9 z-10 -mx-4 bg-white px-4 pb-2 dark:bg-zinc-900 sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:dark:bg-transparent">
            <TrackView
              track={track}
              trail={trail}
              bot={bot ?? undefined}
              color={color}
              showFinish={points.length > 1}
              onPointer={draw}
              note={
                phase === 'rysuje'
                  ? points.length === 0
                    ? 'przeciągnij palcem, żeby narysować trasę'
                    : `trasa: ${length(points)} kroków`
                  : phase === 'jedzie'
                    ? 'robot jedzie'
                    : phase === 'meta'
                      ? 'dojechał do mety'
                      : phase === 'zgubil'
                        ? 'zgubił linię'
                        : `trasa gotowa: ${length(points)} kroków`
              }
            />
            <div className="mx-auto mt-2 flex max-w-[340px] gap-2">
              <button
                type="button"
                onClick={start}
                disabled={!ready || phase === 'jedzie'}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 border py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: color, borderColor: color }}
              >
                <Play className="h-4 w-4" aria-hidden /> Puść robota
              </button>
              <button
                type="button"
                onClick={clear}
                className="flex cursor-pointer items-center justify-center gap-1.5 border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <Eraser className="h-4 w-4" aria-hidden /> wyczyść
              </button>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
            Program robota
          </p>
          <div className="mt-2 overflow-x-auto pb-1">
            <Script blocks={FOLLOW_SCRIPT} />
          </div>

          <div className="mt-3 border-t pt-3">
            <Note color={color} phase={phase} points={points} ready={ready} />
          </div>
        </div>
      </div>

      {done && (
        <div className="mt-4 p-3" style={{ backgroundColor: `${color}14` }}>
          <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            Robot przejechał trasę, której nikt mu nie podał z góry.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">
            W tym programie <strong>nie ma ani jednej liczby o twojej trasie</strong> — nie ma
            zapisane, gdzie jest zakręt ani ile kroków do mety. Jest tylko pętla i pytanie do
            czujnika. Dlatego ten sam program przejedzie <strong>każdą</strong> trasę, którą
            narysujesz — a nie tylko tę jedną.
          </p>
        </div>
      )}
    </div>
  );
}

function Note({
  color,
  phase,
  points,
  ready,
}: {
  color: string;
  phase: Phase;
  points: Point[];
  ready: boolean;
}) {
  if (phase === 'rysuje' && !ready)
    return (
      <p className="text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Rysuj jednym ruchem.</strong> Przyłóż palec na planszy i
        pociągnij linię — może być kręta. Przerywana obręcz na końcu to meta.
      </p>
    );

  if (phase === 'zgubil') {
    const bend = sharpest(points);
    return (
      <div className="border-l-2 border-amber-500 bg-amber-50 p-3 dark:bg-amber-950/30">
        <p className="text-sm font-semibold">Robot zgubił linię.</p>
        <p className="mt-1.5 text-sm leading-relaxed">
          {bend > FOLLOW.degrees * 3
            ? `Twój najostrzejszy zakręt skręca o ${bend} stopni naraz, a robot na jednym obiegu pętli skręca tylko o ${FOLLOW.degrees}. Nie zdążył się wpisać w łuk. Narysuj trasę jeszcze raz, łagodniej — albo zmień liczbę w klocku „obróć”.`
            : 'Trasa jest w porządku, ale robot wyjechał poza planszę albo zakręcił w drugą stronę na samym początku. Zacznij rysować od lewej strony planszy i pociągnij linię dalej.'}
        </p>
      </div>
    );
  }

  if (phase === 'meta')
    return (
      <p className="text-sm leading-relaxed" style={{ color }}>
        <strong>Dojechał.</strong> Popatrz na jego ślad: wije się wzdłuż krawędzi twojej kreski.
        Robot z jednym czujnikiem zawsze tak jedzie — raz na linii, raz obok, i przez to bez przerwy
        się poprawia.
      </p>
    );

  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      <strong className="text-foreground">Trasa gotowa.</strong> Naciśnij „Puść robota” i patrz na
      kropkę czujnika przed nim: czarna, gdy widzi linię, biała, gdy z niej zjechał. To ona
      rozstrzyga każdy zakręt.
    </p>
  );
}
