'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Download,
  File,
  FileText,
  Folder,
  GripVertical,
  Palette,
  Presentation,
  Table2,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { count } from '../../../lib/plural';
import {
  CHAT,
  DESKTOP,
  LEAFLET,
  LICENSE_LABEL,
  listAsText,
  listDone,
  MAX_PER_PURPOSE,
  MIN_PER_PURPOSE,
  MIN_PER_SOURCE,
  programById,
  programsIn,
  PROGRAMS,
  PURPOSES,
  SOURCES,
  wrongPlaceHint,
  type IconKind,
  type Placement,
  type PurposeId,
  type SourceId,
  type TextPart,
} from './hunt';

/**
 * Zadanie obowiązkowe **Z-2** — w całości w lekcji.
 *
 * Pierwsza wersja kazała szukać programów w internecie, wypisać je w edytorze
 * tekstu z licencją przy każdym, zapisać plik i wrzucić go do sprawdzenia.
 * Użytkownik odrzucił ją jako za trudną dla dziesięciolatka (2026-09-16), z tych
 * samych powodów co pierwsze Z-1 — patrz `nosniki-danych/floppy-pour.tsx`.
 *
 * Teraz trzy kroki, każdy z innym gestem, i żaden nie powtarza bloków lekcji:
 *
 * 1. **Trop** — trzy źródła o trzech różnych kształtach (pulpit z ikonami,
 *    wiadomość, gazetka). Dziecko stuka nazwy programów, a pułapki — plik,
 *    folder, system, firma, pakiet, nośnik — odpowiadają jednym zdaniem, czym są
 *    naprawdę. To jest „znajdź w różnych źródłach” z treści zadania.
 * 2. **Spis** — wybór trzech zastosowań i **przeciąganie** znalezionych
 *    programów pod nagłówki w makiecie edytora (albo stuknięcie programu, potem
 *    nagłówka). Program pod złym nagłówkiem wraca z jednym zdaniem, do czego
 *    służy. To jest „w edytorze wypisz zastosowania i programy pod każdym”.
 * 3. **Cena** — dziecko stuka w swoim spisie programy, za które trzeba zapłacić.
 *    Jedyne miejsce, w którym zadanie dotyka licencji, i to lekko: resztę
 *    licencji strona dopisuje sama w nagrodzie.
 */

interface ProgramHuntProps {
  color: string;
  onComplete?: () => void;
}

type Feedback = { tone: 'found' | 'again' | 'trap' | 'miss'; text: string } | null;

