'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { BookHeart, CalendarDays, Gauge, UtensilsCrossed } from 'lucide-react';
import {
  LessonBlock,
  POL_BLOCK_KINDS,
  PolLessonShell,
  useBlockDone,
  type PolBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import type { PolModule } from '../../../data/curriculum';
import type { PolLesson } from '../../../data/lessons';
import { byCloseness, type PlateId } from './degustacja';
import { OPENINGS } from './otwarcia';
import { SlepaDegustacja } from './slepa-degustacja';
import { DlaczegoTa, type Wybor } from './dlaczego-ta';
import { PlanCzytania } from './plan-czytania';
import { PierwszeWrazenie } from './pierwsze-wrazenie';

/**
 * L2 — ja, czytelnik. `[7.1]` `[7.2]` `[7.3]` `[5.4]`, filary 5 i 3.
 *
 * **Zdanie lekcji: książkę wybiera się jak buty — przymierzając.**
 *
 *  - `SlepaDegustacja` — **talerz przysuwany do siebie albo odsuwany**: sześć
 *    otwarć z Czytelni bez tytułów, odsłonięcie i gust wyczytany z ruchów;
 *  - `DlaczegoTa` — para stuknięć z L1 w nowej roli: zdanie z otwarcia + powód;
 *  - `PlanCzytania` — **odcinki-żetony rozkładane na dni**, książka staje na
 *    Półce z planem;
 *  - `PierwszeWrazenie` — pierwszy odcinek w czytniku Czytelni i **wskazówka
 *    „wciągacza”** + uczucie; zdanie od siebie do Teczki.
 *
 * Stan między blokami (odległości talerzy, odsłonięcie, wybór) trzyma
 * `sessionStorage` — odświeżenie strony nie gubi wybranej książki.
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/ja-czytelnik/kacik-czytania.jpg',
  stol: '/images/jezyk-polski/lekcje/ja-czytelnik/stol-degustacja.jpg',
  czytanie: '/images/jezyk-polski/lekcje/ja-czytelnik/czytanie.jpg',
  polka: '/images/jezyk-polski/lekcje/ja-czytelnik/polka.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'degustacja', kind: 'haczyk', title: 'Ślepa degustacja', time: '8 min', icon: UtensilsCrossed },
  { id: 'dlaczego', kind: 'tekst', title: 'Dlaczego ta?', time: '3 min', icon: BookHeart },
  { id: 'plan', kind: 'cwiczenie', title: 'Plan czytania', time: '4 min', icon: CalendarDays },
  { id: 'wrazenie', kind: 'refleksja', title: 'Pierwsze wrażenie', time: '10 min', icon: Gauge },
];

const STATE_KEY = 'dociekai:pol-l2';

interface L2State {
  dist: Record<string, number>;
  revealed: boolean;
  chosen: Wybor | null;
}

const EMPTY: L2State = { dist: {}, revealed: false, chosen: null };

function readState(): L2State {
  try {
    const raw = window.sessionStorage.getItem(STATE_KEY);
    if (!raw) return EMPTY;
    const v = JSON.parse(raw) as Partial<L2State>;
    const chosen = v.chosen && v.chosen.book in OPENINGS ? v.chosen : null;
    return { dist: v.dist ?? {}, revealed: !!v.revealed, chosen };
  } catch {
    return EMPTY;
  }
}

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function JaCzytelnikLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Twoja półka ma pierwszą książkę — wybraną przez ciebie."
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const degustacja = useBlockDone('degustacja');
  const dlaczego = useBlockDone('dlaczego');
  const plan = useBlockDone('plan');
  const wrazenie = useBlockDone('wrazenie');

  const [state, setState] = useState<L2State>(EMPTY);
  useEffect(() => setState(readState()), []);
  const patch = useCallback((p: Partial<L2State>) => {
    setState((s) => {
      const next = { ...s, ...p };
      try {
        window.sessionStorage.setItem(STATE_KEY, JSON.stringify(next));
      } catch {
        /* prywatne okno */
      }
      return next;
    });
  }, []);

  const order = useMemo(() => byCloseness(state.dist), [state.dist]);
  const top: [PlateId, PlateId] = [order[0], order[1]];
  const chosenBook = state.chosen ? OPENINGS[state.chosen.book].book : null;
  const secondBook = state.chosen ? OPENINGS[state.chosen.book === order[0] ? order[1] : order[0]].book : null;

  const { markBlockDone: degustacjaDone } = degustacja;
  const { markBlockDone: dlaczegoDone } = dlaczego;

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="degustacja">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.stol}
          alt="Akwarela: długi stół nakryty białym obrusem w jasnej jadalni, na nim w rzędzie sześć talerzy pod srebrnymi kloszami, przy każdym złożona serwetka i sztućce; za stołem krzesła i okno z zasłonami"
          lead="Książkę wybiera się jak buty — przymierzając."
        >
          Dziś spróbujesz sześciu książek, zanim dowiesz się, jak się nazywają. Okładka i tytuł nie podpowiedzą.
        </LessonImageCard>
        <SlepaDegustacja
          color={color}
          dist={state.dist}
          onDist={(dist) => patch({ dist })}
          revealed={state.revealed}
          onReveal={() => {
            patch({ revealed: true });
            degustacjaDone();
          }}
        />
      </LessonBlock>

      <LessonBlock id="dlaczego">
        {state.revealed ? (
          <DlaczegoTa
            color={color}
            top={top}
            chosen={state.chosen}
            onChosen={(w) => {
              patch({ chosen: w });
              dlaczegoDone();
            }}
          />
        ) : (
          <Waiting text="Najpierw odsłoń talerze w bloku 1." />
        )}
      </LessonBlock>

      <LessonBlock id="plan">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.polka}
          alt="Akwarela: drewniana półka na jasnej ścianie w smudze słońca, stoi na niej tylko jedna książka w zielonej okładce bez napisów, dalej dużo wolnego miejsca, na końcu doniczka z pnącą roślinką"
          reverse
          lead="Półka czytelnika jest jeszcze pusta."
        >
          Za chwilę stanie na niej twoja pierwsza książka — razem z planem, kiedy ją przeczytasz.
        </LessonImageCard>
        {chosenBook ? (
          <PlanCzytania key={chosenBook.id} color={color} book={chosenBook} onComplete={plan.markBlockDone} />
        ) : (
          <Waiting text="Najpierw wybierz książkę w bloku 2." />
        )}
      </LessonBlock>

      <LessonBlock id="wrazenie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.czytanie}
          alt="Akwarela: piegowata dziewczynka z kasztanowym warkoczem, w miętowej bluzie i czerwonych trampkach, siedzi po turecku w zielonym fotelu z grubą książką na kolanach i prowadzi papierową zakładkę wzdłuż linijki tekstu; obok w koszyku śpi kot, na stoliku świeci lampka"
          lead="Pierwszy odcinek: zacznij czytać."
        >
          Na dziś wystarczy pierwsza część. Przy trudnych zdaniach pomogą linijka, większe litery i sylaby, a zakładka zapamięta miejsce.
        </LessonImageCard>
        {chosenBook && secondBook ? (
          <PierwszeWrazenie key={chosenBook.id} color={color} book={chosenBook} second={secondBook} onComplete={wrazenie.markBlockDone} />
        ) : (
          <Waiting text="Najpierw wybierz książkę w bloku 2." />
        )}
      </LessonBlock>
    </>
  );
}

