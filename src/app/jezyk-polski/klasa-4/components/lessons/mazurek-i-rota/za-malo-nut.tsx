'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { KorpusText } from '../../korpus/korpus-text';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { buildKorpus } from '../../../lib/korpus';
import { MAZUREK } from './mazurek';
import { SLOWNICZEK } from './slowniczek';
import {
  TAKT_ROWS,
  fitMessage,
  formOf,
  judgeRow,
  rowSyllables,
  squeeze,
  type TaktRow,
} from './takt';

/**
 * L9, blok 1 „Za mało nut” — **gest nowy dla kursu: przykłada wers do taktu
 * melodii i ściska słowa, aż wers się zmieści.** Dziecko przeciąga wers w
 * dzisiejszym brzmieniu na nuty (jedna sylaba = jedna nuta); nadmiarowe sylaby
 * wystają za ostatnią kreskę taktową. Stuknięcie słowa ściska je do dawnej
 * formy (`przejdziemy` → `przejdziem`) — i wers zaczyna brzmieć jak w hymnie.
 * Nad widżetem hymn i słowniczek (jedyne „stuknij → przeczytaj”
 * w lekcji); dawnych form czasowników słowniczek celowo nie ma.
 */

const KORPUS = buildKorpus(MAZUREK);
const GLOSSARY_IDS = Object.keys(SLOWNICZEK).filter((id) => KORPUS.tokenById[id]);

/** Szerokość komórki nuty — 10 sylab mieści się na 390 px. */
const CELL = 31;

interface Props {
  color: string;
  onComplete: () => void;
}

