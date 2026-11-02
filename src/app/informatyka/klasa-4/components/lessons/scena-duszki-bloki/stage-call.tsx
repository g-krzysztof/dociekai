'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockChip } from '../../scratch/bench';
import { StageView, SpriteArt, SPRITE_NAME, type SpriteKind } from '../../scratch/stage-view';
import { make, type BlockType, type Sprite } from '../../scratch/engine';

/**
 * Haczyk — **polecenie wykonuje ten duszek, który jest zaznaczony**.
 *
 * Interakcja jest wzięta wprost z prawdziwego Scratcha i jest w tej lekcji nowa:
 * kliknięcie klocka w palecie wykonuje go **natychmiast**, na zaznaczonym duszku.
 * Żadnego wybierania odpowiedzi, żadnego sprawdzania wiedzy — dziecko klika
 * klocek i patrzy, kto się ruszył. Gdy rusza się nie ten, o kogo chodziło,
 * pomyłka dzieje się jemu, a nie jest opisana w akapicie.
 *
 * Dlatego domyślnie zaznaczona jest **Gwiazdka**, a zadanie zaczyna się od Kota:
 * pierwsze kliknięcie prawie zawsze idzie w złego duszka. Nic to nie kosztuje —
 * drugi klocek („wróć na start”) każdą pomyłkę cofa, więc blok nie karze, tylko
 * pokazuje skutek.
 *
 * Stąd bierze się pojęcie, na którym stoi reszta lekcji: skrypt nie należy do
 * projektu, tylko do konkretnego duszka.
 */

interface Cast {
  kind: SpriteKind;
  start: Sprite;
  /** Dokąd ma dojść — blada sylwetka na scenie. */
  goal: number;
}

const CAST: Cast[] = [
  { kind: 'kot', start: { x: -150, y: 100, direction: 90, rotationStyle: 'dowolny', visible: true, say: null }, goal: -50 },
  { kind: 'pilka', start: { x: -150, y: 0, direction: 90, rotationStyle: 'dowolny', visible: true, say: null }, goal: 50 },
  { kind: 'gwiazdka', start: { x: -150, y: -100, direction: 90, rotationStyle: 'dowolny', visible: true, say: null }, goal: 150 },
];

const STEP = 100;
const TOLERANCE = 12;

/** Kolejność, w jakiej zadanie prosi o duszki — celowo inna niż domyślne zaznaczenie. */
const ORDER: SpriteKind[] = ['kot', 'pilka', 'gwiazdka'];

interface StageCallProps {
  color: string;
  onComplete?: () => void;
}