function Waiting({ text }: { text: string }) {
  return <p className="border border-dashed bg-white p-4 text-sm text-muted-foreground dark:bg-zinc-900/80">{text}</p>;
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          W kursie jest Czytelnia: książki, które możesz czytać albo słuchać tutaj, odcinek po odcinku. Ale którą wybrać?
          Nikt nie wie lepiej od ciebie.
        </p>
        <p className="mt-3">
          Dziś spróbujesz sześciu początków bez tytułów, wybierzesz jedną książkę, rozłożysz ją na dni i przeczytasz
          pierwszy odcinek. Wszystko stoi na jednym zdaniu: <strong>książkę wybiera się jak buty — przymierzając.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: przytulny kącik do czytania — zielony fotel z dzierganym kocem i poduszką, zapalona stojąca lampa, stos zamkniętych książek bez napisów na grzbietach, okno z koronkową firanką i doniczką, za oknem kamienice"
            width={260}
            height={195}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>
        <div className="lg:hidden">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan tej lekcji</p>
          <ol className="space-y-2">
            {BLOCKS.map((block, index) => (
              <li key={block.id} className="flex items-start gap-3">
                <span className="w-5 shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 text-sm leading-snug">
                  <span className="block font-medium">{POL_BLOCK_KINDS[block.kind].label}</span>
                  <span className="block text-xs text-muted-foreground">{block.time}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
