'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Archive, Check, HelpCircle, Highlighter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import {
  judgeMarks,
  stampsFor,
  type Drawer,
  type Evidence,
  type Legend,
  type Marker,
  type Marks,
  type MarksVerdict,
} from './legendy';

export const MARKER_STYLE: Record<Marker, { label: string; hint: string; bg: string; swatch: string }> = {
  sprawdzalne: {
    label: 'Zielony — da się sprawdzić',
    hint: 'miejsce, rzecz, nazwa, którą można zobaczyć',
    bg: 'bg-emerald-200/80 dark:bg-emerald-700/60',
    swatch: 'bg-emerald-300 dark:bg-emerald-600',
  },
  zmyslone: {
    label: 'Różowy — zmyślone',
    hint: 'cud, potwór, coś, czego nikt nie sprawdzi',
    bg: 'bg-pink-200/90 dark:bg-pink-700/60',
    swatch: 'bg-pink-300 dark:bg-pink-600',
  },
};

const STAMP: Record<Evidence, { icon: typeof Check; cls: string; label: string }> = {
  jest: { icon: Check, cls: 'bg-emerald-600 text-white', label: 'potwierdzone' },
  brak: { icon: X, cls: 'bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900', label: 'brak śladu' },
  niewiadomo: { icon: HelpCircle, cls: 'bg-amber-500 text-white', label: 'nie wiadomo' },
};

/** O ile pikseli trzeba wysunąć szufladę, żeby się otworzyła. */
const PULL_OPEN_PX = 70;

/**
 * Jedna legenda: **zakreślacz w dwóch kolorach** (gest z L3), potem
 * **szafa z dowodami** — dziecko wysuwa szuflady palcem (ciągnie uchwyt
 * w prawo), a każda otwarta szuflada stempluje fragmenty, o których mówi.
 * Gdy wszystkie są otwarte, sędzia (`judgeMarks`) zestawia kolory dziecka
 * z tym, co mówią szuflady; pomyłkę można przemalować i sprawdzić znowu.
 */
