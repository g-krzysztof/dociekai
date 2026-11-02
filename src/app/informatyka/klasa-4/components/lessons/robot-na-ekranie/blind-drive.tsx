'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Check, RotateCcw, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { TrackView } from './track-view';
import {
  START,
  TRACK_HOOK,
  atFinish,
  inside,
  move,
  onTrack,
  sensor,
  turn,
  type Bot,
  type Point,
} from './robot';

/**
 * „Prowadź na ślepo” — haczyk lekcji 28 i **jedyny blok kursu, w którym dziecko
 * jest programem**.
 *
 * Tor istnieje, ale nie jest narysowany. Widać wyłącznie robota, jego własny
 * ślad i **jedną lampkę**: czujnik widzi linię albo jej nie widzi. To jest cała
 * wiedza robota o świecie i w tym bloku staje się też całą wiedzą dziecka.
 *
 * Bez tego doświadczenia reszta lekcji byłaby opowiadaniem. Po nim zdanie
 * „robot nie widzi planszy, robot widzi jeden piksel pod czujnikiem” nie wymaga
 * już dowodu — a program z następnego bloku robi dokładnie to, co dziecko przed
 * chwilą robiło palcem, tylko szybciej i bez zmęczenia.
 *
 * Trzy decyzje, które trzymają ten blok po stronie zabawy, a nie udręki:
 * tor jest **krótki, szeroki i z jednym zakrętem** (zachłanne prowadzenie
 * kończy się metą po ~18 naciśnięciach), zbłądzenie **nic nie kosztuje** (robot
 * jedzie dalej, lampka gaśnie i trzeba wrócić), a po dojechaniu **odsłaniamy
 * tor pod śladem** — nagrodą jest zobaczenie, którędy naprawdę się jechało.
 */

const STEP = 12;
const TURN = 15;

interface BlindDriveProps {
  color: string;
  onComplete?: () => void;
}

export function BlindDrive({ color, onComplete }: BlindDriveProps) {
  const [bot, setBot] = useState<Bot>({ ...START });
  const [trail, setTrail] = useState<Point[]>([{ x: START.x, y: START.y }]);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const anchorRef = useSectionScrollAnchor(done ? 1 : 0);

  const sees = onTrack(sensor(bot), TRACK_HOOK);
  const finished = atFinish(bot, TRACK_HOOK);

  const go = (steps: number = STEP) => {
    if (finished) return;
    const next = move(bot, steps);
    if (!inside(next)) return;
    setBot(next);
    setTrail((current) => [...current, { x: next.x, y: next.y }]);
    setMoves((value) => value + 1);
    if (atFinish(next, TRACK_HOOK)) {
      const used = moves + 1;
      setBest((current) => (current === null ? used : Math.min(current, used)));
      if (!done) {
        setDone(true);
        onComplete?.();
      }
    }
  };

  const rotate = (degrees: number) => {
    if (finished) return;
    setBot((current) => turn(current, degrees));
    setMoves((value) => value + 1);
  };

  const restart = () => {
    setBot({ ...START });
    setTrail([{ x: START.x, y: START.y }]);
    setMoves(0);
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed">
        Na planszy jest tor, ale <strong>go nie zobaczysz</strong> — tak samo jak nie widzi go robot.
        Robot ma jeden czujnik wysunięty do przodu i umie odpowiedzieć na jedno pytanie:{' '}
        <strong>czy pode mną jest linia?</strong> Doprowadź go do mety, mając tylko tę jedną lampkę.
      </p>

      <div className="mt-4 space-y-4 lg:grid lg:gap-4 lg:space-y-0 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="contents lg:block">
          <div className="sticky top-9 z-10 -mx-4 bg-white px-4 pb-2 dark:bg-zinc-900 sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:dark:bg-transparent">
            <TrackView
              track={TRACK_HOOK}
              hidden={!finished}
              trail={trail}
              bot={bot}
              color={color}
              showFinish
              note={finished ? 'tor odsłonięty' : 'plansza oczami robota'}
            />
          </div>
        </div>

        <div>
          <div
            className={cn(
              'flex items-center gap-3 border p-3',
              sees ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-muted/30'
            )}
          >
            <span
              className={cn('h-5 w-5 shrink-0 rounded-full border-2', sees ? 'border-white bg-white' : 'border-zinc-400')}
              aria-hidden
            />
            <span className="text-sm font-semibold">
              {finished ? 'META — robot dojechał' : sees ? 'czujnik: widzę linię' : 'czujnik: nic nie widzę'}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => rotate(-TURN)}
              disabled={finished}
              className="flex cursor-pointer items-center justify-center gap-1 border py-2.5 text-sm font-medium transition-colors hover:bg-muted/50 disabled:opacity-40"
              style={{ borderColor: color, color }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> w lewo
            </button>
            <button
              type="button"
              onClick={() => go()}
              disabled={finished}
              className="flex cursor-pointer items-center justify-center gap-1 border py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: color, borderColor: color }}
            >
              <ArrowUp className="h-4 w-4" aria-hidden /> naprzód
            </button>
            <button
              type="button"
              onClick={() => rotate(TURN)}
              disabled={finished}
              className="flex cursor-pointer items-center justify-center gap-1 border py-2.5 text-sm font-medium transition-colors hover:bg-muted/50 disabled:opacity-40"
              style={{ borderColor: color, color }}
            >
              w prawo <RotateCw className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {/*
            * Cofanie nie jest udogodnieniem, tylko warunkiem, żeby ten blok dało
            * się w ogóle rozwiązać: po zjechaniu z linii sam obrót w miejscu
            * niczego nie ratuje, a jazda dalej oddala. Prawdziwy pilot robota ma
            * wsteczny z tego samego powodu.
            */}
          <button
            type="button"
            onClick={() => go(-STEP)}
            disabled={finished}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-1 border py-2 text-sm font-medium transition-colors hover:bg-muted/50 disabled:opacity-40"
            style={{ borderColor: color, color }}
          >
            <ArrowDown className="h-4 w-4" aria-hidden /> cofnij
          </button>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="font-mono text-xs tabular-nums text-muted-foreground">
              poleceń: <strong className="text-foreground">{moves}</strong>
              {best !== null && <span> · najlepszy przejazd: {best}</span>}
            </p>
            <button
              type="button"
              onClick={restart}
              className="cursor-pointer border px-3 py-1.5 text-xs transition-colors hover:bg-muted/50"
            >
              od nowa
            </button>
          </div>

          {!finished ? (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Gdy lampka gaśnie</strong>, znaczy to tylko tyle, że
              czujnik zjechał z linii. Robot nie wie, w którą stronę — i ty też nie. Zostaje{' '}
              <strong className="text-foreground">cofnąć się</strong>, skręcić po trochu i spróbować
              jeszcze raz.
            </p>
          ) : (
            <div className="mt-3 p-3" style={{ backgroundColor: `${color}14` }}>
              <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
                <Check className="h-4 w-4 shrink-0" aria-hidden />
                Dojechał. Tor jest już odsłonięty.
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">
                Popatrz na swój ślad i na tor pod nim. <strong>Wahałeś/wahałaś się</strong> — trochę w
                lewo, trochę w prawo, znowu do przodu. Dokładnie tak jeździ prawdziwy robot
                podążający za linią i w następnym bloku zobaczysz, że jego program to{' '}
                <strong>te same trzy polecenia, które przed chwilą klikałeś/klikałaś</strong>.
              </p>
              <button
                type="button"
                onClick={restart}
                className="mt-2.5 cursor-pointer border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
                style={{ borderColor: color, color }}
              >
                Spróbuj jeszcze raz, krócej
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
