'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Bench } from '../../scratch/bench';
import { StageView } from '../../scratch/stage-view';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { useProgram } from '../../scratch/use-program';
import { hasHat, make, type Block, type BlockType, type Category, type Run } from '../../scratch/engine';

/**
 * Debugowanie — **trzy programy, które nie robią tego, co obiecuje ich autor**.
 *
 * Najważniejsza reguła tego bloku siedzi w jednej linijce: **paleta i skrypt są
 * zablokowane, dopóki dziecko nie naciśnie flagi**. Nie da się tu poprawiać na
 * ślepo. Najpierw trzeba uruchomić cudzy program i zobaczyć, co naprawdę robi —
 * i dopiero różnica między „co miało robić” a „co robi” jest miejscem, w którym
 * szuka się usterki. To jedyny widżet w kursie, który tak wymusza kolejność, i
 * to jest cała jego treść.
 *
 * Trzy usterki są celowo z **trzech różnych rodzin**, bo każda wygląda tak samo:
 * „nie działa”.
 *  - `bez-kapelusza` — nic się nie dzieje, bo flaga nie ma czego uruchomić;
 *  - `luzem` — dzieje się połowa, bo drugi klocek nie jest doczepiony (leży obok,
 *    a nie pod);
 *  - `za-szybko` — dzieje się wszystko i to jest problem, bo dzieje się naraz.
 *
 * Ostatnia jest najtrudniejsza i najważniejsza: program jest **poprawny**, tylko
 * człowiek nie nadąża. Dziecko musi dojść do tego, że brakującym klockiem jest
 * czekanie, którego nikt nie kazał mu dopisać.
 */

interface Case {
  id: string;
  author: string;
  brief: string;
  category: Category;
  build: () => Block[][];
  check: (run: Run) => { ok: boolean; note: string };
  lesson: string;
}

const CASES: Case[] = [
  {
    id: 'bez-kapelusza',
    author: 'Ania',
    brief: 'Po naciśnięciu flagi duszek ma się przywitać i przejść w prawo.',
    category: 'zdarzenia',
    build: () => [[make('powiedz', 'Cześć!'), make('idz', 100)]],
    check: (run) => {
      if (!run.started)
        return { ok: false, note: 'Flaga naciśnięta, duszek stoi. Dokładnie tak samo jak przed chwilą.' };
      const said = run.log.some((step) => step.kind === 'mowa');
      const moved = run.log.some((step) => step.kind === 'ruch');
      if (!said || !moved)
        return { ok: false, note: 'Coś już się dzieje, ale nie wszystko, co miało. Sprawdź, czego brakuje w słupku.' };
      return { ok: true, note: 'Rusza. Brakowało jednego klocka — tego, który mówi, KIEDY to ma się zacząć.' };
    },
    lesson:
      'Klocki same z siebie nic nie robią. Musi nad nimi stać kapelusz, czyli zdarzenie — coś, co je uruchamia. Bez niego program jest tylko listą, której nikt nie czyta.',
  },
  {
    id: 'luzem',
    author: 'Kuba',
    brief: 'Duszek ma się przywitać, a potem przejść w prawo.',
    category: 'ruch',
    build: () => [[make('flaga'), make('powiedz', 'Cześć!')], [make('idz', 100)]],
    check: (run) => {
      if (!run.started) return { ok: false, note: 'Teraz nie rusza nic — kapelusz musiał gdzieś wypaść.' };
      const said = run.log.some((step) => step.kind === 'mowa');
      const moved = run.log.some((step) => step.kind === 'ruch');
      if (said && !moved)
        return {
          ok: false,
          note: 'Przywitał się i stanął. Klocek z krokami dalej leży osobno — a osobno znaczy: nieuruchamiany.',
        };
      if (!said) return { ok: false, note: 'Duszek się nie odezwał. Sprawdź, czy klocek z mówieniem nadal jest w słupku.' };
      return { ok: true, note: 'Teraz robi obie rzeczy. Klocek musi DOTYKAĆ tego nad sobą, żeby się wykonał.' };
    },
    lesson:
      'Dwa klocki obok siebie i dwa klocki doczepione wyglądają prawie tak samo, a znaczą coś zupełnie innego. Uruchamia się tylko to, co wisi pod kapeluszem — reszta leży na planszy i czeka.',
  },
  {
    id: 'za-szybko',
    author: 'Zosia',
    brief: 'Duszek ma powiedzieć trzy zdania po kolei — tak, żeby każde dało się przeczytać.',
    category: 'kontrola',
    build: () => [
      [make('flaga'), make('powiedz', 'Cześć!'), make('powiedz', 'Jestem tu!'), make('powiedz', 'Pa!')],
    ],
    check: (run) => {
      if (!run.started) return { ok: false, note: 'Teraz nie rusza nic — kapelusz musiał gdzieś wypaść.' };
      const says = run.log.filter((step) => step.kind === 'mowa');
      if (says.length < 3)
        return { ok: false, note: `Zdań jest ${says.length}, a miały być trzy. Któreś wypadło ze słupka.` };
      const heldAll = says.slice(0, -1).every((say) => {
        const next = run.log.find((step) => step.at > say.at && step.kind === 'mowa');
        return run.log.some(
          (step) => step.kind === 'czekanie' && step.at > say.at && (!next || step.at < next.at)
        );
      });
      if (!heldAll)
        return {
          ok: false,
          note: 'Duszek powiedział wszystkie trzy zdania — tak szybko, że został tylko dymek z ostatnim. Program jest wykonany w całości; to człowiek nie nadąża.',
        };
      return { ok: true, note: 'Trzy zdania, każde do przeczytania. Program nie stał się mądrzejszy — dostał czas.' };
    },
    lesson:
      'Ta usterka jest najpodstępniejsza, bo program robił dokładnie to, co mu kazano. Komputer wykonuje klocki tak szybko, jak umie — jeśli coś ma być widoczne dla człowieka, trzeba mu to osobno kazać.',
  },
];

