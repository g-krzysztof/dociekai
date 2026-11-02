'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Cpu, Hand, Home, PenLine, Stamp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { count, plural } from '../../../lib/plural';
import {
  MACHINES,
  PICK_COUNT,
  ZONES,
  machineById,
  ownSentenceOk,
  shuffleChips,
  tally,
  type Chip,
  type Doer,
} from './round';

/**
 * Zadanie praktyczne lekcji o historii komputera — **obchód mieszkania**,
 * w całości w lekcji.
 *
 * Pierwsza wersja odbierała je plikiem: dziecko miało napisać notatkę
 * „Komputery w moim domu” w Notatniku, zapisać ją w folderze kursu i wrócić
 * z plikiem do sprawdzenia. Użytkownik odrzucił ten model 2026-09-19 i miał
 * rację — dla dziesięciolatka to trzy osobne umiejętności (pisanie, zapis,
 * odnalezienie pliku), z których żadna nie jest tematem lekcji o historii
 * komputera, a sprawdzać dałoby się w takiej notatce tylko słowa kluczowe.
 *
 * Treść zadania została ta sama, zmienił się dowód. Trzy kroki, każdy z innym
 * gestem:
 *
 * 1. **Obchód** — plan mieszkania po strefach; dziecko wybiera trzy maszyny,
 *    które naprawdę u siebie ma. Tu nie ma dobrych i złych odpowiedzi: to jego
 *    dom. Świadomie bez komputera, laptopa i telefonu — lekcja pyta o maszyny,
 *    których nikt komputerem nie nazywa.
 * 2. **Kupka karteczek** — piętnaście robót trzech wybranych maszyn, wymieszanych
 *    w jedną kupkę, do rozdzielenia na dwie tace: co maszyna robi sama, a przy
 *    czym rozstrzyga człowiek. Każda karteczka ma jedną poprawną tacę i własne
 *    zdanie na wypadek pomyłki, więc to jest praca sprawdzalna co do sztuki —
 *    dokładnie ta zaleta, którą miał plik.
 * 3. **Protokół** — rozdział robót maszyna po maszynie, a pod nim przełącznik
 *    „wyjmij komputery”: wszystkie karteczki z lewej tacy przelatują na prawą,
 *    czyli do człowieka. To jest teza lekcji w jednym ruchu — i widać przy tym,
 *    że dolna karteczka każdej maszyny i tak stała po prawej stronie od
 *    początku, bo decyzji nie przejęła żadna.
 */

interface HomeRoundProps {
  color: string;
  onComplete?: () => void;
}

const TRAYS: { id: Doer; label: string; about: string }[] = [
  { id: 'maszyna', label: 'Maszyna robi to sama', about: 'nikt przy tym nie stoi' },
  { id: 'ty', label: 'Przy tym jesteś potrzebny ty', about: 'ręce albo decyzja' },
];

