'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Bench } from '../../scratch/bench';
import { StageView } from '../../scratch/stage-view';
import { useStage } from '../../scratch/use-stage';
import { HOME, make, type Block, type BlockType, type Category, type Sprite } from '../../scratch/engine';
import {
  hiddenAt,
  oneByOne,
  shownAt,
  together,
  type ActorDef,
  type StageRun,
} from '../../scratch/stage-engine';
import { TimeTrack } from './time-track';

/**
 * „Miało być naraz” — blok debugowania i trzeci raz, kiedy moduł 6 sięga po swoją
 * pracownię klocków. Nowe jest to, że **skryptów jest siedem i należą do czterech
 * duszków**: pracownia dostaje podpisy stosów, bo bez nich nie da się powiedzieć,
 * czyj jest który — a cała lekcja jest o tym, kto co usłyszał.
 *
 * Jeden projekt, **trzy usterki z trzech różnych rodzin** — dokładnie ta sama
 * zasada, co przy trzech projektach w `FixRun` z lekcji 24, bo objaw jest za
 * każdym razem ten sam („nie znikają razem”), a przyczyna zupełnie inna:
 *
 * 1. **Litera L** czeka na komunikat o innej nazwie. Kapelusz jest, skrypt jest,
 *    tylko nikt do niej nie mówi — komunikat rozpoznaje się po nazwie.
 * 2. **Litera I** ma klocek `ukryj` **bez kapelusza**. W Scratchu wygląda to jak
 *    część programu i nią nie jest; to samo dziecko widziało w lekcji 24, ale
 *    tam luźny klocek leżał w jednym duszku, a tu chowa się wśród siedmiu stosów.
 * 3. **Litera S** znika **własnym czekaniem**, nie komunikatem — i przez to
 *    wypada z szeregu. To najtrudniejsza z trzech, bo ona *działa*: znika, tylko
 *    nie wtedy, kiedy trzeba.
 *
 * Werdykt czyta **czasy z przebiegu**, a diagnozę bierze ze skryptów, więc mówi
 * dziecku nie „coś nie tak”, tylko „litera S znika o pół sekundy wcześniej,
 * własnym czekaniem”.
 */

const LETTERS = [
  { id: 'l', letter: 'L', x: -80, wait: 0.5 },
  { id: 'i', letter: 'I', x: 0, wait: 1 },
  { id: 's', letter: 'S', x: 80, wait: 1.5 },
];

const CAT_HOME: Sprite = { ...HOME, x: -170, y: -95, visible: true };
const LETTER_HOME = (x: number): Sprite => ({ ...HOME, x, y: 35, visible: true });

const PALETTE: BlockType[] = ['flaga', 'klawisz', 'odbior', 'nadaj', 'pokaz', 'ukryj', 'czekaj'];

/** Który stos należy do którego duszka — kolejność jest też kolejnością podpisów. */
const OWNERS = ['kot', 'l', 'l', 'i', 'i', 's', 's'] as const;
const LABELS = [
  'Kot',
  'Litera L · pokazywanie',
  'Litera L · znikanie',
  'Litera I · pokazywanie',
  'Litera I · znikanie',
  'Litera S · pokazywanie',
  'Litera S · znikanie',
];

/** Zepsuty projekt, od którego zaczyna dziecko. Każdy stos to osobny skrypt. */
function broken(): Block[][] {
  return [
    [make('flaga'), make('czekaj', 2.5), make('nadaj', 'znikaj')],
    [make('flaga'), make('ukryj'), make('czekaj', 0.5), make('pokaz')],
    [make('odbior', 'dalej'), make('ukryj')],
    [make('flaga'), make('ukryj'), make('czekaj', 1), make('pokaz')],
    [make('ukryj')],
    [make('flaga'), make('ukryj'), make('czekaj', 1.5), make('pokaz'), make('czekaj', 0.5), make('ukryj')],
    /* Puste miejsce na skrypt znikania litery S — ona jako jedyna jeszcze go nie ma. */
    [],
  ];
}

interface AllAtOnceFixProps {
  color: string;
  onComplete?: () => void;
}

