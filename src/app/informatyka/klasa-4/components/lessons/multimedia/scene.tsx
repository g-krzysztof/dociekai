'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Wspólny świat lekcji o materiałach multimedialnych.
 *
 * Wszystkie pięć bloków pokazuje **te same cztery sceny** i to jest decyzja, nie
 * oszczędność. Lekcja stoi na jednym zdaniu — *ruch ma coś pokazywać; jeśli nic
 * nie pokazuje, tylko zabiera oczy* — a tego zdania nie da się udowodnić na
 * czterech różnych obrazkach: dziecko musi zobaczyć **tę samą scenę** raz jako
 * animację, która ma co pokazać, i raz jako rysunek, w którym przewijak niczego
 * nie znajduje.
 *
 * Scena to funkcja czasu: `SceneArt` dostaje `t` z przedziału 0–1 i rysuje jedną
 * klatkę. Dzięki temu ten sam kod obsługuje przewijanie palcem (blok 1),
 * układanie klatek (blok 2), odtwarzanie z tempem (bloki 3–5) i zatrzymanie na
 * stopklatce — nie ma osobnego „silnika animacji”, jest czysta funkcja.
 *
 * `changes: false` w `kwiat` nie jest brakiem treści — to jest **treść bloku 1**.
 * Scena rysuje dla każdego `t` dokładnie to samo i na tym polega odkrycie:
 * budowy kwiatu nie da się zanimować, bo nic się w niej nie dzieje.
 *
 * Rysunek idzie kodem, nie plikiem: ma być natychmiast w każdym rozmiarze,
 * ma reagować na `t` i ma nieść tylko te napisy, które są treścią (podpisy
 * części kwiatu), bo werdykt w bloku 5 liczy podpisy dziecka co do wyrazu.
 */

export const SCENE_W = 640;
export const SCENE_H = 400;

export type SceneId = 'woda' | 'cien' | 'ulamek' | 'kwiat';

export interface SceneMoment {
  id: string;
  /** Polecenie dla dziecka: „zatrzymaj się w chwili, w której…”. */
  question: string;
  /** Przedział czasu uznawany za trafiony (0–1). */
  from: number;
  to: number;
  /** Co dokładnie dzieje się w tej chwili — zdanie do werdyktu. */
  answer: string;
}

export interface SceneMeta {
  id: SceneId;
  /** Nazwa materiału, tak jak nazwałby go nauczyciel. */
  name: string;
  subject: string;
  /** Pytanie, na które ta scena odpowiada — zadanie w bloku 5 stoi na nim. */
  question: string;
  /** Czy cokolwiek zmienia się tu w czasie. */
  changes: boolean;
  /**
   * Rzeczy, które po prostu widać. Werdykt bloku 5 odejmuje je od podpisu
   * dziecka: podpis złożony z samych nazw tego, co widać, niczego nie dodaje.
   */
  visible: string[];
  /** Chwile do znalezienia przewijakiem (puste dla scen bez zmian). */
  moments: SceneMoment[];
}

export const SCENES: SceneMeta[] = [
  {
    id: 'woda',
    name: 'Skąd bierze się deszcz',
    subject: 'przyroda',
    question: 'Skąd bierze się deszcz?',
    changes: true,
    visible: ['chmura', 'chmurka', 'słońce', 'kropla', 'rzeka', 'woda', 'deszcz', 'niebo'],
    moments: [
      {
        id: 'chmura',
        question: 'Zatrzymaj się w chwili, w której nad rzeką pojawia się pierwsza chmura.',
        from: 0.3,
        to: 0.45,
        answer: 'para wodna zebrała się wysoko i dopiero tam zamieniła się w chmurę',
      },
      {
        id: 'kropla',
        question: 'Zatrzymaj się w chwili, w której kropla odrywa się od chmury.',
        from: 0.63,
        to: 0.76,
        answer: 'kropla zrobiła się na tyle ciężka, że chmura przestała ją utrzymać',
      },
    ],
  },
  {
    id: 'ulamek',
    name: 'Połowa tabliczki',
    subject: 'matematyka',
    question: 'Ile to jest połowa, a ile ćwierć?',
    changes: true,
    visible: ['tabliczka', 'czekolada', 'kawałek', 'kawałki', 'kostka'],
    moments: [
      {
        id: 'polowa',
        question: 'Zatrzymaj się dokładnie w chwili, w której zjedzona jest połowa tabliczki.',
        from: 0.47,
        to: 0.57,
        answer: 'zniknęły dokładnie dwa kawałki z czterech',
      },
    ],
  },
  {
    id: 'cien',
    name: 'Cień w ciągu dnia',
    subject: 'przyroda',
    question: 'Dlaczego cień raz jest długi, a raz krótki?',
    changes: true,
    visible: ['słońce', 'cień', 'patyk', 'kij', 'ziemia', 'trawa'],
    moments: [
      {
        id: 'poludnie',
        question: 'Zatrzymaj się w chwili, w której cień jest najkrótszy.',
        from: 0.44,
        to: 0.56,
        answer: 'słońce stoi najwyżej, więc cień prawie znika',
      },
    ],
  },
  {
    id: 'kwiat',
    name: 'Budowa kwiatu',
    subject: 'przyroda',
    question: 'Jak nazywają się części kwiatu?',
    changes: false,
    visible: ['kwiat', 'płatek', 'płatki', 'łodyga', 'liść', 'liście', 'korzeń', 'korzenie'],
    moments: [],
  },
];

