'use client';

import { useState } from 'react';
import { ArrowRight, Backpack, Check, PackageOpen, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import {
  CAPSULE_ITEMS,
  TO_PACK,
  itemById,
  optionText,
  packReady,
  prophecyFor,
  prophecyReport,
  scenesFor,
} from './kapsula';

/**
 * Blok 1 — **„Kapsuła czasu”** (haczyk).
 *
 * Gest nowy w kursie: **dziecko pakuje kapsułę czasu, zgaduje odczyt
 * archeologa, potem patrzy, jak scena w roku 3026 toczy się bez niego**.
 * Najpierw stuka 5 z 6 rzeczy z plecaka, potem przy dwóch przedmiotach
 * przewiduje słowa archeologa (zwykle trafia — bo zna kontekst), a na końcu
 * krok po kroku ogląda jego żartobliwie błędne odczyty. Puenta: przedmiot
 * bez kontekstu łatwo źle zrozumieć (F-I.2-02, F-I.2-03; filary 1 i 4).
 *
 * Archeolog jest podpisany jako postać wymyślona (filar 5).
 */
export function KapsulaCzasu({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [phase, setPhase] = useState<'pack' | 'prophecy' | 'dig' | 'done'>('pack');
  const [packed, setPacked] = useState<string[]>([]);
  const [picks, setPicks] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      {phase === 'pack' && (
        <Packing color={color} packed={packed} setPacked={setPacked} onDone={() => setPhase('prophecy')} />
      )}
      {phase === 'prophecy' && (
        <Prophecy color={color} packed={packed} picks={picks} setPicks={setPicks} onDone={() => setPhase('dig')} />
      )}
      {(phase === 'dig' || phase === 'done') && (
        <Digging
          color={color}
          packed={packed}
          picks={picks}
          finished={phase === 'done'}
          onDone={() => setPhase('done')}
          onComplete={onComplete}
        />
      )}
    </div>
  );
}

const things = (n: number) => `${n} ${plural(n, { one: 'rzecz', few: 'rzeczy', many: 'rzeczy' })}`;

// ─── Pakowanie ───

function Packing({
  color,
  packed,
  setPacked,
  onDone,
}: {
  color: string;
  packed: string[];
  setPacked: (next: string[]) => void;
  onDone: () => void;
}) {
  /** Rzecz, której nie dało się włożyć, bo kapsuła była pełna. */
  const [blocked, setBlocked] = useState<string | null>(null);
  const ready = packReady(packed);
  const missing = TO_PACK - packed.length;

  const toggle = (id: string) => {
    if (packed.includes(id)) {
      setPacked(packed.filter((p) => p !== id));
      setBlocked(null);
      return;
    }
    if (packed.length >= TO_PACK) {
      setBlocked(id);
      return;
    }
    setPacked([...packed, id]);
    setBlocked(null);
  };

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed">
        Wyobraź sobie: zakopujesz dziś pod szkołą <strong>kapsułę czasu</strong> — metalową puszkę, którą ktoś otworzy
        za tysiąc lat. Zmieści się w niej <strong>{things(TO_PACK)}</strong>. Wybierz z plecaka te, które opowiedzą
        przyszłym ludziom o tobie — jedna musi zostać.
      </p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Rzeczy z plecaka">
        {CAPSULE_ITEMS.map((item) => {
          const on = packed.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(item.id)}
              className={cn(
                'border px-3 py-2 text-sm transition-colors',
                on ? 'font-semibold text-white' : 'bg-white hover:bg-muted dark:bg-zinc-900'
              )}
              style={on ? { backgroundColor: color, borderColor: color } : undefined}
            >
              {on && <Check className="mr-1 inline h-3.5 w-3.5" aria-hidden />}
              {item.name}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex min-h-[3rem] flex-1 items-center gap-2 border-2 border-dashed px-3 py-2 text-sm"
          style={{ borderColor: color }}
          aria-live="polite"
        >
          <Backpack className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
          {packed.length === 0 ? (
            <span className="text-muted-foreground">Pusta kapsuła. Stuknij rzeczy z plecaka.</span>
          ) : (
            <span>
              <span className="tabular-nums">
                W kapsule ({packed.length} z {TO_PACK}):
              </span>{' '}
              <strong>{packed.map((id) => itemById(id).name).join(', ')}</strong>
              {ready ? '. Kapsuła pełna!' : `. Dodaj jeszcze ${things(missing)}.`}
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={!ready}
          onClick={onDone}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          Zakop kapsułę <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {blocked && (
        <p className="text-sm font-medium text-destructive" aria-live="polite">
          Kapsuła jest pełna — mieści {things(TO_PACK)}. Żeby włożyć „{itemById(blocked).name}”, najpierw wyjmij
          inną rzecz (stuknij ją jeszcze raz).
        </p>
      )}
    </div>
  );
}

// ─── Przewidywanie ───

function Prophecy({
  color,
  packed,
  picks,
  setPicks,
  onDone,
}: {
  color: string;
  packed: string[];
  picks: Record<string, string>;
  setPicks: (next: Record<string, string>) => void;
  onDone: () => void;
}) {
  const prophecies = prophecyFor(packed);
  const done = prophecies.every((p) => picks[p.itemId]);

  return (
    <div className="space-y-5">
      <p className="text-base leading-relaxed">
        Kapsuła zakopana. Przewińmy czas o tysiąc lat: <strong>rok 3026</strong>, archeolog otwiera twoją puszkę.
        Nie zna sklepów, autobusów ani sprawdzianów. Zgadnij, co powie o dwóch rzeczach z twojej kapsuły.
      </p>
      {prophecies.map((prophecy) => (
        <fieldset key={prophecy.itemId} className="space-y-2 border p-4">
          <legend className="px-1 text-sm font-semibold">
            {itemById(prophecy.itemId).name} <span className="font-normal text-muted-foreground">— {itemById(prophecy.itemId).today}</span>
          </legend>
          <p className="text-sm leading-relaxed">{prophecy.question}</p>
          <div className="flex flex-wrap gap-2">
            {prophecy.options.map((option) => {
              const on = picks[prophecy.itemId] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPicks({ ...picks, [prophecy.itemId]: option.id })}
                  className={cn(
                    'border px-3 py-2 text-sm transition-colors',
                    on ? 'font-semibold text-white' : 'bg-white hover:bg-muted dark:bg-zinc-900'
                  )}
                  style={on ? { backgroundColor: color, borderColor: color } : undefined}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        disabled={!done}
        onClick={onDone}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        style={{ backgroundColor: color }}
      >
        Otwórz kapsułę w roku 3026 <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

// ─── Wykop w 3026 ───

function Digging({
  color,
  packed,
  picks,
  finished,
  onDone,
  onComplete,
}: {
  color: string;
  packed: string[];
  picks: Record<string, string>;
  finished: boolean;
  onDone: () => void;
  onComplete: () => void;
}) {
  const scenes = scenesFor(packed);
  const [seen, setSeen] = useState(0);
  const allSeen = seen >= scenes.length;

  const next = () => {
    const nextSeen = seen + 1;
    setSeen(nextSeen);
    if (nextSeen >= scenes.length && !finished) {
      onDone();
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      <p className="flex items-start gap-2 bg-muted p-3 text-sm leading-relaxed">
        <PackageOpen className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
        <span>
          <strong>Rok 3026.</strong> Archeolog wyciąga twoją kapsułę z ziemi i ogląda po kolei wszystko, co do niej
          włożyłeś/łaś. Poniżej jego słowa — <strong>postać wymyślona</strong>: tak mógł pomyśleć ktoś, kto nie zna
          twojego świata.
        </span>
      </p>
      <ol className="space-y-3">
        {scenes.slice(0, seen + (allSeen ? 0 : 1)).map((scene, index) => {
          const revealed = index < seen;
          const pick = picks[scene.itemId];
          const pickText = pick ? optionText(scene.itemId, pick) : null;
          return (
            <li key={scene.itemId} className="border p-4">
              <p className="text-sm font-semibold">{itemById(scene.itemId).name}</p>
              {revealed ? (
                <blockquote className="mt-2 space-y-1 text-sm leading-relaxed">
                  <Quote className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  <span>{scene.says}</span>
                  <footer className="text-xs text-muted-foreground">— archeolog z roku 3026 (postać wymyślona)</footer>
                  {pickText && (
                    <p className="pt-1 text-xs">
                      Twoje przewidywanie: <strong>{pickText.charAt(0).toLowerCase() + pickText.slice(1)}</strong>.
                    </p>
                  )}
                </blockquote>
              ) : (
                <button
                  type="button"
                  onClick={next}
                  className="mt-2 inline-flex items-center gap-1.5 border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Posłuchaj, co o tym mówi <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              )}
            </li>
          );
        })}
      </ol>
      {finished && <Verdict color={color} packed={packed} picks={picks} />}
    </div>
  );
}

function Verdict({ color, packed, picks }: { color: string; packed: string[]; picks: Record<string, string> }) {
  const [first, second] = scenesFor(packed);
  const truths = `${first.truth.charAt(0).toUpperCase()}${first.truth.slice(1)}, a ${second.truth}`;
  return (
    <div className="space-y-2 border-2 p-4" style={{ borderColor: color }}>
      <p className="text-base leading-relaxed">
        <strong>{truths} — ty to wiesz, bo żyjesz dziś.</strong> Archeolog za tysiąc lat nie będzie miał twojej
        wiedzy. Dlatego każdy przedmiot, który zostawia człowiek, może opowiedzieć o przeszłości —{' '}
        <strong>ale dopiero razem z informacją, skąd się wziął</strong>.
      </p>
      <ProphecyEcho picks={picks} />
    </div>
  );
}

/** Echo przewidywania — mówi, jak dziecko naprawdę zgadywało. */
function ProphecyEcho({ picks }: { picks: Record<string, string> }) {
  const { withContext, likeArchaeologist } = prophecyReport(picks);
  const text =
    likeArchaeologist === 0
      ? 'Przy zgadywaniu wybierałeś/łaś odpowiedzi „z dziś” — bo masz kontekst. Archeolog go nie ma i dlatego się myli.'
      : withContext === 0
        ? 'Przy zgadywaniu za każdym razem trafiłeś/łaś, co powie archeolog — umiesz pomyśleć jak ktoś, kto nie zna twojego świata.'
        : 'Raz wybrałeś/łaś odpowiedź „z dziś”, raz tę archeologa. Obie drogi prowadzą do tego samego wniosku: bez kontekstu przedmiot łatwo źle odczytać.';
  return <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>;
}
