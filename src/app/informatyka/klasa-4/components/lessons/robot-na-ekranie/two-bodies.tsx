'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Check, Play, RotateCcw, RotateCw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { TrackView } from './track-view';
import { START, move, turn, type Bot, type Point } from './robot';

/**
 * „Ten sam program, dwa ciała” — blok o tym, dlaczego odliczanie kroków zawodzi,
 * choć program jest bez zarzutu.
 *
 * Podstawa programowa mówi o robocie **fizycznym albo na ekranie** `[2.4]`, więc
 * tę różnicę trzeba pokazać, a nie przemilczeć. Dziecko układa jeden plan i
 * puszcza go **naraz w dwa ciała**: duszek na ekranie wykonuje go co do piksela,
 * a robot na kółkach — prawie. Koła się ślizgają, silniki nie kręcą się idealnie
 * równo, a błąd **się kumuluje**: im dłuższy plan, tym większe rozjechanie.
 *
 * To jest blok, w którym plan powstaje **w całości przed uruchomieniem** — w
 * odróżnieniu od haczyka, gdzie dziecko sterowało na żywo. Ta para (pilot kontra
 * program) wraca tu z lekcji 22, ale z nowym morałem: program da się zapisać,
 * ciała nie da się oszukać.
 *
 * Poprawianie planu **działa i tak ma być** — dziecko ma zobaczyć, że dokładanie
 * kroków ratuje jeden przejazd. Zdanie na końcu mówi, czego nie ratuje.
 */

const STEP = 20;
const TURN = 30;
/** Robot na kółkach jedzie krócej i skręca mniej, niż mu kazano — za każdym razem. */
const SLIP = { steps: 0.82, degrees: 0.75 } as const;

const TARGET: Point = { x: 200, y: 150 };
const HIT = 18;

type Move = 'naprzod' | 'lewo' | 'prawo';

const MOVE_LABEL: Record<Move, string> = {
  naprzod: `przesuń o ${STEP} kroków`,
  lewo: `obróć w lewo o ${TURN} stopni`,
  prawo: `obróć w prawo o ${TURN} stopni`,
};

function apply(bot: Bot, what: Move, slip: boolean): Bot {
  if (what === 'naprzod') return move(bot, STEP * (slip ? SLIP.steps : 1));
  const degrees = TURN * (slip ? SLIP.degrees : 1);
  return turn(bot, what === 'lewo' ? -degrees : degrees);
}

interface TwoBodiesProps {
  color: string;
  onComplete?: () => void;
}