export function StageCall({ color, onComplete }: StageCallProps) {
  const [positions, setPositions] = useState<Record<SpriteKind, number>>({
    kot: CAST[0].start.x,
    pilka: CAST[1].start.x,
    gwiazdka: CAST[2].start.x,
  });
  const [selected, setSelected] = useState<SpriteKind>('gwiazdka');
  const [clicks, setClicks] = useState(0);
  const [misfire, setMisfire] = useState<SpriteKind | null>(null);

  const reported = useRef(false);

  const home = (kind: SpriteKind) => CAST.find((item) => item.kind === kind)!;
  const onSpot = (kind: SpriteKind) => Math.abs(positions[kind] - home(kind).goal) < TOLERANCE;
  const placed = ORDER.filter(onSpot).length;
  const allPlaced = placed === ORDER.length;

  useEffect(() => {
    if (!allPlaced || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [allPlaced, onComplete]);

  /** Kliknięty klocek działa od razu — na zaznaczonym duszku i tylko na nim. */
  const fire = (type: BlockType) => {
    if (allPlaced) return;
    const target = home(selected);
    setPositions((prev) => ({
      ...prev,
      [selected]:
        type === 'wroc' ? target.start.x : Math.min(prev[selected] + STEP, 205),
    }));
    setClicks((value) => value + 1);
    /* Pierwsze kliknięcie prawie zawsze idzie w złego duszka — o tym jest ten blok. */
    const wanted = ORDER.find((kind) => !onSpot(kind));
    setMisfire(wanted && wanted !== selected ? selected : null);
  };

  const reset = () => {
    setPositions({ kot: CAST[0].start.x, pilka: CAST[1].start.x, gwiazdka: CAST[2].start.x });
    setClicks(0);
    setMisfire(null);
  };

  const wanted = ORDER.find((kind) => !onSpot(kind));

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">
          Ustaw każdego duszka na jego bladym miejscu — po kolei.
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          kliknięć: {clicks} · na miejscu: {placed}/3
        </p>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Kliknięty klocek wykonuje się natychmiast. Pytanie brzmi: <strong>kto go wykona?</strong>
      </p>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <StageView
          actors={CAST.map((item) => ({
            id: item.kind,
            kind: item.kind,
            sprite: { ...item.start, x: positions[item.kind] },
          }))}
          ghosts={CAST.map((item) => ({ kind: item.kind, x: item.goal, y: item.start.y }))}
        />

        <div className="min-w-0 space-y-4">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Duszki
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {CAST.map((item) => (
                <button
                  key={item.kind}
                  type="button"
                  onClick={() => setSelected(item.kind)}
                  aria-pressed={selected === item.kind}
                  className={cn(
                    'flex flex-col items-center gap-1 border-2 bg-white px-1 py-2 transition dark:bg-zinc-900',
                    selected === item.kind ? 'border-current' : 'border-zinc-200 dark:border-zinc-700'
                  )}
                  style={selected === item.kind ? { color } : undefined}
                >
                  <SpriteArt kind={item.kind} className="h-8 w-8" />
                  <span className="text-[10px] font-medium text-foreground">
                    {SPRITE_NAME[item.kind]}
                  </span>
                  {onSpot(item.kind) && <Check className="h-3 w-3" style={{ color }} aria-hidden />}
                </button>
              ))}
            </div>
          </div>

          <div className="border p-3 dark:border-zinc-700">
            <p className="mb-2 text-xs leading-snug">
              Polecenie wykona:{' '}
              <strong style={{ color }}>{SPRITE_NAME[selected]}</strong>
            </p>
            <div className="space-y-2">
              {(['idz', 'wroc'] as BlockType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => fire(type)}
                  disabled={allPlaced}
                  className="block w-fit disabled:opacity-50"
                >
                  <BlockChip block={make(type, type === 'idz' ? STEP : undefined)} />
                </button>
              ))}
            </div>
          </div>

          {wanted && (
            <p className="text-xs leading-relaxed">
              Teraz na swoje miejsce ma dojść:{' '}
              <strong className="text-foreground">{SPRITE_NAME[wanted]}</strong>.
            </p>
          )}

          {clicks > 0 && !allPlaced && (
            <button
              type="button"
              onClick={reset}
              className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground"
            >
              Ustaw wszystkich z powrotem na start
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {allPlaced ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="text-sm font-semibold" style={{ color }}>
              Wszyscy na miejscach — w {clicks}{' '}
              {clicks === 1 ? 'kliknięciu' : 'kliknięciach'}.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Zapamiętaj z tego trzy słowa. <strong>Scena</strong> to miejsce, po którym wszystko
              chodzi. <strong>Duszek</strong> to ten, kto wykonuje polecenia. A polecenie zawsze
              trafia do <strong>zaznaczonego</strong> duszka — nie do projektu, nie do tego, o którym
              akurat myślisz.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tyle że klikanie po jednym klocku to jeszcze nie program. Program to klocki{' '}
              <strong className="text-foreground">zapisane u duszka na stałe</strong>, żeby wykonał
              je sam, po kolei. Takim zajmiesz się za chwilę.
            </p>
          </motion.div>
        ) : misfire ? (
          <motion.p
            key={`miss-${clicks}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30"
          >
            Ruszył się <strong>{SPRITE_NAME[misfire]}</strong>, bo to on był zaznaczony. Klocek nie
            wie, o kim myślisz — wykonuje go ten duszek, którego wybrałeś/wybrałaś na liście obok.
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
