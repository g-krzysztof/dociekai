'use client';

import { useEffect, useState } from 'react';
import { Check, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { Script } from '../../scratch/loop-stack';
import { make, type Block } from '../../scratch/engine';
import { TrackView } from './track-view';
import { FOLLOW_SCRIPT } from './line-draw';
import { COUNTED, TRACK_A, TRACK_B, startDrive, step, type Drive, type Program } from './robot';

/**
 * „Cztery przejazdy” — blok, w którym dziecko **przeprowadza doświadczenie**, a
 * nie czyta wniosku.
 *
 * Dwa programy razy dwa tory, cztery kratki do wypełnienia — i dopiero z nich
 * wychodzi zdanie, o które w całej lekcji chodzi. Program liczący kroki **działa
 * bez zarzutu**, dopóki świat jest dokładnie ten, pod który go napisano; wystarczy
 * jeden inny zakręt i ten sam program jedzie w pole. Program z czujnikiem nie wie
 * o torze nic i właśnie dlatego przejedzie każdy.
 *
 * **Tor A jest wyprowadzony z programu liczącego** (`pathFrom` w `robot.ts`), więc
 * na nim wypada idealnie. To nie jest ustawka — to jedyny sposób, żeby dziecko
 * nie wyniosło z lekcji przekonania, że odliczanie kroków nie działa nigdy.
 *
 * Podsumowanie pojawia się dopiero po **wszystkich czterech** przejazdach i jest
 * złożone z ich wyników, nie z gotowego akapitu.
 */

/** Program liczący kroki — liczby muszą się zgadzać z `COUNTED` w symulacji. */
const COUNTED_SCRIPT: Block[] = [
  make('flaga'),
  make('powtorz', COUNTED.turns, [make('idz', COUNTED.steps), make('obroc', COUNTED.degrees)]),
];

const PROGRAM_LABEL: Record<Program, string> = {
  kroki: 'po krokach',
  czujnik: 'po czujniku',
};

const TRACKS = { A: TRACK_A, B: TRACK_B } as const;
type TrackId = keyof typeof TRACKS;

const OUTCOME: Record<Drive['status'], string> = {
  jedzie: 'jedzie',
  meta: 'dojechał do mety',
  'poza-planszą': 'wyjechał poza planszę',
  'koniec-programu': 'skończyły mu się polecenia',
  zabłądził: 'krążył i nie trafił',
};

interface TrackLabProps {
  color: string;
  onComplete?: () => void;
}

export function TrackLab({ color, onComplete }: TrackLabProps) {
  const [track, setTrack] = useState<TrackId>('A');
  const [program, setProgram] = useState<Program>('kroki');
  const [drive, setDrive] = useState<Drive>(() => startDrive());
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Record<string, Drive['status']>>({});
  const [done, setDone] = useState(false);
  const anchorRef = useSectionScrollAnchor(Object.keys(results).length);

  useEffect(() => {
    if (!running) return;
    if (drive.status !== 'jedzie') {
      setRunning(false);
      setResults((current) => ({ ...current, [`${track}-${program}`]: drive.status }));
      return;
    }
    const timer = window.setTimeout(
      () => setDrive((current) => step(current, program, TRACKS[track])),
      program === 'czujnik' ? 28 : 110
    );
    return () => window.clearTimeout(timer);
  }, [running, drive, program, track]);

  const filled = Object.keys(results).length;

  useEffect(() => {
    if (filled === 4 && !done) {
      setDone(true);
      onComplete?.();
    }
  }, [filled, done, onComplete]);

  const launch = () => {
    setDrive(startDrive());
    setRunning(true);
  };

  const pick = (nextTrack: TrackId, nextProgram: Program) => {
    if (running) return;
    setTrack(nextTrack);
    setProgram(nextProgram);
    setDrive(startDrive());
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed">
        Dwa programy i dwa tory. Tor <strong>B zaczyna się identycznie jak A</strong> i dopiero w
        połowie skręca w drugą stronę. Puść <strong>każdy program na każdym torze</strong> —
        wszystkie cztery przejazdy — i dopiero potem powiedz, który program jest lepszy.
      </p>

      <div className="mt-4 space-y-4 lg:grid lg:gap-4 lg:space-y-0 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="contents lg:block">
          <div className="sticky top-9 z-10 -mx-4 bg-white px-4 pb-2 dark:bg-zinc-900 sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:dark:bg-transparent">
            <TrackView
              track={TRACKS[track]}
              trail={drive.trail}
              bot={drive.bot}
              color={color}
              showFinish
              note={running ? 'jedzie…' : `tor ${track} · program ${PROGRAM_LABEL[program]}`}
            />
            <div className="mx-auto mt-2 max-w-[340px]">
              <button
                type="button"
                onClick={launch}
                disabled={running}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 border py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: color, borderColor: color }}
              >
                <Play className="h-4 w-4" aria-hidden /> Uruchom przejazd
              </button>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
            Cztery przejazdy · {filled} z 4
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[320px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border px-2 py-1 text-left text-xs font-semibold text-muted-foreground">
                    program \ tor
                  </th>
                  {(['A', 'B'] as TrackId[]).map((id) => (
                    <th key={id} className="border px-2 py-1 text-left text-xs font-semibold">
                      tor {id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(['kroki', 'czujnik'] as Program[]).map((id) => (
                  <tr key={id}>
                    <th className="border px-2 py-1 text-left text-xs font-medium">{PROGRAM_LABEL[id]}</th>
                    {(['A', 'B'] as TrackId[]).map((tid) => {
                      const outcome = results[`${tid}-${id}`];
                      const here = track === tid && program === id;
                      return (
                        <td
                          key={tid}
                          className={cn('border px-2 py-1 align-top text-xs leading-snug', here && 'font-semibold')}
                          style={here ? { borderColor: color } : undefined}
                        >
                          {outcome ? (
                            <span className={outcome === 'meta' ? '' : 'text-amber-700 dark:text-amber-400'}>
                              {OUTCOME[outcome]}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => pick(tid, id)}
                              className="cursor-pointer text-muted-foreground underline underline-offset-2 hover:text-foreground"
                            >
                              wybierz i uruchom
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
            Program „{PROGRAM_LABEL[program]}”
          </p>
          <div className="mt-2 overflow-x-auto pb-1">
            <Script blocks={program === 'kroki' ? COUNTED_SCRIPT : FOLLOW_SCRIPT} />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {program === 'kroki' ? (
              <>
                Ten program <strong>nie ma czujnika</strong>. Wie tylko, ile razy przesunąć i o ile
                stopni skręcić — i zrobi to tak samo na każdej planszy, jaką mu podłożysz.
              </>
            ) : (
              <>
                Ten program <strong>nie wie o torze nic</strong> — ani gdzie jest zakręt, ani ile
                kroków do mety. Pyta tylko czujnika i decyduje na bieżąco.
              </>
            )}
          </p>
        </div>
      </div>

      {done && (
        <div className="mt-4 p-3" style={{ backgroundColor: `${color}14` }}>
          <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            Cztery przejazdy za tobą.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">
            Program liczący kroki <strong>nie jest zły</strong> — na torze A pojechał idealnie, bo
            powstał dokładnie pod ten tor. Wystarczył jednak jeden inny zakręt i przestał pasować,
            choć w samym programie nic się nie zepsuło. Program z czujnikiem przejechał{' '}
            <strong>oba</strong>, bo nie zna trasy — tylko ją bada, kawałek po kawałku. Tak działa
            prawie każdy prawdziwy robot.
          </p>
        </div>
      )}
    </div>
  );
}
