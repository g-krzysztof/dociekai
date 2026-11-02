'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Mic, Monitor, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MIN_POINTS, SlideContentView, SlideStage, fitFontSize, words } from './slide-view';

/**
 * Blok 2 — **zdanie zdjęte ze slajdu nie znika; przenosi się do ust.**
 *
 * To jest najczęstszy błąd pierwszej prezentacji w życiu: dziecko wie, że „na
 * slajdzie ma być mało tekstu”, więc zdania **kasuje** — i razem z nimi kasuje
 * połowę tego, co miało powiedzieć. Dlatego w tym widżecie **nie ma kosza**. Są
 * dwie przegródki: to, co widz ZOBACZY, i to, co widz USŁYSZY, a każde zdanie
 * musi leżeć w którejś z nich.
 *
 * Nagrodą za przeniesienie jest rzecz, której nie da się opowiedzieć: **litery
 * na slajdzie rosną same**. Rozmiar liczy `fitFontSize`, czyli ten sam rachunek,
 * który robi autodopasowanie w PowerPoincie — więc „mniej tekstu = większe
 * litery” nie jest u nas ładnym powiedzeniem, tylko arytmetyką, którą dziecko
 * widzi na własne oczy przy każdym przeciągnięciu.
 *
 * Gest jest prawdziwym przeciąganiem (`pointerdown` → `pointerup` z trafieniem w
 * prostokąt kolumny), a nie samym przyciskiem — strzałka przy każdym zdaniu jest
 * dodatkiem dla klawiatury i dla tabletu, nie zamiennikiem.
 *
 * Przełącznik „hasła zamiast zdań” jest **pokazem, nie ćwiczeniem**: jedno
 * kliknięcie i dziecko widzi, ile jeszcze urosłyby litery, gdyby zamiast zdań
 * zostawiło na slajdzie same hasła. Do zaliczenia nie jest potrzebny.
 */

interface Thought {
  id: string;
  /** Całe zdanie — takie, jakie się MÓWI. */
  full: string;
  /** Hasło — takie, jakie zostaje na slajdzie. */
  short: string;
}

const THOUGHTS: Thought[] = [
  { id: 'noc', full: 'Jeż jest zwierzęciem nocnym — w dzień śpi, a po ogrodzie chodzi dopiero po zmroku.', short: 'Nocne zwierzę' },
  { id: 'kolce', full: 'Na grzbiecie ma około siedmiu tysięcy kolców i wymienia je przez całe życie.', short: '7000 kolców' },
  { id: 'jedzenie', full: 'Najchętniej zjada ślimaki, dżdżownice i owady, dlatego ogrodnicy bardzo się z niego cieszą.', short: 'Je ślimaki i owady' },
  { id: 'zima', full: 'Od listopada do marca zapada w sen zimowy i przez całą zimę nic nie je.', short: 'Zimą śpi' },
  { id: 'jesien', full: 'Jesienią musi porządnie przytyć, bo inaczej nie przetrwa snu zimowego.', short: 'Jesienią tyje' },
  { id: 'mleko', full: 'Jeżowi nie wolno dawać mleka — wypije je, ale potem bardzo choruje.', short: 'Nigdy mleka!' },
  { id: 'strzelanie', full: 'Kolce nie są zatrute i jeż nie umie nimi strzelać, choć w bajkach robi to bez przerwy.', short: 'Kolce nie strzelają' },
];

const TITLE = 'Jeż w naszym ogrodzie';
/** Mowa idzie ~2,5 wyrazu na sekundę — ta sama stała co w próbie generalnej. */
const WORDS_PER_SECOND = 2.5;

type Where = 'slide' | 'notes';

