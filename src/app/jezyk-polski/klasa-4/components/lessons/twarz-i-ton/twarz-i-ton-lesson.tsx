'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Clapperboard, PenLine, Smile } from 'lucide-react';
import {
  DragGhost,
  LessonBlock,
  POL_BLOCK_KINDS,
  PolLessonShell,
  Przypominajka,
  useBlockDone,
  useDragToken,
  type PolBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { POL_LESSONS, type PolLesson } from '../../../data/lessons';
import type { PolModule } from '../../../data/curriculum';
import { NoPieknie } from './no-pieknie';
import { NiemyFilm } from './niemy-film';
import { BezTwarzy } from './bez-twarzy';

/**
 * L4 — twarz i ton. `[1.7]` `[5.5]` `[1.1]`, filary 2 i 4.
 *
 * **Zdanie lekcji: twarz i ton potrafią odwrócić znaczenie słów — a kiedy
 * piszesz, nie masz ani jednego, ani drugiego.**
 *
 *  - `NoPieknie` — **twarz lepiona trzema suwakami** + trzy nagrania tonu przy
 *    tych samych słowach; Zuzia mówi, co zrozumiała (`ton.ts`);
 *  - `NiemyFilm` — **zatrzymanie niemego filmu** w chwili zmiany ciała, potem
 *    „Nic mi nie jest.” i dowód z klatki (`film.ts`);
 *  - `BezTwarzy` — pierwsze swobodne pisanie w Pisarni, paleta uczuć
 *    (`data/uczucia.ts`), Ola pokazuje twarzą, co wyczytała (`odpowiedz.ts`).
 *
 * Twarze rysuje kod (`components/twarz/`, wypromowane z L3).
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/twarz-i-ton/tecza.jpg',
  sok: '/images/jezyk-polski/lekcje/twarz-i-ton/sok-dywan.jpg',
  podworko: '/images/jezyk-polski/lekcje/twarz-i-ton/podworko-bramka.jpg',
  szczeniak: '/images/jezyk-polski/lekcje/twarz-i-ton/szczeniak.jpg',
});

const ALT_TECZA =
  'Akwarela: tęcza nad rzeką z kamiennym mostem i miasteczkiem z wieżą kościoła; z boku jasna kamienica, w otwartym oknie na piętrze z daleka widać dziewczynkę z warkoczem w miętowej bluzie, patrzącą na tęczę';
const ALT_SOK =
  'Akwarela: przewrócona szklanka leży na jasnym puszystym dywanie, wylewa się z niej duża żółtopomarańczowa plama soku; w tle kanapa, regał z książkami i stolik';

const BLOCKS: PolBlockMeta[] = [
  { id: 'pieknie', kind: 'haczyk', title: '„No pięknie.”', time: '6 min', icon: Smile },
  { id: 'film', kind: 'cwiczenie', title: 'Niemy film', time: '6 min', icon: Clapperboard },
  { id: 'bez-twarzy', kind: 'zadanie', title: 'Bez twarzy', time: '8 min', icon: PenLine },
];

const L3 = POL_LESSONS.find((l) => l.slug === 'do-kogo-mowie')!;

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function TwarzITonLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Twarz i ton zostały na podwórku. W wiadomości do Oli pracowały same słowa — i Ola zrozumiała."
      entry={<PrzypominajkaNaloz color={polModule.color} />}
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const pieknie = useBlockDone('pieknie');
  const film = useBlockDone('film');
  const bez = useBlockDone('bez-twarzy');
  const [sytuacja, setSytuacja] = useState<'tecza' | 'sok'>('tecza');
  return (
    <>
      <LessonIntro color={color} />
      <LessonBlock id="pieknie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={sytuacja === 'sok' ? IMAGES.sok : IMAGES.intro}
          alt={sytuacja === 'sok' ? ALT_SOK : ALT_TECZA}
          lead="Dwa słowa, dwa zupełnie różne znaczenia."
        >
          „No pięknie” mówi się nad tęczą i nad rozlanym sokiem. Skąd słuchacz wie, o co chodzi?
        </LessonImageCard>
        <NoPieknie color={color} onComplete={pieknie.markBlockDone} onSytuacja={setSytuacja} />
      </LessonBlock>
      <LessonBlock id="film">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.podworko}
          alt="Akwarela: brukowane podwórko starej kamienicy z cegły, na bruku dwa plecaki ustawione jak bramka, piłka leży pod murem przy rynnie"
          reverse
          lead="Mecz na podwórku się skończył. Drużyna Tymka przegrała 2 : 5."
        >
          Tymek wraca do domu. Najpierw obejrzysz to bez dźwięku — samo ciało też coś mówi.
        </LessonImageCard>
        <NiemyFilm color={color} onComplete={film.markBlockDone} />
      </LessonBlock>
      <LessonBlock id="bez-twarzy">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.szczeniak}
          alt="Akwarela: mały biało-brązowy kudłaty szczeniak wygląda z kartonowego pudła stojącego na kamiennym progu przed drewnianymi drzwiami"
          lead="Ola ma nowinę."
        >
          Napisała do ciebie. Ty też odpiszesz — ale ona nie zobaczy twojej twarzy.
        </LessonImageCard>
        <BezTwarzy color={color} onComplete={bez.markBlockDone} />
      </LessonBlock>
    </>
  );
}

/** Przypominajka z L3: nałóż jedną kartkę na drugą — co wystaje? */
const KARTA_A = ['Cześć!', 'Oddasz', 'mi', 'piłkę?'];
const KARTA_B = ['Dzień', 'dobry!', 'Czy', 'odda', 'mi', 'Pani', 'piłkę?'];

function PrzypominajkaNaloz({ color }: { color: string }) {
  const [on, setOn] = useState(false);
  const drag = useDragToken({ disabled: on, onDrop: (_i, t) => t === 'pr-b' && setOn(true), onTap: () => setOn(true) });
  const inA = new Set(KARTA_A.map((w) => w.toLowerCase()));
  return (
    <Przypominajka from={L3} distance={1} color={color}>
      <p className="text-sm leading-relaxed sm:text-base">Połóż kartkę do Tymka na kartkę do pani Haliny. Które słowa wystają?</p>
      <div className="mt-3 flex flex-wrap items-start gap-3">
        {!on && (
          <button type="button" {...drag.bind('pr-a')} className="cursor-grab touch-none border-2 bg-amber-50 px-3 py-2 text-sm dark:bg-zinc-800" style={{ borderColor: '#f08a3c' }}>
            {KARTA_A.join(' ')}
          </button>
        )}
        <div data-drop="pr-b" className="flex flex-wrap gap-1 border-2 px-3 py-2 text-sm" style={{ borderColor: drag.hover === 'pr-b' ? color : '#b7a3d6' }}>
          {KARTA_B.map((w, i) => {
            const sticks = on && !inA.has(w.toLowerCase());
            return (
              <span key={i} className="px-0.5" style={sticks ? { transform: 'translateY(-4px)', boxShadow: `0 3px 0 ${color}`, display: 'inline-block' } : { opacity: on ? 0.5 : 1 }}>
                {w}
              </span>
            );
          })}
        </div>
      </div>
      <p className="mt-2 min-h-[2.75rem] text-sm leading-snug" aria-live="polite">
        {on ? 'Wystają „Dzień dobry”, „Czy”, „odda”, „Pani” — słowa grzeczności. Dziś zobaczysz, że w rozmowie grzeczność niesie też twarz i głos.' : ''}
      </p>
      <DragGhost drag={drag.drag}>
        <span className="block border-2 bg-amber-50 px-3 py-2 text-sm" style={{ borderColor: '#f08a3c' }}>
          {KARTA_A.join(' ')}
        </span>
      </DragGhost>
    </Przypominajka>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>Kiedy rozmawiasz z kimś twarzą w twarz, mówią nie tylko słowa. Mówi mina, głos, ręce, cała postawa.</p>
        <p className="mt-3">
          Dziś ulepisz twarz do dwóch słów, złapiesz w niemym filmie chwilę, w której ciało mówi swoje, i napiszesz do Oli
          tak, żeby zrozumiała cię bez twarzy. Wszystko stoi na jednym zdaniu:{' '}
          <strong>twarz i ton potrafią odwrócić znaczenie słów — a kiedy piszesz, nie masz ani jednego, ani drugiego.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt={ALT_TECZA}
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
