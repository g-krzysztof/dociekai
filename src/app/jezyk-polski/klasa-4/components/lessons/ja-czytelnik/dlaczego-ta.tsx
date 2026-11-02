'use client';

import { useEffect, useState } from 'react';
import { KorpusText } from '../../korpus/korpus-text';
import type { PlateId } from './degustacja';
import { OPENINGS } from './otwarcia';

/**
 * L2, blok 2 „Dlaczego ta?” `[7.1]` — para stuknięć z L1 w nowej roli:
 * **zdanie z otwarcia + powód**. Dziecko bierze talerz przysunięty najbliżej
 * (albo drugi), stuka zdanie, przez które chce czytać dalej, i dokłada powód
 * z palety albo jedno własne słowo. Zdanie musi pochodzić z tego otwarcia —
 * to jedyne, co tu jest sprawdzane; **powód należy do dziecka.**
 */

export const POWODY = [
  { id: 'smieszne', label: 'jest śmieszne' },
  { id: 'tajemnicze', label: 'jest tajemnicze' },
  { id: 'straszne', label: 'trochę straszne' },
  { id: 'slowa', label: 'ma piękne słowa' },
  { id: 'bohater', label: 'ciekawy bohater' },
  { id: 'akcja', label: 'coś się dzieje' },
] as const;

export interface Wybor {
  book: PlateId;
  unit: string;
  reason: string;
}

interface Props {
  color: string;
  /** Dwa talerze przysunięte najbliżej — pierwszy jest domyślny. */
  top: [PlateId, PlateId];
  onChosen: (w: Wybor) => void;
  chosen: Wybor | null;
}

/** Jedno słowo własne: same litery (z łącznikiem), do 20 znaków. */
export const ownWordOk = (w: string) => /^\p{L}+(-\p{L}+)?$/u.test(w.trim()) && w.trim().length <= 20;

export function DlaczegoTa({ color, top, onChosen, chosen }: Props) {
  const [book, setBook] = useState<PlateId>(chosen?.book ?? top[0]);
  const [unit, setUnit] = useState<string | null>(chosen?.unit ?? null);
  const [reason, setReason] = useState<string | null>(null);
  const [own, setOwn] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!chosen) setBook(top[0]);
  }, [top, chosen]);

  const o = OPENINGS[book];
  const reasonText = reason === 'own' ? own.trim() : POWODY.find((p) => p.id === reason)?.label;
  const ready = !!unit && !!reasonText && (reason !== 'own' || ownWordOk(own));

  const pick = (id: string) => {
    // Kontrola dowodu: zdanie musi być z tego otwarcia.
    if (!o.units.includes(id)) {
      setMsg('To zdanie nie pochodzi z tego talerza.');
      return;
    }
    setUnit(id);
    setMsg('');
  };

  const confirm = () => {
    if (!ready || !unit || !reasonText) return;
    onChosen({ book, unit, reason: reasonText });
  };

  if (chosen) {
    const ch = OPENINGS[chosen.book];
    return (
      <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
        <div className="border-l-4 p-4" style={{ borderColor: color, backgroundColor: `color-mix(in srgb, ${color} 6%, transparent)` }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            Biorę: {ch.book.title}
          </p>
          <p className="mt-2 font-serif text-lg italic leading-relaxed">„{ch.korpus.unitById[chosen.unit].text}”</p>
          <p className="mt-2 text-sm sm:text-base">
            Chcę czytać dalej, bo <strong>{chosen.reason}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Który talerz">
        {top.map((id, i) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={book === id}
            onClick={() => {
              setBook(id);
              setUnit(null);
            }}
            className="border px-3 py-1.5 text-sm"
            style={{ borderColor: book === id ? color : undefined, fontWeight: book === id ? 600 : undefined }}
          >
            {i === 0 ? 'Najbliżej: ' : 'Drugi: '}
            {OPENINGS[id].book.title}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm leading-relaxed sm:text-base">
        <strong>1.</strong> Stuknij zdanie, przez które chcesz czytać dalej.
      </p>
      <KorpusText
        korpus={o.korpus}
        color={color}
        pick="unit"
        onPick={pick}
        marks={unit ? { [unit]: 'picked' } : undefined}
        className="mt-2 text-[15px] leading-7 sm:text-base"
      />

      <p className="mt-4 text-sm leading-relaxed sm:text-base">
        <strong>2.</strong> Dlaczego właśnie ono?
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {POWODY.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={reason === p.id}
            onClick={() => setReason(p.id)}
            className="border px-3 py-1.5 text-sm"
            style={{
              borderColor: reason === p.id ? color : undefined,
              backgroundColor: reason === p.id ? `color-mix(in srgb, ${color} 12%, transparent)` : undefined,
            }}
          >
            {p.label}
          </button>
        ))}
        <label
          className="flex items-center gap-2 border px-2 py-1 text-sm"
          style={{ borderColor: reason === 'own' ? color : undefined }}
        >
          własne słowo:
          <input
            value={own}
            onChange={(e) => {
              setOwn(e.target.value.slice(0, 20));
              setReason('own');
            }}
            onFocus={() => setReason('own')}
            className="w-28 border-b bg-transparent px-1 outline-none"
            aria-label="Własne słowo"
          />
        </label>
      </div>

      <div className="mt-4 flex min-h-[2.5rem] flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={confirm}
          disabled={!ready}
          className="border-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          style={{ backgroundColor: color, borderColor: color }}
        >
          Biorę tę książkę
        </button>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {msg ||
            (!unit
              ? 'Najpierw zdanie.'
              : !reasonText
                ? 'Teraz powód.'
                : reason === 'own' && !ownWordOk(own)
                  ? 'Jedno słowo, same litery.'
                  : '')}
        </span>
      </div>
    </div>
  );
}