export function ZaMaloNut({ color, onComplete }: Props) {
  const [gloss, setGloss] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, boolean>>({});
  const [squeezed, setSqueezed] = useState<Record<string, Set<number>>>({});
  const [fitted, setFitted] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const allFit = TAKT_ROWS.every((r) => fitted[r.id]);
  useEffect(() => {
    if (allFit) onComplete();
  }, [allFit, onComplete]);

  const evaluate = (row: TaktRow, set: Set<number>) => {
    const v = judgeRow(row, set);
    setNotes((n) => ({ ...n, [row.id]: fitMessage(row, v) }));
    setFitted((f) => ({ ...f, [row.id]: v.fit === 'pasuje' }));
  };

  const place = (rowId: string) => {
    const row = TAKT_ROWS.find((r) => r.id === rowId);
    if (!row || placed[rowId]) return;
    const set = new Set<number>();
    setPlaced((p) => ({ ...p, [rowId]: true }));
    setSqueezed((s) => ({ ...s, [rowId]: set }));
    evaluate(row, set);
  };

  const drag = useDragToken({
    onDrop: (id, target) => {
      if (target === `takt:${id}`) place(id);
    },
    onTap: (id) => place(id),
  });

  const tapWord = (row: TaktRow, word: number) => {
    const res = squeeze(row, squeezed[row.id] ?? new Set(), word);
    if (!res.ok) {
      setNotes((n) => ({ ...n, [row.id]: res.reason }));
      return;
    }
    setSqueezed((s) => ({ ...s, [row.id]: res.squeezed }));
    evaluate(row, res.squeezed);
  };

  const dragged = TAKT_ROWS.find((r) => r.id === drag.drag?.id);

  return (
    <div className="space-y-5">
      <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_240px]">
          <KorpusText
            korpus={KORPUS}
            color={color}
            pick="word"
            pickable={GLOSSARY_IDS}
            onPick={(id) => setGloss(id)}
            marks={Object.fromEntries(GLOSSARY_IDS.map((id) => [id, id === gloss ? 'picked' : 'hint']))}
            className="text-base leading-8 sm:text-lg"
          />
          <aside className="border-t pt-3 text-sm leading-relaxed md:border-l md:border-t-0 md:pl-4 md:pt-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Słowniczek</p>
            <div className="mt-2 min-h-[6.5rem]" aria-live="polite">
              {gloss ? (
                <p>
                  <strong>{SLOWNICZEK[gloss].word}</strong> — {SLOWNICZEK[gloss].note}
                </p>
              ) : (
                <p className="text-muted-foreground">Stuknij podkreślone słowo, a tu pojawi się, co znaczy.</p>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Słowa: Józef Wybicki, 1797. Tekst urzędowy hymnu (ustawa z 1980 r.), zwrotka 1, refren, zwrotka 2.
            </p>
          </aside>
        </div>
      </div>

      <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
        <p className="text-sm leading-relaxed sm:text-base">
          Każda kropka to jedna nuta melodii. Każda sylaba potrzebuje swojej nuty. Przeciągnij wers — napisany tak, jak
          mówimy dziś — na nuty. Jeśli coś wystaje, stuknij słowo, które da się <strong>ścisnąć</strong>.
        </p>

        <div className="mt-4 space-y-6">
          {TAKT_ROWS.map((row) => (
            <TaktLine
              key={row.id}
              row={row}
              color={color}
              placed={!!placed[row.id]}
              squeezed={squeezed[row.id] ?? new Set()}
              fitted={!!fitted[row.id]}
              note={notes[row.id]}
              hover={drag.hover === `takt:${row.id}`}
              bind={drag.bind(row.id)}
              onWord={(i) => tapWord(row, i)}
            />
          ))}
        </div>

        <div className="mt-5 min-h-[4.5rem] border-t pt-4 text-sm leading-relaxed sm:text-base" aria-live="polite">
          {allFit && (
            <p>
              <strong>Krótka forma to nie błąd.</strong> Dawniej mówiono i „przejdziemy”, i „przejdziem”. Wybicki wybrał
              krótsze słowa, bo pasowały do nut — tak jak ty przed chwilą.
            </p>
          )}
        </div>
      </div>

      <DragGhost drag={drag.drag}>
        {dragged && <Strip row={dragged} color={color} />}
      </DragGhost>
    </div>
  );
}

function Strip({ row, color }: { row: TaktRow; color: string }) {
  return (
    <span className="inline-block border-2 bg-white px-3 py-1.5 text-sm font-medium dark:bg-zinc-900" style={{ borderColor: color }}>
      {row.words.map((w, i) => formOf(w, false) + (w.punct ?? '') + (i < row.words.length - 1 ? ' ' : '')).join('')}
    </span>
  );
}

interface LineProps {
  row: TaktRow;
  color: string;
  placed: boolean;
  squeezed: Set<number>;
  fitted: boolean;
  note?: string;
  hover: boolean;
  bind: ReturnType<ReturnType<typeof useDragToken>['bind']>;
  onWord: (i: number) => void;
}

function TaktLine({ row, color, placed, squeezed, fitted, note, hover, bind, onWord }: LineProps) {
  const syl = placed ? rowSyllables(row, squeezed) : [];
  const cells = Math.max(row.notes, syl.length, row.notes + 2);
  const barEnds = row.bars.reduce<number[]>((acc, n) => [...acc, (acc.at(-1) ?? 0) + n], []);
  const [sung, setSung] = useState(-1);

  // Gdy wers pasuje, sylaby „śpiewają się” po kolei razem z nutami.
  useEffect(() => {
    if (!fitted) {
      setSung(-1);
      return;
    }
    let i = 0;
    setSung(0);
    const t = window.setInterval(() => {
      i += 1;
      setSung(i);
      if (i >= row.notes) window.clearInterval(t);
    }, 220);
    return () => window.clearInterval(t);
  }, [fitted, row.notes, squeezed]);

  return (
    <div>
      <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {row.where}
        {fitted && <Check className="h-3.5 w-3.5 text-emerald-600" aria-label="pasuje" />}
      </p>
      <div
        data-drop={`takt:${row.id}`}
        className="max-w-full overflow-hidden border px-1 py-2 transition-colors"
        style={{
          borderColor: hover ? color : undefined,
          backgroundColor: hover ? `color-mix(in srgb, ${color} 8%, transparent)` : undefined,
        }}
      >
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cells}, ${CELL}px)` }}>
          {Array.from({ length: cells }, (_, i) => {
            const isNote = i < row.notes;
            const barEnd = barEnds.includes(i + 1);
            const lit = fitted && i < sung;
            return (
              <div
                key={`n${i}`}
                className="flex h-7 items-center justify-center"
                style={{
                  borderRight: barEnd ? `${i + 1 === row.notes ? 3 : 1}px solid currentColor` : undefined,
                }}
              >
                {isNote && (
                  <span
                    className="block h-3 w-3 rounded-full transition-transform"
                    style={{ backgroundColor: lit ? color : 'currentColor', transform: lit ? 'scale(1.35)' : undefined, opacity: lit ? 1 : 0.55 }}
                  />
                )}
              </div>
            );
          })}
          {Array.from({ length: cells }, (_, i) => {
            const s = syl[i];
            const over = i >= row.notes;
            const barEnd = barEnds.includes(i + 1);
            return (
              <div
                key={`s${i}`}
                className="flex h-7 items-center justify-center text-[12px] font-medium sm:text-[13px]"
                style={{
                  borderRight: barEnd ? `${i + 1 === row.notes ? 3 : 1}px solid currentColor` : undefined,
                  color: s && over ? '#b91c1c' : undefined,
                  backgroundColor: s && over ? 'color-mix(in srgb, #dc2626 14%, transparent)' : undefined,
                  fontWeight: fitted && i < sung ? 700 : undefined,
                }}
              >
                {s?.syl}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 min-h-[2.5rem]">
        {!placed ? (
          <button
            type="button"
            {...bind}
            className="cursor-grab touch-none border-2 border-dashed bg-white px-3 py-1.5 text-sm font-medium dark:bg-zinc-900"
            style={{ borderColor: color }}
            aria-label={`Przeciągnij wers na nuty: ${row.words.map((w) => formOf(w, false)).join(' ')}`}
          >
            {row.words.map((w, i) => formOf(w, false) + (w.punct ?? '') + (i < row.words.length - 1 ? ' ' : '')).join('')}
          </button>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {row.words.map((w, i) => {
              const sq = squeezed.has(i);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onWord(i)}
                  className="border px-2 py-1 text-sm transition-colors"
                  style={{
                    borderColor: sq ? color : undefined,
                    backgroundColor: sq ? `color-mix(in srgb, ${color} 12%, transparent)` : undefined,
                  }}
                  aria-pressed={sq}
                >
                  {formOf(w, sq)}
                  {w.punct}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <p className="mt-1 min-h-[2.75rem] text-sm leading-snug" aria-live="polite" style={{ color: fitted ? '#047857' : undefined }}>
        {placed ? note : ' '}
      </p>
    </div>
  );
}
