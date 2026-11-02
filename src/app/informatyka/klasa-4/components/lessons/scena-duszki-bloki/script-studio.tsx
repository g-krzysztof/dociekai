'use client';

import { useMemo, useState } from 'react';
import { MousePointerClick } from 'lucide-react';
import { count } from '../../../lib/plural';
import { TaskShell } from '../../task-shell';
import { Bench } from '../../scratch/bench';
import { StageView } from '../../scratch/stage-view';
import { useProgram } from '../../scratch/use-program';
import { blocksToProgram } from '../../scratch/blocks-to-project';
import type { ScratchSprite } from '../../scratch/program';
import {
  HOME,
  make,
  run,
  type Block,
  type BlockType,
  type Category,
  type Frame,
} from '../../scratch/engine';
import { FIRST_SCRIPT_CRITERIA, judgeFirstScript } from './judge';

/**
 * Zadanie praktyczne tej lekcji — **wykonywane na stronie**, na tym samym `Benchu`
 * i tej samej scenie, na których dziecko pracowało w blokach 2–4.
 *
 * Zlecenie opisuje wynik, nie klocki. Paleta ma osiem klocków, a zamówienie
 * potrzebuje czterech — pozostałe (`pokaż`, `ukryj`, `zagraj dźwięk`, `wróć na
 * start`) są po to, żeby trzeba było **wybrać**, nie tylko poskładać. Werdykt
 * czyta program przez `blocksToProgram` (ten sam kształt, w którym sędzia czytał
 * kiedyś plik), więc nie wie, skąd program przyszedł.
 *
 * Nagrodą nie jest ptaszek, tylko **program widziany oczami widza**: silnik
 * uruchamia skrypt dziecka i strona pokazuje kolejne klatki sceny. Widz nie widzi
 * klocków — widzi tylko to, co dzieje się na scenie, i właśnie tego uczy lekcja.
 */

/** Wzorzec zamówienia — pokazujemy **wynik**, nigdy klocków. Ich dziecko ma się domyślić samo. */
const GOAL: Block[] = [
  make('flaga'),
  make('powiedz', 'Cześć!'),
  make('czekaj', 1),
  make('idz', 100),
];

const PALETTE: BlockType[] = [
  'flaga',
  'powiedz',
  'pokaz',
  'ukryj',
  'idz',
  'wroc',
  'czekaj',
  'dzwiek',
];

/** Kot z makiety — sędzia widzi go jako jedynego duszka projektu. */
const CAT: ScratchSprite = {
  name: 'Kot',
  x: HOME.x,
  y: HOME.y,
  direction: HOME.direction,
  visible: true,
  rotationStyle: HOME.rotationStyle,
  costumes: [],
};

/** Ile klatek pokazujemy w nagrodzie — dłuższy program dostaje pierwsze cztery i dopisek. */
const MAX_STILLS = 4;

interface ScriptStudioProps {
  color: string;
  onComplete?: () => void;
}

export function ScriptStudio({ color, onComplete }: ScriptStudioProps) {
  const [stacks, setStacks] = useState<Block[][]>([[]]);
  const [category, setCategory] = useState<Category>('zdarzenia');
  /* Migawka pracy z chwili sprawdzenia: nagroda ma pokazać to, co przeszło werdykt, a nie to, co dziecko przestawiło potem. */
  const [checked, setChecked] = useState<{ blocks: Block[]; attempt: number } | null>(null);
  const program = useProgram(stacks[0] ?? []);

  const judge = () => {
    setChecked((previous) => ({ blocks: stacks[0] ?? [], attempt: (previous?.attempt ?? 0) + 1 }));
    return { verdicts: judgeFirstScript(blocksToProgram([{ sprite: CAT, stacks }])), data: null };
  };

  const reset = () => {
    setStacks([[]]);
    setCategory('zdarzenia');
    setChecked(null);
    program.clear();
  };

  return (
    <TaskShell
      color={color}
      brief={
        <>
          <p>
            Zamawiam u ciebie <strong>jednego duszka, który wita widza i odchodzi</strong>. Po
            naciśnięciu zielonej flagi ma powiedzieć coś od siebie, odczekać chwilę — i dopiero
            wtedy ruszyć w bok.
          </p>
          <p className="mt-2">
            Nie podam ci listy klocków. W palecie jest ich osiem, a zamówienie potrzebuje tylko
            niektórych — <strong>wybierz je sam/sama</strong>. Kiedy skończysz, przeczytam twój
            skrypt klocek po klocku i powiem, co w nim znalazłam.
          </p>
        </>
      }
      goal={<GoalPreview color={color} />}
      criteria={FIRST_SCRIPT_CRITERIA}
      workshop={
        <div>
          <p className="mb-3 text-sm leading-relaxed">
            Ułóż skrypt i <strong>uruchom go zieloną flagą</strong> — zobacz na scenie, co zrobi,
            zanim mi go oddasz.
          </p>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
            <Bench
              color={color}
              stacks={stacks}
              onStacksChange={setStacks}
              available={PALETTE}
              category={category}
              onCategoryChange={setCategory}
              active={program.active ? { stack: 0, ...program.active } : null}
              locked={program.running}
              scriptHint="Pusto. Każdy skrypt zaczyna się kapeluszem z zieloną flagą."
            />
            <div>
              <StageView
                actors={[{ id: 'kot', kind: 'kot', sprite: program.sprite, sound: program.sound }]}
                running={program.running}
                onStart={program.start}
                onStop={program.stop}
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
      }
      judge={judge}
      onReset={reset}
      acceptedText={
        <>
          To jest <strong>twój</strong> program — nie mój i nie z pokazu. Przeczytałam go klocek po
          klocku, dokładnie tak, jak leży na stole: flaga, słowa, chwila ciszy i ruch, w tej
          kolejności. Zobacz niżej, jak wygląda dla widza.
        </>
      }
      reward={checked && <ProgramFilm key={checked.attempt} blocks={checked.blocks} color={color} />}
      onComplete={onComplete}
    />
  );
}

