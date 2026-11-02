'use client';

import Image from 'next/image';
import { Archive, MessageCircleQuestion, TreeDeciduous, Users } from 'lucide-react';
import {
  HIST_BLOCK_KINDS,
  HistLessonShell,
  LessonBlock,
  useBlockDone,
  type HistBlockMeta,
} from '../../lesson-shell';
import { Przypominajka } from '../../przypominajka';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { FamilyTree } from '../../family-tree/family-tree';
import { StryjCzyWuj } from './stryj-czy-wuj';
import { KuferPamiatek } from './kufer-pamiatek';
import { PrzepytajDomownika } from './przepytaj-domownika';
import { RodzinneBramki } from './rodzinne-bramki';
import { LISIECCY, LISIECCY_TIER_LABELS } from './rodzina-lisieckich';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L5 — historia mojej rodziny. `[2.1 — kultura]`, cel 1, filary 1 i 4.
 *
 * **Zdanie lekcji: twoja rodzina też ma źródła — trzeba tylko wiedzieć, kogo
 * zapytać i na co patrzeć.**
 *
 * Cztery bloki, gesty nowe w kursie:
 *
 *  - `StryjCzyWuj` — **przenosi tabliczki z nazwami** (stryj, wuj, ciotka…) na osoby
 *    ze zdjęcia według tego, co każda mówi o sobie;
 *  - `FamilyTree` (silnik `family-tree`, pierwszy konsument) — **sadza osoby na
 *    piętrach drzewa** z lat i tropów; gdy dwie osoby się kłócą, drzewo trzeszczy;
 *  - `KuferPamiatek` — **lupa** (drugi konsument `source-desk`) nad czterema
 *    przedmiotami pradziadka, rok z napisu na kartę muzealną, opowieść ułożona
 *    od najdawniejszej z lat odczytanych przez dziecko;
 *  - `PrzepytajDomownika` — trzy pytania do wywiadu, werdykt z **budowy zestawu**,
 *    karta wywiadu jako nagroda i dobrowolne lata rodzinne na osi.
 *
 * Przypominajka wraca do „Dwóch bramek” z L2 (dystans 3). Prywatność: nic z bloku 4
 * nie opuszcza urządzenia.
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/historia-mojej-rodziny/dziadek-opowiada.jpg',
  drzewo: '/images/historia/lekcje/historia-mojej-rodziny/drzewo.jpg',
  kufer: '/images/historia/lekcje/historia-mojej-rodziny/kufer.jpg',
  obiad: '/images/historia/lekcje/historia-mojej-rodziny/rodzinny-obiad.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'stryj', kind: 'haczyk', title: 'Stryj czy wuj?', time: '4 min', icon: Users },
  { id: 'drzewo', kind: 'symulator', title: 'Drzewo rodziny Lisieckich', time: '7 min', icon: TreeDeciduous },
  { id: 'kufer', kind: 'zrodlo', title: 'Kufer pamiątek', time: '8 min', icon: Archive },
  { id: 'wywiad', kind: 'zadanie', title: 'Przepytaj domownika', time: '6 min', icon: MessageCircleQuestion },
];

