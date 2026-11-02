'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AArrowDown, AArrowUp, Bookmark, Check, ChevronDown, ChevronUp, Rows3, Ruler, Scissors } from 'lucide-react';
import { plural } from '@/lib/plural';
import { buildKorpus } from '../../lib/korpus';
import { episodeMinutes, type CzytelniaBook } from '../../lib/czytelnia/types';
import {
  DEFAULT_READING,
  firstPart,
  loadReading,
  saveReading,
  textClass,
  type ReadingSettings,
  type TextSize,
} from '../../lib/czytelnia/czytanie';
import { sylaby } from '../../lib/czytelnia/sylaby';
import { addBook, markEpisodeDone, setBookmark } from '../../lib/polka/model';
import { useShelf } from '../../lib/polka/use-shelf';
import { KorpusText, type KorpusMark } from '../korpus/korpus-text';

/**
 * Czytnik odcinka Czytelni (E5b; od zwrotu 2026-10-19 bez lektora, z
 * narzędziami czytania E4c). Dziecko czyta
 * samo, a pomagają mu:
 * - **linijka** — jedno zdanie wyraźne, reszta przygaszona; stuknięcie
 *   wyróżnionego zdania przesuwa linijkę dalej, stuknięcie innego — na nie
 *   (strzałki w pasku też), a zakładka idzie za linijką. Pasek nie jest
 *   przyklejony: `sticky` chował się pod paskiem gościa, a przy linijce ręka i
 *   tak jest na tekście;
 * - **rozmiar liter** (trzy stopnie) i **odstępy** (szersza interlinia);
 * - **sylaby** — stuknięty wyraz pokazuje się podzielony („kro·ni·karz”).
 * Ustawienia pamięta ta przeglądarka (`lib/czytelnia/czytanie.ts`).
 *
 * Bez linijki stuknięcie zdania → „Zakładka tutaj”; „Wróć do zakładki”
 * przewija i zaznacza. Odcinek zalicza „Przeczytane”. Książka, której nie było
 * na Półce, staje na niej przy pierwszej zakładce albo przeczytanym odcinku.
 *
 * `part` + `onPart` — lekcja (L2, „Pierwsze wrażenie”) pozwala skończyć po
 * pierwszej części odcinka: po akapicie z `firstPart()` stoi „Zatrzymuję się
 * tutaj”, które kładzie zakładkę i woła `onPart`. `onFinished(n)` — odcinek
 * przeczytany w całości.
 */

export interface CzytelniaReaderProps {
  book: CzytelniaBook;
  /** Numer odcinka (`n`). */
  n: number;
  color: string;
  onFinished?: (n: number) => void;
  /** Pokaż koniec pierwszej części odcinka (L2). */
  part?: boolean;
  onPart?: () => void;
}

