'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FIGURES, getFigure, type SourceCard } from './postacie';
import { ratingWord, useTeczka } from './teczka-state';

/**
 * Blok 1 — **Wybór postaci**. Gesty: stuka teczkę jednej z czterech
 * postaci (fotografia prawdziwego zabytku), czyta pierwszą kartę z teczki
 * i ustawia suwak pierwszego wrażenia — wróci on w bloku 3 obok oceny
 * po przeczytaniu wszystkich świadków. `onDone` po zapisaniu wrażenia.
 */
export function WyborWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const { work, update, choose } = useTeczka();
  const fig = work.figure ? getFigure(work.figure) : undefined;
  const first = fig?.cards.find((c) => c.id === fig.firstCard);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        <strong>Wybierz teczkę jednej postaci.</strong> W każdej leży sześć kart: co pisali o niej ludzie z jej czasów i co piszą
        historycy dziś. Uwaga — świadkowie się nie zgadzają.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FIGURES.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={work.figure === f.id}
            onClick={() => choose(f.id)}
            className={cn('border-2 bg-white p-1.5 text-left dark:bg-zinc-900', work.figure === f.id && 'font-semibold')}
            style={work.figure === f.id ? { borderColor: color } : undefined}
          >
            <span className="relative block aspect-[3/4] w-full overflow-hidden bg-muted">
              <Image src={f.photo} alt="" width={240} height={320} className="h-auto w-full" style={{ height: 'auto' }} />
            </span>
            <span className="mt-1.5 block text-sm leading-tight">{f.name}</span>
            <span className="block text-xs font-normal text-muted-foreground">{f.role}</span>
            <span className="block text-xs font-normal text-muted-foreground">{f.lived}</span>
          </button>
        ))}
      </div>
      {work.figure && work.first !== null && (
        <p className="text-xs text-muted-foreground">Zmiana teczki zaczyna pracę od nowa.</p>
      )}

      {fig && first && (
        <div className="space-y-3 border-t pt-4">
          <figure className="text-xs leading-relaxed text-muted-foreground">
            <Image src={fig.photo} alt={fig.photoAlt} width={150} height={200} className="float-left mb-1 mr-3 h-auto w-[110px]" style={{ height: 'auto' }} />
            <figcaption>{fig.photoCredit}</figcaption>
          </figure>
          <div className="clear-both" />
          <p className="text-sm leading-relaxed">Pierwsza karta z teczki. Przeczytaj ją i powiedz, co myślisz — na razie tylko na jej podstawie.</p>
          <SourceCardView card={first} color={color} />
          <RatingSlider
            color={color}
            label={`Pierwsze wrażenie: ${fig.name}…`}
            value={work.first ?? 0}
            she={fig.she}
            onChange={(v) => update({ first: v })}
          />
          <button
            type="button"
            onClick={() => {
              if (work.first === null) update({ first: 0 });
              onDone();
            }}
            className="border-2 px-3 py-1.5 text-sm font-semibold"
            style={{ borderColor: color, color }}
          >
            Zapisz pierwsze wrażenie
          </button>
        </div>
      )}
    </div>
  );
}

/** Karta źródłowa: paszport u góry, zdania pod spodem (bez zakreśleń). */
export function SourceCardView({ card, color, children }: { card: SourceCard; color: string; children?: ReactNode }) {
  return (
    <article className="border bg-[#fbf6e9] p-3 dark:bg-zinc-900">
      <header className="mb-2 border-b border-dashed pb-1.5 text-xs leading-snug">
        <span className="font-semibold" style={{ color }}>
          {card.author}
        </span>{' '}
        · {card.when} · <span className="text-muted-foreground">{card.who}</span>
        <span className="ml-1 whitespace-nowrap uppercase tracking-wide text-muted-foreground">
          · {card.age === 'dawne' ? 'źródło dawne' : 'historyk dziś'}
        </span>
      </header>
      {children ?? (
        <div className="space-y-1 font-serif text-[15px] leading-relaxed">
          {card.sentences.map((s) => (
            <p key={s.id}>{s.text}</p>
          ))}
        </div>
      )}
    </article>
  );
}

/** Suwak −2…+2 (zaszkodził ↔ pomógł) — natywny range, przeciągany palcem. */
export function RatingSlider({
  color,
  label,
  value,
  she,
  onChange,
}: {
  color: string;
  label: string;
  value: number;
  she: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block border bg-white p-3 dark:bg-zinc-900">
      <span className="block text-sm font-semibold">{label}</span>
      <input
        type="range"
        min={-2}
        max={2}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full cursor-ew-resize"
        style={{ accentColor: color }}
      />
      <span className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>{she ? 'zaszkodziła' : 'zaszkodził'}</span>
        <span>{she ? 'pomogła' : 'pomógł'}</span>
      </span>
      <span className="mt-1 block text-center text-sm font-semibold" style={{ color }}>
        {ratingWord(value, she)}
      </span>
    </label>
  );
}
