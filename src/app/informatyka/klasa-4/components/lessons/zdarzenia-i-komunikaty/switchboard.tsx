'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Check, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { BlockChip } from '../../scratch/bench';
import { StageView } from '../../scratch/stage-view';
import { useStage } from '../../scratch/use-stage';
import { HOME, make, type Block, type BlockType, type Sprite } from '../../scratch/engine';
import {
  hiddenAt,
  shownAt,
  together,
  type ActorDef,
  type StageRun,
  type Trigger,
} from '../../scratch/stage-engine';
import { TimeTrack } from './time-track';

/**
 * Rozdzielnia — blok, w którym pojawia się **komunikat**, i to jako odpowiedź na
 * pytanie zadane w haczyku: jak sprawić, żeby jedno zdarzenie usłyszało kilka
 * duszków naraz.
 *
 * Zamiast przeciągać klocki do skryptów, dziecko **wpina kapelusze w gniazda**.
 * Ciała skryptów są z góry dane i niezmienne (`pokaż`, potem `ukryj`), więc cała
 * uwaga idzie na jedno pytanie: *czego ten duszek ma słuchać*. Gest jest nowy w
 * repo i celowo przypomina łączenie wtyczek — bo komunikat naprawdę działa jak
 * wspólny przewód.
 *
 * Zlecenie jest tak dobrane, że **bez komunikatu nie da się go wykonać**:
 * wyzwalaczem jest kliknięcie Kota, a „kiedy ten duszek kliknięty” słyszy
 * wyłącznie ten duszek, w którego skrypcie stoi. Litera z takim kapeluszem nie
 * obudzi się od kliknięcia Kota — i werdykt mówi to wprost, zamiast odsyłać do
 * podpowiedzi. Zielona flaga też nie pomoże: klikamy Kota, nie flagę.
 *
 * Druga runda dokłada drugie gniazdo z `ukryj` i drugi komunikat. Po niej
 * dziecko ma na ekranie **kompletny szkielet zadania Z-8**: litery pojawiają się
 * po jednym zdarzeniu, a znikają po drugim — wszystkie w tej samej chwili.
 */

const LETTERS = [
  { id: 'o', letter: 'O', x: -80 },
  { id: 'l', letter: 'L', x: 0 },
  { id: 'a', letter: 'A', x: 80 },
];

const CAT_HOME: Sprite = { ...HOME, x: -170, y: -95, visible: true };
/**
 * W pierwszej rundzie litery są **ukryte w panelu duszka** i pokazują się na
 * komunikat. W drugiej stoją już na scenie — inaczej „zniknijcie naraz” nie
 * miałoby czego zdejmować, bo nikogo by tam nie było.
 */
const LETTER_HOME = (x: number, visible: boolean): Sprite => ({ ...HOME, x, y: 35, visible });

/** Kapelusze do wpięcia. Dwa z nich są pułapkami i obie są pouczające. */
const PLUGS: BlockType[] = ['flaga', 'klik', 'odbior'];

interface Round {
  title: string;
  brief: string;
  /** Czym dziecko ma uruchomić scenę w tej rundzie. */
  trigger: Trigger;
  triggerLabel: string;
  /** Komunikat, którego oczekuje ta runda — do werdyktów o złej nazwie. */
  message: string;
}

const ROUNDS: Round[] = [
  {
    title: 'Pokażcie się — wszystkie naraz',
    brief:
      'Kot ma w skrypcie klocek „nadaj komunikat start”. Wepnij literom takie kapelusze, żeby po kliknięciu Kota wszystkie trzy pokazały się w tej samej chwili.',
    trigger: { kind: 'klik', actorId: 'kot' },
    triggerLabel: 'kliknij Kota na scenie',
    message: 'start',
  },
  {
    title: 'I zniknijcie — też naraz',
    brief:
      'Każda litera dostała drugie gniazdo, a pod nim klocek „ukryj”. Kot ma drugi skrypt: po spacji nadaje komunikat „znikaj”. Dokończ to tak, żeby wszystkie trzy litery znikały jednocześnie.',
    trigger: { kind: 'klawisz', key: 'spacja' },
    triggerLabel: 'naciśnij spację',
    message: 'znikaj',
  },
];

