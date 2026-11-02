'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Check, CornerUpLeft, Flag, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { BlockChip } from '../../scratch/bench';
import { Script } from '../../scratch/loop-stack';
import { StageView } from '../../scratch/stage-view';
import { useProgram } from '../../scratch/use-program';
import { HOME, make, run, type Block, type Run } from '../../scratch/engine';

/**
 * Blok 4 — **objaśnianie instrukcji przez wyjęcie jej z programu** `[2.3]`.
 *
 * Wymaganie mówi „uzasadnia swój sposób rozwiązania, objaśnia działanie
 * wybranych instrukcji”. Zapytane wprost „po co jest ten klocek?”, dziecko
 * odpowiada zdaniem z samouczka. Tutaj odpowiada **doświadczeniem**: wyjmuje
 * klocek, uruchamia program i patrzy, co przestało działać. Dokładnie tak robi
 * programista, który nie jest pewien, czy dana linijka jest jeszcze potrzebna.
 *
 * Trzy obietnice, trzy klocki, jedno przypisanie — ale widżet **nie sprawdza,
 * czy dziecko wskazało właściwy klocek**, tylko czy jego doświadczenie coś
 * zepsuło. Dowodem jest skutek, nie zgadnięcie.
 *
 * Dwa zabezpieczenia są tu ważniejsze niż same obietnice, bo uczą, czym jest
 * uczciwe doświadczenie: wyjęcie kapelusza **wyłącza cały program**, a wyjęcie
 * pętli zabiera ze sobą jej wnętrze — w obu przypadkach zmieniła się więcej niż
 * jedna rzecz i nie wolno z tego nic wnioskować. Widżet mówi to wprost zamiast
 * policzyć taką próbę jako dowód.
 */

/* Skrypt, który naprawdę działa — i o to chodzi: psujemy coś, co jest sprawne. */
const SCRIPT: Block[] = [
  make('flaga'),
  make('wroc'),
  /*
   * Kierunek jest w skrypcie razem z miejscem, bo „wróć na start” odstawia
   * duszka, ale NIE prostuje mu nosa — a po odbiciu od krawędzi kot zostaje
   * zwrócony w lewo. Bez tego klocka drugi przebieg różniłby się od pierwszego
   * nawet w kompletnym programie i cała trzecia obietnica byłaby nieprawdziwa.
   */
  make('kierunek', 90),
  make('styl', 'lewo-prawo'),
  make('powtorz', 10, [make('idz', 45), make('odbij')]),
  make('powiedz', 'koniec'),
];

interface Claim {
  id: string;
  text: string;
  /** Czy obietnica jest prawdziwa dla tej wersji programu. */
  holds: (first: Run, second: Run) => boolean;
  /** Zdanie, gdy dziecko ją złamie. */
  broke: string;
}

const CLAIMS: Claim[] = [
  {
    id: 'krawedz',
    text: 'Kot zawraca przy krawędzi sceny, zamiast się o nią oprzeć.',
    holds: (first) => first.bounces > 0,
    broke: 'Kot dojechał do krawędzi i się o nią oparł — dalej już tylko przebierał łapami w miejscu.',
  },
  {
    id: 'glowa',
    text: 'Kot nigdy nie idzie głową w dół.',
    holds: (first, second) => !first.upsideDown && !second.upsideDown,
    broke: 'W drodze powrotnej kot szedł do góry nogami.',
  },
  {
    id: 'start',
    text: 'Po każdym kliknięciu flagi kot zaczyna tak samo: z tego samego miejsca i zwrócony w tę samą stronę.',
    holds: (first, second) => sameEnding(first, second),
    broke: 'Drugie uruchomienie skończyło się inaczej niż pierwsze — bo zaczęło się w innym stanie niż pierwsze.',
  },
];

function endOf(result: Run) {
  return result.frames[result.frames.length - 1]?.sprite ?? HOME;
}

/** Czy dwa przebiegi kończą się tak samo — po tym poznajemy program, który startuje zawsze tak samo. */
function sameEnding(first: Run, second: Run): boolean {
  const a = endOf(first);
  const b = endOf(second);
  return Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1 && a.direction === b.direction;
}

/** Skrypt bez jednego klocka — szukamy po `id`, więc działa też w środku pętli. */
function without(blocks: Block[], id: string): Block[] {
  return blocks
    .filter((block) => block.id !== id)
    .map((block) => (block.inner ? { ...block, inner: without(block.inner, id) } : block));
}

