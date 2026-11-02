'use client';

import { useState, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { judgePassport, passportCard, type PassportCard, type PassportFieldDef } from './passport';

/**
 * Silnik `source-desk` — **paszport źródła**. Dziecko stuka karteczkę
 * z banku, potem pole paszportu; karteczkę z pola zdejmuje, stukając w nią
 * jeszcze raz. „Sprawdź” ocenia wszystkie pola naraz, a odrzut nazywa powód
 * ze źródła. Konsumenci: L2 (moneta), L3 (kronika Kadłubka).
 */
export function SourcePassport<F extends string>({
  color,
  fields,
  bank,
  locked,
  onDone,
  intro,
}: {
  color: string;
  fields: PassportFieldDef<F>[];
  bank: PassportCard<F>[];
  /** Paszport sprawdzony — tylko do oglądania. */
  locked: boolean;
  onDone: () => void;
  intro?: ReactNode;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Partial<Record<F, string>>>({});
  const [errors, setErrors] = useState<Partial<Record<F, string>>>({});
  const placedIds = new Set(Object.values(placed) as string[]);
  const free = bank.filter((card) => !placedIds.has(card.id));

  const place = (field: F) => {
    if (locked || !selected) return;
    setPlaced((prev) => ({ ...prev, [field]: selected }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSelected(null);
  };

  const unplace = (field: F) => {
    if (locked) return;
    setPlaced((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const check = () => {
    const verdict = judgePassport(fields, bank, placed);
    setErrors(verdict.errors);
    if (verdict.ok) onDone();
  };

  const allPlaced = fields.every(({ id }) => placed[id]);

  return (
    <div className="space-y-4">
      {intro ?? (
        <p className="text-base leading-relaxed">
          Historyk przy każdym źródle wypełnia <strong>paszport: kto, kiedy, po co</strong>. Stuknij karteczkę
          z banku, potem pole paszportu. Karteczkę z pola zdejmiesz, stukając w nią jeszcze raz.
        </p>
      )}
      <div className="flex flex-wrap gap-2 border p-3" role="group" aria-label="Bank karteczek">
        {free.map((card) => (
          <button
            key={card.id}
            type="button"
            disabled={locked}
            aria-pressed={selected === card.id}
            onClick={() => setSelected(selected === card.id ? null : card.id)}
            className={cn(
              'border px-3 py-2 text-left text-sm transition-colors disabled:opacity-60',
              selected === card.id ? 'font-semibold text-white' : 'bg-white hover:bg-muted dark:bg-zinc-900'
            )}
            style={selected === card.id ? { backgroundColor: color, borderColor: color } : undefined}
          >
            {card.text}
          </button>
        ))}
        {free.length === 0 && (
          <span className="text-sm text-muted-foreground">Bank pusty — wszystkie karteczki w paszporcie.</span>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {fields.map(({ id, question }) => {
          const cardId = placed[id];
          return (
            <div key={id} className="space-y-1 border p-3">
              <p className="text-sm font-semibold">{question}</p>
              {cardId ? (
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => unplace(id)}
                  className="w-full px-2 py-2 text-sm font-medium text-white disabled:cursor-default"
                  style={{ backgroundColor: color }}
                  aria-label={`${passportCard(bank, cardId).text} — stuknij, żeby zdjąć z pola`}
                >
                  {passportCard(bank, cardId).text}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={locked || !selected}
                  onClick={() => place(id)}
                  className="w-full border-2 border-dashed px-2 py-2 text-sm text-muted-foreground disabled:cursor-default disabled:opacity-60"
                >
                  {selected ? 'Połóż tu karteczkę' : 'Wybierz karteczkę z banku'}
                </button>
              )}
              {errors[id] && (
                <p className="text-xs font-medium text-destructive" aria-live="polite">
                  {errors[id]}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {!locked && (
        <button
          type="button"
          disabled={!allPlaced}
          onClick={check}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          Sprawdź paszport <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
