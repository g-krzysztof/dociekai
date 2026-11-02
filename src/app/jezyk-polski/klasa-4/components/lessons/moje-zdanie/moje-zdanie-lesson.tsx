'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Flag, MapPin, PenLine, Shuffle } from 'lucide-react';
import {
  LessonBlock,
  POL_BLOCK_KINDS,
  PolLessonShell,
  Przypominajka,
  useBlockDone,
  type PolBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { POL_LESSONS, type PolLesson } from '../../../data/lessons';
import type { PolModule } from '../../../data/curriculum';
import type { Strona } from './argumenty';
import { Zebranie, type Flaga } from './zebranie';
import { Dlaczego } from './dlaczego';
import { MojPowod } from './moj-powod';
import { DrugaStrona } from './druga-strona';

/**
 * L6 — moje zdanie. `[1.6]` `[4.4]`, filary 4 i 2.
 *
 * **Zdanie lekcji: zdanie bez „bo” to tylko upór.**
 *
 *  - `Zebranie` — **chorągiewka wbita w plan podwórka**; bez powodu się chwieje;
 *  - `Dlaczego` — **karta-argument rzucona panu Bogdanowi**: łapie, przypina
 *    pod cudzą chorągiewką albo odbija (`argumenty.ts`, talie lustrzane);
 *  - `MojPowod` — zdanie z „bo” w Pisarni, sędzia struktury, Teczka;
 *  - `DrugaStrona` — **staje na planie** gdziekolwiek, z argumentem przy sobie.
 *
 * Nie waga (to L20 historii) — tu fizyka to rzut i odbicie.
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/moje-zdanie/podworko-trzepak.jpg',
  zebranie: '/images/jezyk-polski/lekcje/moje-zdanie/zebranie.jpg',
  grzadka: '/images/jezyk-polski/lekcje/moje-zdanie/grzadka.jpg',
  bramki: '/images/jezyk-polski/lekcje/moje-zdanie/bramki.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'zebranie', kind: 'haczyk', title: 'Zebranie na podwórku', time: '3 min', icon: Flag },
  { id: 'dlaczego', kind: 'rozmowa', title: 'Dlaczego?', time: '6 min', icon: Shuffle },
  { id: 'powod', kind: 'zadanie', title: 'Mój powód', time: '6 min', icon: PenLine },
  { id: 'druga', kind: 'dylemat', title: 'Druga strona', time: '4 min', icon: MapPin },
];

const STATE_KEY = 'dociekai:pol-l6';
const L5 = POL_LESSONS.find((l) => l.slug === 'slucham-uwaznie')!;

interface L6State {
  flaga: Flaga | null;
  przypiete: Record<Strona, string[]>;
  zdanie: string | null;
}
const EMPTY: L6State = { flaga: null, przypiete: { ogrodek: [], boisko: [] }, zdanie: null };

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function MojeZdanieLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Twoja chorągiewka już się nie chwieje — stoi na powodzie. A druga strona też miała swoje racje."
      entry={<PrzypominajkaSer color={polModule.color} />}
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const zebranie = useBlockDone('zebranie');
  const dlaczego = useBlockDone('dlaczego');
  const powod = useBlockDone('powod');
  const druga = useBlockDone('druga');
  const [st, setSt] = useState<L6State>(EMPTY);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STATE_KEY);
      if (raw) setSt(JSON.parse(raw) as L6State);
    } catch {
      /* prywatne okno */
    }
  }, []);
  const patch = useCallback((p: (s: L6State) => L6State) => {
    setSt((cur) => {
      const next = p(cur);
      try {
        window.sessionStorage.setItem(STATE_KEY, JSON.stringify(next));
      } catch {
        /* prywatne okno */
      }
      return next;
    });
  }, []);

  const { markBlockDone: zebranieDone } = zebranie;
  const { markBlockDone: powodDone } = powod;
  const onFlaga = useCallback(
    (f: Flaga) => {
      // Nowa chorągiewka po drugiej stronie — talia i przypięte zaczynają się od nowa.
      patch((s) => (s.flaga?.strona === f.strona ? { ...s, flaga: f } : { ...EMPTY, flaga: f }));
      zebranieDone();
    },
    [patch, zebranieDone]
  );
  const onPrzypnij = useCallback((s: Strona, id: string) => patch((cur) => ({ ...cur, przypiete: { ...cur.przypiete, [s]: [...cur.przypiete[s], id] } })), [patch]);
  const onZdanie = useCallback(
    (z: string) => {
      patch((s) => ({ ...s, zdanie: z }));
      powodDone();
    },
    [patch, powodDone]
  );

  const czekaj = (t: string) => <p className="border border-dashed bg-white p-4 text-sm text-muted-foreground dark:bg-zinc-900/80">{t}</p>;

  return (
    <>
      <LessonIntro color={color} />
      <LessonBlock id="zebranie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zebranie}
          alt="Akwarela: zebranie lokatorów na podwórku kamienicy — kilkoro dorosłych i dzieci stoi w kręgu, widzianych z daleka"
          lead="Zebranie lokatorów."
        >
          Na podwórku jest wolny plac. Kamienica musi zdecydować: ogródek czy boisko?
        </LessonImageCard>
        <Zebranie color={color} flaga={st.flaga} onFlaga={onFlaga} />
      </LessonBlock>
      <LessonBlock id="dlaczego">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.grzadka}
          alt="Akwarela: drewniana skrzynia-grządka z krzakami pomidorów"
          reverse
          lead="Pan Bogdan zbiera argumenty."
        >
          Rzucaj mu karty. Niektóre to powody — a niektóre tylko tak wyglądają.
        </LessonImageCard>
        {st.flaga ? (
          <Dlaczego key={st.flaga.strona} color={color} strona={st.flaga.strona} przypiete={st.przypiete} onPrzypnij={onPrzypnij} onComplete={dlaczego.markBlockDone} />
        ) : (
          czekaj('Najpierw wbij chorągiewkę w bloku 1.')
        )}
      </LessonBlock>
      <LessonBlock id="powod">
        {st.flaga ? <MojPowod color={color} strona={st.flaga.strona} onAccepted={onZdanie} /> : czekaj('Najpierw wbij chorągiewkę w bloku 1.')}
      </LessonBlock>
      <LessonBlock id="druga">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.bramki}
          alt="Akwarela: dwie bramki z kamieni na udeptanej trawie podwórka"
          lead="Wszystkie powody leżą na stole."
        >
          Teraz zdecyduj jeszcze raz — tym razem z powodami obu stron w głowie.
        </LessonImageCard>
        {st.flaga ? (
          <DrugaStrona color={color} flaga={st.flaga} przypiete={st.przypiete} mojeZdanie={st.zdanie} onComplete={druga.markBlockDone} />
        ) : (
          czekaj('Najpierw wbij chorągiewkę w bloku 1.')
        )}
      </LessonBlock>
    </>
  );
}

