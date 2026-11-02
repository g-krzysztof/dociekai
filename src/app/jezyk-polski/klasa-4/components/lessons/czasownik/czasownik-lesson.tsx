'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CalendarClock, NotebookPen, Users } from 'lucide-react';
import { LessonBlock, POL_BLOCK_KINDS, PolLessonShell, Przypominajka, useBlockDone, type PolBlockMeta } from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { POL_LESSONS, type PolLesson } from '../../../data/lessons';
import type { PolModule } from '../../../data/curriculum';
import { useWyspa } from '../../../lib/wyspa/use-wyspa';
import { useZapisBloku } from '../use-zapis-bloku';
import { coWHasle } from '../frazeologizmy/zwroty';
import { OsDnia, type StanOsi } from './os-dnia';
import { KtoToRobi, type StanOsob } from './kto-to-robi';
import { PlanNaJutro } from './plan-na-jutro';

/**
 * L15 — czasownik niesie czas. `[3.1]` `[3.10]` (czasownik, osoba, liczba,
 * czas; bezokolicznik) `[4.7]`, filary 1 i 2. Archetyp **Maszyna** (§ 3a
 * Z5), świat modułu 4: wyspa (nazwa z L14) — jeden dzień; bez dźwięku.
 *
 * **Zdanie lekcji: czasownik niesie czas — przestaw go, a cała historia
 * przeniesie się do wczoraj albo jutra.**
 *
 *  - `OsDnia` — żeton dnia na osi, czasowniki-bagaż dorzucane do zdań;
 *  - `KtoToRobi` — figurki osób na podeście (osoba, liczba, bezokolicznik);
 *  - `PlanNaJutro` — Pisarnia z werdyktem (czas przyszły z form SGJP), Teczka.
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/czasownik/swit.jpg',
  wieczor: '/images/jezyk-polski/lekcje/czasownik/wieczor.jpg',
  buty: '/images/jezyk-polski/lekcje/czasownik/pomost-buty.jpg',
  pomost: '/images/jezyk-polski/lekcje/czasownik/dziewczynka-pomost.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'os', kind: 'scena', title: 'Wczoraj, dziś, jutro', time: '7 min', icon: CalendarClock },
  { id: 'osoby', kind: 'odkrycie', title: 'Kto to robi?', time: '6 min', icon: Users },
  { id: 'plan', kind: 'zadanie', title: 'Plan na jutro', time: '8 min', icon: NotebookPen },
];

const SCOPE = 'pol-l15';
const L12 = POL_LESSONS.find((l) => l.slug === 'frazeologizmy')!;

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function CzasownikLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Plan na jutro wisi na słupie wyspy i leży w Teczce. W następnej lekcji na wyspę wrócą słowa z kosza — „zielony”, „szybko”, „wysoki” — i zacznie się wyścig."
      entry={<PrzypominajkaSlownik color={polModule.color} />}
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const os = useBlockDone('os');
  const osoby = useBlockDone('osoby');
  const plan = useBlockDone('plan');
  const zapisOsi = useZapisBloku<StanOsi>('os', os.done, SCOPE);
  const zapisOsob = useZapisBloku<StanOsob>('osoby', osoby.done, SCOPE);
  const { wyspa } = useWyspa();

  return (
    <>
      <LessonIntro color={color} wyspa={wyspa.nazwa} />
      <LessonBlock id="os">
        <OsDnia
          key={zapisOsi.restored ? 'zapis' : 'nowe'}
          color={color}
          obraz={IMAGES.intro}
          wyspa={wyspa.nazwa}
          initial={zapisOsi.restored}
          onState={zapisOsi.save}
          onComplete={os.markBlockDone}
        />
        {os.done && (
          <div className="relative mx-auto mt-4 aspect-[4/3] w-full max-w-md overflow-hidden border">
            <Image
              src={IMAGES.wieczor}
              alt="Akwarela: wieczór nad zatoką — łódka kołysze się na spokojnej wodzie, na skałach świeci biała latarnia, niebo granatowe i liliowe"
              width={448}
              height={336}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </LessonBlock>
      <LessonBlock id="osoby">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.buty}
          alt="Akwarela: drewniany pomost nad morzem, na deskach w rzędzie stoją buty różnej wielkości — od małych kaloszy po duże trzewiki"
          lead="Kto dziś płynie?"
        >
          Na pomoście stoi rząd butów, małych i dużych. Każde zdanie z czasownikiem ma kogoś, kto to robi — i czasownik od razu wie, kto to.
        </LessonImageCard>
        <KtoToRobi
          key={zapisOsob.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisOsob.restored}
          onState={zapisOsob.save}
          onComplete={osoby.markBlockDone}
        />
      </LessonBlock>
      <LessonBlock id="plan">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.pomost}
          alt="Akwarela: dziewczynka z jasnobrązowym warkoczem siedzi tyłem na końcu pomostu i macha bosymi nogami nad wodą, obok słomkowy kapelusz, w oddali wysepka i żaglówka"
          reverse
          lead="A jutro?"
        >
          Jutro na wyspie może się zdarzyć wszystko, co zaplanujesz. Plan zawiśnie na słupie przy pomoście.
        </LessonImageCard>
        <PlanNaJutro color={color} wyspa={wyspa.nazwa} onComplete={plan.markBlockDone} />
      </LessonBlock>
    </>
  );
}

/** Przypominajka z L12: zwrot w słowniku stoi pod jednym ze swoich słów — bez werdyktu. */
function PrzypominajkaSlownik({ color }: { color: string }) {
  const [haslo, setHaslo] = useState<string | null>(null);
  const c = haslo ? coWHasle(haslo, 'kamien-z-serca') : null;
  return (
    <Przypominajka from={L12} distance={3} color={color}>
      <p className="text-sm leading-relaxed sm:text-base">Gdzie w słowniku szukać zwrotu „kamień spadł komuś z serca”?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {['serce', 'kamień'].map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => setHaslo(h)}
            className="border px-3 py-1.5 font-serif text-sm"
            style={haslo === h ? { borderColor: color, background: `${color}18` } : undefined}
          >
            hasło „{h}”
          </button>
        ))}
      </div>
      <p className="mt-2 min-h-[3rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {c === 'jest' && 'Jest — za znakiem ◊. Dziś słowa znów będą zmieniać kształt, tym razem razem z czasem.'}
        {c === 'pod-innym' && 'Pod „serce” tego zwrotu nie ma — stoi pod innym swoim słowem. Spróbuj drugiego.'}
      </p>
    </Przypominajka>
  );
}

function LessonIntro({ color, wyspa }: { color: string; wyspa?: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Na wyspie{wyspa ? ` ${wyspa}` : ''} wstaje dzień. Rybak naprawia łódkę, koza skubie trawę, a ktoś prowadzi dziennik wyspy.
        </p>
        <p className="mt-3">
          Przesuniesz ten dzień do wczoraj i do jutra, postawisz figurki na pomoście i zaplanujesz jutro. Wszystko stoi na jednym zdaniu:{' '}
          <strong>czasownik niesie czas — przestaw go, a cała historia przeniesie się do wczoraj albo jutra.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: o świcie siwy rybak naprawia młotkiem odwróconą łódkę na plaży wyspy, za nim na wydmie pasie się biała koza, różowe niebo i słońce nad morzem"
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
