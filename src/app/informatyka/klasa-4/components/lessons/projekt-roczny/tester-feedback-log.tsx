'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { FEEDBACK_CATEGORIES } from './feedback';

/**
 * Dziennik testów — miejsce na notatki z rozmów z prawdziwymi ludźmi, którym
 * dziecko pokazało swój gotowy projekt **na tym samym ekranie** (żadnego
 * pliku do przesłania — po prostu podaje urządzenie dalej). Strona nie ma
 * jak zweryfikować treści wpisu, więc to nie jest checkbox „zrobione", tylko
 * gest: wybór kategorii z tej samej listy, której dziecko uczyło się
 * rozpoznawać na przykładzie Kuby w poprzednim bloku.
 */

interface Entry {
  kto: string;
  category: string;
}

const WHO = ['Mama', 'Tata', 'Rodzeństwo', 'Kolega/koleżanka', 'Ktoś inny'];
const MIN_ENTRIES = 2;

export function TesterFeedbackLog({
  color,
  onComplete,
}: {
  color: string;
  onComplete?: () => void;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [kto, setKto] = useState(WHO[0]);
  const [category, setCategory] = useState(FEEDBACK_CATEGORIES[0].id);
  const reported = useRef(false);

  useEffect(() => {
    if (entries.length >= MIN_ENTRIES && !reported.current) {
      reported.current = true;
      onComplete?.();
    }
  }, [entries.length, onComplete]);

  const add = () => setEntries((prev) => [...prev, { kto, category }]);
  const remove = (index: number) => setEntries((prev) => prev.filter((_, i) => i !== index));

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        Dziennik testów
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Podaj urządzenie co najmniej dwóm innym osobom, niech zagrają w Twój projekt na tym samym
        ekranie, a potem zapisz tutaj, co powiedziały.
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="text-xs">
          <span className="mb-1 block text-muted-foreground">Kto testował</span>
          <select
            value={kto}
            onChange={(event) => setKto(event.target.value)}
            className="border bg-transparent px-2 py-1.5 text-sm"
          >
            {WHO.map((who) => (
              <option key={who} value={who}>
                {who}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          <span className="mb-1 block text-muted-foreground">Co powiedzieli</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="border bg-transparent px-2 py-1.5 text-sm"
          >
            {FEEDBACK_CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={add}
          className="inline-flex cursor-pointer items-center gap-1 border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted/50"
          style={{ borderColor: color, color }}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Dodaj
        </button>
      </div>

      {entries.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {entries.map((entry, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <span className="font-medium">{entry.kto}:</span>
              <span className="text-muted-foreground">
                {FEEDBACK_CATEGORIES.find((item) => item.id === entry.category)?.label}
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="Usuń wpis"
                className="ml-auto shrink-0 text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {entries.length >= MIN_ENTRIES && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium" style={{ color }}>
          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Masz opinie od {entries.length} osób.
        </p>
      )}
    </div>
  );
}
