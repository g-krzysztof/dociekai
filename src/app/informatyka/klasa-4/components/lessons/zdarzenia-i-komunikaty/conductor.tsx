'use client';

import { useMemo, useState } from 'react';
import { Check, Keyboard, MousePointerClick } from 'lucide-react';
import { BlockChip } from '../../scratch/bench';
import { StageView } from '../../scratch/stage-view';
import { useStage } from '../../scratch/use-stage';
import { HOME, make, type Block, type Sprite } from '../../scratch/engine';
import type { ActorDef, Trigger } from '../../scratch/stage-engine';

/**
 * „Kto to usłyszał?” — haczyk lekcji.
 *
 * Trzy duszki, trzy różne kapelusze, jeden wniosek: **skrypt nie należy do
 * programu, tylko do duszka, i budzi go konkretne zdarzenie**. Dziecko nie czyta
 * o tym — wywołuje zdarzenia naprawdę: naciska zieloną flagę, **naciska klawisz
 * na swojej klawiaturze** i klika duszka na scenie.
 *
 * Blok kończy się **niepowodzeniem, i to celowo**: druga runda prosi o obudzenie
 * wszystkich trzech jednym naciśnięciem, a tymi trzema wyzwalaczami się nie da —
 * każdy z nich słucha tylko jeden duszek. Licznik „ile duszków obudziło jedno
 * naciśnięcie” dochodzi do 1 i nie rusza dalej. To jest cała motywacja dla
 * komunikatów, które przychodzą w trzecim bloku; gdyby lekcja zaczęła się od
 * nich, nikt nie wiedziałby, po co są.
 *
 * Klawisz da się nacisnąć **naprawdę** (obszar z `tabIndex`, `keydown` po
 * `focus`), a na ekranach dotykowych stoi obok przycisk z tą samą etykietą —
 * ten sam układ co `ShortcutShow` w lekcji 15.
 */

const CAST: { id: string; kind: 'kot' | 'pilka' | 'gwiazdka'; name: string; home: Sprite; hat: Block; say: string }[] = [
  {
    id: 'kot',
    kind: 'kot',
    name: 'Kot',
    home: { ...HOME, x: -140, y: 70 },
    hat: make('flaga'),
    say: 'Słyszę flagę!',
  },
  {
    id: 'pilka',
    kind: 'pilka',
    name: 'Piłka',
    home: { ...HOME, x: 0, y: -40 },
    hat: make('klawisz', 'spacja'),
    say: 'Słyszę spację!',
  },
  {
    id: 'gwiazdka',
    kind: 'gwiazdka',
    name: 'Gwiazdka',
    home: { ...HOME, x: 140, y: 70 },
    hat: make('klik'),
    say: 'Ktoś mnie kliknął!',
  },
];

/** Po tylu próbach w rundzie 2 wniosek „nie da się” jest już wnioskiem z pomiaru. */
const ENOUGH_TRIES = 4;

interface ConductorProps {
  color: string;
  onComplete?: () => void;
}

