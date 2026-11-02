'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Eye, Play, Square, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SCENES, SceneArt, SceneStage, TimeScrubber, sceneById } from './scene';
import {
  MAX_CAPTION_WORDS,
  SCENE_COUNT,
  TOPICS,
  emptyMaterial,
  judgeMaterial,
  words,
  type Criterion,
  type StudioScene,
  type Topic,
} from './material-judge';

/**
 * Blok 5 — zadanie praktyczne, **w całości wykonywane tutaj**.
 *
 * Wymaganie `[3.5]` mówi wprost: *przygotowuje materiały multimedialne, łącząc
 * tekst, obraz i proste animacje, także wspomagające naukę innych przedmiotów*.
 * Stąd trzy tematy do wyboru i wszystkie trzy są z innych przedmiotów —
 * materiał ma komuś pomóc się czegoś nauczyć, a nie być ładny.
 *
 * Zadanie nie wychodzi poza stronę (decyzja z 2026-09-19, ta sama co w lekcji
 * o prezentacji): dziesięciolatek gubi się nie na materiale, tylko na wyborze
 * programu i na „Zapisz jako”, a zadanie z lekcji o animacji zamieniłoby się
 * w zadanie o menu cudzego narzędzia.
 *
 * Trzy etapy zostają, bo są dobre: **zlecenie** z jawną listą tego, czego będę
 * szukać, **warsztat** i **odbiór** punkt po punkcie, z darmowymi poprawkami.
 * Nagrodą jest coś, czego dziecko nie zobaczy w żadnym prawdziwym programie:
 * **jego własny materiał obejrzany przyrządami z tej lekcji** — znacznikiem oka
 * i przewijakiem. Klamra: te same narzędzia, którymi w bloku 4 rozbierało cudzą
 * pracę, dostaje teraz wycelowane we własną.
 */

const HOLD_MS = 3000;

export function MediaStudio({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [scenes, setScenes] = useState<StudioScene[]>(emptyMaterial);
  const [active, setActive] = useState(0);
  const [verdicts, setVerdicts] = useState<Criterion[] | null>(null);
  const reported = useRef(false);

  const accepted = verdicts !== null && verdicts.every((verdict) => verdict.ok);
  const scene = scenes[active];

  useEffect(() => {
    if (accepted && !reported.current) {
      reported.current = true;
      onComplete?.();
    }
  }, [accepted, onComplete]);

  const edit = (patch: Partial<StudioScene>) =>
    setScenes((current) => current.map((item, index) => (index === active ? { ...item, ...patch } : item)));

  return (
    <div className="border bg-white dark:bg-zinc-900/80">
      <Stage number="01" label="Zlecenie" color={color}>
        <p className="text-sm leading-relaxed sm:text-base">
          Zrób <strong>materiał na trzy sceny</strong>, z którego ktoś młodszy od ciebie naprawdę czegoś się nauczy.
          Najpierw jedna decyzja, od której zależy wszystko inne: <strong>na jakie pytanie ten materiał odpowiada</strong>.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {TOPICS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTopic(item)}
              className={cn(
                'cursor-pointer border px-3 py-1.5 text-sm transition-colors',
                topic?.id === item.id ? 'font-semibold' : 'text-muted-foreground hover:text-foreground'
              )}
              style={topic?.id === item.id ? { borderColor: color, color } : undefined}
            >
              {item.question}
              <span className="ml-1.5 text-xs font-normal">({item.subject})</span>
            </button>
          ))}
        </div>

        {topic && (
          <p className="mt-2 text-sm leading-relaxed" style={{ color }}>
            {topic.hint}
          </p>
        )}

        {topic && !accepted && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Czego będę szukać w twoim materiale
            </p>
            <CriteriaList color={color} criteria={verdicts ?? judgeMaterial(topic, emptyMaterial())} showResult={verdicts !== null} />
          </div>
        )}
      </Stage>

      <Stage number="02" label="Twoje trzy sceny" color={color}>
        {!topic ? (
          <p className="text-sm text-muted-foreground">Najpierw wybierz pytanie — od niego zależy każda scena.</p>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              {scenes.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActive(index)}
                  className={cn(
                    'cursor-pointer border px-2.5 py-1 text-xs tabular-nums transition-colors',
                    index === active ? 'font-semibold' : 'text-muted-foreground hover:text-foreground'
                  )}
                  style={index === active ? { borderColor: color, color } : undefined}
                >
                  scena {index + 1}
                </button>
              ))}
            </div>

            <ScenePreview scene={scene} color={color} />

            <div className="mx-auto mt-3 w-full max-w-[480px] space-y-3">
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Obrazek</p>
                <div className="flex flex-wrap gap-1.5">
                  {SCENES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => edit({ picture: item.id })}
                      title={item.name}
                      className={cn(
                        'relative h-12 w-16 cursor-pointer overflow-hidden border bg-white transition-opacity',
                        scene.picture === item.id ? 'border-2' : 'opacity-70 hover:opacity-100'
                      )}
                      style={scene.picture === item.id ? { borderColor: color } : undefined}
                      aria-label={item.name}
                    >
                      <SceneArt scene={item.id} t={0.4} />
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{sceneById(scene.picture).name}</p>
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Podpis</span>
                <input
                  value={scene.caption}
                  onChange={(event) => edit({ caption: event.target.value })}
                  className="mt-1 w-full border bg-transparent px-3 py-2 text-sm outline-none focus:border-current"
                  style={{ caretColor: color }}
                  placeholder="napisz, czego na obrazku nie widać"
                />
                <span className="mt-1 block text-xs tabular-nums text-muted-foreground">
                  {words(scene.caption).length} / {MAX_CAPTION_WORDS} wyrazów
                </span>
              </label>

              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ruch</p>
                <div className="flex flex-wrap gap-1.5">
                  <Toggle color={color} on={!scene.moving} onClick={() => edit({ moving: false })}>
                    zwykły rysunek
                  </Toggle>
                  <Toggle color={color} on={scene.moving} onClick={() => edit({ moving: true })}>
                    animacja
                  </Toggle>
                </div>
                {scene.moving && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {[2, 5, 8].map((value) => (
                      <Toggle
                        key={value}
                        color={color}
                        on={scene.duration === value}
                        onClick={() => edit({ duration: value })}
                      >
                        ruch trwa {value} s
                      </Toggle>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ozdoba</p>
                <Toggle color={color} on={scene.badge} onClick={() => edit({ badge: !scene.badge })}>
                  migająca ramka „NOWOŚĆ” w rogu
                </Toggle>
              </div>
            </div>
          </>
        )}
      </Stage>

      <Stage number="03" label="Odbiór" color={color} last>
        {!topic ? (
          <p className="text-sm text-muted-foreground">Najpierw zlecenie.</p>
        ) : accepted ? (
          <>
            <p className="text-sm leading-relaxed sm:text-base">
              <strong>Przyjęte — wszystkie siedem punktów.</strong> Twój materiał odpowiada na pytanie „{topic.question}”
              i da się go obejrzeć do końca. Zobacz go teraz <strong>tymi samymi przyrządami</strong>, którymi w
              poprzednim bloku rozbierałeś/rozbierałaś cudzą pracę.
            </p>
            <MaterialPlayer scenes={scenes} color={color} />
          </>
        ) : (
          <>
            <p className="text-sm leading-relaxed">
              Kiedy skończysz trzy sceny, oddaj materiał. <strong>Poprawki są za darmo</strong> — liczy się ostatnia
              wersja.
            </p>
            <button
              type="button"
              onClick={() => setVerdicts(judgeMaterial(topic, scenes))}
              className="mt-3 cursor-pointer border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
              style={{ borderColor: color, color }}
            >
              Oddaj materiał
            </button>
            {verdicts && (
              <div className="mt-4">
                <CriteriaList color={color} criteria={verdicts} showResult />
              </div>
            )}
          </>
        )}
      </Stage>
    </div>
  );
}