export function LegendaZDowodami({
  legend,
  color,
  hints = true,
  onDone,
}: {
  legend: Legend;
  color: string;
  /** Podpowiedzi pod pisakami — druga legenda idzie bez nich. */
  hints?: boolean;
  onDone: () => void;
}) {
  const [marker, setMarker] = useState<Marker>('sprawdzalne');
  const [marks, setMarks] = useState<Marks>({});
  const [cabinet, setCabinet] = useState(false);
  const [opened, setOpened] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<MarksVerdict | null>(null);
  const paintMode = useRef<'paint' | 'erase' | null>(null);
  const lastFrag = useRef<string | null>(null);

  const accepted = verdict?.ok === true;
  const allOpen = opened.length === legend.drawers.length;
  const stamps = stampsFor(legend, opened);
  const markedCount = legend.fragments.filter((f) => marks[f.id]).length;
  const allMarked = markedCount === legend.fragments.length;

  const applyTo = (id: string) => {
    if (accepted || lastFrag.current === id) return;
    lastFrag.current = id;
    setMarks((prev) => {
      const next = { ...prev };
      if (paintMode.current === 'erase') delete next[id];
      else next[id] = marker;
      return next;
    });
    setVerdict(null);
  };

  const fragAt = (x: number, y: number): string | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-frag]');
    return el?.dataset.frag ?? null;
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const id = fragAt(e.clientX, e.clientY);
    if (!id || accepted) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Bez przechwycenia ruch i tak działa, dopóki palec jest nad tekstem.
    }
    paintMode.current = marks[id] === marker ? 'erase' : 'paint';
    lastFrag.current = null;
    applyTo(id);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!paintMode.current) return;
    const id = fragAt(e.clientX, e.clientY);
    if (id) applyTo(id);
  };
  const endPaint = () => {
    paintMode.current = null;
    lastFrag.current = null;
  };

  const openDrawer = (id: string) => {
    if (opened.includes(id)) return;
    const next = [...opened, id];
    setOpened(next);
    if (next.length === legend.drawers.length) setVerdict(judgeMarks(legend, marks));
  };

  const check = () => {
    setVerdict(judgeMarks(legend, marks));
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Legenda</p>
        <h3 className="text-lg font-semibold">{legend.title}</h3>
        <p className="text-sm text-muted-foreground">{legend.intro}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Pisak">
        {(Object.keys(MARKER_STYLE) as Marker[]).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={marker === m}
            disabled={accepted}
            onClick={() => setMarker(m)}
            className={cn(
              'flex items-center gap-3 border-2 px-3 py-2 text-left text-sm transition-colors disabled:opacity-60',
              marker === m ? 'font-semibold' : 'border-transparent bg-muted/60'
            )}
            style={marker === m ? { borderColor: color } : undefined}
          >
            <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center', MARKER_STYLE[m].swatch)}>
              <Highlighter className="h-4 w-4" aria-hidden />
            </span>
            <span>
              <span className="block">{MARKER_STYLE[m].label}</span>
              {hints && <span className="block text-xs font-normal text-muted-foreground">{MARKER_STYLE[m].hint}</span>}
            </span>
          </button>
        ))}
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPaint}
        onPointerCancel={endPaint}
        className="border bg-amber-50/60 p-4 font-serif text-[17px] leading-loose select-none dark:bg-zinc-900/60 sm:p-5"
        aria-label={`Tekst legendy „${legend.title}”`}
      >
        {legend.fragments.map((f) => {
          const m = marks[f.id];
          const wrong = verdict?.wrong.some((x) => x.id === f.id);
          const stamp = stamps[f.id];
          const S = stamp ? STAMP[stamp] : null;
          return (
            <span key={f.id}>
              <button
                type="button"
                data-frag={f.id}
                disabled={accepted}
                onKeyDown={(e: KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    paintMode.current = marks[f.id] === marker ? 'erase' : 'paint';
                    lastFrag.current = null;
                    applyTo(f.id);
                    endPaint();
                  }
                }}
                aria-label={`${f.text}${m ? ` — ${m === 'sprawdzalne' ? 'zielony' : 'różowy'}` : ''}${S ? ` — szuflada: ${S.label}` : ''}`}
                className={cn(
                  'touch-none rounded-sm px-0.5 text-left transition-colors disabled:cursor-default',
                  m && MARKER_STYLE[m].bg,
                  wrong && 'underline decoration-destructive decoration-wavy decoration-2 underline-offset-4'
                )}
              >
                {f.text}
              </button>
              {S && (
                <span
                  className={cn('ml-0.5 inline-flex h-4 w-4 -translate-y-0.5 items-center justify-center rounded-full align-middle', S.cls)}
                  title={S.label}
                  aria-hidden
                >
                  <S.icon className="h-3 w-3" strokeWidth={3} />
                </span>
              )}{' '}
            </span>
          );
        })}
      </div>

      {!cabinet && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!allMarked}
            onClick={() => setCabinet(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: color }}
          >
            <Archive className="h-4 w-4" aria-hidden /> Otwórz szafę z dowodami
          </button>
          <span className="text-sm text-muted-foreground">
            {allMarked
              ? 'Wszystko ma kolor.'
              : `Bez koloru: ${legend.fragments.length - markedCount} ${plural(legend.fragments.length - markedCount, { one: 'fragment', few: 'fragmenty', many: 'fragmentów' })}.`}
          </span>
        </div>
      )}

      {cabinet && (
        <div className="space-y-2">
          <p className="text-sm leading-relaxed">
            {allOpen
              ? 'Wszystkie szuflady otwarte. Stemple przy tekście mówią, co znalazły.'
              : <>Wysuń każdą szufladę — <strong>pociągnij uchwyt w prawo</strong>. Stempel przy tekście pokaże, co w niej jest.</>}
          </p>
          <div className="space-y-1.5 border-2 border-amber-900/30 bg-amber-900/5 p-2 dark:border-amber-200/20">
            {legend.drawers.map((d) => (
              <Szuflada key={d.id} drawer={d} open={opened.includes(d.id)} color={color} onOpen={() => openDrawer(d.id)} />
            ))}
          </div>
        </div>
      )}

      {allOpen && verdict && !verdict.ok && (
        <div className="space-y-2 border-l-2 border-destructive pl-4 text-sm leading-relaxed" aria-live="polite">
          {verdict.wrong.map((w) => (
            <p key={w.id}>
              <strong>„{w.text}”</strong> zakreślone na {w.marked === 'sprawdzalne' ? 'zielono' : 'różowo'}, a szuflada „{w.drawer}”
              mówi: {w.note}
            </p>
          ))}
          {verdict.unmarked > 0 && <p>Któryś fragment stracił kolor — zakreśl go.</p>}
          <p className="text-muted-foreground">Przemaluj pisakiem i sprawdź jeszcze raz.</p>
        </div>
      )}

      {allOpen && !accepted && (
        <button
          type="button"
          onClick={check}
          disabled={verdict !== null}
          className="px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          Sprawdź jeszcze raz
        </button>
      )}

      {allOpen && verdict?.ok && (
        <AcceptedNote legend={legend} color={color} onDone={onDone} />
      )}
    </div>
  );
}