function findBlock(blocks: Block[], id: string): Block | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    const inner = block.inner ? findBlock(block.inner, id) : null;
    if (inner) return inner;
  }
  return null;
}

type Outcome =
  | { kind: 'martwy' }
  | { kind: 'bez-ruchu' }
  | { kind: 'wynik'; broken: string[] };

interface PullOutProps {
  color: string;
  onComplete?: () => void;
}

export function PullOut({ color, onComplete }: PullOutProps) {
  const [pulled, setPulled] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [proven, setProven] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const script = useMemo(() => (pulled ? without(SCRIPT, pulled) : SCRIPT), [pulled]);
  const program = useProgram(script, HOME);
  const anchorRef = useSectionScrollAnchor(Object.keys(proven).length);

  const pulledBlock = pulled ? findBlock(SCRIPT, pulled) : null;

  const pull = (id: string) => {
    if (program.running) return;
    setPulled((current) => (current === id ? null : id));
    setOutcome(null);
    program.clear();
  };

  const test = () => {
    const first = run(script, HOME);
    /* Drugi przebieg startuje tam, gdzie skończył pierwszy — tak samo jak w Scratchu. */
    const second = run(script, endOf(first));
    program.start();

    if (!first.started) {
      setOutcome({ kind: 'martwy' });
      return;
    }
    const moved = first.log.some((step) => step.kind === 'ruch');
    if (!moved) {
      setOutcome({ kind: 'bez-ruchu' });
      return;
    }

    const broken = CLAIMS.filter((claim) => !claim.holds(first, second)).map((claim) => claim.id);
    setOutcome({ kind: 'wynik', broken });

    if (pulled && broken.length > 0) {
      const next = { ...proven };
      for (const id of broken) next[id] = pulled;
      setProven(next);
      if (!done && CLAIMS.every((claim) => next[claim.id])) {
        setDone(true);
        onComplete?.();
      }
    }
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/60 sm:p-5">
      <div className="mb-4 border-l-2 pl-3" style={{ borderColor: color }}>
        <p className="text-sm leading-relaxed">
          Ten skrypt <strong>działa</strong>. Kot chodzi tam i z powrotem po scenie i nic mu nie
          dolega. Pytanie brzmi inaczej: <strong>skąd wiesz, po co jest w nim każdy klocek?</strong>
        </p>
        <p className="mt-2 flex items-start gap-1.5 text-sm leading-relaxed">
          <Hand className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
          <span>
            Jest na to sposób, z którego programiści korzystają codziennie:{' '}
            <strong>wyjmij jeden klocek i zobacz, co przestanie działać</strong>. Niżej są trzy
            obietnice tego programu — udowodnij każdą z nich, łamiąc ją.
          </span>
        </p>
      </div>

      {/*
        * Kolejność na wąskim ekranie jest inna niż na szerokim i to jest cała
        * odpowiedź na audyt „wyświetlacz musi zostać na ekranie”: najpierw
        * skrypt z przyciskiem (sterowanie), zaraz pod nim scena z wynikiem
        * (wyświetlacz), a lista obietnic dopiero na końcu. Na szerokim scena
        * wraca na lewo, obok skryptu.
        */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-x-5 lg:gap-y-4">
        <div className="order-2 lg:order-none lg:col-start-1 lg:row-start-1 lg:row-span-2">
          <StageView
            actors={[{ id: 'kot', kind: 'kot', sprite: program.sprite }]}
            grid
            running={program.running}
            note={program.idle ? 'nie ma czego uruchomić' : program.running ? 'program idzie' : 'scena'}
          />

          {outcome && !program.running && (
            <div className="mx-auto mt-3 max-w-[340px]">
              {outcome.kind === 'martwy' && (
                <div className="border-l-2 border-amber-500 bg-amber-50 p-3 dark:bg-amber-950/30">
                  <p className="text-sm leading-relaxed">
                    Bez kapelusza zielona flaga nie ma czego uruchomić — <strong>zgasł cały
                    program</strong>, a nie jedna jego część. Takie doświadczenie nie mówi nic o
                    żadnym pojedynczym klocku.
                  </p>
                </div>
              )}
              {outcome.kind === 'bez-ruchu' && (
                <div className="border-l-2 border-amber-500 bg-amber-50 p-3 dark:bg-amber-950/30">
                  <p className="text-sm leading-relaxed">
                    Kot w ogóle się nie ruszył, więc o chodzeniu po scenie nie da się z tego
                    wywnioskować nic. <strong>Wyjąłeś/wyjęłaś więcej niż jedną rzecz naraz</strong> —
                    klocek z paszczą zabiera ze sobą wszystko, co ma w środku.
                  </p>
                </div>
              )}
              {outcome.kind === 'wynik' && (
                <div
                  className={cn(
                    'p-3',
                    outcome.broken.length === 0 ? 'bg-muted/50' : 'bg-amber-50 dark:bg-amber-950/30'
                  )}
                >
                  {outcome.broken.length === 0 ? (
                    <p className="text-sm leading-relaxed">
                      {pulledBlock ? (
                        <>
                          Program działa dalej tak samo — <strong>żadna z trzech obietnic się nie
                          zepsuła</strong>. Ten klocek odpowiada więc za coś innego. To też jest
                          wynik doświadczenia, nie pomyłka.
                        </>
                      ) : (
                        <>
                          Tak wygląda ten program <strong>w komplecie</strong>: wszystkie trzy
                          obietnice są spełnione. Teraz wyjmij jeden klocek i uruchom jeszcze raz.
                        </>
                      )}
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {outcome.broken.map((id) => (
                        <li key={id} className="flex items-start gap-1.5 text-sm leading-relaxed">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                          <span>{CLAIMS.find((claim) => claim.id === id)?.broke}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="order-1 space-y-3 lg:order-none lg:col-start-2 lg:row-start-1">
          <div className="flex flex-wrap items-start gap-4">
            <div className="overflow-x-auto pb-1">
              <Script
                blocks={script}
                onBlockDown={(_path, block) => pull(block.id)}
              />
            </div>

            <div className="min-w-[150px]">
              <p className="mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                wyjęty klocek
              </p>
              <div className="flex min-h-[46px] items-start border border-dashed p-1.5">
                {pulledBlock ? (
                  <BlockChip block={pulledBlock} />
                ) : (
                  <span className="px-1 text-xs text-muted-foreground">pusto</span>
                )}
              </div>
              {pulledBlock && (
                <button
                  type="button"
                  onClick={() => pull(pulledBlock.id)}
                  className="mt-1.5 flex cursor-pointer items-center gap-1 text-xs underline underline-offset-2"
                >
                  <CornerUpLeft className="h-3 w-3 shrink-0" aria-hidden /> wstaw z powrotem
                </button>
              )}
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Stuknij w klocek, żeby go wyjąć — <strong className="text-foreground">jeden na
            raz</strong>. Doświadczenie, w którym zmieniło się kilka rzeczy naraz, nie mówi, która z
            nich zawiniła.
          </p>

          <button
            type="button"
            onClick={test}
            disabled={program.running}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 border py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: color, borderColor: color }}
          >
            <Flag className="h-4 w-4" aria-hidden />
            {pulledBlock ? 'Uruchom bez tego klocka' : 'Uruchom cały program'}
          </button>

        </div>

        <div className="order-3 space-y-3 lg:order-none lg:col-start-2 lg:row-start-2">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
              Trzy obietnice tego programu
            </p>
            <ul className="space-y-2">
              {CLAIMS.map((claim) => {
                const by = proven[claim.id];
                const block = by ? findBlock(SCRIPT, by) : null;
                return (
                  <li key={claim.id} className="border p-2">
                    <p className="flex items-start gap-1.5 text-sm leading-snug">
                      {by ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                      ) : (
                        <span
                          className="mt-1 h-3 w-3 shrink-0 border"
                          style={{ borderColor: `${color}80` }}
                          aria-hidden
                        />
                      )}
                      <span>{claim.text}</span>
                    </p>
                    <div className="mt-1.5 flex min-h-[26px] items-center gap-2 pl-[22px]">
                      {block ? (
                        <>
                          <span className="text-[11px] text-muted-foreground">odpowiada za to:</span>
                          <BlockChip block={block} />
                        </>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          jeszcze nie udowodnione
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {done && (
            <div className="p-3" style={{ backgroundColor: `${color}14` }}>
              <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
                <Check className="h-4 w-4 shrink-0" aria-hidden /> Trzy obietnice, trzy dowody.
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">
                Właśnie zrobiłeś/zrobiłaś coś, o co nauczyciel pyta słowami „<em>wytłumacz, jak
                działa twój program</em>”. Odpowiedź „bo działa” nie jest wytłumaczeniem.{' '}
                <strong>Jeśli umiesz powiedzieć, co się zepsuje bez danego klocka — wiesz, po co on
                tam jest.</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
