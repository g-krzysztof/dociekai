'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Library, MessageCircle, Scissors, Stamp } from 'lucide-react';
import { LessonBlock, POL_BLOCK_KINDS, PolLessonShell, Przypominajka, useBlockDone, type PolBlockMeta } from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { POL_LESSONS, type PolLesson } from '../../../data/lessons';
import type { PolModule } from '../../../data/curriculum';
import { useZapisBloku } from '../use-zapis-bloku';
import { ROTA_ROLES } from '../mazurek-i-rota/pieczec';
import { PeknieCzyWytrzyma, type StanProb } from './peknie-czy-wytrzyma';
import { DwiePolki, type StanPolek } from './dwie-polki';
import { ZuziaSlucha, type StanZuzi } from './zuzia-slucha';
import type { Dziennik } from './zwroty';

/**
 * L12 — słowa w parze. `[3.7]` `[3.6]` `[3.5]` `[3.10]` (związek
 * frazeologiczny), filary 1 i 2. Archetyp **Śledztwo** (§ 3a Z5), świat
 * modułu 3: pracownia słownikarza (Zuzia w odwiedzinach); bez dźwięku.
 *
 * **Zdanie lekcji: niektóre słowa w parze znaczą coś zupełnie innego niż
 * każde osobno.**
 *
 *  - `PeknieCzyWytrzyma` — nożyczki po linii wokół słowa, wklejenie
 *    bliskoznacznego z szufladki; zwrot wytrzymuje albo pęka (dziennik prób);
 *  - `DwiePolki` — paski na półki według dziennika dziecka (termin
 *    „związek frazeologiczny”);
 *  - `ZuziaSlucha` — dosłowna chmurka Zuzi przemalowana objaśnieniem ze
 *    słownika z L10 (jedyna „postać reaguje” w module 3).
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/frazeologizmy/nozyczki.jpg',
  polki: '/images/jezyk-polski/lekcje/frazeologizmy/polki.jpg',
  babcia: '/images/jezyk-polski/lekcje/frazeologizmy/babcia-zuzia.jpg',
  dziadek: '/images/jezyk-polski/lekcje/frazeologizmy/dziadek-biegnie.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'nozyczki', kind: 'haczyk', title: 'Pęknie czy wytrzyma?', time: '8 min', icon: Scissors },
  { id: 'polki', kind: 'odkrycie', title: 'Dwie półki', time: '4 min', icon: Library },
  { id: 'zuzia', kind: 'scena', title: 'Zuzia słucha babci', time: '8 min', icon: MessageCircle },
];

const SCOPE = 'pol-l12';
const L9 = POL_LESSONS.find((l) => l.slug === 'mazurek-i-rota')!;

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function FrazeologizmyLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Dwie półki ze zwrotami zostają w pracowni. Następny moduł przenosi cię na wyspę, na której jeszcze nic nie ma — słowa będą ją zapełniać."
      entry={<PrzypominajkaPieczec color={polModule.color} />}
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const nozyczki = useBlockDone('nozyczki');
  const polki = useBlockDone('polki');
  const zuzia = useBlockDone('zuzia');
  const zapisProb = useZapisBloku<StanProb>('nozyczki', nozyczki.done, SCOPE);
  const zapisPolek = useZapisBloku<StanPolek>('polki', polki.done, SCOPE);
  const zapisZuzi = useZapisBloku<StanZuzi>('zuzia', zuzia.done, SCOPE);
  // Dziennik żyje w lekcji: blok 2 odkłada paski według prób z bloku 1.
  const [dziennik, setDziennik] = useState<Dziennik | null>(null);
  const dziennikTeraz = dziennik ?? zapisProb.restored?.dziennik ?? {};

  return (
    <>
      <LessonIntro color={color} />
      <LessonBlock id="nozyczki">
        <PeknieCzyWytrzyma
          key={zapisProb.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisProb.restored}
          onState={(s) => {
            setDziennik(s.dziennik);
            zapisProb.save(s);
          }}
          onComplete={nozyczki.markBlockDone}
        />
      </LessonBlock>
      <LessonBlock id="polki">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.polki}
          alt="Akwarela: dwie drewniane półki na bielonej ścianie strychu, na każdej zwinięte paski papieru przewiązane sznurkiem, obok okno i dzbanek z pędzlami"
          lead="Każdy pasek ma swoje miejsce."
        >
          Słownikarz trzyma sprawdzone zwroty na dwóch półkach. Co leży na której — mówi tylko twój dziennik śledztwa.
        </LessonImageCard>
        <DwiePolki
          key={zapisPolek.restored ? 'zapis' : 'nowe'}
          color={color}
          dziennik={dziennikTeraz}
          initial={zapisPolek.restored}
          onState={zapisPolek.save}
          onComplete={polki.markBlockDone}
        />
      </LessonBlock>
      <LessonBlock id="zuzia">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.babcia}
          alt="Akwarela: babcia w granatowej sukience i beżowej chuście opowiada coś z uniesioną dłonią, obok na kanapie siedzi mała Zuzia w żółtym płaszczyku i czerwonych kaloszach i patrzy na nią z zachwytem, za oknem śnieg"
          reverse
          lead="Zuzia wpadła do pracowni z babcią."
        >
          Babcia opowiada o dziadku, a Zuzia ma pięć lat i wszystko rozumie dosłownie. Pomóż jej słownikiem.
        </LessonImageCard>
        <ZuziaSlucha
          key={zapisZuzi.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisZuzi.restored}
          onState={zapisZuzi.save}
          onComplete={zuzia.markBlockDone}
        />
        {zuzia.done && (
          <div className="relative mx-auto mt-4 aspect-[4/3] w-full max-w-md overflow-hidden border">
            <Image
              src={IMAGES.dziadek}
              alt="Akwarela: starszy pan z siwym wąsem, w czapce i kurtce, biegnie ze śmiechem przez zaśnieżony park z drewnianym karmnikiem pod pachą, za nim radośnie pędzi duży kudłaty pies"
              width={448}
              height={336}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </LessonBlock>
    </>
  );
}

/** Przypominajka z L9: przyłóż pieczęć do wersu-obietnicy — bez werdyktu. */
const WERSY = [
  { id: 'v2', tekst: 'Polski my naród, polski lud,' },
  { id: 'v0', tekst: 'Nie rzucim ziemi, skąd nasz ród.' },
  { id: 'v5', tekst: 'Tak nam dopomóż Bóg!' },
];
function PrzypominajkaPieczec({ color }: { color: string }) {
  const [wers, setWers] = useState<string | null>(null);
  const info = wers ? ROTA_ROLES[wers] : null;
  return (
    <Przypominajka from={L9} distance={3} color={color}>
      <p className="text-sm leading-relaxed sm:text-base">Przyłóż pieczęć do wersu „Roty”, który obiecuje.</p>
      <div className="mt-2 flex flex-col gap-1.5">
        {WERSY.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setWers(w.id)}
            className="flex items-center gap-2 border px-3 py-1.5 text-left font-serif text-sm sm:text-base"
            style={wers === w.id ? { borderColor: color, background: `${color}18` } : undefined}
          >
            <Stamp className="h-4 w-4 shrink-0" style={{ color: wers === w.id ? color : undefined }} aria-hidden />
            {w.tekst}
          </button>
        ))}
      </div>
      <p className="mt-2 min-h-[3rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {info && (info.role === 'obietnica' ? <>Lak trzyma. Po dzisiejszemu: {info.today} Dziś też zobaczysz słowa, które trzymają się razem.</> : info.does)}
      </p>
    </Przypominajka>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>Na stole słownikarza leżą nożyczki, klej i paski papieru. Na każdym pasku — zdanie.</p>
        <p className="mt-3">
          Wytniesz z nich słowa, wkleisz inne o tym samym znaczeniu i sprawdzisz, co wytrzyma. Wszystko stoi na jednym zdaniu:{' '}
          <strong>niektóre słowa w parze znaczą coś zupełnie innego niż każde osobno.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: drewniany stół na strychu, na nim mosiężne nożyczki, długie paski czystego papieru, dwa przecięte paski i słoiczek kleju z pędzlem, światło z okna w skosie dachu"
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
