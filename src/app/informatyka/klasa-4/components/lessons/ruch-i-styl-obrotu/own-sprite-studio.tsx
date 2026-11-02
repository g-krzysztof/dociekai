'use client';

import { useRef, useState } from 'react';
import { Check, MousePointerClick } from 'lucide-react';
import type { Picture } from '../../picture-view';
import { TaskShell } from '../../task-shell';
import { Bench } from '../../scratch/bench';
import { CostumeArt, GreenFlag, StageView, spriteTransform } from '../../scratch/stage-view';
import { useProgram } from '../../scratch/use-program';
import {
  make,
  normalizeDirection,
  type Block,
  type BlockType,
  type Category,
  type RotationStyle,
} from '../../scratch/engine';
import { SpritePad } from './sprite-pad';
import { measure } from './sprite-pic';
import { Z7_CRITERIA, Z7_START, judgeZ7, type Z7Report } from './z7';

/**
 * Zadanie obowiązkowe **Z-7** — własny duszek na spacerze — **wykonywane na stronie**.
 *
 * Trzy podpunkty brzmienia, każdy jest tu osobną pracą, a nie zdaniem do odhaczenia:
 * 1. „namaluj duszka według własnego pomysłu” — `SpritePad`, ten sam rysunek, który dziecko
 *    zrobiło w bloku 3 (stan lekcji); werdykt mierzy, czy to rysunek i czy stoi na krzyżyku;
 * 2. „skrypt, który określi jego poruszanie się w poziomie (lewo, prawo)” — `Bench` i scena, na
 *    której chodzi **jego** duszek;
 * 3. „ustaw taki styl obrotu, aby duszek nie poruszał się głową w dół” — klocek w skrypcie, a
 *    werdykt patrzy, co duszek naprawdę zrobił (`Run.upsideDown`), nie tylko czy klocek stoi.
 *
 * Nagrodą jest jego rysunek w czterech kierunkach przy stylu obrotu, który sam ustawił: przy
 * „lewo-prawo” stoi na nogach we wszystkich czterech, przy „dowolny” w dwóch robi fikołka —
 * i to jest dowód nie do podważenia, bo widać na nim jego własny rysunek, nie naszego kota.
 */

/** Wzorzec zamówienia: pokazujemy **wynik**, nigdy listy klocków. */
const GOAL: Block[] = [
  make('flaga'),
  make('styl', 'lewo-prawo'),
  make('kierunek', 90),
  make('idz', 100),
  make('czekaj', 0.5),
  make('idz', 100),
  make('czekaj', 0.5),
  make('kierunek', -90),
  make('idz', 100),
  make('czekaj', 0.5),
  make('idz', 100),
];

const PALETTE: BlockType[] = ['flaga', 'idz', 'kierunek', 'obroc', 'odbij', 'styl', 'czekaj'];

const FOUR_WAYS: { direction: number; label: string }[] = [
  { direction: 90, label: 'w prawo' },
  { direction: 0, label: 'w górę' },
  { direction: -90, label: 'w lewo' },
  { direction: 180, label: 'w dół' },
];

interface OwnSpriteStudioProps {
  color: string;
  /** Rysunek dziecka — stan lekcji, ten sam co w pracowni z bloku 3. */
  pic: Picture;
  onPicChange: (picture: Picture) => void;
  onComplete?: () => void;
}