/** Po przyjęciu: kamienie, które wystają z rzeki — i przycisk dalej (raz). */
function AcceptedNote({ legend, color, onDone }: { legend: Legend; color: string; onDone: () => void }) {
  const [sent, setSent] = useState(false);
  const all = stampsFor(legend, legend.drawers.map((d) => d.id));
  const stones = legend.fragments.filter((f) => all[f.id] === 'jest');
  const unsure = legend.fragments.filter((f) => all[f.id] === 'niewiadomo');
  return (
    <div className="space-y-3 border p-4" style={{ borderColor: color }} aria-live="polite">
      <p className="text-sm font-semibold">Zgadza się z dowodami.</p>
      <p className="text-sm leading-relaxed">
        Sprawdzić da się tylko {stones.length} z {legend.fragments.length} fragmentów:{' '}
        {stones.map((s, i) => (
          <span key={s.id}>
            <span className="rounded-sm bg-emerald-200/80 px-0.5 dark:bg-emerald-700/60">{s.text.replace(/[.,]$/, '')}</span>
            {i < stones.length - 1 ? ', ' : '.'}
          </span>
        ))}{' '}
        To są <strong>kamienie wystające z rzeki</strong> — reszta płynie dookoła nich.
        {unsure.length > 0 && (
          <>
            {' '}A przy „{unsure[0].text.replace(/[.,]$/, '')}” uczciwa odpowiedź brzmi: nie wiadomo.
          </>
        )}
      </p>
      {!sent && (
        <button
          type="button"
          onClick={() => {
            setSent(true);
            onDone();
          }}
          className="px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          Dalej
        </button>
      )}
    </div>
  );
}

/**
 * Szuflada: front z uchwytem, który ciągnie się w prawo. Wysunięta dalej niż
 * `PULL_OPEN_PX` otwiera się i zostaje otwarta; krócej — wraca na miejsce.
 * Enter/spacja na uchwycie też otwiera.
 */
function Szuflada({ drawer, open, color, onOpen }: { drawer: Drawer; open: boolean; color: string; onOpen: () => void }) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<number | null>(null);

  const down = (e: PointerEvent<HTMLButtonElement>) => {
    if (open || e.button > 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // jak wyżej
    }
    start.current = e.clientX;
    setDragging(true);
  };
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    if (start.current == null) return;
    setDx(Math.max(0, Math.min(PULL_OPEN_PX + 30, e.clientX - start.current)));
  };
  const up = () => {
    if (start.current == null) return;
    start.current = null;
    setDragging(false);
    if (dx >= PULL_OPEN_PX) onOpen();
    setDx(0);
  };

  return (
    <div className="overflow-hidden">
      <div className="relative h-12 bg-amber-950/10 dark:bg-amber-100/5">
        <div
          className={cn(
            'absolute inset-y-0 left-0 flex w-full items-center justify-between border border-amber-900/30 bg-amber-100 px-3 transition-transform dark:border-amber-200/20 dark:bg-zinc-800',
            dragging && 'transition-none'
          )}
          style={{ transform: `translateX(${open ? 0 : dx}px)` }}
        >
          <span className="text-sm font-semibold">{drawer.label}</span>
          {open ? (
            <span className="text-xs font-semibold" style={{ color }}>
              otwarta
            </span>
          ) : (
            <button
              type="button"
              aria-label={`Wysuń szufladę „${drawer.label}”`}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpen();
                }
              }}
              className="flex h-9 w-20 cursor-grab touch-none items-center justify-center border border-amber-900/40 bg-amber-200 text-xs font-semibold dark:bg-zinc-700"
            >
              ⟶ uchwyt
            </button>
          )}
        </div>
      </div>
      {open && (
        <div className="border border-t-0 border-amber-900/30 bg-white p-3 text-sm leading-relaxed dark:border-amber-200/20 dark:bg-zinc-900">
          <p>{drawer.inside}</p>
          <ul className="mt-2 space-y-1">
            {drawer.findings.map((f) => {
              const S = STAMP[f.result];
              return (
                <li key={f.frag} className="flex items-start gap-2 text-[13px]">
                  <span className={cn('mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full', S.cls)} aria-hidden>
                    <S.icon className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span>
                    <span className="font-semibold">{S.label}:</span> {f.note}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
