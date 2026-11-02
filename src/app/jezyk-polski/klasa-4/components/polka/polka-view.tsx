'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Bookmark, Check } from 'lucide-react';
import { plural } from '@/lib/plural';
import { addDays, parseKey, todayKey } from '@/lib/streak/school-calendar';
import { setStatus } from '../../lib/polka/model';
import { feelingLabel, sortSummaries, summarizeEntry, type ShelfSummary } from '../../lib/polka/summary';
import { useShelf } from '../../lib/polka/use-shelf';
import { shelfBookInfo } from './book-info';

/**
 * Półka czytelnika (E5c) — grzbiety książek na desce i karta wybranej:
 * przeczytane odcinki, zakładka, plan (skutek, nie ocena: „przy tym planie
 * skończysz w środę”) i pierwsze wrażenie. Dziecko może książkę odłożyć
 * i do niej wrócić; plan i wrażenie ustawia lekcja L2, nie ten widok.
 *
 * `onOpen(bookId, n)` — „Czytaj dalej”: wołający otwiera czytnik na odcinku
 * z zakładki albo pierwszym nieprzeczytanym. Bez `onOpen` przycisku nie ma.
 */

export interface PolkaViewProps {
  color: string;
  onOpen?: (bookId: string, n: number) => void;
}

const EPISODES = { one: 'odcinek', few: 'odcinki', many: 'odcinków' };

function dayLabel(key: string, today: string): string {
  if (key === today) return 'dziś';
  if (key === addDays(today, 1)) return 'jutro';
  const date = parseKey(key);
  const day = ['w niedzielę', 'w poniedziałek', 'we wtorek', 'w środę', 'w czwartek', 'w piątek', 'w sobotę'][date.getDay()];
  return `${day}, ${new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long' }).format(date)}`;
}

/** Odcinek, od którego czytać dalej: z zakładki, jeśli nieprzeczytany, inaczej pierwszy nieprzeczytany. */
function continueAt(s: ShelfSummary): number | null {
  if (s.next === null) return null;
  if (s.bookmark && !s.done.includes(s.bookmark.n)) return s.bookmark.n;
  return s.next;
}

export function PolkaView({ color, onOpen }: PolkaViewProps) {
  const { shelf, ready, update } = useShelf();
  const today = ready ? todayKey() : '';
  const books = useMemo(() => {
    if (!ready) return [];
    const list: ShelfSummary[] = [];
    for (const entry of Object.values(shelf.entries)) {
      const info = shelfBookInfo(entry);
      if (info) list.push(summarizeEntry(entry, info, today));
    }
    return sortSummaries(list);
  }, [shelf, ready, today]);
  const [picked, setPicked] = useState<string | null>(null);
  const current = books.find((b) => b.bookId === picked) ?? books[0];

  if (!ready) return <div className="min-h-64" aria-busy="true" />;

  if (books.length === 0) {
    return (
      <div data-testid="polka-empty" className="space-y-3">
        <Plank color={color} />
        <p className="text-muted-foreground">
          Twoja półka czeka na pierwszą książkę. Wybierzesz ją w lekcji „Ja, czytelnik”.
        </p>
      </div>
    );
  }

  const read = books.filter((b) => b.status === 'przeczytana').length;

  return (
    <div data-testid="polka" className="space-y-5">
      <div>
        <div className="flex min-h-44 flex-wrap items-end gap-x-1.5 gap-y-4 px-2" role="list" aria-label="Książki na półce">
          {books.map((b) => (
            <Spine key={b.bookId} book={b} color={color} active={b.bookId === current?.bookId} onPick={() => setPicked(b.bookId)} />
          ))}
        </div>
        <Plank color={color} />
        <p className="mt-2 text-sm text-muted-foreground">
          Na półce: {books.length} {plural(books.length, { one: 'tekst', few: 'teksty', many: 'tekstów' })}, przeczytane w całości: {read}.
        </p>
      </div>

      {current && (
        <BookCard
          key={current.bookId}
          book={current}
          color={color}
          today={today}
          onOpen={onOpen}
          onStatus={(value) => update((rec, now) => setStatus(rec, current.bookId, value, now))}
        />
      )}
    </div>
  );
}

function Plank({ color }: { color: string }) {
  return <div aria-hidden className="h-3 w-full" style={{ backgroundColor: color, opacity: 0.85 }} />;
}

function Spine({ book, color, active, onPick }: { book: ShelfSummary; color: string; active: boolean; onPick: () => void }) {
  const total = book.info.total;
  const height = book.kind === 'lekcja' ? 112 : Math.min(168, 128 + total * 8);
  const leaning = book.status === 'odlozona';
  return (
    <div role="listitem" className="flex items-end">
      <button
        type="button"
        onClick={onPick}
        aria-pressed={active}
        aria-label={`${book.info.title} — ${book.done.length} z ${total} ${plural(total, EPISODES)} przeczytane`}
        data-book={book.bookId}
        className="relative flex w-12 flex-col justify-end overflow-hidden border-2 transition-transform duration-200"
        style={{
          height,
          borderColor: color,
          backgroundColor: `color-mix(in srgb, ${color} 12%, var(--background))`,
          transform: `${active ? 'translateY(-10px)' : ''} ${leaning ? 'rotate(-6deg)' : ''}`.trim() || undefined,
          transformOrigin: 'bottom left',
        }}
      >
        {/* Przeczytane odcinki napełniają grzbiet od dołu. */}
        <span aria-hidden className="absolute inset-x-0 bottom-0 flex flex-col-reverse">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className="border-t border-background/60"
              style={{ height: (height - 4) / total, backgroundColor: book.done.includes(i + 1) ? color : 'transparent', opacity: 0.35 }}
            />
          ))}
        </span>
        <span
          className="relative mx-auto mb-2 line-clamp-1 max-h-[calc(100%-1.5rem)] overflow-hidden text-xs font-semibold [writing-mode:vertical-rl]"
          style={{ transform: 'rotate(180deg)' }}
        >
          {book.info.title}
        </span>
        <span aria-hidden className="absolute inset-x-0 top-1 flex h-4 justify-center">
          {book.status === 'przeczytana' && <Check className="h-4 w-4" style={{ color }} />}
        </span>
      </button>
    </div>
  );
}