const L2_LESSON = getLesson('warsztat-historyka', 'zrodla-historyczne');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function HistoriaMojejRodzinyLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Rozpoznałeś/łaś krewnych po tym, co mówią, posadziłeś/łaś rodzinę Lisieckich na drzewie, przeczytałeś/łaś lupą cztery rzeczy z kufra pradziadka i ułożyłeś/łaś z nich jego historię, a potem przygotowałeś/łaś wywiad z kimś bliskim. Twoja rodzina ma źródła — wiesz już, kogo zapytać i na co patrzeć."
      entry={
        L2_LESSON ? (
          <Przypominajka from={L2_LESSON} distance={3} color={histModule.color}>
            <RodzinneBramki color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const stryj = useBlockDone('stryj');
  const drzewo = useBlockDone('drzewo');
  const kufer = useBlockDone('kufer');
  const wywiad = useBlockDone('wywiad');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="stryj">
        <p className="mb-4 text-base leading-relaxed">
          Zanim zajrzymy do kufra, wyjaśnijmy sobie słowa. Na zdjęciu rodzinnym stoi Franek i sześcioro krewnych — każde
          mówi, kim jest dla Franka.
        </p>
        <StryjCzyWuj color={color} onComplete={stryj.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="drzewo">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.drzewo}
          alt="Akwarela: rozłożyste stare drzewo z grubym pniem, mocnymi konarami i gęstą koroną liści, w ciepłym świetle poranka; u stóp drzewa miękka trawa"
          lead="Najstarsi przy pniu, najmłodsi w koronie."
        >
          Rodzinę rysuje się jako drzewo. Pień to najstarsze pokolenie, korona — najmłodsze. Posadź rodzinę Lisieckich —
          każdy z nich zostawił w domu trop: kartkę z datą, podpis na zdjęciu, metrykę.
        </LessonImageCard>
        <div className="mt-4">
          <FamilyTree
            color={color}
            people={LISIECCY}
            tierLabels={LISIECCY_TIER_LABELS}
            onComplete={drzewo.markBlockDone}
          />
        </div>
      </LessonBlock>

      <LessonBlock id="kufer">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kufer}
          alt="Akwarela: otwarty drewniany kufer na strychu, a w nim zegarek kieszonkowy na łańcuszku, pożółkłe zdjęcia, medal na wstążce i list w kopercie; w tle smuga światła z małego okienka"
          reverse
          lead="W kufrze pradziadka leżą cztery rzeczy."
        >
          Pamiątki rodzinne to źródła — takie same, jak te z poprzednich lekcji. Przeczytaj je lupą, wypełnij karty
          muzealne i zobacz, co z nich wynika.
        </LessonImageCard>
        <div className="mt-4">
          <KuferPamiatek color={color} onComplete={kufer.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="wywiad">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.obiad}
          alt="Akwarela: rodzinny obiad świąteczny widziany z boku — przy długim stole siedzą osoby w różnym wieku, na stole wazon, półmiski i świeczka, ktoś opowiada, a pozostali słuchają"
          lead="Najlepsze źródło siedzi przy stole."
        >
          Nie wszystko jest w kufrze. Wiele rodzinnych historii żyje tylko w opowieściach — dawniej przekazywano je
          ustnie z pokolenia na pokolenie. Czas zapytać.
        </LessonImageCard>
        <div className="mt-4">
          <PrzepytajDomownika color={color} onComplete={wywiad.markBlockDone} />
        </div>
      </LessonBlock>
    </>
  );
}

/**
 * Wejście w lekcję: pytanie, na które odpowiada, i plan bloków dla ekranów bez
 * bocznej szyny. Bez numeru — nie jest blokiem, więc nie liczy się do postępu.
 */
function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Historia nie dzieje się tylko w zamkach i na polach bitew. Dzieje się też w twoim domu. <strong>Rodzina</strong>{' '}
          to osoby połączone więzami krwi albo wspólnym domem — a każda ma swoją opowieść. Rodziny bywają różne: duże,
          małe, z babciami, z ciociami, z opiekunami. Dla historyka liczy się jedno — że ktoś coś pamięta albo zostawił.
        </p>
        <p className="mt-3">
          Dziś rozpoznasz krewnych po tym, co mówią, posadzisz rodzinę na drzewie, przeczytasz lupą rzeczy z kufra i
          przygotujesz wywiad z kimś bliskim. Wszystko stoi na jednym zdaniu:{' '}
          <strong>twoja rodzina też ma źródła — trzeba tylko wiedzieć, kogo zapytać i na co patrzeć.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: chłopiec około dziewięciu lat siedzi w drewnianym warsztacie na niskim stołku i słucha starszego mężczyzny, który pokazuje mu mały stary zegarek; wokół narzędzia na ścianie i smuga światła z okna"
            width={260}
            height={195}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>

        {/* Plan tej lekcji — dla ekranów bez bocznej szyny; powyżej `lg` szyna go dubluje. */}
        <div className="lg:hidden">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan tej lekcji</p>
          <ol className="space-y-2">
            {BLOCKS.map((block, index) => (
              <li key={block.id} className="flex items-start gap-3">
                <span className="w-5 shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 text-sm leading-snug">
                  <span className="block font-medium">{HIST_BLOCK_KINDS[block.kind].label}</span>
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