/** Przypominajka z L5: o którą rzecz trzeba dopytać? Stuknij ją w wiadomości. */
const KAWALKI = ['Kup chleb razowy,', 'dwa litry mleka', 'i ser, ten co zawsze.'];
function PrzypominajkaSer({ color }: { color: string }) {
  const [pick, setPick] = useState<number | null>(null);
  return (
    <Przypominajka from={L5} distance={1} color={color}>
      <p className="text-sm leading-relaxed sm:text-base">O którą rzecz z tej wiadomości trzeba dopytać? Stuknij ją.</p>
      <p className="mt-2 flex flex-wrap gap-1.5">
        {KAWALKI.map((k, i) => (
          <button key={i} type="button" onClick={() => setPick(i)} className="border px-2 py-1 text-sm" style={{ borderColor: pick === i ? color : undefined }}>
            {k}
          </button>
        ))}
      </p>
      <p className="mt-2 min-h-[2.5rem] text-sm" aria-live="polite">
        {pick === null ? '' : pick === 2 ? '„Ten co zawsze” wie tylko pani Halina — o to się pyta. Dziś będziesz pytać „dlaczego?”.' : 'To jest powiedziane wprost — nie trzeba dopytywać.'}
      </p>
    </Przypominajka>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>Każdy może powiedzieć, czego chce. Ale kiedy kilka osób chce czego innego, wygrywa nie ten, kto krzyczy najgłośniej.</p>
        <p className="mt-3">
          Dziś wybierzesz stronę w sporze o podwórko, sprawdzisz, które argumenty są powodami, napiszesz własny — i jeszcze raz
          staniesz po którejś stronie. Wszystko stoi na jednym zdaniu: <strong>zdanie bez „bo” to tylko upór.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: podwórko kamienicy z trzepakiem i pustym placem w jesiennym świetle"
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
