'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Eye, Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { count } from '../../../lib/plural';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { SceneArt, SceneStage } from './scene';

/**
 * Blok 3 — **symulator uwagi widza.**
 *
 * Reguła, o którą chodzi, brzmi banalnie: *oko idzie tam, gdzie się rusza*.
 * Zdanie w akapicie niczego nie zmienia — dziecko musi zobaczyć **skutek
 * swojej własnej decyzji**, i to skutek, którego nie da się obejrzeć w żadnym
 * prawdziwym programie, bo nikt nie rysuje widzowi jego wzroku.
 *
 * Stąd znacznik oka i jawna, wypisana nad sceną reguła, według której się
 * porusza. To jest symulacja i mówimy o tym wprost — ale **reguła jest widoczna
 * przed uruchomieniem**, więc dziecko przewiduje wynik, zamiast go przyjmować na
 * wiarę.
 *
 * Trzy rundy na **tym samym ekranie** i z tym samym kompletem elementów. Zmienia
 * się wyłącznie zdanie „co widz ma z tego wynieść” — i za każdym razem wychodzi
 * z niego inna odpowiedź. Animacja, która w rundzie 1 jest jedyną słuszną, w
 * rundzie 2 jest tą, która psuje wszystko. To jest sedno bloku: **najpierw
 * powiedz, po co robisz materiał, potem decyduj, co się rusza.**
 *
 * Runda 3 dokłada oś czasu, bo dwóch celów naraz osiągnąć się nie da i to nie
 * jest pułapka, tylko odpowiedź: ruch po kolei zamiast ruchu naraz.
 */

const TOTAL = 6000;
const STEP = 100;
/** Co ile oko przeskakuje, gdy ruszają się co najmniej dwie rzeczy. */
const SWITCH_EVERY = 800;
/** Ile trwa złapanie wzroku po przeskoku — ten czas przepada. */
const REFOCUS = 300;
/** Ile oko musi spędzić na podpisie, żeby dało się go przeczytać. */
const READ_MS = 3500;
/** Ile trwa wjazd podpisu z boku; przez ten czas liter nie da się czytać. */
const SLIDE_MS = 1200;

type Timing = 'off' | 'start' | 'koniec';

const WINDOWS: Record<Exclude<Timing, 'off'>, [number, number]> = {
  start: [0, 3500],
  koniec: [3800, TOTAL],
};

interface ElementDef {
  id: 'para' | 'podpis' | 'ramka' | 'dalej';
  label: string;
  what: string;
  /** Miejsce na scenie, do którego skacze znacznik oka (procenty). */
  at: { x: number; y: number };
}

const ELEMENTS: ElementDef[] = [
  { id: 'para', label: 'Para nad rzeką', what: 'strużki pary unoszą się do góry', at: { x: 58, y: 48 } },
  { id: 'podpis', label: 'Podpis', what: 'podpis wjeżdża z boku', at: { x: 50, y: 88 } },
  { id: 'ramka', label: 'Ramka „NOWOŚĆ”', what: 'ramka miga w rogu', at: { x: 84, y: 12 } },
  { id: 'dalej', label: 'Strzałka „dalej”', what: 'strzałka pulsuje w rogu', at: { x: 87, y: 84 } },
];

type Settings = Record<ElementDef['id'], Timing>;

const NOTHING: Settings = { para: 'off', podpis: 'off', ramka: 'off', dalej: 'off' };

function covers(timing: Timing, time: number): boolean {
  if (timing === 'off') return false;
  const [from, to] = WINDOWS[timing];
  return time >= from && time < to;
}

interface Result {
  attention: Record<string, number>;
  reading: number;
  /** Ile razy oko przeskoczyło między dwiema ruszającymi się rzeczami. */
  jumps: number;
  /** Przebieg dla znacznika: co 100 ms, na czym jest oko (albo `null` w przeskoku). */
  track: (string | null)[];
}

/**
 * Przebieg wzroku widza, liczony z góry, a nie mierzony — dlatego reguła stoi
 * nad sceną otwartym tekstem. Gdy nic się nie rusza, oko wraca do tekstu; gdy
 * rusza się jedno, zostaje tam; gdy rusza się więcej, krąży i na każdym
 * przeskoku traci {@link REFOCUS} ms.
 */
