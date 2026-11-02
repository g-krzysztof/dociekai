'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { RegionMap, RMAP } from '../../hist-map/region-map';
import { project } from '../../hist-map/geo';
import { PostacWStroju } from './postac-w-stroju';
import {
  COSTUMES,
  PARTS,
  PUZZLES,
  costumeOf,
  homeOf,
  judgeFind,
  judgeSend,
  type CostumeId,
  type PartId,
  type Slot,
} from './stroje';

/** Wycinek mapy: od Łowicza po Tatry. */
const VIEW = { x: 170, y: 195, w: 250, h: 280 };

/** Gdzie stoi postać-wzór względem swojego miasta (żeby trzy się nie nakładały). */
const FIGURE_AT: Record<CostumeId, { x: number; y: number }> = {
  lowicki: { x: 300, y: 200 },
  krakowski: { x: 190, y: 320 },
  podhalanski: { x: 315, y: 362 },
};
const FIG_W = 46;
const FIG_H = 88;

const OFF = '#efe7d2';

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const SLOT_LABEL: Record<Slot, string> = {
  hat: 'na głowie',
  top: 'na koszuli',
  bottom: 'spodnie',
  item: 'w ręce',
};

/**
 * Blok `cwiczenie` L12 — obcy element stroju. Na postaci jedna rzecz
 * „przywędrowała” z innego regionu. Dziecko (1) stuka ją — sędzia porównuje ze
 * strojem, do którego należy reszta, (2) odsyła ją do stroju, który ją nosi —
 * dużym przyciskiem albo stuknięciem stroju na mapie (przeciąganie wycięte
 * 2026-10-10: krok 2 był niewidoczny i nikt nie wiedział, co dalej). Wzory stoją na mapie przy swoich miastach, więc rozpoznanie wynika
 * z porównania, nie z klucza autora.
 */