export function sceneById(id: SceneId): SceneMeta {
  const found = SCENES.find((scene) => scene.id === id);
  if (!found) throw new Error(`Nie znam sceny "${id}"`);
  return found;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Przedział przeskalowany na 0–1: `ramp(t, 0.3, 0.45)` to „od 0.3 rośnie do 1 w 0.45”. */
function ramp(t: number, from: number, to: number): number {
  return clamp01((t - from) / (to - from));
}

/* ───────────────────────── płótno ───────────────────────── */

/**
 * Płótno sceny: stałe 640 × 400 px, przeskalowane do szerokości kolumny.
 *
 * `maxWidth` jest obowiązkowy i domyślnie niski. Makieta o stałych proporcjach
 * puszczona na całą kolumnę rośnie na desktopie tak, że sterowanie pod nią
 * wypada poza ekran — to jest wniosek z audytu „wyświetlacz musi zostać na
 * ekranie” i dotyczy każdej sceny w tej lekcji.
 */
export function SceneStage({
  children,
  className,
  maxWidth = 480,
}: {
  children: ReactNode;
  className?: string;
  maxWidth?: number;
}) {
  return (
    <div
      className={cn('relative mx-auto w-full overflow-hidden border', className)}
      style={{ maxWidth, aspectRatio: `${SCENE_W} / ${SCENE_H}`, backgroundColor: '#ffffff' }}
    >
      {children}
    </div>
  );
}

/** Jedna klatka sceny. Czysta funkcja czasu — to samo `t` zawsze daje ten sam rysunek. */
export function SceneArt({ scene, t }: { scene: SceneId; t: number }) {
  const time = clamp01(t);
  return (
    <svg
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      {scene === 'woda' ? (
        <WaterArt t={time} />
      ) : scene === 'ulamek' ? (
        <BarArt t={time} />
      ) : scene === 'cien' ? (
        <ShadowArt t={time} />
      ) : (
        <FlowerArt />
      )}
    </svg>
  );
}

/* ───────────────────────── sceny ───────────────────────── */

/**
 * Skąd bierze się deszcz. Cztery zjawiska rozłożone w czasie:
 * parowanie (0,05–0,40), chmura (0,35–0,47), ciężka kropla (0,55–0,68),
 * spadanie (0,68–0,92). Chwile z `moments` celują dokładnie w dwa progi, więc
 * jeśli któryś z tych progów się tu zmieni, trzeba poprawić też tamte przedziały.
 */
function WaterArt({ t }: { t: number }) {
  const cloud = ramp(t, 0.35, 0.47);
  const heavy = ramp(t, 0.55, 0.68);
  const fall = ramp(t, 0.68, 0.92);
  const splash = ramp(t, 0.92, 1);
  const cloudY = 128;
  const dropY = cloudY + 34 + fall * 150;

  return (
    <>
      <rect x="0" y="0" width={SCENE_W} height={SCENE_H} fill="#eef6fb" />
      {/* Słońce stoi nieruchomo — lekcja uczy, że rusza się tylko to, co ma coś pokazać. */}
      <circle cx="86" cy="74" r="34" fill="#fbe3a3" />
      <circle cx="86" cy="74" r="24" fill="#f7d071" />
      <path d="M0 296 Q120 268 250 288 T640 272 V400 H0 Z" fill="#cfe4c4" />
      <path d="M0 320 Q160 300 320 316 T640 304 V400 H0 Z" fill="#a9cfe6" />

      {/* Para: trzy strużki unoszące się znad rzeki, każda z własnym opóźnieniem. */}
      {[0, 1, 2].map((index) => {
        const rise = ramp(t, 0.05 + index * 0.07, 0.34 + index * 0.07);
        if (rise <= 0) return null;
        const x = 250 + index * 78;
        const y = 300 - rise * 150;
        return (
          <path
            key={index}
            d={`M${x} ${y} q12 -18 0 -34 q-12 -18 0 -34`}
            fill="none"
            stroke="#7fb8d6"
            strokeWidth="5"
            strokeLinecap="round"
            opacity={0.25 + 0.6 * rise * (1 - 0.5 * cloud)}
          />
        );
      })}

      {/* Chmura rośnie i ciemnieje dopiero wtedy, gdy para dotarła na górę. */}
      {cloud > 0 && (
        <g opacity={Math.min(1, cloud * 1.4)}>
          <g transform={`translate(330 ${cloudY}) scale(${0.55 + 0.45 * cloud})`}>
            <ellipse cx="0" cy="0" rx="74" ry="30" fill={cloud > 0.8 ? '#b6c3cf' : '#dfe7ee'} />
            <circle cx="-34" cy="-14" r="28" fill={cloud > 0.8 ? '#c3ced8' : '#e7edf2'} />
            <circle cx="12" cy="-24" r="34" fill={cloud > 0.8 ? '#c3ced8' : '#e7edf2'} />
            <circle cx="48" cy="-8" r="24" fill={cloud > 0.8 ? '#c3ced8' : '#e7edf2'} />
          </g>
        </g>
      )}

      {/* Kropla: najpierw zwisa z chmury i rośnie, potem spada. */}
      {heavy > 0 && <Drop x={330} y={dropY} size={0.6 + 0.4 * heavy} />}

      {splash > 0 && (
        <g stroke="#5aa7cd" strokeWidth="4" strokeLinecap="round" opacity={1 - splash}>
          <path d={`M${330 - 26 * splash} ${312 - 14 * splash} l-10 -12`} />
          <path d={`M${330 + 26 * splash} ${312 - 14 * splash} l10 -12`} />
        </g>
      )}
    </>
  );
}

/** Kropla rysowana wprost ze współrzędnych — bez `transform`, bo skala ma zmieniać kształt, a nie układ. */
function Drop({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <path
      d={`M${x} ${y} q${-13 * size} ${-18 * size} 0 ${-30 * size} q${13 * size} ${12 * size} 0 ${30 * size} Z`}
      fill="#5aa7cd"
    />
  );
}

/**
 * Połowa tabliczki. `t` to część zjedzonej czekolady: cztery kawałki znikają po
 * kolei, a piąty kęs jest zawsze na wierzchu tego, który właśnie znika. Chwila
 * „połowa” wypada dokładnie w 0,5 — dwa całe kawałki mniej.
 */
function BarArt({ t }: { t: number }) {
  const eaten = t * 4;
  const boxes = [0, 1, 2, 3];
  const left = 96;
  const size = 112;

  return (
    <>
      <rect x="0" y="0" width={SCENE_W} height={SCENE_H} fill="#fbf5ec" />
      <rect x={left - 14} y="126" width={size * 4 + 28} height={size + 28} fill="#e7d6bd" />
      {boxes.map((index) => {
        const gone = clamp01(eaten - index);
        if (gone >= 1) return null;
        return (
          <g key={index}>
            <rect
              x={left + index * size}
              y="140"
              width={size - 8}
              height={size}
              fill="#8a5a33"
              opacity={1 - gone * 0.75}
            />
            <rect
              x={left + index * size + 8}
              y="148"
              width={size - 24}
              height={size - 16}
              fill="#a06a3c"
              opacity={1 - gone * 0.75}
            />
            {/* Kęs: półokrągłe wgryzienie wchodzące od prawej w kawałek, który właśnie znika. */}
            {gone > 0 && gone < 1 && (
              <circle cx={left + index * size} cy="196" r={14 + gone * 72} fill="#fbf5ec" />
            )}
          </g>
        );
      })}
      <rect x={left - 14} y="126" width={size * 4 + 28} height={size + 28} fill="none" stroke="#c9b294" strokeWidth="3" />
    </>
  );
}

/**
 * Cień w ciągu dnia. Słońce jedzie po łuku, a **cień patyka liczy się z
 * podobieństwa trójkątów** — nie jest rysowany „na oko”. To jedyny sposób, żeby
 * dziecko, przesuwając słońce w bloku 2, zobaczyło prawdziwą zależność: im
 * wyżej słońce, tym krótszy cień, a w południe cień prawie znika.
 */
export function shadowTipX(sunX: number, sunY: number): number {
  const base = 320;
  const stickTop = 240;
  const ground = 300;
  /* Trójkąt słońce–wierzchołek patyka i trójkąt słońce–koniec cienia są podobne. */
  const drop = Math.max(24, ground - sunY);
  return base + ((base - sunX) * (ground - stickTop)) / drop;
}

export function sunAt(p: number): { x: number; y: number } {
  const x = 90 + clamp01(p) * 460;
  const y = 240 - 150 * Math.sin(clamp01(p) * Math.PI);
  return { x, y };
}

function ShadowArt({ t }: { t: number }) {
  const sun = sunAt(t);
  const tip = shadowTipX(sun.x, sun.y);
  const mid = (320 + tip) / 2;

  return (
    <>
      <rect x="0" y="0" width={SCENE_W} height={SCENE_H} fill="#eaf3f8" />
      <path d="M0 300 H640 V400 H0 Z" fill="#cfe4c4" />
      <circle cx={sun.x} cy={sun.y} r="30" fill="#fbe3a3" />
      <circle cx={sun.x} cy={sun.y} r="21" fill="#f7d071" />
      <ellipse cx="320" cy="302" rx="22" ry="7" fill="#b9d3ab" />
      {/* Cień jako leżąca na ziemi soczewka: gruby przy patyku, zbiegający się w policzonym
          końcu. Klin o grubości kilku pikseli wyglądał na ekranie jak kreska i cienia po prostu
          nie było widać — a to on jest treścią całego bloku. */}
      <path
        d={`M320 297 Q${mid} 289 ${tip} 303 Q${mid} 319 320 311 Z`}
        fill="#7f97a8"
        opacity="0.6"
      />
      <rect x="314" y="240" width="12" height="60" fill="#9c7b52" />
    </>
  );
}

/**
 * Budowa kwiatu — **scena, w której nic się nie dzieje**, i to jest jej cała
 * rola. Nie przyjmuje `t`, bo nie ma czego przyjmować. Podpisy części są tu
 * treścią, a nie ozdobą: to jest dokładnie ten materiał, który ma być rysunkiem,
 * nie filmem.
 */
function FlowerArt() {
  const petals = [0, 1, 2, 3, 4, 5];
  return (
    <>
      <rect x="0" y="0" width={SCENE_W} height={SCENE_H} fill="#fdfaf3" />
      <path d="M0 318 H640 V400 H0 Z" fill="#e8dcc6" />
      <path d="M266 318 V168" stroke="#7fa45f" strokeWidth="9" fill="none" />
      <path d="M266 252 q-56 -20 -74 14 q48 22 74 -14 Z" fill="#8fbd6c" />
      <path d="M266 292 q56 -20 74 14 q-48 22 -74 -14 Z" fill="#8fbd6c" />
      {petals.map((index) => {
        const angle = (index / petals.length) * Math.PI * 2;
        return (
          <ellipse
            key={index}
            cx={266 + Math.cos(angle) * 40}
            cy={148 + Math.sin(angle) * 40}
            rx="27"
            ry="19"
            fill="#e9a8bf"
            transform={`rotate(${(angle * 180) / Math.PI} ${266 + Math.cos(angle) * 40} ${148 + Math.sin(angle) * 40})`}
          />
        );
      })}
      <circle cx="266" cy="148" r="22" fill="#f2cf72" />
      <path
        d="M266 318 q-26 26 -44 40 M266 318 q24 28 42 38 M266 318 v44"
        stroke="#b09067"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />

      {/* Podpisy części — jedyne litery w scenach tej lekcji, bo tu są treścią. */}
      <g fontSize="19" fill="#5b5245" fontFamily="system-ui, sans-serif">
        <path d="M330 120 H404" stroke="#b6ac9a" strokeWidth="2" />
        <text x="412" y="126">płatek</text>
        <path d="M300 214 H404" stroke="#b6ac9a" strokeWidth="2" />
        <text x="412" y="220">łodyga</text>
        <path d="M356 300 H404" stroke="#b6ac9a" strokeWidth="2" />
        <text x="412" y="306">liść</text>
        <path d="M290 356 H404" stroke="#b6ac9a" strokeWidth="2" />
        <text x="412" y="362">korzeń</text>
      </g>
    </>
  );
}

/* ───────────────────────── odtwarzanie ───────────────────────── */

/**
 * Czas materiału w trakcie odtwarzania. Zwraca `t` z przedziału 0–1 liczone
 * z prawdziwego zegara (`requestAnimationFrame`), a nie z licznika klatek —
 * dzięki temu „12 klatek na sekundę” znaczy naprawdę 12 klatek na sekundę,
 * niezależnie od tego, jak szybko przerysowuje się przeglądarka.
 */
export function usePlayback({
  playing,
  durationMs,
  loop = false,
  onEnd,
}: {
  playing: boolean;
  durationMs: number;
  loop?: boolean;
  onEnd?: () => void;
}): number {
  const [t, setT] = useState(0);
  const ended = useRef(onEnd);
  ended.current = onEnd;

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = (now - start) / durationMs;
      if (progress >= 1) {
        if (loop) {
          setT(progress % 1);
          frame = requestAnimationFrame(tick);
          return;
        }
        setT(1);
        ended.current?.();
        return;
      }
      setT(progress);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, durationMs, loop]);

  useEffect(() => {
    if (!playing) setT(0);
  }, [playing]);

  return t;
}

