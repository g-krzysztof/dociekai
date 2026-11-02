'use client';

import { useState } from 'react';
import { BookMarked, BookOpen, Trash2 } from 'lucide-react';
import { plural } from '@/lib/plural';
import { paragraphsOf } from '../../lib/polka/summary';
import type { TeczkaItem } from '../../lib/teczka/types';
import { useTeczka } from '../../lib/teczka/use-teczka';
import { lessonByKey } from '../polka/book-info';

/**
 * Teczka autora (E5c) — kartki z tekstami dziecka w kolejności roku. Dziecko
 * wybiera kartki do książeczki („Do książeczki”) i może kartkę usunąć (dwa
 * kroki, bo to jego tekst i nie ma kopii). Tekst nigdy nie wychodzi
 * z urządzenia — mówimy to rzeczowo, bez straszenia.
 *
 * `onOpenBooklet` — wołający pokazuje książeczkę (`<Ksiazeczka>`).
 */

export interface TeczkaViewProps {
  color: string;
  onOpenBooklet?: () => void;
}

const dateLabel = (ms: number) => new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long' }).format(new Date(ms));

export function TeczkaView({ color, onOpenBooklet }: TeczkaViewProps) {
  const { items, ready, remove, toggleBooklet } = useTeczka();

  if (!ready) return <div className="min-h-40" aria-busy="true" />;

  if (items.length === 0) {
    return (
      <p data-testid="teczka-empty" className="border-2 border-dashed p-6 text-muted-foreground">
        Teczka jest jeszcze pusta. Każdy tekst, który napiszesz w lekcjach, trafi tutaj.
      </p>
    );
  }

  const chosen = items.filter((it) => it.inBooklet).length;

  return (
    <div data-testid="teczka" className="space-y-4">
      <div className="flex min-h-10 flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          {items.length} {plural(items.length, { one: 'kartka', few: 'kartki', many: 'kartek' })} · w książeczce:{' '}
          <strong data-testid="teczka-chosen">{chosen}</strong>
        </p>
        {onOpenBooklet && (
          <button
            type="button"
            onClick={onOpenBooklet}
            disabled={chosen === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ backgroundColor: color }}
          >
            <BookOpen className="h-4 w-4" aria-hidden /> Zobacz książeczkę
          </button>
        )}
      </div>

      <ol className="space-y-3">
        {items.map((it) => (
          <Card key={it.id} item={it} color={color} onToggle={(on) => toggleBooklet(it.id, on)} onRemove={() => remove(it.id)} />
        ))}
      </ol>

      <p className="text-xs text-muted-foreground">Kartki są zapisane tylko na tym urządzeniu.</p>
    </div>
  );
}

function Card({
  item,
  color,
  onToggle,
  onRemove,
}: {
  item: TeczkaItem;
  color: string;
  onToggle: (on: boolean) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const paragraphs = paragraphsOf(item.text);
  const long = paragraphs.length > 3 || item.text.length > 260;
  const lesson = lessonByKey(item.lesson);
  const chosen = !!item.inBooklet;

  return (
    <li
      data-teczka-item={item.id}
      className="relative border bg-background p-4 shadow-[3px_3px_0_0_rgba(0,0,0,0.06)]"
      style={chosen ? { borderColor: color } : undefined}
    >
      <header className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
        <h3 className="font-bold">{item.title || 'Bez tytułu'}</h3>
        <p className="text-xs text-muted-foreground">
          {lesson ? `${lesson.short} · ` : ''}
          {dateLabel(item.createdAt)}
        </p>
      </header>

      <div className={`space-y-2 whitespace-pre-wrap break-words ${open || !long ? '' : 'line-clamp-4'}`}>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {long && (
        <button type="button" onClick={() => setOpen((o) => !o)} className="mt-1 text-sm underline" style={{ color }}>
          {open ? 'Zwiń' : 'Pokaż całą kartkę'}
        </button>
      )}

      <div className="mt-3 flex min-h-10 flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={chosen}
          onClick={() => onToggle(!chosen)}
          className="inline-flex items-center gap-1.5 border-2 px-3 py-1.5 text-sm font-medium"
          style={chosen ? { borderColor: color, backgroundColor: color, color: 'white' } : { borderColor: color, color }}
        >
          <BookMarked className="h-4 w-4" aria-hidden /> {chosen ? 'W książeczce' : 'Do książeczki'}
        </button>
        {confirm ? (
          <span className="inline-flex items-center gap-2 text-sm">
            Usunąć tę kartkę na zawsze?
            <button type="button" onClick={onRemove} className="border border-destructive px-3 py-1.5 text-destructive">
              Tak, usuń
            </button>
            <button type="button" onClick={() => setConfirm(false)} className="border px-3 py-1.5">
              Nie
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            aria-label={`Usuń kartkę „${item.title}”`}
            className="ml-auto inline-flex items-center gap-1.5 px-2 py-1.5 text-sm text-muted-foreground"
          >
            <Trash2 className="h-4 w-4" aria-hidden /> Usuń
          </button>
        )}
      </div>
    </li>
  );
}