const AVAILABLE: BlockType[] = ['flaga', 'idz', 'wroc', 'powiedz', 'pokaz', 'ukryj', 'dzwiek', 'czekaj'];

/** Stała pusta lista — nowa tablica w każdym renderze zrywałaby zależności odtwarzacza. */
const EMPTY: Block[] = [];

interface FixRunProps {
  color: string;
  onComplete?: () => void;
}

export function FixRun({ color, onComplete }: FixRunProps) {
  const [at, setAt] = useState(0);
  const problem = CASES[Math.min(at, CASES.length - 1)];

  const [stacks, setStacks] = useState<Block[][]>(problem.build);
  const [category, setCategory] = useState<Category>(problem.category);

  /* Flaga uruchamia ten stos, nad którym stoi kapelusz — reszta leży i czeka. */
  const runIndex = stacks.findIndex(hasHat);
  const program = useProgram(stacks[runIndex >= 0 ? runIndex : 0] ?? EMPTY);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(at);

  const seen = program.attempts > 0;
  /* Werdykt istnieje dopiero po zakończonym przebiegu — także po takim, który w ogóle nie ruszył. */
  const settled = program.finished || program.idle;
  const verdict = settled && program.last ? problem.check(program.last) : null;
  const done = at >= CASES.length;

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const advance = () => {
    const next = CASES[at + 1];
    setAt(at + 1);
    if (next) {
      setStacks(next.build());
      setCategory(next.category);
    }
    program.clear();
  };

  if (done) {
    return (
      <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <p className="text-sm font-semibold sm:text-base" style={{ color }}>
          Trzy programy, trzy zupełnie różne usterki — i jedno wspólne zdanie na ekranie: „nie
          działa”.
        </p>
        <ul className="mt-3 space-y-2">
          {CASES.map((item) => (
            <li key={item.id} className="border-l-2 p-3" style={{ borderColor: color }}>
              <p className="text-sm leading-relaxed">{item.lesson}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm leading-relaxed">
          Zauważ, czego za każdym razem <strong>nie</strong> zrobiłeś/zrobiłaś: nie wpatrywałeś się w
          klocki. Najpierw uruchamiałeś/uruchamiałaś program i patrzyłeś/patrzyłaś na scenę —
          bo usterki nie widać w kodzie, widać ją w <strong>różnicy między tym, co program miał
          zrobić, a tym, co robi</strong>. Tak się szuka błędów i w Scratchu, i we wszystkim, co
          napiszesz później.
        </p>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">
          Projekt {at + 1} z {CASES.length} — {problem.author} mówi, że nie działa.
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">uruchomień: {program.attempts}</p>
      </div>
      <p className="mb-1 text-sm leading-relaxed">
        <span className="text-muted-foreground">Miało robić tak:</span> {problem.brief}
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        {seen
          ? 'Teraz szukaj różnicy między tym, co miało robić, a tym, co robi — i popraw.'
          : 'Najpierw naciśnij zieloną flagę. Dopóki nie zobaczysz, co ten program robi, nie ma czego poprawiać.'}
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
        <div className={cn(!seen && 'pointer-events-none opacity-60')} aria-disabled={!seen}>
          <Bench
            color={color}
            stacks={stacks}
            onStacksChange={setStacks}
            available={AVAILABLE}
            category={category}
            onCategoryChange={setCategory}
            active={program.active ? { stack: runIndex >= 0 ? runIndex : 0, ...program.active } : null}
            locked={!seen || program.running}
          />
        </div>
        <div>
          <StageView
            actors={[{ id: 'kot', kind: 'kot', sprite: program.sprite, sound: program.sound }]}
            running={program.running}
            onStart={program.start}
            onStop={program.stop}
          />
          {!seen && (
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
              Klocki są na razie zablokowane. Odblokują się, kiedy zobaczysz program w działaniu.
            </p>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {verdict && (
          <motion.div
            key={`${problem.id}-${program.attempts}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'mt-4 p-3 text-sm leading-relaxed',
              !verdict.ok && 'border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30'
            )}
            style={verdict.ok ? { backgroundColor: `${color}14` } : undefined}
          >
            <p className="flex items-start gap-2">
              {verdict.ok && <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />}
              <span>{verdict.note}</span>
            </p>
            {verdict.ok && (
              <>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{problem.lesson}</p>
                <button
                  type="button"
                  onClick={advance}
                  className="mt-3 px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: color }}
                >
                  {at === CASES.length - 1 ? 'Co łączyło te trzy usterki?' : 'Następny projekt'}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
