'use client';

import { useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import Image from 'next/image';
import { ArrowRight, GripVertical, Layers, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { img } from '@/lib/media';
import { SourcePassport } from '../../source-desk/source-passport';
import {
  AXIS_FROM,
  AXIS_TO,
  BATTLE_YEAR,
  CHRONICLES,
  COPIES,
  KADLUBEK_BANK,
  KADLUBEK_FIELDS,
  chronicleById,
  judgeAxisDrop,
  judgeStack,
  uToYear,
  yearToU,
  yearsAfter,
  type ChronicleId,
} from './psie-pole';

/** Prawdziwe źródło (domena publiczna) — nie ilustracja z generatora. */
const DRZEWORYT = img('/images/historia/lekcje/wiarygodnosc-zrodla/drzeworyt-bielskiego-1564.jpg');

type Phase = 'axis' | 'stack' | 'passport' | 'done';

/** Wiersz etykiety pod osią — Gall i Kadłubek leżą blisko siebie tylko na wąskim ekranie, ale stały rząd nie zależy od szerokości. */
const LABEL_ROW: Record<ChronicleId, 0 | 1> = { gall: 0, kadlubek: 1, dlugosz: 0, bielski: 1 };
const TICKS = [1100, 1200, 1300, 1400, 1500, 1600];
/** „leży na Kadłubku” — miejscownik nazwiska do komunikatu stosu. */
const ON_LOCATIVE: Record<ChronicleId, string> = { gall: 'Gallu', kadlubek: 'Kadłubku', dlugosz: 'Długoszu', bielski: 'Bielskim' };

/**
 * Blok 2 — **„Psie Pole”** (śledztwo).
 *
 * Trzy kroki, dwa gesty nowe w kursie:
 *  1. **rozkłada kroniki na osi „kiedy napisano”** — przeciąga kartę nad oś
 *     (albo wybiera kartę i stuka w oś / strzałki + Enter); po położeniu karta
 *     odsłania, co kronika pisze o bitwie, a oś sama rysuje odległość od 1109 r.;
 *  2. **nakłada kopie na oryginał** — Długosz i Bielski znają opowieść od
 *     Kadłubka, więc trzy kroniki zamieniają się w jeden stos — jeden głos;
 *  3. paszport kroniki Kadłubka (silnik `source-desk`, drugi konsument):
 *     kto, kiedy, po co — z kart i z osi.
 */
export function PsiePoleSledztwo({ color, kopistaImage, onComplete }: { color: string; kopistaImage: string; onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('axis');

  return (
    <div className="space-y-6">
      <AxisStep color={color} locked={phase !== 'axis'} onDone={() => setPhase('stack')} />
      {phase !== 'axis' && (
        <StackStep color={color} kopistaImage={kopistaImage} locked={phase !== 'stack'} onDone={() => setPhase('passport')} />
      )}
      {(phase === 'passport' || phase === 'done') && (
        <div className="space-y-4">
          <ChronicleCard id="kadlubek" showSays />
          <SourcePassport
            color={color}
            fields={KADLUBEK_FIELDS}
            bank={KADLUBEK_BANK}
            locked={phase === 'done'}
            onDone={() => {
              setPhase('done');
              onComplete();
            }}
            intro={
              <p className="text-base leading-relaxed">
                Ostatni krok: <strong>paszport kroniki Kadłubka</strong> — tej, od której zaczyna się cała opowieść.
                Odpowiedzi są na jego karcie i na osi. Stuknij karteczkę, potem pole.
              </p>
            }
          />
        </div>
      )}
      {phase === 'done' && (
        <div className="space-y-2 border-2 p-4 text-base leading-relaxed" style={{ borderColor: color }} aria-live="polite">
          <p>
            <strong>Kto zyskuje na opowieści o wielkim zwycięstwie Krzywoustego?</strong> Jego syn — książę, na którego
            dworze Kadłubek pisał prawie sto lat później. To nie dowód, że Kadłubek zmyślił. To powód, żeby go
            sprawdzać: tak jak Maja broniąca najlepszego kolegi.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Krok 1: oś „kiedy napisano” ───

function AxisStep({ color, locked, onDone }: { color: string; locked: boolean; onDone: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<Partial<Record<ChronicleId, number>>>({});
  const [selected, setSelected] = useState<ChronicleId | null>(null);
  const [drag, setDrag] = useState<{ id: ChronicleId; x: number; y: number; moved: boolean } | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const moved = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  const allPlaced = CHRONICLES.every((c) => placed[c.id] !== undefined);

  const yearAtClientX = (clientX: number): number | null => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    return uToYear((clientX - rect.left) / rect.width);
  };

  const overTrack = (clientX: number, clientY: number): boolean => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return false;
    return clientX >= rect.left - 8 && clientX <= rect.right + 8 && clientY >= rect.top - 48 && clientY <= rect.bottom + 24;
  };

  const drop = (id: ChronicleId, year: number) => {
    const verdict = judgeAxisDrop(id, year);
    const c = chronicleById(id);
    if (verdict.ok) {
      const next = { ...placed, [id]: c.written };
      setPlaced(next);
      setSelected(null);
      setCursor(null);
      setMessage({ ok: true, text: `${c.author} — na miejscu. Przeczytaj, co pisze o bitwie.` });
    } else {
      setMessage({ ok: false, text: verdict.why });
    }
  };

  const onCardPointerDown = (e: PointerEvent<HTMLButtonElement>, id: ChronicleId) => {
    if (locked) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Bez przechwycenia zostaje stuknięcie (wybór karty).
    }
    moved.current = false;
    start.current = { x: e.clientX, y: e.clientY };
    setDrag({ id, x: e.clientX, y: e.clientY, moved: false });
  };
  const onCardPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 6) moved.current = true;
    if (moved.current) {
      setDrag({ ...drag, x: e.clientX, y: e.clientY, moved: true });
      setCursor(overTrack(e.clientX, e.clientY) ? yearAtClientX(e.clientX) : null);
    }
  };
  const onCardPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const id = drag.id;
    setDrag(null);
    if (!moved.current) {
      setSelected((s) => (s === id ? null : id));
      setMessage(null);
      return;
    }
    setCursor(null);
    if (overTrack(e.clientX, e.clientY)) {
      const year = yearAtClientX(e.clientX);
      if (year !== null) drop(id, year);
    } else {
      setMessage({ ok: false, text: 'Puść kartę nad osią — tam, gdzie jest rok jej napisania.' });
    }
  };

  const onTrackClick = (e: MouseEvent<HTMLDivElement>) => {
    if (locked || !selected) return;
    const year = yearAtClientX(e.clientX);
    if (year !== null) drop(selected, year);
  };

  const onTrackKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (locked || !selected) return;
    const step = e.shiftKey ? 50 : 10;
    const current = cursor ?? 1350;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setCursor(Math.min(AXIS_TO, Math.max(AXIS_FROM, current + (e.key === 'ArrowLeft' ? -step : step))));
    } else if ((e.key === 'Enter' || e.key === ' ') && cursor !== null) {
      e.preventDefault();
      drop(selected, cursor);
    }
  };

  const waiting = CHRONICLES.filter((c) => placed[c.id] === undefined);
  const placedSorted = CHRONICLES.filter((c) => placed[c.id] !== undefined);

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed">
        O bitwie pod Wrocławiem w {BATTLE_YEAR} r. piszą cztery dawne kroniki. Zanim uwierzysz którejkolwiek, sprawdź,{' '}
        <strong>kiedy każdą napisano</strong>. Przeciągnij karty nad oś — albo stuknij kartę, a potem miejsce na osi.
      </p>

      {/* Oś — zawsze nad kartami, żeby przeciągana karta i cel były widoczne naraz także na telefonie. */}
      <div className="border bg-white p-3 dark:bg-zinc-900 sm:p-4">
        <div
          ref={trackRef}
          role="application"
          tabIndex={locked ? -1 : 0}
          onClick={onTrackClick}
          onKeyDown={onTrackKey}
          aria-label={
            selected
              ? `Oś lat ${AXIS_FROM}–${AXIS_TO}. Strzałki przesuwają znacznik (z Shiftem o 50 lat), Enter kładzie kartę ${chronicleById(selected).short}.`
              : `Oś lat ${AXIS_FROM}–${AXIS_TO}. Najpierw wybierz kartę kroniki.`
          }
          className={cn('relative mx-3 h-36 select-none focus-visible:outline-2', selected && !locked && 'cursor-crosshair')}
        >
          {/* bitwa */}
          {/* Rok 1109 leży tuż przy lewym końcu osi — etykieta zaczyna się na kresce i biegnie w prawo, żeby nie wyjść za kadr. */}
          <div className="absolute top-0" style={{ left: `${yearToU(BATTLE_YEAR) * 100}%` }}>
            <span className="-ml-2 flex w-fit items-center gap-1 whitespace-nowrap border border-dashed bg-background px-1.5 py-0.5 text-xs font-semibold">
              <Swords className="h-3 w-3" aria-hidden /> bitwa? {BATTLE_YEAR}
            </span>
            <span className="block h-7 w-px border-l border-dashed border-foreground/60" />
          </div>

          {/* linia i podziałka */}
          <div className="absolute inset-x-0 top-[3.25rem] h-0.5 bg-foreground/70" />
          {TICKS.map((t) => (
            <div key={t} className="absolute top-[3.25rem] -translate-x-1/2" style={{ left: `${yearToU(t) * 100}%` }}>
              <span className="mx-auto block h-2 w-px bg-foreground/70" />
              <span className="block text-[11px] tabular-nums text-muted-foreground">{t}</span>
            </div>
          ))}

          {/* odległości od bitwy — kreska od 1109 r. do etykiety kroniki, w jej rzędzie */}
          {placedSorted.map((c) => {
            const from = yearToU(BATTLE_YEAR) * 100;
            const to = yearToU(c.written) * 100;
            return (
              <div
                key={`d-${c.id}`}
                className="absolute h-0.5 opacity-40"
                style={{ left: `${from}%`, width: `${to - from}%`, top: `${5.6 + LABEL_ROW[c.id] * 2.1}rem`, backgroundColor: color }}
                aria-hidden
              />
            );
          })}

          {/* położone karty */}
          {placedSorted.map((c) => (
            <div
              key={c.id}
              className="absolute -translate-x-1/2 text-center"
              style={{ left: `${yearToU(c.written) * 100}%`, top: `${5 + LABEL_ROW[c.id] * 2.1}rem` }}
            >
              <span className="block whitespace-nowrap px-1.5 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: color }}>
                {c.short}
              </span>
            </div>
          ))}

          {/* znacznik przeciągania / klawiatury */}
          {cursor !== null && (
            <div className="pointer-events-none absolute top-6 -translate-x-1/2" style={{ left: `${yearToU(cursor) * 100}%` }}>
              <span className="mx-auto block h-10 w-0.5" style={{ backgroundColor: color }} />
              <span className="block text-xs font-semibold tabular-nums" style={{ color }}>
                {cursor}
              </span>
            </div>
          )}
        </div>
      </div>

      {message && (
        <p className={cn('text-sm leading-relaxed', message.ok ? 'font-semibold text-success' : 'font-medium text-destructive')} aria-live="polite">
          {message.text}
        </p>
      )}

      {waiting.length > 0 && !locked && (
        <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Karty kronik do położenia">
          {waiting.map((c) => (
            <button
              key={c.id}
              type="button"
              onPointerDown={(e) => onCardPointerDown(e, c.id)}
              onPointerMove={onCardPointerMove}
              onPointerUp={onCardPointerUp}
              onPointerCancel={() => {
                setDrag(null);
                setCursor(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelected((s) => (s === c.id ? null : c.id));
                  trackRef.current?.focus();
                }
              }}
              aria-pressed={selected === c.id}
              className={cn(
                'flex touch-none items-start gap-2 border-2 bg-white p-3 text-left text-sm transition-shadow dark:bg-zinc-900',
                drag?.id === c.id && drag.moved ? 'opacity-40' : 'cursor-grab',
                selected === c.id ? 'shadow-md' : 'border-border'
              )}
              style={selected === c.id ? { borderColor: color } : undefined}
            >
              <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0">
                <span className="block font-semibold">
                  {c.author} <span className="font-normal tabular-nums text-muted-foreground">· pisał {c.writtenLabel}</span>
                </span>
                <span className="mt-0.5 block text-muted-foreground">{c.who}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {drag?.moved && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full border-2 bg-white px-3 py-1.5 text-sm font-semibold shadow-lg dark:bg-zinc-900"
          style={{ left: drag.x, top: drag.y - 8, borderColor: color }}
          aria-hidden
        >
          {chronicleById(drag.id).short} · {chronicleById(drag.id).writtenLabel}
        </div>
      )}

      {placedSorted.length > 0 && (
        <ol className="space-y-2">
          {placedSorted.map((c) => {
            const after = yearsAfter(c.id);
            return (
              <li key={c.id} className="border bg-muted/40 p-3 text-sm leading-relaxed">
                <span className="block font-semibold">
                  {c.author} —{' '}
                  <span className="tabular-nums">
                    {after.approx ? 'ok. ' : ''}
                    {after.years} {plural(after.years, { one: 'rok', few: 'lata', many: 'lat' })} po bitwie
                  </span>
                </span>
                {c.says}
              </li>
            );
          })}
        </ol>
      )}

      {allPlaced && !locked && (
        <div className="space-y-3">
          <p className="text-base leading-relaxed">
            Spójrz na oś: <strong>tylko Gall pisał zaraz po wojnie — i właśnie on o bitwie milczy.</strong> Wszyscy,
            którzy ją opisują, pisali dużo później. Od kogo wiedzieli?
          </p>
          <button
            type="button"
            onClick={onDone}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            Sprawdźmy, kto od kogo <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Krok 2: kopie na oryginał ───

function StackStep({
  color,
  kopistaImage,
  locked,
  onDone,
}: {
  color: string;
  kopistaImage: string;
  locked: boolean;
  onDone: () => void;
}) {
  const [onto, setOnto] = useState<Partial<Record<ChronicleId, ChronicleId>>>({});
  const [selected, setSelected] = useState<ChronicleId | null>(null);
  const [drag, setDrag] = useState<{ id: ChronicleId; x: number; y: number; moved: boolean } | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const moved = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  const stacked = (id: ChronicleId) => onto[id] !== undefined;
  const allStacked = COPIES.every(stacked);
  const rootOf = (id: ChronicleId): ChronicleId => {
    let cur = id;
    while (onto[cur]) cur = onto[cur]!;
    return cur;
  };
  const piles = CHRONICLES.filter((c) => !stacked(c.id));

  const put = (copy: ChronicleId, target: ChronicleId) => {
    const verdict = judgeStack(copy, target);
    if (verdict.ok) {
      setOnto((prev) => ({ ...prev, [copy]: target }));
      setSelected(null);
      setMessage({ ok: true, text: `${chronicleById(copy).short} leży na ${ON_LOCATIVE[target]} — kopia na oryginale.` });
    } else {
      setMessage({ ok: false, text: verdict.why });
    }
  };

  const pileAt = (x: number, y: number): ChronicleId | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-pile]');
    return (el?.dataset.pile as ChronicleId | undefined) ?? null;
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>, id: ChronicleId) => {
    if (locked) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Zostaje stuknięcie.
    }
    moved.current = false;
    start.current = { x: e.clientX, y: e.clientY };
    setDrag({ id, x: e.clientX, y: e.clientY, moved: false });
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 6) moved.current = true;
    if (moved.current) setDrag({ ...drag, x: e.clientX, y: e.clientY, moved: true });
  };
  const onPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const id = drag.id;
    setDrag(null);
    if (!moved.current) {
      // Stuknięcie: wybierz kartę albo — gdy inna jest wybrana — połóż ją tutaj.
      if (selected && selected !== id) put(selected, id);
      else setSelected((s) => (s === id ? null : id));
      return;
    }
    const target = pileAt(e.clientX, e.clientY);
    if (target && target !== id) put(id, target);
    else setMessage({ ok: false, text: 'Upuść kartę na innej kronice — tej, od której jej autor zna opowieść.' });
  };

  return (
    <div className="space-y-4 border-t pt-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_220px] sm:items-start">
        <p className="text-base leading-relaxed">
          Dawni kronikarze często <strong>przepisywali starsze kroniki</strong>. Przeczytaj karty i{' '}
          <strong>połóż każdą kopię na kronice, od której jej autor zna opowieść</strong> — przeciągnij albo stuknij
          kopię, a potem oryginał.
        </p>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[220px] overflow-hidden">
          <Image
            src={kopistaImage}
            alt="Akwarela: siwy, brodaty uczony w ciemnym habicie siedzi w klasztornej bibliotece przy stole z dwiema otwartymi księgami — z lewej starą, zniszczoną, z prawej nową, do której przepisuje gęsim piórem"
            width={220}
            height={165}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {piles.map((pile) => {
          const children = CHRONICLES.filter((c) => stacked(c.id) && rootOf(c.id) === pile.id);
          return (
            <div key={pile.id} data-pile={pile.id} className="relative">
              {children.map((c, i) => (
                <div
                  key={c.id}
                  className="absolute inset-x-0 border bg-muted px-2 py-1 text-xs font-semibold"
                  style={{ top: -(children.length - i) * 10, zIndex: i }}
                  aria-hidden
                />
              ))}
              <button
                type="button"
                onPointerDown={(e) => onPointerDown(e, pile.id)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => setDrag(null)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  e.preventDefault();
                  if (selected && selected !== pile.id) put(selected, pile.id);
                  else setSelected((s) => (s === pile.id ? null : pile.id));
                }}
                disabled={locked}
                aria-pressed={selected === pile.id}
                className={cn(
                  'relative z-10 flex h-full min-h-[8rem] w-full touch-none flex-col border-2 bg-white p-3 text-left text-sm disabled:cursor-default dark:bg-zinc-900',
                  drag?.id === pile.id && drag.moved && 'opacity-40',
                  selected === pile.id ? 'shadow-md' : 'border-border'
                )}
                style={selected === pile.id ? { borderColor: color } : undefined}
              >
                <span className="font-semibold">{pile.author}</span>
                <span className="text-xs tabular-nums text-muted-foreground">pisał {pile.writtenLabel}</span>
                <span className="mt-1 text-xs leading-snug">
                  {pile.copyHint ? (
                    <>Uwaga: {pile.copyHint}.</>
                  ) : pile.id === 'gall' ? (
                    'O bitwie milczy.'
                  ) : (
                    'Pierwszy opis wielkiej bitwy.'
                  )}
                </span>
                {children.length > 0 && (
                  <span className="mt-auto flex items-center gap-1 pt-2 text-xs font-semibold" style={{ color }}>
                    <Layers className="h-3.5 w-3.5" aria-hidden /> + {children.map((c) => c.short).join(', ')}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {drag?.moved && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full border-2 bg-white px-3 py-1.5 text-sm font-semibold shadow-lg dark:bg-zinc-900"
          style={{ left: drag.x, top: drag.y - 8, borderColor: color }}
          aria-hidden
        >
          {chronicleById(drag.id).short}
        </div>
      )}

      {message && !allStacked && (
        <p className={cn('text-sm leading-relaxed', message.ok ? 'font-semibold text-success' : 'font-medium text-destructive')} aria-live="polite">
          {message.text}
        </p>
      )}

      {allStacked && (
        <div className="space-y-4" aria-live="polite">
          <div className="space-y-2 border-2 p-4 text-base leading-relaxed" style={{ borderColor: color }}>
            <p>
              <strong>Trzy kroniki opisują bitwę — ale to jeden głos: Kadłubka.</strong> Kopia nie jest nowym świadkiem.
              Pamiętasz czat? Dwóch niezależnych świadków to co innego niż jeden, którego słowa ktoś powtórzył dwa razy.
            </p>
            <p>A jedyny, który pisał zaraz po wojnie — Gall — o wielkiej bitwie nie wspomina.</p>
          </div>
          <figure className="space-y-1">
            <div className="relative mx-auto aspect-[1000/729] w-full max-w-xl overflow-hidden border">
              <Image
                src={DRZEWORYT}
                alt="Drzeworyt z XVI wieku: tłum rycerzy na koniach w pełnych zbrojach płytowych, z kopiami i chorągwiami, walczy w ciasnym zwarciu; na ziemi leżą powaleni"
                width={576}
                height={420}
                className="absolute inset-0 h-full w-full object-contain"
              />
            </div>
            <figcaption className="text-xs leading-relaxed text-muted-foreground">
              <strong>Prawdziwe źródło:</strong> „Bitwa na Psim Polu”, drzeworyt z kroniki Marcina Bielskiego, 1564 r. —
              ponad 450 lat po bitwie. Rycerze mają zbroje płytowe, których w 1109 r. jeszcze nie znano: drzeworytnik
              narysował wojsko ze swoich czasów. Domena publiczna, Biblioteka Narodowa (przez Wikimedia Commons).
            </figcaption>
          </figure>
          {!locked && (
            <button
              type="button"
              onClick={onDone}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              Do paszportu Kadłubka <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ChronicleCard({ id, showSays }: { id: ChronicleId; showSays?: boolean }) {
  const c = chronicleById(id);
  return (
    <div className="border bg-muted/40 p-3 text-sm leading-relaxed">
      <p className="font-semibold">
        {c.author} <span className="font-normal tabular-nums text-muted-foreground">· pisał {c.writtenLabel}</span>
      </p>
      <p>{c.who}</p>
      {showSays && <p className="mt-1">{c.says}</p>}
    </div>
  );
}