export function Conductor({ color, onComplete }: ConductorProps) {
  const actors = useMemo<ActorDef[]>(
    () =>
      CAST.map((item) => ({
        id: item.id,
        name: item.name,
        home: item.home,
        scripts: [[item.hat, make('powiedz', item.say)]],
      })),
    []
  );

  const stage = useStage(actors);
  const [woken, setWoken] = useState<string[]>([]);
  const [tries, setTries] = useState(0);
  const [best, setBest] = useState(0);
  const [round, setRound] = useState(0);
  const [missed, setMissed] = useState(false);

  const fire = (trigger: Trigger) => {
    stage.fire(trigger);
    const run = runPreview(actors, trigger);
    setMissed(run.length === 0);
    if (round === 0) {
      const all = Array.from(new Set([...woken, ...run]));
      setWoken(all);
      if (all.length === CAST.length) setRound(1);
      return;
    }
    setTries((value) => value + 1);
    setBest((value) => Math.max(value, run.length));
  };

  const stuck = round === 1 && tries >= ENOUGH_TRIES && best <= 1;

  const finish = () => {
    setRound(2);
    onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
        <div>
          <StageView
            actors={CAST.map((item) => ({
              id: item.id,
              kind: item.kind,
              sprite: stage.sprites[item.id] ?? item.home,
            }))}
            running={stage.running}
            note={stage.running ? 'Program idzie' : 'Scena'}
            onStagePointer={(point, phase) => {
              if (phase !== 'down') return;
              const hit = CAST.find(
                (item) => Math.hypot(point.x - item.home.x, point.y - item.home.y) < 45
              );
              if (hit) fire({ kind: 'klik', actorId: hit.id });
            }}
            className="max-w-[420px]"
          />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            W duszka na scenie można kliknąć — spróbuj.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Wyzwalacze
          </p>
          <div className="mt-2 space-y-2">
            <button
              type="button"
              onClick={() => fire({ kind: 'flaga' })}
              className="flex w-full cursor-pointer items-center gap-2 border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50"
            >
              <Flag />
              zielona flaga
            </button>

            <div
              tabIndex={0}
              role="button"
              onKeyDown={(event) => {
                if (event.key !== ' ' && event.code !== 'Space') return;
                event.preventDefault();
                fire({ kind: 'klawisz', key: 'spacja' });
              }}
              className="flex w-full cursor-pointer items-center gap-2 border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50 focus-visible:outline-2"
              style={{ outlineColor: color }}
            >
              <Keyboard className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              kliknij tutaj i naciśnij spację
            </div>

            <button
              type="button"
              onClick={() => fire({ kind: 'klik', actorId: 'gwiazdka' })}
              className="flex w-full cursor-pointer items-center gap-2 border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50"
            >
              <MousePointerClick className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              kliknij Gwiazdkę
            </button>
          </div>

          {missed && (
            <p className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
              Nikt tego nie słuchał — żaden duszek nie ma takiego kapelusza.
            </p>
          )}

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Skrypty duszków
          </p>
          <div className="mt-2 space-y-3">
            {CAST.map((item) => (
              <div key={item.id}>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.name}
                  {round === 0 && woken.includes(item.id) && (
                    <Check className="ml-1 inline h-3 w-3" style={{ color }} aria-hidden />
                  )}
                </p>
                <div className="w-fit">
                  <BlockChip block={item.hat} />
                  <BlockChip block={make('powiedz', item.say)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 border-t pt-3">
        {round === 0 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Zlecenie 1 z 2
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              <strong>Odezwij się do każdego z trzech duszków.</strong> Przeczytaj ich kapelusze —
              każdy słucha czegoś innego. Obudzone: {woken.length} z {CAST.length}.
            </p>
          </>
        )}

        {round === 1 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Zlecenie 2 z 2
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              Wszyscy trzej się odezwali — ale <strong>jeden po drugim</strong>. Teraz spróbuj tak,
              żeby <strong>jedno naciśnięcie obudziło więcej niż jednego duszka</strong>.
            </p>
            <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
              Prób: {tries} · najwięcej duszków obudzonych jednym naciśnięciem:{' '}
              <strong className="text-foreground">{best}</strong>
            </p>
            {stuck && (
              <div className="mt-3 p-3" style={{ backgroundColor: `${color}14` }}>
                <p className="text-sm leading-relaxed">
                  I nie da się. <strong>Każdy z tych trzech wyzwalaczy słucha tylko jeden duszek</strong>
                  {' '}— flagi Kot, spacji Piłka, kliknięcia Gwiazdka. Żeby jedno zdarzenie usłyszeli
                  wszyscy naraz, potrzebny jest inny sposób. Poznasz go za dwa bloki.
                </p>
                <button
                  type="button"
                  onClick={finish}
                  className="mt-2 cursor-pointer border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
                  style={{ borderColor: color, color }}
                >
                  Rozumiem — idźmy dalej
                </button>
              </div>
            )}
          </>
        )}

        {round === 2 && (
          <div className="p-3" style={{ backgroundColor: `${color}14` }}>
            <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
              <Check className="h-4 w-4 shrink-0" aria-hidden />
              Zapamiętaj to zdanie.
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">
              <strong>Skrypt nie należy do programu, tylko do duszka</strong> — i rusza dopiero
              wtedy, gdy zdarzy się to, co jest napisane na jego kapeluszu. Duszków może ruszyć
              kilka naraz; trzeba im tylko dać wspólny powód.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Kto obudziłby się przy tym wyzwalaczu — do licznika, bez czekania na animację. */
function runPreview(actors: ActorDef[], trigger: Trigger): string[] {
  const woken: string[] = [];
  for (const actor of actors)
    for (const stack of actor.scripts) {
      const hat = stack[0];
      if (!hat) continue;
      if (trigger.kind === 'flaga' && hat.type === 'flaga') woken.push(actor.id);
      if (trigger.kind === 'klawisz' && hat.type === 'klawisz' && hat.value === trigger.key)
        woken.push(actor.id);
      if (trigger.kind === 'klik' && hat.type === 'klik' && actor.id === trigger.actorId)
        woken.push(actor.id);
    }
  return Array.from(new Set(woken));
}

function Flag() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M5 3v18" stroke="#2f7a2f" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <path d="M6 4.5h12l-3 3.5 3 3.5H6z" fill="#4cbb17" />
    </svg>
  );
}