interface SwitchboardProps {
  color: string;
  onComplete?: () => void;
}

export function Switchboard({ color, onComplete }: SwitchboardProps) {
  const [round, setRound] = useState(0);
  /** Wpięte kapelusze: `show[i]` dla gniazda „pokaż”, `hide[i]` dla „ukryj”. */
  const [show, setShow] = useState<(Block | null)[]>([null, null, null]);
  const [hide, setHide] = useState<(Block | null)[]>([null, null, null]);
  const anchorRef = useSectionScrollAnchor(round);

  const cat: ActorDef = useMemo(
    () => ({
      id: 'kot',
      name: 'Kot',
      home: CAT_HOME,
      scripts: [
        [make('klik'), make('nadaj', 'start')],
        [make('klawisz', 'spacja'), make('nadaj', 'znikaj')],
      ],
    }),
    []
  );

  const actors = useMemo<ActorDef[]>(
    () => [
      cat,
      ...LETTERS.map((item, index) => ({
        id: item.id,
        name: `Litera ${item.letter}`,
        home: LETTER_HOME(item.x, round >= 1),
        scripts: [
          ...(show[index] ? [[show[index] as Block, make('pokaz')]] : []),
          ...(hide[index] ? [[hide[index] as Block, make('ukryj')]] : []),
        ],
      })),
    ],
    [cat, show, hide, round]
  );

  const stage = useStage(actors);
  const [fired, setFired] = useState<Trigger | null>(null);

  const done = round >= ROUNDS.length;
  const current = ROUNDS[Math.min(round, ROUNDS.length - 1)];
  const verdict =
    !done && stage.finished && stage.last && sameTrigger(fired, current.trigger)
      ? judge(stage.last, actors, round, show, hide)
      : null;

  const fire = (trigger: Trigger) => {
    setFired(trigger);
    stage.fire(trigger);
  };

  const next = () => {
    const following = round + 1;
    setRound(following);
    /* Po ostatnim zleceniu oś zostaje taka, jaką dziecko właśnie zrobiło — to jest wynik bloku. */
    if (following < ROUNDS.length) {
      stage.clear();
      setFired(null);
      return;
    }
    onComplete?.();
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      {!done && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Zlecenie {round + 1} z {ROUNDS.length} · {current.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed">{current.brief}</p>
        </div>
      )}

      <PlugBoard
        color={color}
        round={Math.min(round, ROUNDS.length - 1)}
        show={show}
        hide={hide}
        onShow={setShow}
        onHide={setHide}
        locked={stage.running}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <div>
          <StageView
            actors={[
              { id: 'kot', kind: 'kot', sprite: stage.sprites.kot ?? CAT_HOME },
              ...LETTERS.map((item) => ({
                id: item.id,
                kind: 'kot' as const,
                letter: item.letter,
                sprite: stage.sprites[item.id] ?? LETTER_HOME(item.x, round >= 1),
              })),
            ]}
            running={stage.running}
            onStagePointer={(point, phase) => {
              if (phase !== 'down' || stage.running) return;
              if (Math.hypot(point.x - CAT_HOME.x, point.y - CAT_HOME.y) < 50)
                fire({ kind: 'klik', actorId: 'kot' });
            }}
          />
          <div
            tabIndex={0}
            role="button"
            onKeyDown={(event) => {
              if (event.key !== ' ' && event.code !== 'Space') return;
              event.preventDefault();
              fire({ kind: 'klawisz', key: 'spacja' });
            }}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/50"
          >
            <Keyboard className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden />
            kliknij tutaj i naciśnij spację
          </div>
          <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
            Kota klikasz wprost na scenie.
          </p>
        </div>

        <TimeTrack
          rows={[
            { id: 'kot', label: 'Kot' },
            ...LETTERS.map((item) => ({
              id: item.id,
              letter: item.letter,
              label: `Litera ${item.letter}`,
            })),
          ]}
          run={stage.last}
          now={stage.now}
          note="Żółty romb to nadany komunikat. Popatrz, w której chwili odpowiadają na niego litery."
        />
      </div>

      {!done && (
        <div className="mt-4 border-t pt-3">
          {verdict ? (
            <div
              className={cn(
                'p-3',
                !verdict.ok && 'border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30'
              )}
              style={verdict.ok ? { backgroundColor: `${color}14` } : undefined}
            >
              <p
                className="flex items-center gap-2 text-sm font-semibold"
                style={verdict.ok ? { color } : undefined}
              >
                {verdict.ok && <Check className="h-4 w-4 shrink-0" aria-hidden />}
                {verdict.ok ? 'Zlecenie wykonane.' : 'Jeszcze nie.'}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">{verdict.note}</p>
              {verdict.ok && (
                <button
                  type="button"
                  onClick={next}
                  className="mt-2.5 cursor-pointer border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
                  style={{ borderColor: color, color }}
                >
                  {round + 1 < ROUNDS.length ? 'Następne zlecenie' : 'Kończę blok'}
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Wepnij kapelusze, a potem <strong className="text-foreground">{current.triggerLabel}</strong>.
            </p>
          )}
        </div>
      )}

      {done && (
        <div className="mt-4 p-3" style={{ backgroundColor: `${color}14` }}>
          <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            Masz przed sobą szkielet zadania z końca lekcji.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">
            <strong>Komunikat nie ma adresata.</strong> Nadaje go jeden duszek, a odbiera każdy, kto
            ma kapelusz z tą samą nazwą — i wszyscy w tej samej chwili. To jest cała odpowiedź na
            pytanie z pierwszego bloku i jedyny sposób, żeby coś działo się{' '}
            <strong>naprawdę jednocześnie</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Werdykt                                                             */
/* ------------------------------------------------------------------ */

function sameTrigger(a: Trigger | null, b: Trigger): boolean {
  if (!a || a.kind !== b.kind) return false;
  if (a.kind === 'klik' && b.kind === 'klik') return a.actorId === b.actorId;
  if (a.kind === 'klawisz' && b.kind === 'klawisz') return a.key === b.key;
  return true;
}

function judge(
  run: StageRun,
  actors: ActorDef[],
  round: number,
  show: (Block | null)[],
  hide: (Block | null)[]
): { ok: boolean; note: string } {
  const letters = LETTERS.map((item, index) => ({
    ...item,
    actor: actors.find((actor) => actor.id === item.id)!,
    plug: round === 0 ? show[index] : hide[index],
  }));

  const empty = letters.filter((item) => !item.plug);
  if (empty.length > 0)
    return {
      ok: false,
      note: `Puste gniazdo przy ${empty.length === 1 ? 'literze' : 'literach'} ${empty.map((item) => item.letter).join(', ')}. Skrypt bez kapelusza nigdy nie rusza — to wiesz już z poprzedniej lekcji.`,
    };

  const wrongOwn = letters.filter((item) => item.plug?.type === 'klik');
  if (wrongOwn.length > 0)
    return {
      ok: false,
      note: `Litera ${wrongOwn[0].letter} ma kapelusz „kiedy ten duszek kliknięty”. Ten kapelusz słyszy TYLKO ten duszek, w którego skrypcie stoi — a ty klikasz Kota, nie literę.`,
    };

  const wrongFlag = letters.filter((item) => item.plug?.type === 'flaga');
  if (wrongFlag.length > 0)
    return {
      ok: false,
      note: `Litera ${wrongFlag[0].letter} czeka na zieloną flagę, a my flagi nie naciskamy. Potrzebny jest kapelusz, który usłyszy to, co nadaje Kot.`,
    };

  const message = ROUNDS[round].message;
  const wrongMessage = letters.filter((item) => String(item.plug?.value ?? '') !== message);
  if (wrongMessage.length > 0)
    return {
      ok: false,
      note: `Litera ${wrongMessage[0].letter} czeka na komunikat „${wrongMessage[0].plug?.value}”, a Kot nadaje „${message}”. Komunikat rozpoznaje się po nazwie — kliknij w białe pole kapelusza i zmień ją.`,
    };

  const times = letters.map((item) =>
    round === 0 ? shownAt(run, item.id, item.actor.home) : hiddenAt(run, item.id, item.actor.home)
  );
  if (times.some((time) => time == null))
    return { ok: false, note: 'Któraś litera nie zareagowała. Uruchom scenę jeszcze raz.' };
  if (!together(times))
    return { ok: false, note: 'Litery reagują, ale w różnych chwilach — na osi widać schodki zamiast jednej kreski.' };

  return {
    ok: true,
    note:
      round === 0
        ? 'Jeden komunikat, trzy odbiorczynie, jedna chwila. Na osi czasu trzy zielone kropki stoją dokładnie nad żółtym rombem Kota.'
        : 'Znikają w tej samej milisekundzie, w której Kot nadał komunikat. Dokładnie tego wymaga zadanie na końcu lekcji.',
  };
}

/* ------------------------------------------------------------------ */
/* Tablica z gniazdami                                                 */
/* ------------------------------------------------------------------ */

interface PlugBoardProps {
  color: string;
  round: number;
  show: (Block | null)[];
  hide: (Block | null)[];
  onShow: (value: (Block | null)[]) => void;
  onHide: (value: (Block | null)[]) => void;
  locked?: boolean;
}

function PlugBoard({ color, round, show, hide, onShow, onHide, locked }: PlugBoardProps) {
  const [drag, setDrag] = useState<{ type: BlockType; x: number; y: number } | null>(null);
  const dragRef = useRef<{ type: BlockType; x: number; y: number } | null>(null);
  const sockets = useRef(new Map<string, HTMLElement>());
  const [over, setOver] = useState<string | null>(null);
  const overRef = useRef<string | null>(null);
  /**
   * Kapelusz wzięty „do ręki” kliknięciem. Przeciąganie jest tu gestem
   * głównym, ale nie może być jedynym: bez tego tablicy nie dałoby się obsłużyć
   * z klawiatury ani jednym palcem na małym ekranie. Ta sama para co w
   * pracowni klocków, gdzie kliknięcie dokłada klocek na koniec.
   */
  const [held, setHeld] = useState<BlockType | null>(null);
  /* Odróżnia kliknięcie od przeciągnięcia — bez progu każdy chwyt wybierałby kapelusz. */
  const moved = useRef(false);

  const setSocket = useCallback((key: string, node: HTMLElement | null) => {
    if (node) sockets.current.set(key, node);
    else sockets.current.delete(key);
  }, []);

  const putRef = useRef<(key: string, type: BlockType) => void>(() => undefined);
  putRef.current = (key: string, type: BlockType) => {
    const [slot, index] = key.split(':');
    const block = make(type, type === 'odbior' ? (slot === 'show' ? 'start' : 'znikaj') : undefined);
    if (slot === 'show') onShow(show.map((old, i) => (i === Number(index) ? block : old)));
    else onHide(hide.map((old, i) => (i === Number(index) ? block : old)));
  };

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!dragRef.current) return;
      if (Math.hypot(event.clientX - dragRef.current.x, event.clientY - dragRef.current.y) > 6)
        moved.current = true;
      dragRef.current = { ...dragRef.current, x: event.clientX, y: event.clientY };
      setDrag(dragRef.current);
      let found: string | null = null;
      sockets.current.forEach((node, key) => {
        const rect = node.getBoundingClientRect();
        if (
          event.clientX >= rect.left - 12 &&
          event.clientX <= rect.right + 12 &&
          event.clientY >= rect.top - 12 &&
          event.clientY <= rect.bottom + 12
        )
          found = key;
      });
      overRef.current = found;
      setOver(found);
    };
    const up = () => {
      const active = dragRef.current;
      const target = overRef.current;
      dragRef.current = null;
      overRef.current = null;
      setDrag(null);
      setOver(null);
      if (!active) return;
      if (target) {
        putRef.current(target, active.type);
        setHeld(null);
        return;
      }
      /* Palec nie ruszył dalej niż o próg — to było kliknięcie, czyli wzięcie do ręki. */
      if (!moved.current) setHeld(active.type);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);

  const grab = (event: ReactPointerEvent<HTMLDivElement>, type: BlockType) => {
    if (locked || event.button !== 0) return;
    moved.current = false;
    dragRef.current = { type, x: event.clientX, y: event.clientY };
    setDrag(dragRef.current);
  };

  /** Kliknięcie w gniazdo wkłada to, co dziecko trzyma w ręce. */
  const drop = (key: string) => {
    if (locked || !held) return;
    putRef.current(key, held);
    setHeld(null);
  };

  const cycle = (key: string, block: Block) => {
    if (block.type !== 'odbior') return;
    const [slot, index] = key.split(':');
    const value = String(block.value) === 'start' ? 'znikaj' : 'start';
    const next = make('odbior', value);
    if (slot === 'show') onShow(show.map((old, i) => (i === Number(index) ? next : old)));
    else onHide(hide.map((old, i) => (i === Number(index) ? next : old)));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,210px)_minmax(0,1fr)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Kapelusze do wpięcia
        </p>
        <div className="mt-2 space-y-2 border bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800/60">
          {PLUGS.map((type) => (
            <div
              key={type}
              role="button"
              tabIndex={0}
              aria-label={`Kapelusz ${type}`}
              onPointerDown={(event) => grab(event, type)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                setHeld(type);
              }}
              className={cn(
                'w-fit touch-none',
                locked ? 'opacity-50' : 'cursor-grab',
                held === type && 'outline-2 outline-offset-2'
              )}
              style={held === type ? { outlineColor: color, outlineStyle: 'solid' } : undefined}
            >
              <BlockChip block={make(type, type === 'odbior' ? 'start' : undefined)} />
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
          {held
            ? 'Trzymasz kapelusz — kliknij teraz puste gniazdo.'
            : 'Przeciągnij kapelusz na puste gniazdo nad klockiem litery — albo kliknij najpierw jego, potem gniazdo.'}
        </p>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Skrypty Kota — dane, nie do zmiany
        </p>
        <div className="mt-2 space-y-3">
          <div className="w-fit opacity-80">
            <BlockChip block={make('klik')} />
            <BlockChip block={make('nadaj', 'start')} />
          </div>
          {round >= 1 && (
            <div className="w-fit opacity-80">
              <BlockChip block={make('klawisz', 'spacja')} />
              <BlockChip block={make('nadaj', 'znikaj')} />
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Skrypty liter
        </p>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          {LETTERS.map((item, index) => (
            <div key={item.id}>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Litera {item.letter}
              </p>
              <Socket
                keyName={`show:${index}`}
                block={show[index]}
                body={make('pokaz')}
                over={over === `show:${index}`}
                color={color}
                setRef={setSocket}
                onCycle={cycle}
                onDrop={drop}
                label={`Gniazdo kapelusza litery ${item.letter} — pokazywanie`}
              />
              {round >= 1 && (
                <div className="mt-4">
                  <Socket
                    keyName={`hide:${index}`}
                    block={hide[index]}
                    body={make('ukryj')}
                    over={over === `hide:${index}`}
                    color={color}
                    setRef={setSocket}
                    onCycle={cycle}
                    onDrop={drop}
                    label={`Gniazdo kapelusza litery ${item.letter} — znikanie`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {drag && (
        <div className="pointer-events-none fixed z-50 opacity-90" style={{ left: drag.x - 40, top: drag.y - 12 }}>
          <BlockChip block={make(drag.type, drag.type === 'odbior' ? 'start' : undefined)} />
        </div>
      )}
    </div>
  );
}

function Socket({
  keyName,
  block,
  body,
  over,
  color,
  setRef,
  onCycle,
  onDrop,
  label,
}: {
  keyName: string;
  block: Block | null;
  body: Block;
  over: boolean;
  color: string;
  setRef: (key: string, node: HTMLElement | null) => void;
  onCycle: (key: string, block: Block) => void;
  onDrop: (key: string) => void;
  label: string;
}) {
  return (
    <div>
      <div ref={(node) => setRef(keyName, node)} className="w-fit">
        {block ? (
          <BlockChip block={block} editable onValueClick={() => onCycle(keyName, block)} />
        ) : (
          <button
            type="button"
            aria-label={label}
            data-socket={keyName}
            onClick={() => onDrop(keyName)}
            className="flex h-[30px] w-[150px] cursor-pointer items-center justify-center rounded-t-[14px] rounded-b-[3px] border-2 border-dashed text-[10px] font-semibold uppercase tracking-wide"
            style={{
              borderColor: over ? color : '#c7ccd4',
              backgroundColor: over ? `${color}1a` : 'transparent',
              color: over ? color : '#9aa5b1',
            }}
          >
            puste gniazdo
          </button>
        )}
      </div>
      <BlockChip block={body} />
    </div>
  );
}