function simulate(settings: Settings): Result {
  const attention: Record<string, number> = {};
  const track: (string | null)[] = [];
  let reading = 0;
  let jumps = 0;
  let lastKey = '';
  let slotStart = 0;
  let lastTarget: string | null = null;

  for (let time = 0; time < TOTAL; time += STEP) {
    const moving = ELEMENTS.filter((element) => covers(settings[element.id], time)).map((e) => e.id);
    const key = moving.join(',');
    if (key !== lastKey) {
      lastKey = key;
      slotStart = time;
    }

    let target: string | null;
    if (moving.length === 0) {
      target = 'podpis';
    } else if (moving.length === 1) {
      target = moving[0];
    } else {
      const since = time - slotStart;
      target = since % SWITCH_EVERY < REFOCUS ? null : moving[Math.floor(since / SWITCH_EVERY) % moving.length];
    }

    /* Przeskokiem jest tylko zmiana celu WYMUSZONA przez dwie ruszające się rzeczy.
       Powrót oka do tekstu po skończonej animacji nie kosztuje widza nic. */
    if (moving.length > 1 && target && target !== lastTarget && lastTarget !== null) jumps += 1;
    lastTarget = target;
    track.push(target);
    if (target) attention[target] = (attention[target] ?? 0) + STEP;

    /* Podpis czyta się tylko wtedy, gdy stoi w miejscu — w trakcie wjazdu litery uciekają. */
    if (target === 'podpis') {
      const sliding =
        settings.podpis !== 'off' &&
        covers(settings.podpis, time) &&
        time - WINDOWS[settings.podpis as Exclude<Timing, 'off'>][0] < SLIDE_MS;
      if (!sliding) reading += STEP;
    }
  }

  return { attention, reading, jumps, track };
}

interface Round {
  id: string;
  goal: string;
  caption: string;
  /** Co musi się udać, żeby runda była zaliczona. */
  check: (result: Result) => boolean;
  /** Zdanie po nieudanym przebiegu — ma nazywać przyczynę, nie oceniać. */
  needs: (result: Result) => string;
  targets: (result: Result) => { label: string; ok: boolean; detail: string }[];
}

const seconds = (ms: number) => `${(ms / 1000).toFixed(1).replace('.', ',')} s`;

const ROUNDS: Round[] = [
  {
    id: 'rozumie',
    goal: 'Widz ma zrozumieć, skąd woda bierze się w chmurze.',
    caption: 'Woda z rzeki paruje i unosi się do góry.',
    check: (result) => (result.attention.para ?? 0) >= 2500,
    needs: (result) =>
      (result.attention.para ?? 0) >= 2500
        ? ''
        : `Widz patrzył na parę tylko ${seconds(result.attention.para ?? 0)} z potrzebnych 2,5 s.`,
    targets: (result) => [
      {
        label: 'obejrzał, jak para unosi się znad rzeki',
        ok: (result.attention.para ?? 0) >= 2500,
        detail: seconds(result.attention.para ?? 0),
      },
    ],
  },
  {
    id: 'zapamieta',
    goal: 'Widz ma zapamiętać, że ta zamiana nazywa się parowaniem.',
    caption: 'Zamiana wody w parę nazywa się parowaniem.',
    check: (result) => result.reading >= READ_MS,
    needs: (result) =>
      result.reading >= READ_MS
        ? ''
        : `Na podpis starczyło ${seconds(result.reading)}, a na przeczytanie go trzeba 3,5 s.`,
    targets: (result) => [
      {
        label: 'przeczytał podpis z nazwą',
        ok: result.reading >= READ_MS,
        detail: `${seconds(result.reading)} z 3,5 s`,
      },
    ],
  },
  {
    id: 'i-to-i-to',
    goal: 'Widz ma najpierw zrozumieć temat, a potem zauważyć strzałkę „dalej”.',
    caption: 'Deszcz to woda, która wróciła tam, skąd wyparowała.',
    check: (result) => (result.attention.para ?? 0) >= 2500 && (result.attention.dalej ?? 0) >= 1000,
    needs: (result) => {
      const para = (result.attention.para ?? 0) >= 2500;
      const dalej = (result.attention.dalej ?? 0) >= 1000;
      if (para && dalej) return '';
      if (!para && !dalej) return 'Oko nie zdążyło ani z parą, ani ze strzałką — ruszało się za dużo rzeczy naraz.';
      return para
        ? 'Para owszem, ale strzałki „dalej” widz nie zauważył.'
        : 'Strzałkę widz zauważył, ale tematu nie obejrzał.';
    },
    targets: (result) => [
      {
        label: 'obejrzał, jak para unosi się znad rzeki',
        ok: (result.attention.para ?? 0) >= 2500,
        detail: seconds(result.attention.para ?? 0),
      },
      {
        label: 'zauważył strzałkę „dalej”',
        ok: (result.attention.dalej ?? 0) >= 1000,
        detail: seconds(result.attention.dalej ?? 0),
      },
    ],
  },
];