/** Podgląd zamówienia: sam wynik, bez klocków. Klocki dziecko dobiera samo. */
function GoalPreview({ color }: { color: string }) {
  const program = useProgram(GOAL);
  return (
    <div className="grid gap-3 border bg-muted/20 p-3 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)] sm:items-center">
      <StageView
        actors={[{ id: 'kot', kind: 'kot', sprite: program.sprite, sound: program.sound }]}
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
          U ciebie tekst w dymku i liczba kroków będą własne. Liczy się{' '}
          <strong className="text-foreground">kolejność</strong>: najpierw słowa, potem chwila
          ciszy, na końcu ruch.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nagroda: program oczami widza                                       */
/* ------------------------------------------------------------------ */

/** „1,5” zamiast „1.5” — sekundy po polsku. */
function seconds(ms: number): string {
  return String(Math.round(ms / 100) / 10).replace('.', ',');
}

/** Co zmieniło się na scenie względem poprzedniej klatki — tyle, ile widz jest w stanie zauważyć. */
function caption(frame: Frame, previous: Frame | null): string {
  const now = frame.sprite;
  const before = previous?.sprite;
  const parts: string[] = [];

  if (now.say && now.say !== before?.say) parts.push(`mówi „${now.say}”`);
  const moved = before ? Math.round(Math.hypot(now.x - before.x, now.y - before.y)) : 0;
  if (moved > 0) parts.push(`przechodzi ${count(moved, 'krok', 'kroki', 'kroków')}`);
  if (before && now.visible !== before.visible) parts.push(now.visible ? 'pojawia się' : 'znika');
  if (frame.sound) parts.push('gra dźwięk');

  if (parts.length === 0) return before ? 'Nic się nie zmienia.' : 'Stoi na starcie.';
  const text = parts.join(', ');
  return `${text[0].toUpperCase()}${text.slice(1)}.`;
}

function ProgramFilm({ blocks, color }: { blocks: Block[]; color: string }) {
  const frames = useMemo(() => run(blocks).frames, [blocks]);
  if (frames.length === 0) return null;

  const stills = frames.slice(0, MAX_STILLS).map((frame, index) => {
    const before = index > 0 ? frames[index - 1] : null;
    const shifted = before && (before.sprite.x !== frame.sprite.x || before.sprite.y !== frame.sprite.y);
    return {
      frame,
      at: frames.slice(0, index).reduce((sum, earlier) => sum + earlier.hold, 0),
      text: caption(frame, before),
      /* Krótki krok to kilka pikseli na scenie — blada sylwetka pokazuje, skąd duszek przyszedł. */
      ghosts: shifted ? [{ kind: 'kot' as const, x: before.sprite.x, y: before.sprite.y }] : undefined,
    };
  });
  const anyGhost = stills.some((still) => still.ghosts);

  return (
    <div className="border bg-muted/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        Tak zobaczy to widz
      </p>
      <p className="mt-1 text-sm leading-relaxed">
        Widz nie widzi twoich klocków. Widzi tylko scenę — więc tak wygląda twój program, klatka po
        klatce:
      </p>

      <ol className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stills.map(({ frame, at, text, ghosts }, index) => (
          <li key={index}>
            <StageView
              actors={[{ id: `klatka-${index}`, kind: 'kot', sprite: frame.sprite, sound: frame.sound }]}
              ghosts={ghosts}
              note={`klatka ${index + 1} · ${seconds(at)} s`}
              className="mx-0"
            />
            <p className="mt-1.5 text-sm leading-snug">{text}</p>
          </li>
        ))}
      </ol>

      {anyGhost && (
        <p className="mt-2 text-xs text-muted-foreground">
          Blada sylwetka pokazuje, gdzie duszek stał w poprzedniej klatce.
        </p>
      )}

      {frames.length > MAX_STILLS && (
        <p className="mt-2 text-xs text-muted-foreground">
          …i jeszcze {count(frames.length - MAX_STILLS, 'klatka', 'klatki', 'klatek')} dalej.
        </p>
      )}

      {frames.length > 1 && (
        <p className="mt-3 text-sm leading-relaxed">
          Klatki dzieli <strong>{seconds(frames[0].hold)} s</strong> — tyle, ile odczekał klocek
          „czekaj”. Bez niego wszystko wydarzyłoby się w jednej klatce i widz zobaczyłby tylko to,
          co na samym końcu.
        </p>
      )}
    </div>
  );
}