export function ProgramHunt({ color, onComplete }: ProgramHuntProps) {
  const [source, setSource] = useState<SourceId>('pulpit');
  const [found, setFound] = useState<string[]>([]);
  const [traps, setTraps] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const [purposes, setPurposes] = useState<PurposeId[]>([]);
  const [placed, setPlaced] = useState<Placement>({});
  const [listMsg, setListMsg] = useState<string | null>(null);

  const [paid, setPaid] = useState<string[]>([]);
  const [paidMsg, setPaidMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const foundIn = (id: SourceId) =>
    programsIn(id).filter((program) => found.includes(program.id)).length;
  const huntDone = SOURCES.every((item) => foundIn(item.id) >= MIN_PER_SOURCE);
  const spisDone = listDone(purposes, placed);
  const placedIds = purposes.flatMap((purpose) => placed[purpose] ?? []);

  /* ── 01 trop ── */
  const findProgram = (id: string) => {
    const program = programById(id);
    if (found.includes(id)) {
      setFeedback({ tone: 'again', text: `${program.name} już masz w znaleziskach.` });
      return;
    }
    setFound([...found, id]);
    setFeedback({
      tone: 'found',
      text: `Jest! ${program.name} — to program. Trafia do znalezisk.`,
    });
  };
  const hitTrap = (trap: string, note: string) => {
    if (!traps.includes(trap)) setTraps([...traps, trap]);
    setFeedback({ tone: 'trap', text: `Pułapka! ${note}` });
  };
  const miss = (word: string) => {
    const clean = word.replace(/[^\p{L}\p{N}-]/gu, '');
    if (!clean) return;
    setFeedback({ tone: 'miss', text: `„${clean}” to nie nazwa programu.` });
  };

  /* ── 02 spis ── */
  const togglePurpose = (id: PurposeId) => {
    setListMsg(null);
    if (purposes.includes(id)) {
      /* Odznaczone zastosowanie oddaje swoje programy z powrotem do znalezisk. */
      setPurposes(purposes.filter((item) => item !== id));
      const next = { ...placed };
      delete next[id];
      setPlaced(next);
      return;
    }
    if (purposes.length === 3) {
      setListMsg('Zadanie prosi o trzy zastosowania. Żeby wybrać inne, najpierw odznacz jedno.');
      return;
    }
    setPurposes([...purposes, id]);
  };

  const place = (id: string, purpose: PurposeId) => {
    const program = programById(id);
    const list = placed[purpose] ?? [];
    if (program.purpose !== purpose) {
      setListMsg(wrongPlaceHint(program, purpose));
      return false;
    }
    if (list.length >= MAX_PER_PURPOSE) {
      setListMsg('Pod jednym nagłówkiem wystarczą trzy programy.');
      return false;
    }
    setPlaced({ ...placed, [purpose]: [...list, id] });
    setListMsg(null);
    return true;
  };

  const unplace = (id: string, purpose: PurposeId) => {
    setPlaced({ ...placed, [purpose]: (placed[purpose] ?? []).filter((item) => item !== id) });
    setPaid(paid.filter((item) => item !== id));
  };

  /* ── 03 cena ── */
  const markPaid = (id: string) => {
    const program = programById(id);
    if (program.license !== 'platny') {
      setPaidMsg(
        `${program.name} (${LICENSE_LABEL[program.license]}) — za ten program nie trzeba płacić.`
      );
      return;
    }
    setPaidMsg(null);
    setPaid(paid.includes(id) ? paid.filter((item) => item !== id) : [...paid, id]);
  };

  const checkPaid = () => {
    const missing = placedIds.filter(
      (id) => programById(id).license === 'platny' && !paid.includes(id)
    );
    if (missing.length > 0) {
      setPaidMsg(
        'W twoim spisie jest jeszcze płatny program. Wróć do gazetki, jeśli nie pamiętasz, co w niej było.'
      );
      return;
    }
    setPaidMsg(null);
    if (!done) {
      setDone(true);
      onComplete?.();
    }
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="text-sm leading-relaxed sm:text-base">
        <p>
          <strong>Zadanie Z-2.</strong> Znajdź w różnych źródłach po kilka nazw programów
          przeznaczonych do konkretnych zastosowań, np. edytowania tekstu, rysowania, wykonywania
          obliczeń. W edytorze tekstu wypisz wybrane zastosowania i przykładowe programy pod każdym
          z nich.
        </p>
        <p className="mt-2 text-muted-foreground">
          Wszystko zrobisz tutaj: wytropisz programy w trzech źródłach, ułożysz z nich spis i
          sprawdzisz, za które trzeba płacić.
        </p>
      </div>

      {/* 01 — trop */}
      <Step n="01" title="Wytrop programy w trzech źródłach" color={color}>
        <p className="mb-3 text-sm text-muted-foreground">
          <strong className="text-foreground">Stukaj nazwy programów.</strong> Uważaj na pułapki —
          nie wszystko, co kojarzy się z komputerem, jest programem. W każdym źródle znajdź co
          najmniej {MIN_PER_SOURCE}.
        </p>

        <div className="mb-3 grid grid-cols-3 border" role="group" aria-label="Źródło">
          {SOURCES.map((item, index) => {
            const active = item.id === source;
            const count = foundIn(item.id);
            const enough = count >= MIN_PER_SOURCE;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSource(item.id);
                  setFeedback(null);
                }}
                aria-pressed={active}
                className={cn(
                  'flex cursor-pointer flex-col items-center px-1.5 py-2 text-center transition-colors',
                  index > 0 && 'border-l',
                  !active && 'hover:bg-muted/50'
                )}
                style={active ? { backgroundColor: color, color: 'white' } : undefined}
              >
                <span className="flex items-center gap-1 text-xs font-bold leading-tight sm:text-sm">
                  {enough && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                  {item.label}
                </span>
                <span
                  className={cn(
                    'font-mono text-xs tabular-nums',
                    !active && 'text-muted-foreground'
                  )}
                >
                  {count}/{programsIn(item.id).length}
                </span>
              </button>
            );
          })}
        </div>

        {source === 'pulpit' && (
          <DesktopSource
            color={color}
            found={found}
            traps={traps}
            onProgram={findProgram}
            onTrap={hitTrap}
          />
        )}
        {source === 'wiadomosc' && (
          <ChatSource
            color={color}
            found={found}
            traps={traps}
            onProgram={findProgram}
            onTrap={hitTrap}
            onMiss={miss}
          />
        )}
        {source === 'gazetka' && (
          <LeafletSource
            color={color}
            found={found}
            traps={traps}
            onProgram={findProgram}
            onTrap={hitTrap}
            onMiss={miss}
          />
        )}

        <p
          aria-live="polite"
          className={cn(
            'mt-2 min-h-[2.75rem] border-l-2 pl-3 text-sm leading-snug',
            !feedback && 'border-transparent text-muted-foreground'
          )}
          style={
            feedback
              ? {
                  borderColor:
                    feedback.tone === 'found'
                      ? color
                      : feedback.tone === 'trap'
                        ? '#d97706'
                        : 'var(--border)',
                }
              : undefined
          }
        >
          {feedback?.text ??
            (huntDone
              ? 'Masz dość znalezisk, żeby ułożyć spis. Możesz jeszcze szukać — przydadzą się.'
              : 'Stuknij nazwę, którą uważasz za program.')}
        </p>
      </Step>

      {/* 02 — spis */}
      {huntDone && (
        <Step n="02" title="Ułóż spis w edytorze" color={color}>
          <ListBuilder
            color={color}
            found={found}
            purposes={purposes}
            placed={placed}
            paid={paid}
            pricing={spisDone}
            message={listMsg}
            onTogglePurpose={togglePurpose}
            onPlace={place}
            onUnplace={unplace}
            onMarkPaid={markPaid}
          />
        </Step>
      )}

      {/* 03 — cena */}
      {huntDone && spisDone && (
        <Step n="03" title="Za które programy trzeba zapłacić?" color={color}>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Stuknij w spisie wyżej</strong> każdy program, który
            jest płatny, a potem sprawdź. Jeśli żaden nie jest — od razu naciśnij „Sprawdź”.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={checkPaid}
              className="cursor-pointer px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              Sprawdź
            </button>
            {paidMsg && (
              <span className="text-sm leading-snug text-amber-700 dark:text-amber-400">
                {paidMsg}
              </span>
            )}
          </div>
        </Step>
      )}

      <AnimatePresence>
        {done && spisDone && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 border-t-2 pt-5"
            style={{ borderColor: color }}
          >
            <Reward color={color} purposes={purposes} placed={placed} found={found} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Step({
  n,
  title,
  color,
  children,
}: {
  n: string;
  title: string;
  color: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 border-t pt-4"
    >
      <p className="mb-3 flex items-baseline gap-2.5">
        <span className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {n}
        </span>
        <span className="font-bold">{title}</span>
      </p>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* 01 — źródła                                                         */
/* ------------------------------------------------------------------ */

interface SourceProps {
  color: string;
  found: string[];
  traps: string[];
  onProgram: (id: string) => void;
  onTrap: (trap: string, note: string) => void;
}

const ICONS: Record<IconKind, { icon: LucideIcon; tint: string }> = {
  tekst: { icon: FileText, tint: '#3b82f6' },
  rysunek: { icon: Palette, tint: '#e11d48' },
  liczby: { icon: Table2, tint: '#16a34a' },
  pokaz: { icon: Presentation, tint: '#ea580c' },
  folder: { icon: Folder, tint: '#eab308' },
  plik: { icon: File, tint: '#94a3b8' },
  kosz: { icon: Trash2, tint: '#94a3b8' },
};

/** Makieta pulpitu — świadomie jak system, nie jak strona kursu (tak jak `TidyDesktop`). */
function DesktopSource({ color, found, traps, onProgram, onTrap }: SourceProps) {
  return (
    <div className="rounded-md bg-gradient-to-br from-slate-700 to-slate-900 p-3 sm:p-4">
      <ul className="grid grid-cols-4 gap-x-1 gap-y-3">
        {DESKTOP.map((item) => {
          const key = item.kind === 'program' ? item.id : item.trap;
          const label = item.kind === 'program' ? programById(item.id).name : item.label;
          const isFound = item.kind === 'program' && found.includes(item.id);
          const isTrap = item.kind === 'trap' && traps.includes(item.trap);
          const { icon: Icon, tint } = ICONS[item.icon];
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() =>
                  item.kind === 'program' ? onProgram(item.id) : onTrap(item.trap, item.note)
                }
                className={cn(
                  'relative flex w-full cursor-pointer flex-col items-center gap-1 rounded px-0.5 py-1.5 text-center transition-colors hover:bg-white/10',
                  isTrap && 'opacity-50'
                )}
                style={
                  isFound
                    ? { backgroundColor: `${color}55`, boxShadow: `inset 0 0 0 2px ${color}` }
                    : undefined
                }
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor:
                      item.icon === 'folder' || item.icon === 'plik' || item.icon === 'kosz'
                        ? 'transparent'
                        : tint,
                  }}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{
                      color:
                        item.icon === 'folder' || item.icon === 'plik' || item.icon === 'kosz'
                          ? tint
                          : 'white',
                    }}
                    aria-hidden
                  />
                </span>
                <span className="line-clamp-2 break-words text-[11px] leading-tight text-white">
                  {label}
                </span>
                {isFound && (
                  <span
                    className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  >
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ChatSource(props: SourceProps & { onMiss: (word: string) => void }) {
  return (
    <div className="rounded-md border bg-zinc-100 p-3 dark:bg-zinc-800 sm:p-4">
      <p className="mb-3 flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white">
          O
        </span>
        <span>
          <strong className="text-zinc-900 dark:text-zinc-50">Ola</strong> · kuzynka, 6 klasa
        </span>
      </p>
      <ul className="space-y-2">
        {CHAT.map((message, index) => (
          <li
            key={index}
            className="w-fit max-w-[92%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[15px] leading-relaxed text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
          >
            <TappableText parts={message.parts} {...props} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function LeafletSource(props: SourceProps & { onMiss: (word: string) => void }) {
  return (
    <div className="rounded-md border-2 border-red-600 bg-amber-50 text-amber-950">
      <p className="bg-red-600 px-3 py-1.5 text-sm font-black uppercase tracking-wide text-white">
        Gazetka · Sklep Komputerek
      </p>
      <ul className="grid gap-2 p-3 sm:grid-cols-3">
        {LEAFLET.map((offer, index) => (
          <li key={index} className="relative border border-amber-300 bg-white p-3 pt-4">
            <span className="absolute -top-2 right-2 bg-yellow-300 px-1.5 text-[10px] font-bold uppercase">
              {offer.badge}
            </span>
            <p className="text-base font-bold leading-snug">
              <TappableText parts={offer.title} {...props} />
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              <TappableText parts={offer.body} {...props} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Tekst, w którym każde słowo da się stuknąć. Zwykłe słowa odpowiadają „to nie
 * nazwa programu”, więc sam wygląd nie zdradza, gdzie są programy. Odstępy stoją
 * POZA klikalnymi fragmentami — inaczej przeglądarka zjada spacje na brzegach
 * (wpadka `EmphasisAudit` z lekcji 18).
 */
function TappableText({
  parts,
  color,
  found,
  traps,
  onProgram,
  onTrap,
  onMiss,
}: SourceProps & { parts: TextPart[]; onMiss: (word: string) => void }) {
  const word = 'cursor-pointer rounded-sm decoration-dotted underline-offset-4 hover:underline';
  return (
    <>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return part.split(/(\s+)/).map((chunk, chunkIndex) =>
            /^\s*$/.test(chunk) ? (
              <span key={`${index}-${chunkIndex}`}>{chunk}</span>
            ) : (
              <span key={`${index}-${chunkIndex}`} className={word} onClick={() => onMiss(chunk)}>
                {chunk}
              </span>
            )
          );
        }
        if ('program' in part) {
          const isFound = found.includes(part.program);
          return (
            <span
              key={index}
              role="button"
              tabIndex={0}
              onClick={() => onProgram(part.program)}
              onKeyDown={(event) => activate(event, () => onProgram(part.program))}
              className={cn(
                word,
                isFound && 'px-0.5 font-semibold no-underline hover:no-underline'
              )}
              style={
                isFound
                  ? { backgroundColor: `${color}2e`, boxShadow: `inset 0 -2px 0 ${color}` }
                  : undefined
              }
            >
              {part.text}
            </span>
          );
        }
        const seen = traps.includes(part.trap);
        return (
          <span
            key={index}
            role="button"
            tabIndex={0}
            onClick={() => onTrap(part.trap, part.note)}
            onKeyDown={(event) => activate(event, () => onTrap(part.trap, part.note))}
            className={cn(
              word,
              seen &&
                'text-zinc-400 line-through decoration-amber-500 decoration-solid hover:line-through'
            )}
          >
            {part.text}
          </span>
        );
      })}
    </>
  );
}

function activate(event: KeyboardEvent, run: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    run();
  }
}

/* ------------------------------------------------------------------ */
/* 02 — spis                                                           */
/* ------------------------------------------------------------------ */

function ListBuilder({
  color,
  found,
  purposes,
  placed,
  paid,
  pricing,
  message,
  onTogglePurpose,
  onPlace,
  onUnplace,
  onMarkPaid,
}: {
  color: string;
  found: string[];
  purposes: PurposeId[];
  placed: Placement;
  paid: string[];
  /** Krok 03: linie spisu da się stukać, żeby oznaczyć płatne. */
  pricing: boolean;
  message: string | null;
  onTogglePurpose: (id: PurposeId) => void;
  onPlace: (id: string, purpose: PurposeId) => boolean;
  onUnplace: (id: string, purpose: PurposeId) => void;
  onMarkPaid: (id: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [ghost, setGhost] = useState<{ id: string; x: number; y: number } | null>(null);
  const [hover, setHover] = useState<PurposeId | null>(null);
  const drag = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);

  const placedIds = Object.values(placed).flat();
  const tray = PROGRAMS.filter(
    (program) => found.includes(program.id) && !placedIds.includes(program.id)
  );

  const purposeAt = (x: number, y: number): PurposeId | null => {
    const zone = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-drop-purpose]');
    return (zone?.dataset.dropPurpose as PurposeId | undefined) ?? null;
  };

  const drop = (id: string, purpose: PurposeId) => {
    if (onPlace(id, purpose)) setSelected(null);
  };

  const stickerHandlers = (id: string) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { id, x: event.clientX, y: event.clientY, moved: false };
    },
    onPointerMove: (event: PointerEvent<HTMLButtonElement>) => {
      const current = drag.current;
      if (!current) return;
      if (!current.moved && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 6)
        return;
      current.moved = true;
      setGhost({ id, x: event.clientX, y: event.clientY });
      setHover(purposeAt(event.clientX, event.clientY));
    },
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => {
      const current = drag.current;
      drag.current = null;
      setGhost(null);
      setHover(null);
      if (!current) return;
      if (current.moved) {
        const purpose = purposeAt(event.clientX, event.clientY);
        if (purpose) drop(current.id, purpose);
      } else {
        setSelected((prev) => (prev === id ? null : id));
      }
    },
    onPointerCancel: () => {
      drag.current = null;
      setGhost(null);
      setHover(null);
    },
    /* Klawiatura: Enter/spacja wybiera program, potem Enter na nagłówku go wstawia. */
    onClick: (event: React.MouseEvent) => {
      if (event.detail === 0) setSelected((prev) => (prev === id ? null : id));
    },
  });

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        <strong className="text-foreground">Wybierz trzy zastosowania</strong> — pojawią się jako
        nagłówki w edytorze.
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {PURPOSES.map((purpose) => {
          const on = purposes.includes(purpose.id);
          return (
            <button
              key={purpose.id}
              type="button"
              onClick={() => onTogglePurpose(purpose.id)}
              aria-pressed={on}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 border-2 px-3 py-1.5 text-sm font-semibold transition-colors',
                !on && 'hover:bg-muted/50'
              )}
              style={
                on
                  ? { borderColor: color, backgroundColor: color, color: 'white' }
                  : { borderColor: 'var(--border)' }
              }
            >
              {on && <Check className="h-3.5 w-3.5" aria-hidden />}
              {purpose.label}
            </button>
          );
        })}
      </div>

      {purposes.length > 0 && (
        <>
          <p className="mb-2 text-sm text-muted-foreground">
            <strong className="text-foreground">Przeciągnij programy</strong> pod właściwy nagłówek
            — po {MIN_PER_PURPOSE}–{MAX_PER_PURPOSE} pod każdym. Możesz też stuknąć program, a potem
            nagłówek.
          </p>

          {/* Znaleziska do wstawienia */}
          <div className="mb-3 flex min-h-[44px] flex-wrap gap-2 border border-dashed p-2">
            {tray.length === 0 ? (
              <span className="self-center text-xs text-muted-foreground">
                Wszystkie znaleziska są już w spisie. Potrzebujesz więcej? Poszukaj jeszcze w
                źródłach.
              </span>
            ) : (
              tray.map((program) => (
                <button
                  key={program.id}
                  type="button"
                  {...stickerHandlers(program.id)}
                  aria-pressed={selected === program.id}
                  className={cn(
                    'inline-flex cursor-grab select-none items-center gap-1 border bg-white py-1.5 pl-1 pr-2.5 text-sm font-semibold shadow-sm active:cursor-grabbing dark:bg-zinc-900',
                    ghost?.id === program.id && 'opacity-30'
                  )}
                  style={{
                    touchAction: 'none',
                    borderColor: selected === program.id ? color : 'var(--border)',
                    boxShadow: selected === program.id ? `0 0 0 2px ${color}` : undefined,
                  }}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden />
                  {program.name}
                </button>
              ))
            )}
          </div>

          {message && (
            <p className="mb-3 border-l-2 border-amber-500 pl-3 text-sm leading-snug text-amber-800 dark:text-amber-300">
              {message}
            </p>
          )}
        </>
      )}

      {/* Makieta edytora tekstu */}
      <div className="overflow-hidden rounded-md border border-zinc-300 shadow-sm dark:border-zinc-700">
        <div className="flex items-center gap-2 border-b border-zinc-300 bg-zinc-100 px-3 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">moje-programy.txt — Notatnik</span>
        </div>
        <div className="space-y-3 bg-white px-3 py-3 text-[15px] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-4">
          <p className="font-bold">Programy i ich zastosowania</p>
          {purposes.length === 0 && (
            <p className="text-sm text-zinc-400">
              Tu pojawią się nagłówki zastosowań, które wybierzesz.
            </p>
          )}
          {purposes.map((purposeId) => {
            const purpose = PURPOSES.find((item) => item.id === purposeId)!;
            const list = placed[purposeId] ?? [];
            const full = list.length >= MAX_PER_PURPOSE;
            const target = hover === purposeId || (selected !== null && !full);
            const nothingLeft =
              list.length < MIN_PER_PURPOSE &&
              !tray.some((program) => program.purpose === purposeId);
            return (
              <div
                key={purposeId}
                data-drop-purpose={purposeId}
                role={selected ? 'button' : undefined}
                tabIndex={selected ? 0 : undefined}
                onClick={() => selected && drop(selected, purposeId)}
                onKeyDown={(event) => selected && activate(event, () => drop(selected, purposeId))}
                className={cn(
                  'rounded-sm border-2 border-transparent p-1.5 transition-colors',
                  selected && 'cursor-pointer'
                )}
                style={
                  target ? { borderColor: `${color}88`, backgroundColor: `${color}0d` } : undefined
                }
              >
                <p className="flex items-center gap-2 font-bold">
                  {purpose.label}
                  {list.length >= MIN_PER_PURPOSE && (
                    <Check className="h-4 w-4" style={{ color }} aria-hidden />
                  )}
                </p>
                <ul className="mt-1 space-y-1">
                  {list.map((id) => {
                    const program = programById(id);
                    const isPaid = paid.includes(id);
                    return (
                      <li key={id} className="flex items-center gap-2">
                        <span className="text-zinc-400" aria-hidden>
                          –
                        </span>
                        {pricing ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onMarkPaid(id);
                            }}
                            aria-pressed={isPaid}
                            className="cursor-pointer rounded-sm px-1 text-left underline decoration-dashed underline-offset-4 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            style={{ textDecorationColor: color }}
                          >
                            {program.name}
                          </button>
                        ) : (
                          <span className="px-1">{program.name}</span>
                        )}
                        {isPaid && (
                          <span className="bg-amber-200 px-1.5 text-[11px] font-bold uppercase text-amber-900">
                            płatny
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onUnplace(id, purposeId);
                          }}
                          aria-label={`Usuń ${program.name} ze spisu`}
                          className="ml-auto cursor-pointer p-1 text-zinc-400 hover:text-red-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    );
                  })}
                  {!full && (
                    <li className="border border-dashed border-zinc-300 px-2 py-1 text-xs text-zinc-400 dark:border-zinc-700">
                      {nothingLeft
                        ? 'Brakuje ci programów do tego — poszukaj jeszcze w źródłach.'
                        : selected
                          ? 'stuknij, żeby wstawić tutaj'
                          : 'upuść tu program'}
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Przeciągany program — idzie za palcem, nie łapie wskaźnika. */}
      {ghost && (
        <span
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 border bg-white px-2.5 py-1.5 text-sm font-semibold shadow-lg dark:bg-zinc-900"
          style={{ left: ghost.x, top: ghost.y, borderColor: color }}
        >
          {programById(ghost.id).name}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nagroda                                                             */
/* ------------------------------------------------------------------ */

const LICENSE_TONE = {
  platny: 'bg-amber-200 text-amber-900',
  darmowy: 'bg-sky-100 text-sky-900',
  open: 'bg-emerald-100 text-emerald-900',
} as const;

function Reward({
  color,
  purposes,
  placed,
  found,
}: {
  color: string;
  purposes: PurposeId[];
  placed: Placement;
  found: string[];
}) {
  const ids = purposes.flatMap((purpose) => placed[purpose] ?? []);
  const open = ids.filter((id) => programById(id).license === 'open').length;

  const download = () => {
    const url = URL.createObjectURL(
      new Blob(['﻿', listAsText(purposes, placed)], { type: 'text/plain;charset=utf-8' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'moje-programy.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="text-sm leading-relaxed">
      <p className="text-base font-bold">Zadanie Z-2 zaliczone.</p>
      <p className="mt-2">
        Wytropione programy: <strong>{found.length}</strong> z {PROGRAMS.length}, w trzech różnych
        źródłach. Przy każdym programie z twojego spisu dopisałam licencję:
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {purposes.map((purposeId) => {
          const purpose = PURPOSES.find((item) => item.id === purposeId)!;
          return (
            <div key={purposeId} className="border p-3" style={{ borderColor: `${color}55` }}>
              <p className="mb-1.5 font-bold">{purpose.label}</p>
              <ul className="space-y-1">
                {(placed[purposeId] ?? []).map((id) => {
                  const program = programById(id);
                  return (
                    <li key={id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>{program.name}</span>
                      <span
                        className={cn(
                          'px-1.5 text-[11px] font-bold',
                          LICENSE_TONE[program.license]
                        )}
                      >
                        {LICENSE_LABEL[program.license]}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-3">
        Zobacz: <strong>w każdej twojej grupie jest program, za który nie trzeba płacić</strong>.
        Tak jest prawie zawsze — dlatego kopia płatnego programu „od kolegi” nigdy nie jest
        potrzebna.{' '}
        {open > 0 ? (
          <>
            Masz też{' '}
            {open === 1 ? 'jeden program' : count(open, 'program', 'programy', 'programów')} open
            source — takie wolno nawet zmieniać i dawać innym.
          </>
        ) : (
          <>
            Nie masz za to żadnego programu open source — w źródłach były LibreOffice, GIMP i Krita.
          </>
        )}
      </p>

      <button
        type="button"
        onClick={download}
        className="mt-4 inline-flex cursor-pointer items-center gap-2 border-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
        style={{ borderColor: color, color }}
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden />
        Zapisz spis na komputerze (.txt)
      </button>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Nieobowiązkowe — plik otworzysz w Notatniku albo w TextEdit.
      </p>
    </div>
  );
}