export function OwnSpriteStudio({ color, pic, onPicChange, onComplete }: OwnSpriteStudioProps) {
  const [stacks, setStacks] = useState<Block[][]>([[]]);
  const [category, setCategory] = useState<Category>('zdarzenia');
  const stack = stacks[0] ?? [];
  const sprite = measure(pic);
  const costume = sprite.drawn ? pic : undefined;
  const program = useProgram(stack, Z7_START);
  const stage = useRef<HTMLDivElement>(null);

  const reset = () => {
    setStacks([[]]);
    setCategory('zdarzenia');
    program.clear();
  };

  /** Uruchamia program i, jeśli scena stoi poza widokiem (wąski ekran: pod skryptem), przewija do niej. */
  const runInView = () => {
    program.start();
    const box = stage.current?.getBoundingClientRect();
    if (!box || (box.top >= 130 && box.bottom <= window.innerHeight)) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    stage.current?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <TaskShell<Z7Report>
      color={color}
      criteria={Z7_CRITERIA}
      judge={() => judgeZ7(stack, pic)}
      renderReport={(report) => <Report report={report} color={color} />}
      onReset={reset}
      resetLabel="Zacznij skrypt od nowa"
      onComplete={onComplete}
      brief={
        <>
          <p className="border-l-2 pl-3 italic" style={{ borderColor: color }}>
            Namaluj w programie Scratch duszka według własnego pomysłu. Następnie zbuduj dla niego
            skrypt, który określi jego poruszanie się w poziomie (lewo, prawo). W skrypcie ustaw taki
            styl obrotu, aby duszek nie poruszał się głową w dół.
          </p>
          <p className="mt-3">
            Trzy rzeczy, wszystkie już dziś przerabiane: <strong>własny rysunek</strong> (i krzyżyk,
            na którym ma stanąć), <strong>spacer w bok</strong> — czyli taki, przy którym zmienia się
            x, a wysokość zostaje — i <strong>styl obrotu w skrypcie</strong>.
          </p>
          <p className="mt-2">
            Listy klocków nie podam. Uruchomię twój program u siebie i sprawdzę, co duszek naprawdę
            zrobił — także czy <strong>ani razu nie szedł głową w dół</strong>.
          </p>
        </>
      }
      goal={<GoalPreview color={color} costume={costume} />}
      workshop={
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Twój duszek
            </p>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,330px)_minmax(0,1fr)]">
              <SpritePad pic={pic} onChange={onPicChange} />
              <div className="text-sm leading-relaxed">
                {!sprite.drawn && (
                  <p>
                    Rysuj pędzlem po kratce — kilka kresek wystarczy, a pomysł jest twój. Jeśli
                    narysowałeś/narysowałaś duszka w bloku trzecim, <strong>on już tu jest</strong> i
                    możesz go dopracować.
                  </p>
                )}
                {sprite.drawn && !sprite.centered && (
                  <p className="border-l-2 border-amber-500 bg-amber-50 p-2.5 dark:bg-amber-950/30">
                    Rysunek leży <strong>{sprite.offset.toFixed(1)} pola od krzyżyka</strong>. Duszek
                    obraca się i odbija wokół krzyżyka, więc będzie odskakiwał przy zwrocie. Weź
                    narzędzie <strong className="whitespace-nowrap">przesuń cały rysunek</strong> i
                    przeciągnij go na krzyżyk.
                  </p>
                )}
                {sprite.centered && (
                  <p className="flex items-start gap-2" style={{ color }}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span className="font-medium">Duszek stoi na krzyżyku — obraca się w miejscu.</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Jego skrypt
            </p>
            <p className="mb-3 text-sm leading-relaxed">
              Ułóż spacer i <strong>uruchom go zieloną flagą</strong> — zobacz na scenie, czy twój
              duszek idzie w obie strony i czy stoi na nogach, zanim mi go oddasz.
            </p>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
              <div>
                <Bench
                  color={color}
                  stacks={stacks}
                  onStacksChange={setStacks}
                  available={PALETTE}
                  category={category}
                  onCategoryChange={setCategory}
                  active={program.active ? { stack: 0, ...program.active } : null}
                  locked={program.running}
                  scriptHint="Zacznij od kapelusza z zieloną flagą."
                />
                {/* Tam, gdzie scena stoi obok skryptu, flaga jest pod ręką — przycisk jest tylko dla wąskiego ekranu. */}
                <button
                  type="button"
                  onClick={runInView}
                  disabled={program.running}
                  className="mt-3 inline-flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-40 lg:hidden"
                  style={{ borderColor: color, color }}
                >
                  <GreenFlag className="h-4 w-4" />
                  Uruchom i pokaż na scenie
                </button>
              </div>
              {/* `scroll-mt-32` zostawia zapas na pasek powłoki, który dla gościa ma 118 px na telefonie. */}
              <div ref={stage} className="scroll-mt-32">
                <StageView
                  actors={[{ id: 'duszek', kind: 'kot', sprite: program.sprite, costume }]}
                  running={program.running}
                  onStart={program.start}
                  onStop={program.stop}
                  note={`kierunek ${Math.round(program.sprite.direction)}`}
                />
                {program.idle && (
                  <p className="mt-2 border-l-2 border-amber-500 bg-amber-50 p-2 text-xs leading-relaxed dark:bg-amber-950/30">
                    Flaga naciśnięta, duszek stoi. Nad twoimi klockami nie ma kapelusza{' '}
                    <strong>„kiedy kliknięto zieloną flagę”</strong>, więc flaga nie ma czego
                    uruchomić.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      }
      acceptedText={
        <>
          To chodzi <strong>twój</strong> duszek, twoim skryptem — uruchomiłam go u siebie i
          obejrzałam każdy krok. Popatrz wyżej, jak wygląda w czterech kierunkach przy stylu obrotu,
          który sam(a) mu ustawiłeś/ustawiłaś.
        </>
      }
    />
  );
}

/** Podgląd zamówienia: sam wynik. Jeśli dziecko narysowało duszka, to on tu spaceruje. */
function GoalPreview({ color, costume }: { color: string; costume?: Picture }) {
  const program = useProgram(GOAL, Z7_START);
  return (
    <div className="grid gap-3 border bg-muted/20 p-3 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)] sm:items-center">
      <StageView
        actors={[{ id: 'duszek', kind: 'kot', sprite: program.sprite, costume }]}
        running={program.running}
        onStart={program.start}
        onStop={program.stop}
      />
      <div className="text-sm leading-relaxed">
        <p className="flex items-center gap-1.5 font-semibold" style={{ color }}>
          <MousePointerClick className="h-4 w-4 shrink-0" aria-hidden />
          Naciśnij flagę — tak ma to wyglądać.
        </p>
        <p className="mt-2 text-muted-foreground">
          {costume
            ? 'To twój duszek z pracowni — możesz go poprawić albo narysować nowego.'
            : 'U ciebie będzie chodził duszek, którego sam(a) namalujesz.'}{' '}
          Liczy się to, że idzie <strong className="text-foreground">w obie strony</strong> i przez
          całą drogę <strong className="text-foreground">stoi na nogach</strong>.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Raport — jego duszek w czterech kierunkach                          */
/* ------------------------------------------------------------------ */

function Report({ report, color }: { report: Z7Report; color: string }) {
  const { pic, style } = report;
  if (!pic) return null;
  const shown: RotationStyle = style ?? 'dowolny';

  return (
    <div className="border bg-muted/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        Twój duszek w czterech kierunkach
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Styl obrotu <strong className="text-foreground">{shown}</strong> —{' '}
        {style ? 'ten z klocka w twoim skrypcie' : 'bo w skrypcie nie ma klocka stylu, więc obowiązuje domyślny'}.
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {FOUR_WAYS.map((way) => (
          <div key={way.direction} className="text-center">
            {/* Cała kratka kostiumu, nie tylko rysunek — obrót idzie wokół krzyżyka na jej środku. */}
            <div className="mx-auto aspect-square w-full max-w-24 border bg-white dark:border-zinc-700">
              <div
                className="h-full w-full"
                style={{
                  transform: spriteTransform({
                    ...Z7_START,
                    direction: normalizeDirection(way.direction),
                    rotationStyle: shown,
                  }),
                }}
              >
                <CostumeArt pic={pic} />
              </div>
            </div>
            <p className="mt-1 text-[10px] leading-tight text-muted-foreground">{way.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