function BookCard({
  book,
  color,
  today,
  onOpen,
  onStatus,
}: {
  book: ShelfSummary;
  color: string;
  today: string;
  onOpen?: (bookId: string, n: number) => void;
  onStatus: (value: 'czytam' | 'odlozona') => void;
}) {
  const total = book.info.total;
  const at = continueAt(book);
  const plan = book.plan;
  const feeling = feelingLabel(book.impression?.feeling);

  return (
    <section data-testid="polka-card" className="space-y-4 border-2 p-4" style={{ borderColor: color }}>
      <header className="space-y-0.5">
        <h3 className="text-lg font-bold">{book.info.title}</h3>
        <p className="text-sm text-muted-foreground">
          {[book.info.author, book.info.genre].filter(Boolean).join(' · ')}
        </p>
      </header>

      {total > 1 && (
        <div>
          <p className="mb-1.5 text-sm">
            Przeczytane: {book.done.length} z {total} {plural(total, EPISODES)}
          </p>
          <ol className="flex flex-wrap gap-1.5" aria-label="Odcinki">
            {Array.from({ length: total }, (_, i) => {
              const n = i + 1;
              const done = book.done.includes(n);
              const marked = book.bookmark?.n === n;
              return (
                <li
                  key={n}
                  className="relative flex h-9 w-9 items-center justify-center border-2 text-sm font-semibold"
                  style={{ borderColor: color, backgroundColor: done ? color : undefined, color: done ? 'white' : color }}
                  aria-label={`Odcinek ${n}${done ? ', przeczytany' : ''}${marked ? ', zakładka' : ''}`}
                >
                  {n}
                  {marked && <Bookmark aria-hidden className="absolute -top-2 right-0 h-4 w-4" style={{ color, fill: 'var(--background)' }} />}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <p data-testid="polka-plan" className="text-sm">
        {plan.kind === 'gotowe' && <>Przeczytane w całości. Brawo!</>}
        {plan.kind === 'brak' && <>Tej książki nie masz w planie — czytasz ją wtedy, kiedy chcesz.</>}
        {plan.kind === 'koniec' && (
          <>
            {plan.today > 0 ? `Dziś w planie: ${plan.today} ${plural(plan.today, EPISODES)}. ` : 'Dziś w planie nic — dzień wolny od tej książki. '}
            Przy tym planie skończysz <strong>{dayLabel(plan.end, today)}</strong>.
          </>
        )}
        {plan.kind === 'za-krotki' && (
          <>
            {plan.today > 0 ? `Dziś w planie: ${plan.today} ${plural(plan.today, EPISODES)}. ` : ''}
            Dla {plan.missing} {plural(plan.missing, { one: 'odcinka', few: 'odcinków', many: 'odcinków' })} nie ma jeszcze dnia w planie.
          </>
        )}
      </p>

      {book.impression && (
        <div className="flex items-center gap-3">
          <Gauge value={book.impression.gauge} color={color} />
          <p className="text-sm">
            Pierwsze wrażenie{feeling ? `: ${feeling}` : ''}.
          </p>
        </div>
      )}

      <div className="flex min-h-10 flex-wrap gap-2">
        {onOpen && at !== null && (
          <button
            type="button"
            onClick={() => onOpen(book.bookId, at)}
            className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            <BookOpen className="h-5 w-5" aria-hidden />
            {book.done.length === 0 ? 'Zacznij czytać' : total > 1 ? `Czytaj dalej — odcinek ${at}` : 'Czytaj dalej'}
          </button>
        )}
        {book.status === 'czytam' && (
          <button type="button" onClick={() => onStatus('odlozona')} className="border px-4 py-2 text-sm">
            Odłóż na później
          </button>
        )}
        {book.status === 'odlozona' && (
          <button type="button" onClick={() => onStatus('czytam')} className="border px-4 py-2 text-sm" style={{ borderColor: color, color }}>
            Wracam do tej książki
          </button>
        )}
      </div>
    </section>
  );
}

/** Mała tarcza „wciągacza” — ta sama co w L2, tylko do odczytu. */
function Gauge({ value, color }: { value: number; color: string }) {
  const a = Math.PI * (1 - value / 100);
  const x = Math.round((40 + 30 * Math.cos(a)) * 100) / 100;
  const y = Math.round((40 - 30 * Math.sin(a)) * 100) / 100;
  return (
    <svg viewBox="0 0 80 46" className="h-10 w-[70px] shrink-0" role="img" aria-label={`Wciągacz: ${value} na 100`}>
      <path d="M 6 40 A 34 34 0 0 1 74 40" fill="none" stroke="currentColor" strokeOpacity={0.25} strokeWidth={5} />
      <line x1={40} y1={40} x2={x} y2={y} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <circle cx={40} cy={40} r={3.5} fill={color} />
    </svg>
  );
}