export function EyeTrap({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState<string[]>([]);
  const anchor = useSectionScrollAnchor(index);

  const finish = (id: string) => {
    const next = solved.includes(id) ? solved : [...solved, id];
    setSolved(next);
    if (next.length === ROUNDS.length) onComplete?.();
    else setIndex((value) => value + 1);
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        Ten sam ekran materiału trzy razy. Za każdym razem zmieni się <strong>jedno zdanie</strong>: co widz ma z tego
        wynieść. Ty decydujesz, <strong>co się na nim rusza i kiedy</strong> — a potem oglądasz, dokąd poszedł wzrok
        widza.
      </p>

      <div className="mt-3 border-l-2 bg-muted/40 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
        <strong>Reguła, według której chodzi znacznik oka:</strong> oko idzie tam, gdzie coś się rusza. Gdy rusza się
        jedna rzecz — zostaje przy niej. Gdy dwie albo więcej — skacze między nimi i na każdym przeskoku traci 0,3 s.
        Gdy nie rusza się nic — wraca do tekstu i zaczyna czytać.
      </div>

      <div ref={anchor} className="mt-5 space-y-5">
        {ROUNDS.slice(0, solved.length + 1).map((round, position) => (
          <RoundView
            key={round.id}
            round={round}
            color={color}
            active={position === index}
            solved={solved.includes(round.id)}
            onSolved={() => finish(round.id)}
          />
        ))}
      </div>

      {solved.length === ROUNDS.length && (
        <p className="mt-5 p-4 text-sm leading-relaxed" style={{ backgroundColor: `${color}12` }}>
          Trzy razy ten sam ekran i trzy różne odpowiedzi — bo trzy razy co innego miało zostać w głowie widza.{' '}
          <strong>Nie pytaj „co tu zanimować”, tylko „co widz ma z tego wynieść”</strong>. Dopiero z tej odpowiedzi
          wynika, co ma się ruszać. A jeśli okaże się, że dwie rzeczy naraz — to znaczy, że mają iść{' '}
          <strong>po kolei</strong>.
        </p>
      )}
    </div>
  );
}

function RoundView({
  round,
  color,
  active,
  solved,
  onSolved,
}: {
  round: Round;
  color: string;
  active: boolean;
  solved: boolean;
  onSolved: () => void;
}) {
  const [settings, setSettings] = useState<Settings>(NOTHING);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const reported = useRef(false);

  useEffect(() => {
    if (!playing) return;
    const started = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const elapsed = now - started;
      if (elapsed >= TOTAL) {
        setTime(TOTAL);
        setPlaying(false);
        return;
      }
      setTime(elapsed);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const run = () => {
    setResult(null);
    setTime(0);
    setPlaying(true);
    const outcome = simulate(settings);
    /* Werdykt pokazujemy dopiero po przebiegu — inaczej dziecko czytałoby wynik zamiast patrzeć. */
    window.setTimeout(() => {
      setResult(outcome);
      if (round.check(outcome) && !reported.current) {
        reported.current = true;
        onSolved();
      }
    }, TOTAL);
  };

  const step = Math.min(Math.floor(time / STEP), Math.floor(TOTAL / STEP) - 1);
  const track = result ?? simulate(settings);
  const looking = playing ? track.track[step] : null;
  const eye = ELEMENTS.find((element) => element.id === looking);

  const moving = (id: ElementDef['id']) => playing && covers(settings[id], time);
  /* Scena rusza się tylko wtedy, gdy dziecko włączyło parę; poza tym stoi na stopklatce. */
  const sceneT = moving('para') ? 0.05 + ((time - WINDOWS[settings.para as 'start' | 'koniec'][0]) / 2600) * 0.3 : 0.22;
  const slideIn =
    moving('podpis') && time - WINDOWS[settings.podpis as 'start' | 'koniec'][0] < SLIDE_MS
      ? (time - WINDOWS[settings.podpis as 'start' | 'koniec'][0]) / SLIDE_MS
      : 1;

  return (
    <div className={cn('border p-4 transition-opacity', !active && !solved && 'opacity-40')}>
      <p className="mb-3 text-sm leading-relaxed">
        <span className="font-semibold" style={{ color }}>
          Cel materiału:
        </span>{' '}
        {round.goal}
      </p>

      <SceneStage>
        <SceneArt scene="woda" t={Math.min(0.35, sceneT)} />

        <span
          className={cn(
            'absolute right-3 top-3 border-2 px-2 py-0.5 text-[11px] font-bold',
            moving('ramka') && 'animate-pulse'
          )}
          style={{ borderColor: '#d64545', color: '#d64545', backgroundColor: '#fff6f6' }}
        >
          NOWOŚĆ
        </span>

        <span
          className={cn(
            'absolute bottom-3 right-3 border px-2 py-1 text-[11px] font-semibold',
            moving('dalej') && 'animate-pulse'
          )}
          style={{ borderColor: '#4a6f8a', color: '#4a6f8a', backgroundColor: '#ffffff' }}
        >
          dalej ▸
        </span>

        <p
          className="absolute bottom-0 left-0 right-0 bg-white/90 px-3 py-2 text-[13px] font-medium"
          style={{ color: '#1c1917', transform: `translateX(${(1 - slideIn) * -100}%)` }}
        >
          {round.caption}
        </p>

        {playing && (
          <span
            className="pointer-events-none absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 bg-white/50 transition-all duration-200"
            style={{
              borderColor: color,
              left: `${eye?.at.x ?? 50}%`,
              top: `${eye?.at.y ?? 50}%`,
              opacity: looking ? 1 : 0.25,
            }}
          >
            <Eye className="h-4 w-4" style={{ color }} aria-hidden />
          </span>
        )}
      </SceneStage>

      {/* Sterowanie tuż pod sceną — zmiana i jej skutek mają być widoczne razem. */}
      <div className="mx-auto mt-3 w-full max-w-[480px] space-y-1.5">
        {ELEMENTS.map((element) => (
          <div key={element.id} className="flex flex-wrap items-center justify-between gap-2 border px-2.5 py-1.5">
            <span className="text-sm">
              {element.label}
              <span className="ml-1.5 text-xs text-muted-foreground">{element.what}</span>
            </span>
            <span className="flex gap-1">
              {(['off', 'start', 'koniec'] as Timing[]).map((timing) => (
                <button
                  key={timing}
                  type="button"
                  disabled={playing || solved}
                  onClick={() => setSettings((current) => ({ ...current, [element.id]: timing }))}
                  className={cn(
                    'cursor-pointer border px-2 py-0.5 text-xs transition-colors disabled:cursor-not-allowed',
                    settings[element.id] === timing ? 'font-semibold' : 'text-muted-foreground hover:text-foreground'
                  )}
                  style={settings[element.id] === timing ? { borderColor: color, color } : undefined}
                >
                  {timing === 'off' ? 'nie rusza się' : timing === 'start' ? 'na początku' : 'na końcu'}
                </button>
              ))}
            </span>
          </div>
        ))}
      </div>

      {!solved && (
        <button
          type="button"
          onClick={run}
          disabled={playing}
          className="mx-auto mt-3 flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          style={{ borderColor: color, color }}
        >
          <Play className="h-4 w-4" aria-hidden />
          {playing ? 'Widz patrzy…' : 'Pokaż widzowi (6 s)'}
        </button>
      )}

      {result && !playing && (
        <div className="mt-3 space-y-2">
          {round.targets(result).map((target) => (
            <p key={target.label} className="flex items-start gap-2 text-sm leading-snug">
              <span
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-white"
                style={{ backgroundColor: target.ok ? color : '#a1a1aa' }}
                aria-hidden
              >
                {target.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              </span>
              <span>
                Widz {target.label} — <strong>{target.detail}</strong>
              </span>
            </p>
          ))}
          {result.jumps > 0 && (
            <p className="text-xs text-muted-foreground">
              Oko przeskoczyło {count(result.jumps, 'raz', 'razy', 'razy')}, bo ruszała się więcej niż jedna rzecz.
              Każdy przeskok kosztował 0,3 s.
            </p>
          )}
          {!round.check(result) && (
            <p className="text-sm leading-relaxed" style={{ color }}>
              {round.needs(result)} Poprzestawiaj przełączniki i puść jeszcze raz — próby są za darmo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