export function SlideDesk({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [place, setPlace] = useState<Record<string, Where>>(
    Object.fromEntries(THOUGHTS.map((thought) => [thought.id, 'slide' as Where]))
  );
  const [shortForm, setShortForm] = useState(false);
  const [dragging, setDragging] = useState<{ id: string; x: number; y: number } | null>(null);
  const slideColumn = useRef<HTMLDivElement>(null);
  const notesColumn = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  const onSlide = THOUGHTS.filter((thought) => place[thought.id] === 'slide');
  const inNotes = THOUGHTS.filter((thought) => place[thought.id] === 'notes');
  const lines = onSlide.map((thought) => (shortForm ? thought.short : thought.full));
  const size = fitFontSize(lines);
  const slideWords = words([TITLE, ...lines].join(' '));
  const speakSeconds = Math.round(inNotes.reduce((sum, thought) => sum + words(thought.full), 0) / WORDS_PER_SECOND);

  const readable = size >= MIN_POINTS + 4;
  const enough = onSlide.length >= 2;
  const solved = readable && enough;

  useEffect(() => {
    if (solved && !done.current) {
      done.current = true;
      onComplete?.();
    }
  }, [solved, onComplete]);

  const move = (id: string, where: Where) => setPlace((current) => ({ ...current, [id]: where }));

  /* Przeciąganie: duch jedzie za palcem, a o upuszczeniu rozstrzyga trafienie w prostokąt kolumny. */
  useEffect(() => {
    if (!dragging) return;
    const onMove = (event: PointerEvent) =>
      setDragging((current) => (current ? { ...current, x: event.clientX, y: event.clientY } : null));
    const onUp = (event: PointerEvent) => {
      const slide = slideColumn.current?.getBoundingClientRect();
      const notes = notesColumn.current?.getBoundingClientRect();
      const inside = (box: DOMRect | undefined) =>
        box &&
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom;
      if (inside(notes)) move(dragging.id, 'notes');
      else if (inside(slide)) move(dragging.id, 'slide');
      setDragging(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragging]);

  const dragged = dragging ? THOUGHTS.find((thought) => thought.id === dragging.id) : null;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        Oto slajd o jeżach, na który ktoś wrzucił wszystko, co wiedział. <strong>Nic z tego nie jest nieprawdą</strong> —
        problem jest w tym, że to wszystko naraz stoi na ścianie. Przenieś zdania do przegródki{' '}
        <strong>„Mówię”</strong>: nie znikną, tylko przestaną być do czytania, a zaczną być do słuchania.
      </p>

      {/* Slajd jest przyklejony na KAŻDEJ szerokości: na desktopie lista zdań jest dłuższa niż ekran, więc przy ostatnim zdaniu slajd wyjeżdżał w górę i dziecko przenosiło zdania na ślepo (audyt 1280 × 720). */}
      <div className="mt-5 space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-5 lg:space-y-0">
        <div className="contents lg:block lg:space-y-3">
          <div className="sticky top-9 z-10 -mx-5 bg-white px-5 pb-3 pt-1 dark:bg-zinc-900 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            <SlideStage maxWidth={560}>
              <SlideContentView title={TITLE} lines={lines} accent={color} size={size} />
            </SlideStage>
            <div className="mx-auto mt-2 flex max-w-[560px] flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
              <p className="tabular-nums">
                Litery:{' '}
                <strong style={{ color: readable ? color : '#c2410c' }}>{size} pt</strong>
                <span className="text-muted-foreground"> · na slajdzie {slideWords} wyrazów</span>
              </p>
              <p className="tabular-nums text-muted-foreground">
                Do powiedzenia: <strong className="text-foreground">{speakSeconds} s</strong>
              </p>
            </div>
          </div>

          <div ref={slideColumn} className="space-y-2">
            <Header icon={Monitor} color={color} label="Na slajdzie — to widz ZOBACZY" count={onSlide.length} />
            {onSlide.map((thought) => (
              <Item
                key={thought.id}
                text={shortForm ? thought.short : thought.full}
                color={color}
                side="slide"
                dragging={dragging?.id === thought.id}
                onGrab={(x, y) => setDragging({ id: thought.id, x, y })}
                onMove={() => move(thought.id, 'notes')}
              />
            ))}
            {onSlide.length === 0 && <Empty>Pusty slajd to też nie jest prezentacja — coś musi tu zostać.</Empty>}
          </div>
        </div>

        <div ref={notesColumn} className="space-y-2 lg:sticky lg:top-9">
          <Header icon={Mic} color={color} label="Mówię — to widz USŁYSZY" count={inNotes.length} />
          {inNotes.map((thought) => (
            <Item
              key={thought.id}
              text={thought.full}
              color={color}
              side="notes"
              dragging={dragging?.id === thought.id}
              onGrab={(x, y) => setDragging({ id: thought.id, x, y })}
              onMove={() => move(thought.id, 'slide')}
            />
          ))}
          {inNotes.length === 0 && (
            <Empty>Tu trafiają zdania, które powiesz na głos. W prawdziwym programie to są „notatki mówcy”.</Empty>
          )}
        </div>
      </div>

      {dragged && dragging && (
        <div
          className="pointer-events-none fixed z-50 max-w-[280px] border bg-white p-2 text-xs shadow-lg dark:bg-zinc-800"
          style={{ left: dragging.x + 12, top: dragging.y - 12, borderColor: color }}
        >
          {place[dragged.id] === 'slide' && shortForm ? dragged.short : dragged.full}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={shortForm}
            onChange={(event) => setShortForm(event.target.checked)}
            className="h-4 w-4 cursor-pointer accent-current"
            style={{ color }}
          />
          Zostaw na slajdzie same hasła
        </label>
        <button
          type="button"
          onClick={() => {
            setPlace(Object.fromEntries(THOUGHTS.map((thought) => [thought.id, 'slide' as Where])));
            setShortForm(false);
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <RotateCcw className="h-3 w-3" aria-hidden />
          Od nowa
        </button>
      </div>

      {solved ? (
        <div className="mt-4 p-4" style={{ backgroundColor: `${color}12` }}>
          <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            Litery mają {size} pt — z ostatniej ławki to się czyta.
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            Sprawdź teraz obie przegródki: <strong>żadne zdanie nie zginęło</strong>. Te po prawej powiesz — i to jest
            cała różnica między slajdem a kartką. Na kartce wszystko musi być napisane, bo nikogo przy niej nie ma. Przy
            slajdzie <strong>stoisz ty</strong>.
          </p>
          {!shortForm && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Zaznacz jeszcze „zostaw same hasła” i popatrz na liczbę punktów. Hasło robi to samo co przeniesienie
              zdania — tylko że myśl zostaje na slajdzie.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Cel: <strong className="text-foreground">litery co najmniej {MIN_POINTS + 4} pt</strong> i co najmniej dwie
          rzeczy, które zostają widzowi przed oczami. Teraz masz {size} pt.
        </p>
      )}
    </div>
  );
}

function Header({
  icon: Icon,
  color,
  label,
  count,
}: {
  icon: typeof Monitor;
  color: string;
  label: string;
  count: number;
}) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
      <span className="tabular-nums text-muted-foreground">{count}</span>
    </p>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-dashed p-3 text-xs leading-relaxed text-muted-foreground">{children}</p>
  );
}

function Item({
  text,
  color,
  side,
  dragging,
  onGrab,
  onMove,
}: {
  text: string;
  color: string;
  side: Where;
  dragging: boolean;
  onGrab: (x: number, y: number) => void;
  onMove: () => void;
}) {
  return (
    <div
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        onGrab(event.clientX, event.clientY);
      }}
      className={cn(
        'flex touch-none select-none items-start gap-2 border bg-white p-2.5 text-sm leading-snug transition-opacity dark:bg-zinc-800/60',
        'cursor-grab active:cursor-grabbing',
        dragging && 'opacity-30'
      )}
    >
      <span className="min-w-0 flex-1">{text}</span>
      <button
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onMove}
        aria-label={side === 'slide' ? 'Przenieś do „Mówię”' : 'Wróć na slajd'}
        className="shrink-0 cursor-pointer border p-1 transition-colors hover:bg-muted"
        style={{ color }}
      >
        {side === 'slide' ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
