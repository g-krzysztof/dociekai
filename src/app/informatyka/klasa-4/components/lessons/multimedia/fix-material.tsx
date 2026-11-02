'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Eye, Gauge, MoveHorizontal, Play, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SceneArt, SceneStage, TimeScrubber, sceneById, type SceneId } from './scene';

/**
 * Blok 4 — **przybornik, nie kolejne ćwiczenie.**
 *
 * Po trzech blokach dziecko ma trzy przyrządy: przewijak (blok 1), pokrętło
 * tempa (blok 2) i znacznik oka (blok 3). Tu dostaje cudzy, gotowy materiał
 * z trzema usterkami i **żadnej informacji, która jest gdzie**. Praca polega na
 * czymś, czego w tym kursie jeszcze nie było: *dobrać przyrząd do podejrzenia*.
 *
 * Sedno jest w tym, że **każdy przyrząd widzi tylko swoje**. Przewijak nie wie
 * nic o tempie, pokrętło tempa nie odróżnia animacji od rysunku, a znacznik oka
 * nie ma pojęcia, czy cokolwiek się w kadrze zmienia. Slajd z budową kwiatu
 * przepuszczą **dwa z trzech** przyrządów — i to nie jest ich wada, tylko powód,
 * dla którego trzeba mieć więcej niż jeden.
 *
 * Naprawa dzieje się **tym samym przyrządem, który usterkę znalazł**, więc nie
 * ma tu osobnego przycisku „napraw”: pokrętło zwalnia tempo, przewijak kasuje
 * animację, której nie ma czego animować, a znacznik oka wyłącza ozdobę.
 */

type Tool = 'przewijak' | 'tempo' | 'oko';

const TOOLS: { id: Tool; label: string; from: string; icon: typeof Eye }[] = [
  { id: 'przewijak', label: 'Przewijak', from: 'z bloku 1', icon: MoveHorizontal },
  { id: 'tempo', label: 'Pokrętło tempa', from: 'z bloku 2', icon: Gauge },
  { id: 'oko', label: 'Znacznik oka', from: 'z bloku 3', icon: Eye },
];

interface Slide {
  id: string;
  title: string;
  scene: SceneId;
  caption: string;
  /** Który przyrząd jest w stanie zobaczyć usterkę tego slajdu. */
  defect: Tool;
}

const SLIDES: Slide[] = [
  {
    id: 'deszcz',
    title: 'Skąd bierze się deszcz',
    scene: 'woda',
    caption: 'Woda paruje z rzeki, zbiera się w chmurze i wraca jako deszcz.',
    defect: 'tempo',
  },
  {
    id: 'kwiat',
    title: 'Budowa kwiatu',
    scene: 'kwiat',
    caption: 'Kwiat ma płatki, łodygę, liście i korzeń.',
    defect: 'przewijak',
  },
  {
    id: 'polowa',
    title: 'Ile to jest połowa',
    scene: 'ulamek',
    caption: 'Połowa to dwa kawałki z czterech.',
    defect: 'oko',
  },
];

interface SlideState {
  /** Ile sekund trwa ruch na slajdzie. */
  duration: number;
  /** Czy slajd jest animacją, czy zwykłym rysunkiem. */
  animated: boolean;
  /** Migająca ozdoba w rogu. */
  badge: boolean;
}

const START: Record<string, SlideState> = {
  deszcz: { duration: 0.8, animated: true, badge: false },
  kwiat: { duration: 4, animated: true, badge: false },
  polowa: { duration: 4, animated: true, badge: true },
};

/** Cały slajd wisi 8 sekund; ruch zajmuje jego pierwsze `duration` sekund. */
const SLIDE_MS = 8000;
const READ_MS = 3500;

interface Reading {
  text: string;
  /** Czy ten odczyt jest znalezieniem usterki. */
  defect: boolean;
}

/** Co pokaże dany przyrząd na danym slajdzie przy obecnych ustawieniach. */
function read(tool: Tool, slide: Slide, state: SlideState): Reading {
  const changes = sceneById(slide.scene).changes;

  if (tool === 'przewijak') {
    if (!state.animated) {
      return { text: 'Ten slajd jest zwykłym rysunkiem — przewijak nie ma tu czego przewijać.', defect: false };
    }
    if (!changes) {
      return {
        text: 'Przejechałem przez wszystkie 60 klatek i za każdym razem był dokładnie ten sam rysunek. To nie jest animacja — to rysunek, któremu ktoś kazał się ruszać.',
        defect: true,
      };
    }
    return { text: 'Klatka po klatce coś się tu zmienia — ruch ma co pokazywać.', defect: false };
  }

  if (tool === 'tempo') {
    if (!state.animated) return { text: 'Nie ma tu ruchu, więc nie ma czego przyspieszać ani zwalniać.', defect: false };
    if (state.duration < 3) {
      return {
        text: `Cały ruch przeleciał w ${String(state.duration).replace('.', ',')} s. Widz zobaczył, że coś mignęło, ale nie zdążył zobaczyć, co.`,
        defect: true,
      };
    }
    return { text: `Ruch trwa ${state.duration} s — tyle wystarczy, żeby go prześledzić.`, defect: false };
  }

  const movingThings = (state.animated ? 1 : 0) + (state.badge ? 1 : 0);
  if (movingThings >= 2) {
    return {
      text: 'Oko przeskakiwało między animacją a migającą ramką przez cały slajd i ani razu nie zatrzymało się na podpisie. Podpis został nieprzeczytany.',
      defect: true,
    };
  }
  const readTime = Math.max(0, SLIDE_MS - (state.animated ? state.duration * 1000 : 0));
  return {
    text:
      readTime >= READ_MS
        ? `Oko obejrzało ruch, a potem wróciło do podpisu — zostało mu na czytanie ${(readTime / 1000).toFixed(1).replace('.', ',')} s.`
        : 'Oko nie miało kiedy wrócić do podpisu.',
    defect: false,
  };
}