function Toggle({
  children,
  on,
  onClick,
  color,
}: {
  children: ReactNode;
  on: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'cursor-pointer border px-2.5 py-1 text-xs transition-colors',
        on ? 'font-semibold' : 'text-muted-foreground hover:text-foreground'
      )}
      style={on ? { borderColor: color, color } : undefined}
    >
      {children}
    </button>
  );
}

/** Podgląd jednej sceny w trakcie pracy — animacja chodzi w kółko, żeby było widać, co się robi. */
function ScenePreview({ scene, color }: { scene: StudioScene; color: string }) {
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!scene.moving) {
      setT(0.4);
      return;
    }
    const started = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      setT(((now - started) / (scene.duration * 1000)) % 1);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [scene.moving, scene.duration, scene.picture]);

  return (
    <SceneStage>
      <SceneArt scene={scene.picture} t={t} />
      {scene.badge && (
        <span
          className="absolute right-3 top-3 animate-pulse border-2 px-2 py-0.5 text-[11px] font-bold"
          style={{ borderColor: '#d64545', color: '#d64545', backgroundColor: '#fff6f6' }}
        >
          NOWOŚĆ
        </span>
      )}
      {scene.caption.trim() && (
        <p
          className="absolute bottom-0 left-0 right-0 bg-white/90 px-3 py-2 text-[13px] font-medium"
          style={{ color: '#1c1917' }}
        >
          {scene.caption}
        </p>
      )}
      <span className="absolute left-3 top-3 border bg-white px-2 py-0.5 text-[11px] font-semibold" style={{ color }}>
        {scene.moving ? 'animacja' : 'rysunek'}
      </span>
    </SceneStage>
  );
}

/**
 * Nagroda: materiał dziecka puszczony w całości ze znacznikiem oka, a pod nim
 * przewijak na wybranej scenie. To nie jest ozdobnik — to są dokładnie te dwa
 * przyrządy, którymi lekcja mierzyła cudze materiały, wycelowane teraz w jego
 * własny.
 */