function ToolButton({
  pressed,
  onClick,
  disabled,
  label,
  children,
}: {
  pressed?: boolean;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      className="inline-flex h-9 items-center gap-1.5 border px-2.5 text-sm disabled:opacity-40"
      style={pressed ? { backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)', fontWeight: 600 } : undefined}
    >
      {children}
    </button>
  );
}

export function CzytelniaReader({ book, n, color, onFinished, part = false, onPart }: CzytelniaReaderProps) {
  const episode = book.episodes.find((e) => e.n === n) ?? book.episodes[0];
  const korpus = useMemo(() => buildKorpus(episode.source), [episode.source]);
  const partEnd = useMemo(() => (part ? firstPart(korpus) : null), [part, korpus]);
  const { shelf, ready, update } = useShelf();
  const entry = shelf.entries[book.id];
  const done = entry?.done.includes(episode.n) ?? false;
  const bookmark = entry?.bookmark?.value.n === episode.n ? entry.bookmark.value.unit : null;

  // Ustawienia dopiero po zamontowaniu — serwer nie zna magazynu przeglądarki.
  const [settings, setSettings] = useState<ReadingSettings>(DEFAULT_READING);
  useEffect(() => {
    setSettings(loadReading());
  }, []);
  const change = (patch: Partial<ReadingSettings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      saveReading(next);
      return next;
    });
  };

  const [selected, setSelected] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [syllables, setSyllables] = useState(false);
  const [word, setWord] = useState<string | null>(null);
  const [partTaken, setPartTaken] = useState(false);

  const unitIds = korpus.units.map((u) => u.id);
  const ruler = settings.ruler;
  const current = ruler ? (focus ?? bookmark ?? unitIds[0]) : null;

  const placeBookmark = (unit: string) => {
    update((rec, now) => setBookmark(addBook(rec, book.id, 'czytelnia', now), book.id, episode.n, unit, now));
  };

  const moveRuler = (unit: string, scroll: boolean) => {
    setFocus(unit);
    placeBookmark(unit);
    if (scroll) document.querySelector(`[data-unit="${unit}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const step = (delta: number) => {
    if (!current) return;
    const i = unitIds.indexOf(current);
    const next = unitIds[Math.min(unitIds.length - 1, Math.max(0, i + delta))];
    if (next !== current) moveRuler(next, true);
  };

  const finish = () => {
    update((rec, now) =>
      markEpisodeDone(addBook(rec, book.id, 'czytelnia', now), book.id, episode.n, book.episodes.length, now),
    );
    onFinished?.(episode.n);
  };

  const takePart = () => {
    if (!partEnd) return;
    placeBookmark(unitIds[unitIds.indexOf(partEnd.unit) + 1] ?? partEnd.unit);
    setPartTaken(true);
    onPart?.();
  };

  const goToBookmark = () => {
    if (!bookmark) return;
    document.querySelector(`[data-unit="${bookmark}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setSelected(bookmark);
  };

  const onPick = (id: string) => {
    if (syllables) {
      setWord((cur) => (cur === id ? null : id));
      return;
    }
    if (ruler) {
      if (id === current) step(1);
      else moveRuler(id, false);
      return;
    }
    setSelected((cur) => (cur === id ? null : id));
  };

  const marks: Record<string, KorpusMark> = {};
  if (ruler && current) {
    for (const id of unitIds) if (id !== current) marks[id] = 'dim';
  } else {
    if (bookmark) marks[bookmark] = 'hint';
    if (selected) marks[selected] = 'picked';
  }
  if (syllables && word) marks[word] = 'picked';

  const afterBlock: Record<number, ReactNode> = {};
  if (partEnd && !done) {
    afterBlock[partEnd.block] = (
      <div className="my-5 flex flex-wrap items-center gap-3 border-y-2 border-dashed py-3 text-[15px] leading-snug" style={{ borderColor: color }}>
        {partTaken ? (
          <p className="inline-flex items-center gap-2 font-medium" style={{ color }}>
            <Bookmark className="h-4 w-4" aria-hidden /> Zakładka czeka tutaj. Resztę doczytasz, kiedy zechcesz.
          </p>
        ) : (
          <>
            <p className="min-w-0 flex-1 basis-56">Koniec pierwszej części. Możesz tu przerwać — zakładka zapamięta miejsce.</p>
            <button
              type="button"
              onClick={takePart}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              <Scissors className="h-4 w-4" aria-hidden /> Zatrzymuję się tutaj
            </button>
          </>
        )}
      </div>
    );
  }

  const minutes = episodeMinutes(episode.words);
  const credit = [book.author, book.translator ? `tłum. ${book.translator}` : null].filter(Boolean).join(', ');
  const wordForm = word ? korpus.tokenById[word]?.form : null;

  return (
    <article className="w-full">
      <header className="mb-4 space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wide" style={{ color }}>
          {book.title} · odcinek {episode.n} z {book.episodes.length}
        </p>
        <h3 className="text-xl font-bold">{episode.title}</h3>
        <p className="text-sm text-muted-foreground">
          {credit} · ok. {minutes} {plural(minutes, { one: 'minuta', few: 'minuty', many: 'minut' })} czytania
        </p>
      </header>

      {/* Narzędzia czytania — stały układ, żeby tekst nie skakał. */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5 py-2" data-testid="czytanie-narzedzia">
        <ToolButton pressed={ruler} onClick={() => change({ ruler: !ruler })} label="Linijka: jedno zdanie naraz">
          <Ruler className="h-4 w-4" aria-hidden /> Linijka
        </ToolButton>
        <ToolButton
          onClick={() => change({ size: Math.max(0, settings.size - 1) as TextSize })}
          disabled={settings.size === 0}
          label="Mniejsze litery"
        >
          <AArrowDown className="h-4 w-4" aria-hidden />
        </ToolButton>
        <ToolButton
          onClick={() => change({ size: Math.min(2, settings.size + 1) as TextSize })}
          disabled={settings.size === 2}
          label="Większe litery"
        >
          <AArrowUp className="h-4 w-4" aria-hidden />
        </ToolButton>
        <ToolButton pressed={settings.wide} onClick={() => change({ wide: !settings.wide })} label="Większe odstępy między wierszami">
          <Rows3 className="h-4 w-4" aria-hidden /> Odstępy
        </ToolButton>
        <ToolButton
          pressed={syllables}
          onClick={() => {
            setSyllables((v) => !v);
            setWord(null);
          }}
          label="Sylaby: stuknij wyraz, żeby go podzielić"
        >
          <span aria-hidden className="font-semibold">
            sy·la·by
          </span>
        </ToolButton>
        {ruler && (
          <span className="ml-auto inline-flex gap-1.5">
            <ToolButton onClick={() => step(-1)} disabled={current === unitIds[0]} label="Poprzednie zdanie">
              <ChevronUp className="h-4 w-4" aria-hidden />
            </ToolButton>
            <ToolButton onClick={() => step(1)} disabled={current === unitIds[unitIds.length - 1]} label="Następne zdanie">
              <ChevronDown className="h-4 w-4" aria-hidden /> Dalej
            </ToolButton>
          </span>
        )}
      </div>

      {/* Pasek stanu — stała wysokość: sylaby, zakładka albo podpowiedź. */}
      <div className="mb-3 flex min-h-10 flex-wrap items-center gap-2 text-sm" aria-live="polite">
        {syllables ? (
          wordForm ? (
            <p className="text-2xl font-semibold tracking-wide" style={{ color }} data-testid="sylaby">
              {sylaby(wordForm).join('·')}
            </p>
          ) : (
            <span className="text-muted-foreground">Stuknij wyraz, który trudno przeczytać.</span>
          )
        ) : ruler ? (
          <span className="text-muted-foreground">Przeczytane zdanie stuknij — linijka przejdzie do następnego, a zakładka za nią.</span>
        ) : selected ? (
          <button
            type="button"
            onClick={() => {
              placeBookmark(selected);
              setSelected(null);
            }}
            className="inline-flex items-center gap-1.5 border px-3 py-1.5"
            style={{ borderColor: color, color }}
          >
            <Bookmark className="h-4 w-4" aria-hidden /> Zakładka tutaj
          </button>
        ) : ready && bookmark ? (
          <button type="button" onClick={goToBookmark} className="inline-flex items-center gap-1.5 border px-3 py-1.5">
            <Bookmark className="h-4 w-4" aria-hidden style={{ color }} /> Wróć do zakładki
          </button>
        ) : (
          <span className="text-muted-foreground">Stuknij zdanie, żeby zostawić w nim zakładkę.</span>
        )}
      </div>

      <KorpusText
        korpus={korpus}
        color={color}
        pick={syllables ? 'word' : 'unit'}
        onPick={onPick}
        activeUnit={current}
        marks={marks}
        afterBlock={afterBlock}
        className={textClass(settings)}
      />

      <footer className="mt-6 flex min-h-12 flex-wrap items-center gap-3 border-t pt-4">
        {done ? (
          <p className="inline-flex items-center gap-2 font-medium" style={{ color }}>
            <Check className="h-5 w-5" aria-hidden /> Odcinek {episode.n} przeczytany
          </p>
        ) : (
          <button
            type="button"
            onClick={finish}
            className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            <Check className="h-5 w-5" aria-hidden /> Przeczytane
          </button>
        )}
        <p className="text-sm text-muted-foreground">{book.source.label} · domena publiczna</p>
      </footer>
    </article>
  );
}