/* ───────────────────────── przewijak ───────────────────────── */

/**
 * Przewijak — pasek czasu, po którym naprawdę się ciągnie palcem.
 *
 * Suwak, który wygląda na przeciągalny, musi dać się przeciągnąć; klikanie
 * strzałkami zamiast ciągnięcia to w tej lekcji nie drobiazg, bo cały blok 1
 * polega na szukaniu chwili ruchem ręki. Stąd `setPointerCapture`: palec, który
 * zjechał poza pasek, dalej prowadzi uchwyt.
 */
export function TimeScrubber({
  value,
  onChange,
  color,
  frames = 60,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  color: string;
  /** Ile klatek ma materiał — przewijak zatrzaskuje się na klatkach, jak w prawdziwym programie. */
  frames?: number;
  disabled?: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);

  const setFromEvent = (clientX: number) => {
    const box = track.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    const raw = (clientX - box.left) / box.width;
    const frame = Math.round(clamp01(raw) * (frames - 1));
    onChange(frame / (frames - 1));
  };

  const frame = Math.round(value * (frames - 1));

  return (
    <div className="select-none">
      <div
        ref={track}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label="Przewijak materiału"
        aria-valuemin={1}
        aria-valuemax={frames}
        aria-valuenow={frame + 1}
        className={cn(
          'relative h-10 w-full cursor-grab touch-none border bg-muted/50 active:cursor-grabbing',
          disabled && 'pointer-events-none opacity-50'
        )}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setFromEvent(event.clientX);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 0) return;
          setFromEvent(event.clientX);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') onChange(Math.min(1, (frame + 1) / (frames - 1)));
          if (event.key === 'ArrowLeft') onChange(Math.max(0, (frame - 1) / (frames - 1)));
        }}
      >
        {/* Kreski klatek — pasek ma wyglądać jak taśma filmu, bo nią jest. */}
        <div className="pointer-events-none absolute inset-0 flex items-end justify-between px-[1px]">
          {Array.from({ length: frames }).map((_, index) => (
            <span
              key={index}
              className="w-px bg-border"
              style={{ height: index % 10 === 0 ? 14 : 7 }}
            />
          ))}
        </div>
        <div
          className="pointer-events-none absolute top-0 h-full w-1"
          style={{ left: `calc(${value * 100}% - 2px)`, backgroundColor: color }}
        />
        <div
          className="pointer-events-none absolute top-1/2 h-6 w-6 -translate-y-1/2 border-2 bg-white"
          style={{ left: `calc(${value * 100}% - 12px)`, borderColor: color }}
        />
      </div>
      <p className="mt-1 text-right text-xs tabular-nums text-muted-foreground">
        klatka {frame + 1} / {frames}
      </p>
    </div>
  );
}
