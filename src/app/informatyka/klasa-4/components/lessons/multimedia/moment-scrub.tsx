'use client';

import { useState } from 'react';
import { Check, Hand, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import {
  SceneArt,
  SceneStage,
  TimeScrubber,
  sceneById,
  type SceneId,
  type SceneMoment,
} from './scene';

/**
 * Blok 1 — **odkrycie przez palec, nie przez akapit.**
 *
 * Dziecko dostaje jeden przyrząd (przewijak) i trzy polecenia tego samego
 * rodzaju: *zatrzymaj się w chwili, w której…*. Dwa pierwsze materiały mają taką
 * chwilę i znaleźć ją da się tylko ciągnąc uchwyt tam i z powrotem. Trzeci jej
 * nie ma — i to jest cała pointa lekcji, podana tak, że dziecko wypowiada ją
 * samo, naciskając drugi przycisk.
 *
 * Trzy decyzje, bez których ten blok byłby zgadywanką:
 *
 * - **Przycisk „nie ma takiej chwili” stoi w każdej rundzie**, także w tych,
 *   w których jest zła. Gdyby pojawił się dopiero przy kwiatku, byłby
 *   podpowiedzią, a nie decyzją.
 * - **Chybienie nazywa konkret.** Nie „spróbuj jeszcze raz”, tylko „w klatce 21
 *   para dopiero unosi się znad rzeki” — dziecko dowiaduje się, gdzie jest,
 *   a nie że się pomyliło.
 * - **Poprawki są darmowe.** Szukanie chwili to przewijanie w tę i z powrotem,
 *   więc liczenie prób karałoby dokładnie to, czego uczymy.
 */

interface Round {
  id: string;
  scene: SceneId;
  /** Chwila do znalezienia albo `null`, gdy w materiale nic się nie dzieje. */
  moment: SceneMoment | null;
  /** Polecenie dla rund bez chwili — tam nie ma go z czego wziąć. */
  question?: string;
}

const ROUNDS: Round[] = [
  { id: 'woda', scene: 'woda', moment: sceneById('woda').moments[0] },
  { id: 'ulamek', scene: 'ulamek', moment: sceneById('ulamek').moments[0] },
  {
    id: 'kwiat',
    scene: 'kwiat',
    moment: null,
    question: 'Zatrzymaj się w chwili, w której kwiat się otwiera.',
  },
];

const FRAMES = 60;

/** Co dokładnie widać w tej klatce — werdykt ma nazywać rzecz, nie oceniać dziecko. */
function describe(scene: SceneId, t: number): string {
  if (scene === 'woda') {
    if (t < 0.35) return 'para dopiero unosi się znad rzeki';
    if (t < 0.55) return 'chmura już jest i rośnie';
    if (t < 0.68) return 'kropla zwisa z chmury i robi się coraz cięższa';
    if (t < 0.92) return 'kropla leci w dół';
    return 'kropla wpada z powrotem do rzeki';
  }
  if (scene === 'ulamek') {
    const eaten = t * 4;
    if (eaten < 0.9) return 'tabliczka jest prawie cała';
    if (eaten < 1.9) return 'zniknął jeden kawałek z czterech, czyli ćwierć';
    if (eaten < 2.9) return 'zniknęły dwa kawałki z czterech';
    if (eaten < 3.9) return 'zniknęły trzy kawałki z czterech';
    return 'z tabliczki nie ma już nic';
  }
  if (scene === 'cien') {
    if (t < 0.3) return 'słońce jest nisko z lewej, cień leci daleko w prawo';
    if (t < 0.7) return 'słońce jest wysoko, cień jest krótki';
    return 'słońce zachodzi z prawej, cień leci daleko w lewo';
  }
  return 'to samo, co w każdej innej klatce tego materiału';
}

type Verdict =
  | { kind: 'hit'; frame: number; text: string }
  | { kind: 'miss'; frame: number; text: string }
  | { kind: 'wrong-none'; text: string };

export function MomentScrub({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState<string[]>([]);
  const anchor = useSectionScrollAnchor(index);

  const finishRound = (id: string) => {
    const next = solved.includes(id) ? solved : [...solved, id];
    setSolved(next);
    if (next.length === ROUNDS.length) onComplete?.();
    else setIndex((value) => value + 1);
  };

  const done = solved.length === ROUNDS.length;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        Pod każdym materiałem jest <strong>przewijak</strong> — pasek z sześćdziesięcioma klatkami, po którym ciągnie
        się palcem albo myszą. Tak samo przewija się film. Twoje zadanie za każdym razem brzmi tak samo:{' '}
        <strong>zatrzymaj się dokładnie w tej chwili, o którą proszę</strong>.
      </p>

      <div ref={anchor} className="mt-5 space-y-5">
        {ROUNDS.slice(0, solved.length + 1).map((round, position) => (
          <RoundView
            key={round.id}
            round={round}
            color={color}
            active={position === index}
            solved={solved.includes(round.id)}
            onSolved={() => finishRound(round.id)}
          />
        ))}
      </div>

      {done && (
        <div className="mt-5 p-4" style={{ backgroundColor: `${color}12` }}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide" style={{ color }}>
                <th className="pb-2 font-semibold">materiał</th>
                <th className="pb-2 font-semibold">czy coś się zmienia</th>
                <th className="pb-2 font-semibold">czy ruch ma co pokazać</th>
              </tr>
            </thead>
            <tbody>
              {ROUNDS.map((round) => {
                const scene = sceneById(round.scene);
                return (
                  <tr key={round.id} className="border-t align-top">
                    <td className="py-2 pr-3">{scene.name}</td>
                    <td className="py-2 pr-3">{scene.changes ? 'tak' : 'nie, nigdy'}</td>
                    <td className="py-2">{scene.changes ? 'ma — tę zmianę' : 'nie ma czego pokazać'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 text-sm leading-relaxed">
            To jest jedno zdanie, na którym stoi cała ta lekcja: <strong>ruch pokazuje zmianę</strong>. Budowa kwiatu
            zmiany nie ma — i dlatego jest rysunkiem, a nie filmem. Gdyby ktoś ją zanimował, ruch nie pokazałby niczego,
            za to zabrałby oczy podpisom.
          </p>
        </div>
      )}
    </div>
  );
}

function RoundView({
  round,
  color,
  active,
  solved,
  onSolved,
}: {
  round: Round;
  color: string;
  active: boolean;
  solved: boolean;
  onSolved: () => void;
}) {
  const [t, setT] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const scene = sceneById(round.scene);
  const frame = Math.round(t * (FRAMES - 1)) + 1;

  const stopHere = () => {
    if (!round.moment) {
      setVerdict({
        kind: 'wrong-none',
        text: `W klatce ${frame} jest dokładnie to samo, co w klatce 1 i w klatce ${FRAMES}. Przewijak działa — to ten materiał się nie zmienia.`,
      });
      return;
    }
    const hit = t >= round.moment.from && t <= round.moment.to;
    if (hit) {
      setVerdict({ kind: 'hit', frame, text: round.moment.answer });
      onSolved();
    } else {
      setVerdict({ kind: 'miss', frame, text: describe(round.scene, t) });
    }
  };

  const noMoment = () => {
    if (round.moment) {
      setVerdict({
        kind: 'miss',
        frame,
        text: `tu akurat jest co znaleźć — poprzewijaj jeszcze raz, teraz ${describe(round.scene, t)}`,
      });
      return;
    }
    setVerdict({
      kind: 'hit',
      frame,
      text: 'w tym materiale nic się nie zmienia, więc nie ma w nim ani jednej takiej chwili',
    });
    onSolved();
  };

  return (
    <div className={cn('border p-4 transition-opacity', !active && !solved && 'opacity-40')}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        {scene.name} · {scene.subject}
      </p>
      <p className="mb-3 text-sm leading-relaxed sm:text-base">
        <Hand className="mr-1.5 inline h-4 w-4 align-[-2px]" style={{ color }} aria-hidden />
        {round.moment?.question ?? round.question}
      </p>

      <SceneStage>
        <SceneArt scene={round.scene} t={t} />
      </SceneStage>

      <div className="mx-auto mt-3 w-full" style={{ maxWidth: 480 }}>
        <TimeScrubber value={t} onChange={setT} color={color} frames={FRAMES} disabled={solved} />
      </div>

      {!solved && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={stopHere}
            className="cursor-pointer border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            style={{ borderColor: color, color }}
          >
            Zatrzymałem/zatrzymałam się tutaj
          </button>
          <button
            type="button"
            onClick={noMoment}
            className="cursor-pointer border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            W tym materiale nie ma takiej chwili
          </button>
        </div>
      )}

      {verdict && (
        <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed">
          <span
            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-white"
            style={{ backgroundColor: verdict.kind === 'hit' ? color : '#a1a1aa' }}
            aria-hidden
          >
            {verdict.kind === 'hit' ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          </span>
          <span>
            {verdict.kind === 'hit' ? (
              <>
                <strong>Trafione.</strong> {verdict.text}
                {'frame' in verdict && round.moment ? ` (klatka ${verdict.frame}).` : '.'}
              </>
            ) : verdict.kind === 'wrong-none' ? (
              verdict.text
            ) : (
              <>
                Jeszcze nie — w klatce {verdict.frame} {verdict.text}. Pociągnij uchwyt dalej.
              </>
            )}
          </span>
        </p>
      )}
    </div>
  );
}