export function AllAtOnceFix({ color, onComplete }: AllAtOnceFixProps) {
  const [stacks, setStacks] = useState<Block[][]>(broken);
  const [category, setCategory] = useState<Category>('zdarzenia');
  const [solved, setSolved] = useState(false);

  const actors = useMemo<ActorDef[]>(() => {
    const byOwner = new Map<string, Block[][]>();
    stacks.forEach((stack, index) => {
      const owner = OWNERS[index] ?? 'kot';
      byOwner.set(owner, [...(byOwner.get(owner) ?? []), stack]);
    });
    return [
      { id: 'kot', name: 'Kot', home: CAT_HOME, scripts: byOwner.get('kot') ?? [] },
      ...LETTERS.map((item) => ({
        id: item.id,
        name: `Litera ${item.letter}`,
        home: LETTER_HOME(item.x),
        scripts: byOwner.get(item.id) ?? [],
      })),
    ];
  }, [stacks]);

  const stage = useStage(actors);
  const verdict = stage.finished && stage.last ? judge(stage.last, actors, stacks) : null;

  useEffect(() => {
    if (!verdict?.ok || solved) return;
    setSolved(true);
    onComplete?.();
  }, [verdict?.ok, solved, onComplete]);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed">
        Ten projekt <strong>prawie</strong> działa: litery pojawiają się po kolei i składają na słowo,
        a Kot po dwóch i pół sekundy nadaje komunikat „znikaj”. Tylko że znikanie wychodzi{' '}
        <strong>byle jak</strong>. Uruchom, popatrz na oś czasu i znajdź trzy powody — każdy jest
        inny.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
        <Bench
          color={color}
          stacks={stacks}
          onStacksChange={setStacks}
          available={PALETTE}
          category={category}
          onCategoryChange={setCategory}
          locked={stage.running}
          stackLabels={LABELS}
        />

        <div>
          <StageView
            actors={[
              { id: 'kot', kind: 'kot', sprite: stage.sprites.kot ?? CAT_HOME },
              ...LETTERS.map((item) => ({
                id: item.id,
                kind: 'kot' as const,
                letter: item.letter,
                sprite: stage.sprites[item.id] ?? LETTER_HOME(item.x),
              })),
            ]}
            running={stage.running}
            onStart={() => stage.fire({ kind: 'flaga' })}
            onStop={stage.stop}
          />
          <TimeTrack
            className="mt-3"
            rows={[
              { id: 'kot', label: 'Kot' },
              ...LETTERS.map((item) => ({
                id: item.id,
                letter: item.letter,
                label: `Litera ${item.letter}`,
              })),
            ]}
            run={stage.last}
            now={stage.now}
            note="Zielona kropka — litera się pokazuje. Pusta obwódka — znika. Żółty romb — Kot nadaje komunikat."
          />
        </div>
      </div>

      <div className="mt-4 border-t pt-3">
        {verdict ? (
          <div
            className={cn(
              'p-3',
              !verdict.ok && 'border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30'
            )}
            style={verdict.ok ? { backgroundColor: `${color}14` } : undefined}
          >
            <p
              className="flex items-center gap-2 text-sm font-semibold"
              style={verdict.ok ? { color } : undefined}
            >
              {verdict.ok ? (
                <>
                  <Check className="h-4 w-4 shrink-0" aria-hidden />
                  Naprawione.
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
                  Jeszcze nie.
                </>
              )}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">{verdict.note}</p>
            {verdict.ok && (
              <p className="mt-1.5 text-sm leading-relaxed">
                Trzy różne powody, jeden objaw. Dlatego przy „nie działa” nie zgaduje się poprawki —
                najpierw patrzy się, <strong>co się naprawdę stało i kiedy</strong>.
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Cel:</strong> litery mają dalej pojawiać się po
            kolei, a znikać wszystkie trzy w tej samej chwili — w tej, w której Kot nadaje komunikat.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function judge(run: StageRun, actors: ActorDef[], stacks: Block[][]): { ok: boolean; note: string } {
  const letters = LETTERS.map((item) => ({
    ...item,
    actor: actors.find((actor) => actor.id === item.id)!,
    /* Stosy tego duszka — z nich bierze się diagnoza, gdy czas czegoś nie wyjaśnia. */
    own: stacks.filter((_stack, index) => OWNERS[index] === item.id),
  }));

  const shows = letters.map((item) => shownAt(run, item.id, item.actor.home));
  if (shows.some((time) => time == null))
    return { ok: false, note: 'Któraś litera w ogóle się nie pokazała — pokazywanie było dobre, popraw to, co zepsułeś/zepsułaś.' };
  if (!oneByOne(shows))
    return {
      ok: false,
      note: 'Litery przestały pojawiać się po kolei. To akurat działało — przywróć różne czekania przed klockiem „pokaż”.',
    };

  const hides = letters.map((item) => hiddenAt(run, item.id, item.actor.home));
  const missing = letters.filter((_item, index) => hides[index] == null);
  if (missing.length > 0) {
    const item = missing[0];
    const loose = item.own.find((stack) => stack.length > 0 && stack[0].type !== 'flaga' && stack[0].type !== 'odbior' && stack[0].type !== 'klawisz' && stack[0].type !== 'klik');
    const wrongMessage = item.own
      .flatMap((stack) => (stack[0]?.type === 'odbior' ? [String(stack[0].value ?? '')] : []))
      .find((message) => message !== 'znikaj');
    return {
      ok: false,
      note: `Litera ${item.letter} została na scenie. ${
        loose
          ? 'Jej klocek „ukryj” leży luzem, bez kapelusza — w Scratchu wygląda jak część programu, a nie jest.'
          : wrongMessage
            ? `Czeka na komunikat „${wrongMessage}”, a Kot nadaje „znikaj”. Komunikat rozpoznaje się po nazwie.`
            : 'Nie ma skryptu, który by ją ukrył.'
      }`,
    };
  }

  if (!together(hides)) {
    const cat = run.log.find((step) => step.kind === 'komunikat');
    const odd = letters
      .map((item, index) => ({ item, t: hides[index] as number }))
      .sort((a, b) => a.t - b.t)[0];
    const ownTimer = odd.item.own.some(
      (stack) => stack.some((block) => block.type === 'czekaj') && stack.some((block) => block.type === 'ukryj')
    );
    return {
      ok: false,
      note: `Litery znikają, ale w różnych chwilach — na osi widać schodki. Pierwsza wypada ${odd.item.letter}, w ${(odd.t / 1000).toFixed(1)} s${
        cat ? `, a Kot nadaje komunikat dopiero w ${(cat.t / 1000).toFixed(1)} s` : ''
      }. ${ownTimer ? 'Ona nie słucha komunikatu — znika własnym czekaniem.' : ''}`,
    };
  }

  return {
    ok: true,
    note: 'Trzy puste obwódki stoją w jednej pionowej kresce, dokładnie nad rombem Kota. Litery pojawiają się po kolei i znikają jednocześnie.',
  };
}