export function TwoBodies({ color, onComplete }: TwoBodiesProps) {
  const [plan, setPlan] = useState<Move[]>([]);
  const [at, setAt] = useState<number | null>(null);
  const [screen, setScreen] = useState<Bot>({ ...START });
  const [wheels, setWheels] = useState<Bot>({ ...START });
  const [screenTrail, setScreenTrail] = useState<Point[]>([{ x: START.x, y: START.y }]);
  const [wheelTrail, setWheelTrail] = useState<Point[]>([{ x: START.x, y: START.y }]);
  const [done, setDone] = useState(false);
  const runs = useRef(0);
  const anchorRef = useSectionScrollAnchor(done ? 1 : 0);

  const running = at !== null;

  useEffect(() => {
    if (at === null) return;
    if (at >= plan.length) {
      const timer = window.setTimeout(() => setAt(null), 300);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      const what = plan[at];
      setScreen((current) => {
        const next = apply(current, what, false);
        setScreenTrail((trail) => [...trail, { x: next.x, y: next.y }]);
        return next;
      });
      setWheels((current) => {
        const next = apply(current, what, true);
        setWheelTrail((trail) => [...trail, { x: next.x, y: next.y }]);
        return next;
      });
      setAt(at + 1);
    }, 260);
    return () => window.clearTimeout(timer);
  }, [at, plan]);

  const gap = Math.hypot(screen.x - wheels.x, screen.y - wheels.y);
  const hitScreen = Math.hypot(screen.x - TARGET.x, screen.y - TARGET.y) <= HIT;
  const hitWheels = Math.hypot(wheels.x - TARGET.x, wheels.y - TARGET.y) <= HIT;
  const finished = !running && runs.current > 0;

  useEffect(() => {
    if (finished && hitScreen && !done) {
      setDone(true);
      onComplete?.();
    }
  }, [finished, hitScreen, done, onComplete]);

  const add = (what: Move) => {
    if (running) return;
    setPlan((current) => [...current, what]);
  };

  const rewind = () => {
    setScreen({ ...START });
    setWheels({ ...START });
    setScreenTrail([{ x: START.x, y: START.y }]);
    setWheelTrail([{ x: START.x, y: START.y }]);
  };

  const run = () => {
    if (plan.length === 0) return;
    rewind();
    runs.current += 1;
    setAt(0);
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed">
        Ten sam plan poprowadzi teraz <strong>dwa roboty naraz</strong>: duszka na ekranie i robota
        na kółkach. Ułóż plan tak, żeby <strong>duszek</strong> zatrzymał się w obręczy — i popatrz,
        gdzie w tym czasie wyląduje ten drugi.
      </p>

      <div className="mt-4 space-y-4 lg:grid lg:gap-4 lg:space-y-0 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="contents lg:block">
          <div className="sticky top-9 z-10 -mx-4 bg-white px-4 pb-2 dark:bg-zinc-900 sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:dark:bg-transparent">
            <TrackView
              color={color}
              bot={screen}
              otherBot={wheels}
              trail={screenTrail}
              otherTrail={wheelTrail}
              target={TARGET}
              note={running ? `polecenie ${Math.min((at ?? 0) + 1, plan.length)} z ${plan.length}` : 'ciągła linia — ekran, przerywana — kółka'}
            />
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
            Plan — {plan.length === 0 ? 'jeszcze pusty' : `${plan.length} poleceń`}
          </p>

          <ol className="mt-2 max-h-[150px] space-y-1 overflow-y-auto pr-1">
            {plan.map((what, index) => (
              <li
                key={index}
                className={cn(
                  'flex items-center gap-2 border px-2 py-1 text-xs',
                  running && at === index && 'font-bold'
                )}
                style={running && at === index ? { borderColor: color, color } : undefined}
              >
                <span className="font-mono tabular-nums text-muted-foreground">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {MOVE_LABEL[what]}
              </li>
            ))}
            {plan.length === 0 && (
              <li className="text-xs leading-relaxed text-muted-foreground">
                Dokładaj polecenia przyciskami niżej. Plan wykonuje się dopiero po naciśnięciu
                „Uruchom” — <strong>w całości, bez twojego udziału</strong>.
              </li>
            )}
          </ol>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <button type="button" onClick={() => add('lewo')} disabled={running}
              className="flex cursor-pointer items-center justify-center gap-1 border py-2 text-xs font-medium transition-colors hover:bg-muted/50 disabled:opacity-40"
              style={{ borderColor: color, color }}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> w lewo
            </button>
            <button type="button" onClick={() => add('naprzod')} disabled={running}
              className="flex cursor-pointer items-center justify-center gap-1 border py-2 text-xs font-medium transition-colors hover:bg-muted/50 disabled:opacity-40"
              style={{ borderColor: color, color }}>
              <ArrowUp className="h-3.5 w-3.5" aria-hidden /> naprzód
            </button>
            <button type="button" onClick={() => add('prawo')} disabled={running}
              className="flex cursor-pointer items-center justify-center gap-1 border py-2 text-xs font-medium transition-colors hover:bg-muted/50 disabled:opacity-40"
              style={{ borderColor: color, color }}>
              w prawo <RotateCw className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>

          <div className="mt-2 flex gap-2">
            <button type="button" onClick={run} disabled={running || plan.length === 0}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 border py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: color, borderColor: color }}>
              <Play className="h-4 w-4" aria-hidden /> Uruchom plan
            </button>
            <button type="button" onClick={() => { setPlan([]); rewind(); }} disabled={running}
              className="flex cursor-pointer items-center justify-center gap-1.5 border px-3 py-2 text-sm transition-colors hover:bg-muted/50 disabled:opacity-40">
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="mt-3 border-t pt-3">
            {finished ? (
              <div className={cn('p-3', hitScreen ? '' : 'border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30')}
                style={hitScreen ? { backgroundColor: `${color}14` } : undefined}>
                <p className="text-sm leading-relaxed">
                  {hitScreen ? (
                    <>
                      <strong>Duszek trafił w obręcz.</strong> Robot na kółkach minął ją o{' '}
                      <strong>{Math.round(gap / STEP * 10) / 10} kroku</strong>
                      {hitWheels ? ' — tym razem zmieścił się w obręczy, ale ledwie.' : ' i został poza nią.'}
                    </>
                  ) : (
                    <>
                      Duszek zatrzymał się <strong>{Math.round(Math.hypot(screen.x - TARGET.x, screen.y - TARGET.y) / STEP * 10) / 10} kroku</strong>{' '}
                      od obręczy. Dołóż albo odejmij polecenia i uruchom jeszcze raz — plan poprawia
                      się dowolnie wiele razy.
                    </>
                  )}
                </p>
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Oba roboty dostają identyczne polecenia.</strong>{' '}
                Ten na kółkach nie ma żadnego błędu w programie — ma tylko koła, które się ślizgają.
              </p>
            )}
          </div>
        </div>
      </div>

      {done && (
        <div className="mt-4 p-3" style={{ backgroundColor: `${color}14` }}>
          <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            Ten sam plan, dwa różne końce.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">
            Możesz dołożyć kółkowemu robotowi kilka kroków i trafi — ale{' '}
            <strong>tylko na tej jednej trasie i tylko dzisiaj</strong>. Jutro podłoga będzie inna,
            baterie słabsze i poprawka przestanie pasować. Dlatego prawdziwe roboty nie liczą kroków,
            tylko <strong>patrzą czujnikiem</strong> — tak jak ten z poprzedniego bloku.
          </p>
        </div>
      )}
    </div>
  );
}