export function FixMaterial({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [states, setStates] = useState<Record<string, SlideState>>(START);
  const [active, setActive] = useState(0);
  const [tool, setTool] = useState<Tool | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [scrub, setScrub] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [eyeStep, setEyeStep] = useState(0);
  /** Przyrząd odzywa się dopiero, gdy zostanie UŻYTY — sam wybór przyrządu niczego nie mierzy. */
  const [applied, setApplied] = useState(false);
  const reported = useRef(false);

  const slide = SLIDES[active];
  const state = states[slide.id];
  const reading = tool && applied ? read(tool, slide, state) : null;
  const caught = found.includes(slide.id);
  const fixed = SLIDES.filter((item) => !read(item.defect, item, states[item.id]).defect);
  const allFixed = fixed.length === SLIDES.length && found.length === SLIDES.length;

  useEffect(() => {
    if (allFixed && !reported.current) {
      reported.current = true;
      onComplete?.();
    }
  }, [allFixed, onComplete]);

  useEffect(() => {
    if (!reading?.defect || found.includes(slide.id)) return;
    setFound((current) => [...current, slide.id]);
  }, [reading?.defect, found, slide.id]);

  /* Odtwarzanie slajdu: ruch trwa `duration`, potem obraz stoi do końca slajdu. */
  useEffect(() => {
    if (!playing) return;
    const started = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const elapsed = now - started;
      if (elapsed >= SLIDE_MS) {
        setPlaying(false);
        setT(1);
        setApplied(true);
        return;
      }
      setT(Math.min(1, elapsed / (state.duration * 1000)));
      setEyeStep(Math.floor(elapsed / 800));
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, state.duration]);

  const patch = (change: Partial<SlideState>) =>
    setStates((current) => ({ ...current, [slide.id]: { ...current[slide.id], ...change } }));

  const shownT = tool === 'przewijak' && !playing ? scrub : state.animated ? t : 0.4;
  const movingNow = playing && (state.animated || state.badge);
  const eyeOnBadge = movingNow && state.badge && (!state.animated || eyeStep % 2 === 1);

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        Ktoś zrobił materiał do przyrody i matematyki — trzy slajdy. W każdym siedzi <strong>jedna usterka</strong>,
        ale żaden slajd nie wygląda na zepsuty. Masz trzy przyrządy z tej lekcji i jedną zasadę:{' '}
        <strong>każdy przyrząd widzi tylko swoje</strong>. Znajdź usterkę tym, który jest w stanie ją zobaczyć, i tym
        samym przyrządem ją napraw.
      </p>

      <div className="mx-auto mt-4 flex w-full max-w-[480px] gap-1.5">
        {SLIDES.map((item, index) => {
          const ok = !read(item.defect, item, states[item.id]).defect && found.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActive(index);
                setTool(null);
                setPlaying(false);
                setApplied(false);
              }}
              className={cn(
                /* `min-w-0` na samym przycisku, nie tylko na napisie w środku: element
                   nie zwęzi się poniżej swojej treści, dopóki mu się tego nie pozwoli. */
                'flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 border px-2 py-1.5 text-left text-xs transition-colors',
                index === active ? 'border-2 font-semibold' : 'text-muted-foreground hover:text-foreground'
              )}
              style={index === active ? { borderColor: color } : undefined}
            >
              {ok && <Check className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden />}
              <span className="min-w-0 truncate">{item.title}</span>
            </button>
          );
        })}
      </div>

      <SceneStage className="mt-2">
        {state.animated || tool === 'przewijak' ? (
          <SceneArt scene={slide.scene} t={shownT} />
        ) : (
          <SceneArt scene={slide.scene} t={0.4} />
        )}

        {state.badge && (
          <span
            className={cn('absolute right-3 top-3 border-2 px-2 py-0.5 text-[11px] font-bold', playing && 'animate-pulse')}
            style={{ borderColor: '#d64545', color: '#d64545', backgroundColor: '#fff6f6' }}
          >
            NOWOŚĆ
          </span>
        )}

        <p
          className="absolute bottom-0 left-0 right-0 bg-white/90 px-3 py-2 text-[13px] font-medium"
          style={{ color: '#1c1917' }}
        >
          {slide.caption}
        </p>

        {playing && tool === 'oko' && (
          <span
            className="pointer-events-none absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 bg-white/50 transition-all duration-200"
            style={{
              borderColor: color,
              left: eyeOnBadge ? '84%' : movingNow ? '55%' : '50%',
              top: eyeOnBadge ? '12%' : movingNow ? '48%' : '88%',
            }}
          >
            <Eye className="h-4 w-4" style={{ color }} aria-hidden />
          </span>
        )}

        {!state.animated && (
          <span className="absolute left-3 top-3 border bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
            rysunek
          </span>
        )}
      </SceneStage>

      {/* Przybornik — pod sceną, żeby odczyt i obraz były widoczne razem. */}
      <div className="mx-auto mt-3 flex w-full max-w-[480px] flex-wrap justify-center gap-2">
        {TOOLS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTool(item.id);
              setPlaying(false);
              setApplied(false);
              setT(0);
            }}
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 border px-3 py-2 text-sm transition-colors hover:bg-muted',
              tool === item.id && 'font-semibold'
            )}
            style={tool === item.id ? { borderColor: color, color } : undefined}
          >
            <item.icon className="h-4 w-4" aria-hidden />
            {item.label}
            <span className="text-xs font-normal text-muted-foreground">{item.from}</span>
          </button>
        ))}
      </div>

      {tool && (
        <div className="mx-auto mt-3 w-full max-w-[480px] border p-3">
          {tool === 'przewijak' && !state.animated && (
            <p className="text-sm text-muted-foreground">Ten slajd jest rysunkiem — przewijak nie ma czego przewijać.</p>
          )}

          {tool === 'przewijak' && state.animated && (
            <TimeScrubber
              value={scrub}
              onChange={(value) => {
                setScrub(value);
                setApplied(true);
              }}
              color={color}
              frames={60}
              disabled={!state.animated}
            />
          )}

          {(tool === 'tempo' || tool === 'oko') && (
            <button
              type="button"
              onClick={() => {
                setT(0);
                setEyeStep(0);
                setPlaying(true);
              }}
              disabled={playing}
              className="mx-auto flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50"
              style={{ borderColor: color, color }}
            >
              <Play className="h-3.5 w-3.5" aria-hidden />
              {playing ? 'Slajd leci…' : tool === 'oko' ? 'Pokaż widzowi' : 'Odtwórz slajd'}
            </button>
          )}

          {!applied && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {tool === 'przewijak'
                ? 'Pociągnij uchwyt przez cały pasek — przyrząd powie, co zobaczył.'
                : 'Puść slajd do końca — przyrząd mierzy to, co naprawdę się wydarzyło.'}
            </p>
          )}

          {reading && (
            <p
              className={cn('mt-3 text-sm leading-relaxed', reading.defect && 'font-medium')}
              style={reading.defect ? { color } : undefined}
            >
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Odczyt przyrządu: </span>
              {reading.text}
            </p>
          )}

          {/* Naprawa robi się tym samym przyrządem, który usterkę zobaczył. */}
          {caught && reading?.defect && tool === slide.defect && (
            <div className="mt-3 border-t pt-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
                <Wrench className="h-3.5 w-3.5" aria-hidden />
                Napraw to tym samym przyrządem
              </p>
              {tool === 'tempo' && (
                <div className="flex flex-wrap gap-2">
                  {[0.8, 4, 8].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => patch({ duration: value })}
                      className={cn(
                        'cursor-pointer border px-3 py-1.5 text-sm transition-colors hover:bg-muted',
                        state.duration === value && 'font-semibold'
                      )}
                      style={state.duration === value ? { borderColor: color, color } : undefined}
                    >
                      ruch trwa {String(value).replace('.', ',')} s
                    </button>
                  ))}
                </div>
              )}
              {tool === 'przewijak' && (
                <button
                  type="button"
                  onClick={() => patch({ animated: false })}
                  className="cursor-pointer border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                  style={{ borderColor: color, color }}
                >
                  To nie animacja — zrób z tego zwykły rysunek
                </button>
              )}
              {tool === 'oko' && (
                <button
                  type="button"
                  onClick={() => patch({ badge: false })}
                  className="cursor-pointer border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                  style={{ borderColor: color, color }}
                >
                  Zdejmij migającą ramkę — podpis ma być przeczytany
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Znalezione usterki: {found.length} z {SLIDES.length} · naprawione: {fixed.length} z {SLIDES.length}
      </p>

      {allFixed && (
        <p className="mt-4 p-4 text-sm leading-relaxed" style={{ backgroundColor: `${color}12` }}>
          Trzy usterki i trzy różne przyrządy — <strong>żaden z nich sam nie wystarczył</strong>. Slajd z kwiatem
          przepuściły dwa z trzech, bo pokrętło tempa i znacznik oka w ogóle nie patrzą na to, czy w kadrze cokolwiek się
          zmienia. To jest powód, dla którego warto mieć więcej niż jedno pytanie do własnego materiału: <em>czy tu
          w ogóle coś się zmienia</em>, <em>czy da się to przeczytać w tym tempie</em> i <em>czy nie rusza się kilka
          rzeczy naraz</em>.
        </p>
      )}
    </div>
  );
}