export function ObcyElement({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [found, setFound] = useState<PartId | null>(null);
  const [wrong, setWrong] = useState<PartId | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const puzzle = PUZZLES[Math.min(index, PUZZLES.length - 1)];
  const home = homeOf(puzzle);
  const fixedParts = sent ? puzzle.parts.filter((p) => p !== found) : puzzle.parts;

  const tapPart = (p: PartId) => {
    if (sent || finished) return;
    const v = judgeFind(puzzle, p);
    if (v.ok) {
      setFound(p);
      setWrong(null);
      setMsg(null);
    } else {
      setWrong(p);
      setFound(null);
      setMsg(v.why);
    }
  };

  const send = (to: CostumeId) => {
    if (!found || sent) return;
    const v = judgeSend(found, to);
    if (!v.ok) {
      setMsg(v.why);
      return;
    }
    const owner = costumeOf(found);
    setSent(`Zgadza się: ${PARTS[found].name} to część stroju z okolic miasta ${owner.town}. Bez niej postać nosi czysty ${home.name}.`);
    setMsg(null);
  };

  const next = () => {
    const n = index + 1;
    setFound(null);
    setWrong(null);
    setMsg(null);
    setSent(null);
    if (n >= PUZZLES.length) {
      setFinished(true);
      onComplete();
    } else setIndex(n);
  };


  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed">
        {finished
          ? 'Trzy postacie, trzy przybysze odesłane do domu.'
          : found && !sent
            ? `Postać ${index + 1} z ${PUZZLES.length}. Krok 2 z 2: odeślij przybysza do domu — przyciskiem pod mapą albo stuknij strój na mapie.`
            : sent
              ? `Postać ${index + 1} z ${PUZZLES.length} — gotowe.`
              : `Postać ${index + 1} z ${PUZZLES.length}. Krok 1 z 2: jedna rzecz na tej postaci przywędrowała z innego regionu. Porównaj ją z trzema strojami na mapie i stuknij przybysza — na postaci albo na liście pod nią.`}
      </p>

      <div className="mt-3 grid grid-cols-[minmax(0,120px)_1fr] gap-3 sm:grid-cols-[180px_minmax(0,400px)] sm:justify-center">
        <div className="min-w-0">
          {!finished ? (
            <motion.div key={puzzle.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
              <PostacWStroju
                parts={fixedParts}
                onPart={tapPart}
                lifted={found}
                wrong={wrong}
                className="block h-auto w-full"
                title="Postać w stroju ludowym do sprawdzenia"
              />
            </motion.div>
          ) : (
            <div className="flex aspect-[1/2] items-center justify-center border-2 border-dashed" style={{ borderColor: color }}>
              <Check className="h-10 w-10" style={{ color }} />
            </div>
          )}
          {!finished && !found && !sent && (
            <div className="mt-2 flex flex-col gap-1">
              {puzzle.parts.map((part) => (
                <button
                  key={part}
                  type="button"
                  onClick={() => tapPart(part)}
                  className="border px-2 py-1 text-left text-xs leading-snug transition-colors hover:bg-muted"
                  style={{ borderColor: wrong === part ? '#d97706' : 'var(--border)' }}
                >
                  {SLOT_LABEL[PARTS[part].slot]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <RegionMap
            look={() => ({ fill: OFF })}
            showRivers
            viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
            label="Wycinek mapy Polski: stroje z Łowicza, Krakowa i Zakopanego"
            className="block h-auto w-full select-none"
          >
            {COSTUMES.map((c) => {
              const [tx, ty] = project(c.lonlat);
              const at = FIGURE_AT[c.id];
              const drop = `stroj:${c.id}`;
              return (
                <g key={c.id} data-drop={drop} onClick={() => send(c.id)} style={{ cursor: found ? 'pointer' : undefined }}>
                  <line x1={tx} y1={ty} x2={at.x + FIG_W / 2} y2={at.y + FIG_H} stroke={RMAP.ink} strokeWidth={0.8} strokeDasharray="2 2" />
                  <rect
                    x={at.x - 3}
                    y={at.y - 3}
                    width={FIG_W + 6}
                    height={FIG_H + 18}
                    fill="#fffaf0"
                    fillOpacity={0.9}
                    stroke={found && !sent ? color : RMAP.edge}
                    strokeWidth={found && !sent ? 2 : 0.8}
                    strokeDasharray={found && !sent ? '5 3' : undefined}
                  />
                  <PostacWStroju parts={c.parts} title={c.name} box={{ x: at.x, y: at.y, width: FIG_W, height: FIG_H }} />
                  <text x={at.x + FIG_W / 2} y={at.y + FIG_H + 11} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={RMAP.ink}>
                    {c.town}
                  </text>
                  <circle cx={tx} cy={ty} r={3.5} fill={RMAP.ink} />
                </g>
              );
            })}
          </RegionMap>
        </div>
      </div>

      {msg && <p className="mt-3 border-l-4 border-amber-500 pl-3 text-sm">{msg}</p>}
      {found && !sent && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 border-2 p-3 text-sm"
          style={{ borderColor: color, background: `${color}0d` }}
        >
          <p className="font-semibold">
            {cap(PARTS[found].name)} — to przybysz. Skąd przywędrował? Odeślij go do stroju,
            który ma taką samą rzecz:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {COSTUMES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => send(c.id)}
                className="px-4 py-2 font-semibold text-white"
                style={{ background: color }}
              >
                Odeślij do: {c.town}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Możesz też stuknąć strój na mapie.</p>
        </motion.div>
      )}
      {sent && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 border-2 p-3 text-sm"
          style={{ borderColor: color, background: `${color}0d` }}
        >
          <p className="flex items-start gap-2 font-semibold">
            <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} /> {sent}
          </p>
          <button
            type="button"
            onClick={next}
            className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 text-base font-semibold text-white"
            style={{ background: color }}
          >
            {index + 1 < PUZZLES.length ? `Następna postać (${index + 2} z ${PUZZLES.length})` : 'Zakończ ćwiczenie'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}
      {finished && (
        <p className="mt-3 border-l-4 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Strój mówił kiedyś, skąd ktoś jest — z daleka, zanim padło pierwsze słowo. Każda wieś szyła
          z tego, co miała: z owczej wełny w górach, z kolorowych pasów tkanych w domu pod Łowiczem.
          Postacie są tu narysowane w uproszczeniu — prawdziwe stroje obejrzysz w muzeum albo na
          festynie.
        </p>
      )}

    </div>
  );
}