function MaterialPlayer({ scenes, color }: { scenes: StudioScene[]; color: string }) {
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [t, setT] = useState(0);
  const [scrub, setScrub] = useState(0);

  const lengths = scenes.map((scene) => (scene.moving ? scene.duration * 1000 : 0) + HOLD_MS);

  useEffect(() => {
    if (!playing) return;
    const started = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      let elapsed = now - started;
      let position = 0;
      while (position < scenes.length && elapsed > lengths[position]) {
        elapsed -= lengths[position];
        position += 1;
      }
      if (position >= scenes.length) {
        setPlaying(false);
        return;
      }
      const scene = scenes[position];
      setIndex(position);
      setT(scene.moving ? Math.min(1, elapsed / (scene.duration * 1000)) : 0.4);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
    /* `lengths` liczy się z `scenes`, a te po przyjęciu pracy już się nie zmieniają. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, scenes]);

  const scene = scenes[index];
  const shown = playing ? t : scene.moving ? scrub : 0.4;
  /* Oko siedzi na ruchu, dopóki ruch trwa; potem wraca do podpisu. */
  const eyeOnMotion = playing && scene.moving && t < 1;

  return (
    <div className="mt-4">
      <SceneStage>
        <SceneArt scene={scene.picture} t={shown} />
        {scene.badge && (
          <span
            className="absolute right-3 top-3 animate-pulse border-2 px-2 py-0.5 text-[11px] font-bold"
            style={{ borderColor: '#d64545', color: '#d64545', backgroundColor: '#fff6f6' }}
          >
            NOWOŚĆ
          </span>
        )}
        <p
          className="absolute bottom-0 left-0 right-0 bg-white/90 px-3 py-2 text-[13px] font-medium"
          style={{ color: '#1c1917' }}
        >
          {scene.caption}
        </p>
        {playing && (
          <span
            className="pointer-events-none absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 bg-white/50 transition-all duration-200"
            style={{
              borderColor: color,
              left: eyeOnMotion ? '55%' : '50%',
              top: eyeOnMotion ? '48%' : '88%',
            }}
          >
            <Eye className="h-4 w-4" style={{ color }} aria-hidden />
          </span>
        )}
        <span
          className="absolute left-3 top-3 border bg-white px-2 py-0.5 text-[11px] font-semibold tabular-nums"
          style={{ color }}
        >
          scena {index + 1} z {SCENE_COUNT}
        </span>
      </SceneStage>

      <div className="mx-auto mt-3 flex w-full max-w-[480px] flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setT(0);
            setPlaying(true);
          }}
          disabled={playing}
          className="inline-flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50"
          style={{ borderColor: color, color }}
        >
          <Play className="h-4 w-4" aria-hidden />
          Odtwórz mój materiał
        </button>
        {playing && (
          <button
            type="button"
            onClick={() => setPlaying(false)}
            className="inline-flex cursor-pointer items-center gap-1.5 border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <Square className="h-3.5 w-3.5" aria-hidden />
            Zatrzymaj
          </button>
        )}
        {!playing &&
          scenes.map((_, position) => (
            <button
              key={position}
              type="button"
              onClick={() => setIndex(position)}
              className={cn(
                'cursor-pointer border px-2.5 py-1 text-xs tabular-nums transition-colors',
                index === position ? 'font-semibold' : 'text-muted-foreground hover:text-foreground'
              )}
              style={index === position ? { borderColor: color, color } : undefined}
            >
              {position + 1}
            </button>
          ))}
      </div>

      {!playing && scene.moving && (
        <div className="mx-auto mt-3 w-full max-w-[480px]">
          <p className="mb-1 text-xs text-muted-foreground">
            Przewijak na twojej animacji — przejedź ją klatka po klatce i sprawdź, czy naprawdę coś się w niej zmienia.
          </p>
          <TimeScrubber value={scrub} onChange={setScrub} color={color} frames={60} />
        </div>
      )}
    </div>
  );
}

function CriteriaList({
  criteria,
  color,
  showResult,
}: {
  criteria: Criterion[];
  color: string;
  showResult: boolean;
}) {
  return (
    <ul className="mt-2 space-y-1.5">
      {criteria.map((criterion) => (
        <li key={criterion.id} className="flex items-start gap-2 text-sm leading-snug">
          <span
            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-white"
            style={{ backgroundColor: showResult ? (criterion.ok ? color : '#a1a1aa') : '#d4d4d8' }}
            aria-hidden
          >
            {showResult ? (
              criterion.ok ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )
            ) : null}
          </span>
          <span>
            {criterion.label}
            {showResult && <span className="block text-xs text-muted-foreground">{criterion.detail}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Etap zadania — ta sama typografia numerów co w `ProofTask` i w studiu prezentacji. */
function Stage({
  number,
  label,
  color,
  children,
  last,
}: {
  number: string;
  label: string;
  color: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <section className={cn('p-5 sm:p-6', !last && 'border-b')}>
      <div className="mb-3 flex items-baseline gap-3">
        <span className="font-mono text-lg font-bold tabular-nums" style={{ color }}>
          {number}
        </span>
        <h3 className="text-base font-bold">{label}</h3>
      </div>
      {children}
    </section>
  );
}