export function HomeRound({ color, onComplete }: HomeRoundProps) {
  const [picked, setPicked] = useState<string[]>([]);
  const [placed, setPlaced] = useState<Record<string, Doer>>({});
  const [wrong, setWrong] = useState<{ chipId: string; why: string } | null>(null);
  const [held, setHeld] = useState<string | null>(null);
  const [unplugged, setUnplugged] = useState(false);
  const [sentence, setSentence] = useState('');
  const [done, setDone] = useState(false);

  const chips = useMemo(() => (picked.length === PICK_COUNT ? shuffleChips(picked) : []), [picked]);

  /*
   * Talia, nie rozłożona kupka. Piętnaście karteczek rozłożonych naraz ma na
   * telefonie ponad tysiąc pikseli wysokości — tace uciekają wtedy poza ekran
   * i zostaje samo stukanie w ciemno (audyt „wyświetlacz musi zostać na
   * ekranie”). Na wierzchu leży jedna karteczka, tuż pod tacami, a kto chce
   * wybierać, odkłada ją na spód.
   */
  const [queue, setQueue] = useState<string[]>([]);
  useEffect(() => setQueue(chips.map((chip) => chip.id)), [chips]);

  const top = chips.find((chip) => chip.id === queue[0]) ?? null;
  const sorted = chips.length > 0 && queue.length === 0;

  const pick = (id: string) => {
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      /* Czwarta maszyna wypycha pierwszą — dziecko nie musi najpierw odznaczać. */
      return prev.length === PICK_COUNT ? [...prev.slice(1), id] : [...prev, id];
    });
    /* Karteczki należą do wybranej trójki, więc zmiana trójki czyści tace. */
    setPlaced({});
    setWrong(null);
    setHeld(null);
    setUnplugged(false);
    setDone(false);
  };

  const drop = (chip: Chip, tray: Doer) => {
    setHeld(null);
    if (chip.job.by === tray) {
      setWrong(null);
      setPlaced((prev) => ({ ...prev, [chip.id]: tray }));
      setQueue((prev) => prev.filter((id) => id !== chip.id));
      return;
    }
    setWrong({ chipId: chip.id, why: chip.job.why });
  };

  /** „Odłóż na spód” — jedyny sposób na wybór karteczki, gdy któraś zatrzymuje. */
  const postpone = () => {
    setWrong(null);
    setHeld(null);
    setQueue((prev) => (prev.length > 1 ? [...prev.slice(1), prev[0]] : prev));
  };

  const sign = () => {
    setDone(true);
    onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="text-sm leading-relaxed sm:text-base">
        <p>
          <strong>Zadanie.</strong> Zrób obchód swojego mieszkania i znajdź trzy maszyny, które mają
          w środku komputer, a wcale nie wyglądają jak komputer. Przy każdej rozstrzygnij, co robi
          sama, a przy czym jesteś potrzebny ty.
        </p>
        <p className="mt-2 text-muted-foreground">
          Wszystko dzieje się tutaj — nie musisz nic zapisywać ani nigdzie wychodzić. Wystarczy, że
          rozejrzysz się po domu i przypomnisz sobie, co gdzie stoi.
        </p>
      </div>

      {/* 01 — obchód */}
      <Step n="01" title="Wybierz trzy maszyny, które masz u siebie" color={color} aside={`${picked.length}/${PICK_COUNT}`}>
        <p className="mb-3 text-sm text-muted-foreground">
          Nie ma tu złych odpowiedzi — to twój dom. Bierz tylko te, które naprawdę stoją u ciebie
          albo w twojej klatce.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {ZONES.map((zone) => (
            <div key={zone.id} className="border p-3">
              <p className="flex items-baseline gap-2">
                <Home className="h-3.5 w-3.5 shrink-0 self-center" style={{ color }} aria-hidden />
                <span className="text-sm font-bold">{zone.name}</span>
              </p>
              <p className="mb-2.5 text-[11px] leading-snug text-muted-foreground">{zone.note}</p>
              <ul className="flex flex-wrap gap-1.5">
                {MACHINES.filter((machine) => machine.zone === zone.id).map((machine) => {
                  const on = picked.includes(machine.id);
                  return (
                    <li key={machine.id}>
                      <button
                        type="button"
                        onClick={() => pick(machine.id)}
                        aria-pressed={on}
                        title={machine.tell}
                        className={cn(
                          'flex cursor-pointer items-center gap-1.5 border px-2.5 py-1.5 text-left text-xs leading-snug transition-colors sm:text-sm',
                          on ? 'font-semibold' : 'hover:bg-muted/50'
                        )}
                        style={on ? { borderColor: color, backgroundColor: `${color}12` } : undefined}
                      >
                        {on && <Check className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden />}
                        {machine.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        {picked.length > 0 && picked.length < PICK_COUNT && (
          <p className="mt-3 text-sm text-muted-foreground">
            Jeszcze {count(PICK_COUNT - picked.length, 'maszyna', 'maszyny', 'maszyn')} do wyboru.
          </p>
        )}
      </Step>

      {/* 02 — kupka karteczek */}
      {chips.length > 0 && (
        <Step
          n="02"
          title="Rozdziel roboty na dwie tace"
          color={color}
          aside={`${chips.length - queue.length}/${chips.length}`}
        >
          <Sorter
            color={color}
            chips={chips}
            top={top}
            leftCount={queue.length}
            placed={placed}
            held={held}
            setHeld={setHeld}
            wrong={wrong}
            onDrop={drop}
            onPostpone={postpone}
          />
        </Step>
      )}

      {/* 03 — protokół */}
      {sorted && (
        <Step n="03" title="Protokół z obchodu" color={color}>
          <Protocol
            color={color}
            picked={picked}
            unplugged={unplugged}
            setUnplugged={setUnplugged}
            sentence={sentence}
            setSentence={setSentence}
            done={done}
            onSign={sign}
          />
        </Step>
      )}

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 border-t-2 pt-5 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <p className="text-base font-bold">Obchód zamknięty.</p>
            <p className="mt-2">
              Trzy maszyny, które nikomu w tym domu nie kojarzą się z komputerem, wykonują u ciebie{' '}
              <strong>{count(picked.length * 3, 'robotę', 'roboty', 'robót')}</strong> bez pytania
              nikogo o zdanie. Dokładnie tak wygląda historia z tej lekcji, tylko u ciebie w
              mieszkaniu: maszyna po maszynie przejmowały pamiętanie, liczenie i kolejność kroków.
            </p>
            <p className="mt-2">
              Ostatniej roboty nie przejęła żadna. <strong>Decyzja, że coś ma być zrobione</strong>,
              stała po twojej stronie tacy od początku — i tam została.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Kroki                                                               */
/* ------------------------------------------------------------------ */

function Step({
  n,
  title,
  color,
  aside,
  children,
}: {
  n: string;
  title: string;
  color: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 border-t pt-4"
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="flex items-baseline gap-2.5">
          <span className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
            {n}
          </span>
          <span className="font-bold">{title}</span>
        </p>
        {aside && (
          <span className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
            {aside}
          </span>
        )}
      </div>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* 02 — kupka i tace                                                   */
/* ------------------------------------------------------------------ */

function Sorter({
  color,
  chips,
  top,
  leftCount,
  placed,
  held,
  setHeld,
  wrong,
  onDrop,
  onPostpone,
}: {
  color: string;
  chips: Chip[];
  /** Karteczka na wierzchu talii — jedyna, którą się teraz kładzie. */
  top: Chip | null;
  leftCount: number;
  placed: Record<string, Doer>;
  held: string | null;
  setHeld: (id: string | null) => void;
  wrong: { chipId: string; why: string } | null;
  onDrop: (chip: Chip, tray: Doer) => void;
  onPostpone: () => void;
}) {
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = useState<Doer | null>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  /*
   * Przeciąganie jest **ręczne, na zdarzeniach wskaźnika** — ten sam wzorzec co
   * `ProgramHunt` w lekcji 6 i `bench.tsx` w module 6, a nie `drag` z
   * framer-motion. Powód: taca pod palcem ma się podświetlać **w trakcie**
   * ruchu (`elementFromPoint`), a stuknięcie ma być drugą, pełnoprawną drogą —
   * dla palca i dla klawiatury. Jedno i drugie trzeba by i tak dopisać obok
   * gestu biblioteki.
   */
  const trayAt = (x: number, y: number): Doer | null => {
    const zone = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-drop-tray]');
    return (zone?.dataset.dropTray as Doer | undefined) ?? null;
  };

  const clear = () => {
    drag.current = null;
    setGhost(null);
    setHover(null);
  };

  const drop = (tray: Doer) => {
    if (top) onDrop(top, tray);
  };

  const cardHandlers = {
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { x: event.clientX, y: event.clientY, moved: false };
    },
    onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => {
      const current = drag.current;
      if (!current) return;
      if (!current.moved && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 6)
        return;
      current.moved = true;
      setGhost({ x: event.clientX, y: event.clientY });
      setHover(trayAt(event.clientX, event.clientY));
    },
    onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => {
      const current = drag.current;
      clear();
      if (!current || !top) return;
      if (current.moved) {
        const tray = trayAt(event.clientX, event.clientY);
        if (tray) drop(tray);
        return;
      }
      /* Samo stuknięcie: karteczka zostaje w ręce, tacę wskazuje się drugim stuknięciem. */
      setHeld(held === top.id ? null : top.id);
    },
    onPointerCancel: clear,
    /* Klawiatura: Enter/spacja podnosi karteczkę (myszy dotyczy już `pointerup`). */
    onClick: (event: React.MouseEvent) => {
      if (event.detail === 0 && top) setHeld(held === top.id ? null : top.id);
    },
  };

  const inHand = top !== null && held === top.id;

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        <strong className="text-foreground">Przeciągnij karteczkę na tacę</strong> — albo stuknij
        ją, a potem stuknij tacę. Pomyłka nic nie psuje: karteczka zostaje na wierzchu i
        dowiadujesz się dlaczego.
      </p>

      {/* Tace */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {TRAYS.map((tray) => {
          const mine = chips.filter((chip) => placed[chip.id] === tray.id);
          const lit = hover === tray.id || (inHand && ghost === null);
          return (
            <div
              key={tray.id}
              data-drop-tray={tray.id}
              role={inHand ? 'button' : undefined}
              tabIndex={inHand ? 0 : undefined}
              onClick={() => inHand && drop(tray.id)}
              onKeyDown={(event) => {
                if (inHand && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  drop(tray.id);
                }
              }}
              className={cn(
                'min-h-[104px] border-2 p-2 transition-colors sm:p-3',
                inHand ? 'cursor-pointer' : 'cursor-default'
              )}
              style={{
                borderColor: lit ? color : `${color}44`,
                backgroundColor:
                  hover === tray.id ? `${color}1f` : lit ? `${color}0f` : `${color}08`,
              }}
            >
              <p
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase leading-tight tracking-wide sm:text-xs"
                style={{ color }}
              >
                {tray.id === 'maszyna' ? (
                  <Cpu className="h-3.5 w-3.5 shrink-0" aria-hidden />
                ) : (
                  <Hand className="h-3.5 w-3.5 shrink-0" aria-hidden />
                )}
                {tray.label}
              </p>
              <p className="mb-2 text-[11px] leading-tight text-muted-foreground">{tray.about}</p>
              <ul className="flex flex-col gap-1">
                {mine.length === 0 && (
                  <li className="border border-dashed p-1.5 text-center text-[11px] leading-tight text-muted-foreground">
                    {inHand ? 'stuknij tutaj' : 'tu kładziesz karteczki'}
                  </li>
                )}
                {mine.map((chip) => (
                  <motion.li
                    key={chip.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 border bg-white px-1.5 py-1 text-[11px] leading-tight dark:bg-zinc-900/60"
                    style={{ borderColor: `${color}55` }}
                    title={`${machineById(chip.machineId).name}: ${chip.job.text}`}
                  >
                    <Check className="h-3 w-3 shrink-0" style={{ color }} aria-hidden />
                    <span className="min-w-0 truncate">
                      <span className="font-semibold">{machineById(chip.machineId).name}</span>
                      <span className="text-muted-foreground"> · {chip.job.text}</span>
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {wrong && (
          <motion.p
            key={wrong.chipId + wrong.why}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-start gap-2 border-l-2 border-amber-500 py-1 pl-3 text-sm leading-relaxed text-amber-700 dark:text-amber-400"
          >
            <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{wrong.why}</span>
          </motion.p>
        )}
      </AnimatePresence>

      {/* Talia: karteczka na wierzchu */}
      {top && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Karteczka na wierzchu · {plural(leftCount, 'została', 'zostały', 'zostało')}{' '}
              {count(leftCount, 'robota', 'roboty', 'robót')}
            </p>
            {leftCount > 1 && (
              <button
                type="button"
                onClick={onPostpone}
                className="shrink-0 cursor-pointer text-[11px] font-semibold underline decoration-dotted underline-offset-2"
                style={{ color }}
              >
                odłóż na spód
              </button>
            )}
          </div>

          {/* Stosik pod spodem — widać, że karteczek jest więcej. */}
          <div className="relative mx-auto max-w-[560px]">
            {leftCount > 1 && (
              <span
                className="absolute inset-x-1.5 -bottom-1.5 block h-3 border-2 bg-white dark:bg-zinc-900"
                style={{ borderColor: `${color}33` }}
                aria-hidden
              />
            )}
            {leftCount > 2 && (
              <span
                className="absolute inset-x-3 -bottom-3 block h-3 border-2 bg-white dark:bg-zinc-900"
                style={{ borderColor: `${color}22` }}
                aria-hidden
              />
            )}
            <motion.button
              key={top.id}
              type="button"
              {...cardHandlers}
              aria-pressed={inHand}
              initial={{ opacity: 0, y: -6 }}
              animate={
                wrong?.chipId === top.id
                  ? { opacity: 1, y: 0, x: [0, -8, 8, -5, 0] }
                  : { opacity: 1, y: 0 }
              }
              className={cn(
                'relative z-10 w-full cursor-grab touch-none select-none border-2 bg-white p-3 text-left shadow-sm active:cursor-grabbing dark:bg-zinc-900',
                ghost && 'opacity-30'
              )}
              style={{
                borderColor: inHand ? color : wrong?.chipId === top.id ? '#dc2626' : 'var(--border)',
                backgroundColor: inHand ? `${color}12` : undefined,
              }}
            >
              <span
                className="block text-[11px] font-semibold uppercase tracking-wide"
                style={{ color }}
              >
                {machineById(top.machineId).name}
              </span>
              <span className="mt-0.5 block text-sm leading-snug sm:text-base">{top.job.text}</span>
              <span className="mt-1 block text-[11px] font-semibold text-muted-foreground">
                {inHand ? 'trzymasz — stuknij tacę' : 'przeciągnij na tacę albo stuknij'}
              </span>
            </motion.button>
          </div>
        </div>
      )}

      {/* Karteczka pod palcem */}
      {ghost && top && (
        <span
          className="pointer-events-none fixed z-50 max-w-[220px] -translate-x-1/2 -translate-y-1/2 border-2 bg-white px-2.5 py-1.5 text-xs leading-snug shadow-lg dark:bg-zinc-900"
          style={{ left: ghost.x, top: ghost.y, borderColor: color }}
        >
          {top.job.text}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 03 — protokół                                                       */
/* ------------------------------------------------------------------ */

function Protocol({
  color,
  picked,
  unplugged,
  setUnplugged,
  sentence,
  setSentence,
  done,
  onSign,
}: {
  color: string;
  picked: string[];
  unplugged: boolean;
  setUnplugged: (value: boolean) => void;
  sentence: string;
  setSentence: (value: string) => void;
  done: boolean;
  onSign: () => void;
}) {
  const rows = tally(picked);
  const taken = rows.reduce((sum, row) => sum + row.byMachine, 0);
  const canSign = ownSentenceOk(sentence);

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Tak wygląda rozdział robót w twoim mieszkaniu. Lewa kolumna to maszyny, prawa — ty.
      </p>

      <div className="border">
        <div
          className="flex items-center gap-2 border-b px-3 py-2 text-xs font-bold uppercase tracking-wide"
          style={{ backgroundColor: `${color}12`, color }}
        >
          <Stamp className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Protokół z obchodu
        </div>

        <ul className="divide-y">
          {rows.map((row) => (
            <li key={row.machine.id} className="grid gap-2 p-3 sm:grid-cols-[minmax(0,130px)_minmax(0,1fr)]">
              <div>
                <p className="text-sm font-bold">{row.machine.name}</p>
                <p className="text-[11px] leading-snug text-muted-foreground">{row.machine.tell}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['maszyna', 'ty'] as Doer[]).map((side) => (
                  <div key={side} className="min-h-[54px] border p-1.5">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {side === 'maszyna' ? 'maszyna' : 'ty'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {row.machine.jobs
                        .filter((job) =>
                          side === 'ty'
                            ? job.by === 'ty' || unplugged
                            : job.by === 'maszyna' && !unplugged
                        )
                        .map((job) => (
                          <motion.span
                            key={job.id}
                            layoutId={`${row.machine.id}:${job.id}`}
                            layout
                            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                            className="border px-1.5 py-0.5 text-[11px] leading-snug"
                            style={
                              job.by === 'maszyna'
                                ? { borderColor: `${color}66`, backgroundColor: `${color}12` }
                                : { borderColor: 'var(--border)' }
                            }
                          >
                            {job.text}
                          </motion.span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Wyjmij komputery */}
      <div className="mt-4 border-l-2 pl-3" style={{ borderColor: color }}>
        <button
          type="button"
          onClick={() => setUnplugged(!unplugged)}
          className="inline-flex cursor-pointer items-center gap-2 border-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
          style={{ borderColor: color, color }}
        >
          <Cpu className="h-4 w-4 shrink-0" aria-hidden />
          {unplugged ? 'Włóż komputery z powrotem' : 'Wyjmij komputery z tych trzech maszyn'}
        </button>
        <p className="mt-2 text-sm leading-relaxed">
          {unplugged ? (
            <>
              Wszystko wróciło do ciebie: <strong>{count(taken, 'robota', 'roboty', 'robót')}</strong>{' '}
              dziennie, których dziś nikt nie zauważa. Odmierzanie wody, pilnowanie temperatury,
              liczenie czasu — sto lat temu każdą z nich ktoś naprawdę wykonywał ręcznie.
            </>
          ) : (
            <>
              Naciśnij i zobacz, co by się stało, gdyby te trzy maszyny nie miały w środku
              komputera.
            </>
          )}
        </p>
      </div>

      {/* Zdanie od siebie */}
      <div className="mt-5">
        <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <PenLine className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden />
          Ostatni punkt protokołu — twoje zdanie
        </label>
        <input
          type="text"
          value={sentence}
          onChange={(event) => setSentence(event.target.value)}
          disabled={done}
          placeholder="Najbardziej zdziwiło mnie, że…"
          className="w-full border-b-2 bg-transparent px-1 py-1.5 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-70 sm:text-base"
          style={{ borderColor: canSign ? color : 'var(--border)' }}
        />
        {!done && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSign}
              disabled={!canSign}
              className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: color }}
            >
              <Stamp className="h-4 w-4 shrink-0" aria-hidden />
              Podpisz protokół
            </button>
            {!canSign && (
              <span className="text-xs text-muted-foreground">
                Dopisz jedno zdanie od siebie — choćby krótkie.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
