'use client';

import { useState, type CSSProperties, type ReactNode, type SyntheticEvent } from 'react';
import { plural } from '@/lib/plural';
import type { PisMark, PisarniaAnalysis } from '../../lib/pisarnia/types';

/**
 * **Pisarnia** (E3) — pole, w którym dziecko pisze własny tekst, z
 * podświetleniami na żywo. Edytor jest celowo zwykłym `<textarea>`: bez paska
 * formatowania (to nie Word z informatyki), bez autokorekty, bez słownika
 * przeglądarki i bez automatycznej wielkiej litery na telefonie — bo wielka
 * litera, odstępy i ortografia to właśnie to, co dziecko ćwiczy.
 *
 * Podświetlenia rysuje warstwa POD przezroczystym polem: ten sam tekst, ta
 * sama czcionka i ten sam podział linii, tylko litery niewidoczne, a widać tło
 * i podkreślenia. Obie warstwy leżą w jednej komórce siatki, więc pole rośnie
 * razem z tekstem i nigdy nie przewija się samo (żadnego rozjazdu warstw).
 *
 * Stan zostaje w lekcji (`value` + `onChange`), analizę liczy lekcja
 * (`analyze()` w `useMemo`) i przekazuje tutaj gotowe `marks` — ten sam wynik
 * czyta potem sędzia `TaskShell`.
 */

export interface PisarniaProps {
  value: string;
  onChange: (value: string) => void;
  /** Kolor akcentu (modułu). */
  color: string;
  /** Etykieta dla czytnika ekranu (i podpis nad polem, jeśli `showLabel`). */
  label: string;
  showLabel?: boolean;
  marks?: PisMark[];
  placeholder?: string;
  /** Najmniejsza wysokość w liniach (domyślnie 3). */
  minRows?: number;
  maxLength?: number;
  disabled?: boolean;
  /** Analiza do licznika „2 zdania · 11 słów” pod polem. */
  analysis?: PisarniaAnalysis;
  /** Coś pod polem (np. paleta słów, przycisk). */
  footer?: ReactNode;
  id?: string;
}

const TONE_STYLE: Record<PisMark['tone'], CSSProperties> = {
  error: { backgroundColor: 'color-mix(in srgb, #dc2626 16%, transparent)', boxShadow: 'inset 0 -2px 0 #dc2626' },
  bad: { backgroundColor: 'color-mix(in srgb, #dc2626 22%, transparent)', boxShadow: 'inset 0 -2px 0 #b91c1c' },
  warn: { backgroundColor: 'color-mix(in srgb, #d97706 18%, transparent)', boxShadow: 'inset 0 -2px 0 #d97706' },
  good: { backgroundColor: 'color-mix(in srgb, #16a34a 16%, transparent)', boxShadow: 'inset 0 -2px 0 #16a34a' },
  info: { boxShadow: 'inset 0 -2px 0 color-mix(in srgb, currentColor 45%, transparent)' },
};

/** Tekst pocięty na kawałki z podświetleniem. `marks` muszą być rozłączne (daje to `buildMarks`). */
function pieces(value: string, marks: PisMark[]) {
  const out: { text: string; mark?: PisMark }[] = [];
  let at = 0;
  for (const m of [...marks].sort((a, b) => a.start - b.start)) {
    const start = Math.max(m.start, at);
    const end = Math.min(m.end, value.length);
    if (end <= start) continue;
    if (start > at) out.push({ text: value.slice(at, start) });
    out.push({ text: value.slice(start, end), mark: m });
    at = end;
  }
  if (at < value.length) out.push({ text: value.slice(at) });
  return out;
}

const SHARED = 'col-start-1 row-start-1 m-0 w-full whitespace-pre-wrap break-words px-3 py-2.5 font-[inherit] text-[17px] leading-[1.6] tracking-normal';

export function Pisarnia({
  value,
  onChange,
  color,
  label,
  showLabel = false,
  marks = [],
  placeholder,
  minRows = 3,
  maxLength = 1500,
  disabled = false,
  analysis,
  footer,
  id,
}: PisarniaProps) {
  const [caret, setCaret] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);

  const trackCaret = (e: SyntheticEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    setCaret(el.selectionStart === el.selectionEnd ? el.selectionStart : null);
  };

  // Podpowiedź do miejsca pod kursorem (albo tuż przed nim — kursor stoi za błędną literą).
  const hint = focused && caret !== null ? marks.find((m) => m.title && m.start <= caret && caret <= m.end) : undefined;

  const sentences = analysis?.sentences.length ?? 0;
  const words = analysis?.words.length ?? 0;

  return (
    <div className="w-full">
      {showLabel && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
          {label}
        </label>
      )}
      <div
        className="grid border-2 bg-background transition-colors"
        style={{ borderColor: focused ? color : 'color-mix(in srgb, currentColor 22%, transparent)' }}
      >
        <div aria-hidden className={`${SHARED} pointer-events-none select-none text-transparent`}>
          {pieces(value, marks).map((p, i) =>
            p.mark ? (
              <span key={i} style={TONE_STYLE[p.mark.tone]}>
                {p.text}
              </span>
            ) : (
              <span key={i}>{p.text}</span>
            ),
          )}
          {/* Pusta ostatnia linia też ma wysokość. */}
          {'​'}
        </div>
        <textarea
          id={id}
          aria-label={showLabel ? undefined : label}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            trackCaret(e);
          }}
          onSelect={trackCaret}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={minRows}
          maxLength={maxLength}
          disabled={disabled}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          className={`${SHARED} relative resize-none overflow-hidden bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60`}
          style={{ caretColor: color }}
        />
      </div>
      {/* Miejsce na podpowiedź jest stałe (dwie linie), bo znika ona przy utracie
          fokusu — inaczej przycisk pod polem podskakiwałby pod palcem. */}
      <div className="mt-1.5 flex flex-col-reverse gap-0.5 text-sm leading-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <p className="min-h-10 min-w-0 sm:flex-1" aria-live="polite">
          {hint ? <span className="font-medium">{hint.title}</span> : null}
        </p>
        {analysis && (
          <p className="shrink-0 self-end tabular-nums text-muted-foreground sm:self-auto">
            {sentences} {plural(sentences, { one: 'zdanie', few: 'zdania', many: 'zdań' })} · {words}{' '}
            {plural(words, { one: 'słowo', few: 'słowa', many: 'słów' })}
          </p>
        )}
      </div>
      {footer}
    </div>
  );
}
