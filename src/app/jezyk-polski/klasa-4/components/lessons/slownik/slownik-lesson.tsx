'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BookOpen, Repeat, Shuffle } from 'lucide-react';
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
import { useZapisBloku } from '../use-zapis-bloku';
import { GrubySlownik, type Rekordy } from './gruby-slownik';
import { SlowoKameleon, type StanKameleona } from './slowo-kameleon';
import { PrzestawZnaczenie, type StanPrzestaw } from './przestaw-znaczenie';

/**
 * L10 — w słowniku. `[3.5]` `[6.1]`, filary 1 i 3. Archetyp **Gra** (§ 3a Z5),
 * świat modułu 3: pracownia słownikarza; bez dźwięku (test głośnika).
 *
 * **Zdanie lekcji: znaczenie słowa zależy od zdania, w którym stoi — a słownik
 * pomaga, jeśli umiesz w nim szukać.**
 *
 *  - `GrubySlownik` — kartkowanie kciukiem z bezwładnością, wycięcia liter,
 *    żywa pagina; trzy rundy, słownik coraz grubszy (lematy SGJP z Czytelni);
 *  - `SlowoKameleon` — numer znaczenia na zdanie + stuknięcie kotwicy (jedyny
 *    dowód w tekście w module 3);
 *  - `PrzestawZnaczenie` — wymiana słowa obok „zamku”, rysunek przeskakuje.
 *
 * Bez terminu „wyraz wieloznaczny” (poza listą `[3.10]`). Słownik kursu
 * (`data/slownik/hasla.ts`) wraca w L12.
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/slownik/pracownia.jpg',
  wzgorze: '/images/jezyk-polski/lekcje/slownik/zamek-wzgorze.jpg',
  drzwi: '/images/jezyk-polski/lekcje/slownik/zamek-drzwi.jpg',
  kurtka: '/images/jezyk-polski/lekcje/slownik/zamek-kurtka.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'slownik', kind: 'haczyk', title: 'Gruby słownik', time: '7 min', icon: BookOpen },
  { id: 'kameleon', kind: 'tekst', title: 'Słowo-kameleon', time: '7 min', icon: Shuffle },
  { id: 'przestaw', kind: 'scena', title: 'Przestaw znaczenie', time: '6 min', icon: Repeat },
];

const SCOPE = 'pol-l10';
const L7 = POL_LESSONS.find((l) => l.slug === 'emocje-i-potrzeby')!;

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function SlownikLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Słownik zostaje na pulpicie w pracowni. Wrócisz do niego, kiedy będziesz szukać słów, które razem znaczą coś innego niż osobno."
      entry={<PrzypominajkaKiedy color={polModule.color} />}
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const slownik = useBlockDone('slownik');
  const kameleon = useBlockDone('kameleon');
  const przestaw = useBlockDone('przestaw');
  const zapisRekordow = useZapisBloku<Rekordy>('slownik', slownik.done, SCOPE);
  const zapisKameleona = useZapisBloku<StanKameleona>('kameleon', kameleon.done, SCOPE);
  const zapisPrzestaw = useZapisBloku<StanPrzestaw>('przestaw', przestaw.done, SCOPE);

  return (
    <>
      <LessonIntro color={color} />
      <LessonBlock id="slownik">
        <GrubySlownik
          key={zapisRekordow.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisRekordow.restored}
          onRekordy={zapisRekordow.save}
          onComplete={slownik.markBlockDone}
        />
      </LessonBlock>
      <LessonBlock id="kameleon">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.wzgorze}
          alt="Akwarela: kamienny zamek z dwiema okrągłymi wieżami na zielonym wzgórzu nad rzeką o świcie, mgła nad wodą, ścieżka pod górę"
          lead="Jedno słowo, kilka rzeczy."
        >
          W słowniku przy niektórych słowach stoją numery: 1, 2, 3. To znaczy, że jedno słowo nazywa kilka różnych rzeczy. Którą — o
          tym decyduje zdanie.
        </LessonImageCard>
        <SlowoKameleon
          key={zapisKameleona.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisKameleona.restored}
          onState={zapisKameleona.save}
          onComplete={kameleon.markBlockDone}
        />
      </LessonBlock>
      <LessonBlock id="przestaw">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.drzwi}
          alt="Akwarela: stare drewniane drzwi piwnicy z żelaznymi okuciami, w dużym żelaznym zamku tkwi klucz, obok beczka i kamienne schody"
          reverse
          lead="Teraz odwrotnie."
        >
          Zamiast zgadywać, co znaczy słowo, sam zmień jego znaczenie. Wystarczy wymienić jedno słowo obok.
        </LessonImageCard>
        <PrzestawZnaczenie
          key={zapisPrzestaw.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisPrzestaw.restored}
          onState={zapisPrzestaw.save}
          onComplete={przestaw.markBlockDone}
        />
        {przestaw.done && (
          <div className="mt-4">
            <LessonImageCard
              variant="secondary"
              color={color}
              image={IMAGES.kurtka}
              alt="Akwarela: jesienią na podwórku przed kamienicą dziewczynka w czerwonej puchowej kurtce szarpie zacięty zamek, obok na liściach leży plecak, na schodach siedzi kot"
              lead="A ten zamek?"
            >
              Nikt nie musi ci tłumaczyć, o który zamek tu chodzi. Widzisz kurtkę — i już wiesz.
            </LessonImageCard>
          </div>
        )}
      </LessonBlock>
    </>
  );
}

/** Przypominajka z L7: oskarżenie wymienione na jeden pasek „kiedy…”. */
const PASKI = [
  { id: 'zwykle', tekst: 'kiedy jak zwykle wszystko mi zabierasz.', zle: 'Znowu oskarża: „jak zwykle” i „wszystko” mówią o całym życiu, a nie o tym, co się stało.' },
  { id: 'dobry', tekst: 'kiedy bierzesz moje kredki bez pytania.', zle: '' },
  { id: 'jestes', tekst: 'kiedy jesteś taki samolubny.', zle: '„Jesteś…” mówi, jaki ktoś jest. A pasek „kiedy…” ma powiedzieć, co się stało.' },
];
function PrzypominajkaKiedy({ color }: { color: string }) {
  const [wstawiony, setWstawiony] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const wstaw = (id: string) => {
    if (wstawiony === 'dobry') return;
    const p = PASKI.find((x) => x.id === id)!;
    setWstawiony(id);
    setMsg(id === 'dobry' ? 'Tak — teraz mówisz, co się stało, a nie, jaki ktoś jest. Dziś słowa pokażą coś jeszcze: jedno słowo potrafi znaczyć kilka rzeczy.' : p.zle);
  };
  const drag = useDragToken({ onDrop: (id, t) => t === 'luka-l7' && wstaw(id), onTap: wstaw, disabled: wstawiony === 'dobry' });
  const w = PASKI.find((x) => x.id === wstawiony);
  return (
    <Przypominajka from={L7} distance={3} color={color}>
      <p className="text-sm leading-relaxed sm:text-base">Wymień oskarżenie na pasek „kiedy…” — przeciągnij go na podkreślony kawałek albo stuknij.</p>
      <p className="mt-2 font-serif text-lg leading-loose">
        Czuję złość,{' '}
        <span
          data-drop="luka-l7"
          className="inline-block border-b-2 border-dashed px-1 leading-normal"
          style={{ borderColor: color, background: drag.hover === 'luka-l7' ? `${color}22` : undefined }}
        >
          {w ? w.tekst : 'bo zawsze zabierasz moje kredki!'}
        </span>
      </p>
      {wstawiony !== 'dobry' && (
        <div className="mt-2 flex flex-wrap gap-2">
          {PASKI.filter((x) => x.id !== wstawiony).map((x) => (
            <button key={x.id} type="button" {...drag.bind(x.id)} className="touch-none border bg-white px-3 py-1.5 text-left text-sm dark:bg-zinc-900">
              {x.tekst}
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 min-h-[2.5rem] text-sm" aria-live="polite">
        {msg}
      </p>
      <DragGhost drag={drag.drag}>
        {drag.drag && <span className="block border bg-white px-3 py-1.5 text-sm">{PASKI.find((x) => x.id === drag.drag!.id)?.tekst}</span>}
      </DragGhost>
    </Przypominajka>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>Witaj w pracowni słownikarza. Na pulpicie leży gruby słownik, w szufladach czekają słowa.</p>
        <p className="mt-3">
          Najpierw poszukasz haseł na czas, potem sprawdzisz, co robi słowo, które ma kilka znaczeń. Wszystko stoi na jednym zdaniu:{' '}
          <strong>znaczenie słowa zależy od zdania, w którym stoi — a słownik pomaga, jeśli umiesz w nim szukać.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: pracownia na strychu — na drewnianym pulpicie leży gruby otwarty słownik z pustymi stronami, obok szafka z wieloma szufladkami, mosiężna lampa, stos książek i lupa"
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
