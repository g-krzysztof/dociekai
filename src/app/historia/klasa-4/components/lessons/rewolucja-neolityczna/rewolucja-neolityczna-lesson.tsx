'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';
import { Axe, Layers, Sprout, Workflow } from 'lucide-react';
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
import { DziesiecLat } from './dziesiec-lat';
import { WarstwyMapy } from './warstwy-mapy';
import { SchematLiczb } from './schemat-liczb';
import { SiekieraKrzemienna } from './siekiera-krzemienna';
import { IleLatOdSiewu } from './ile-lat-od-siewu';
import { sampleVillage, statsOf, type VillageStats } from './wioska';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L16 — rewolucja neolityczna. `[5.1]`.
 *
 * **Zdanie lekcji: kiedy człowiek zaczął siać, musiał zostać przy polu —
 * i z tej jednej zmiany wyrosły wioski, miasta i państwa.**
 *
 * Cztery bloki:
 *  - `DziesiecLat` — **sieje i żnie palcem po zagonach** rok po roku;
 *    spichlerz, nowi mieszkańcy, którzy nie zdobywają jedzenia, susza,
 *    myszy i kot; obok koczownicy z L15;
 *  - `WarstwyMapy` — najpierw własna wioska na mapie, potem **cztery
 *    przezroczyste folie** (deszcz, rzeki, dzikie zboża, kozy i owce);
 *    przecięcie zapala Żyzny Półksiężyc;
 *  - `SchematLiczb` — schemat przyczyna → skutek z liczb wioski dziecka,
 *    pinezki „rewolucja neolityczna” i „Jerycho”;
 *  - `SiekieraKrzemienna` — **ciacha las pod pole** (ostrze się tępi
 *    i pęka), potem fotografie z Krzemionek Opatowskich.
 *
 * Przypominajka: licznik lat od 10 000 p.n.e. do 2026 (L8, dystans 8).
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/rewolucja-neolityczna/wioska.jpg',
  zarna: '/images/historia/lekcje/rewolucja-neolityczna/zarna.jpg',
  kot: '/images/historia/lekcje/rewolucja-neolityczna/kot.jpg',
  catal: '/images/historia/lekcje/rewolucja-neolityczna/catalhoyuk.jpg',
  krzemien: '/images/historia/lekcje/rewolucja-neolityczna/krzemien-pasiasty.jpg',
  dom: '/images/historia/lekcje/rewolucja-neolityczna/krzemionki-dom.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'wioska', kind: 'symulator', title: 'Dziesięć lat w dolinie', time: '7 min', icon: Sprout },
  { id: 'warstwy', kind: 'mapa', title: 'Gdzie mogło się zacząć?', time: '5 min', icon: Layers },
  { id: 'schemat', kind: 'os-czasu', title: 'Schemat z moich liczb', time: '4 min', icon: Workflow },
  { id: 'krzemionki', kind: 'zrodlo', title: 'Neolit w Polsce: Krzemionki', time: '5 min', icon: Axe },
];

const L8_LESSON = getLesson('czas-i-miejsce', 'obliczanie-czasu');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function RewolucjaNeolitycznaLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Przez dziesięć lat siałeś/łaś i żąłeś/żęłaś zboże — i zobaczyłeś/łaś, jak z nadwyżki w spichlerzu wyrastają nowe domy i ludzie, którzy nie muszą zdobywać jedzenia. Nałożyłeś/łaś warstwy na mapę i znalazłeś/łaś Żyzny Półksiężyc. Wypełniłeś/łaś schemat własnymi liczbami, a na końcu wyciąłeś/łaś las krzemienną siekierą i zobaczyłeś/łaś, po co rolnikom były Krzemionki. Od dziś wiesz: kiedy człowiek zaczął siać, musiał zostać przy polu — i z tej jednej zmiany wyrosły wioski, miasta i państwa."
      entry={
        L8_LESSON ? (
          <Przypominajka from={L8_LESSON} distance={8} color={histModule.color}>
            <IleLatOdSiewu color={histModule.color} />
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
  const wioska = useBlockDone('wioska');
  const warstwy = useBlockDone('warstwy');
  const schemat = useBlockDone('schemat');
  const krzemionki = useBlockDone('krzemionki');
  const [stats, setStats] = useState<VillageStats | null>(null);
  const { markBlockDone: markWioska } = wioska;

  const onFinish = useCallback(
    (s: VillageStats) => {
      setStats(s);
      markWioska();
    },
    [markWioska]
  );

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="wioska">
        <DziesiecLat color={color} catImage={IMAGES.kot} onFinish={onFinish} />
      </LessonBlock>

      <LessonBlock id="warstwy">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zarna}
          alt="Akwarela: kobieta z epoki kamienia klęczy przy dużym płaskim kamieniu żarnowym przed chatą krytą trzciną i ściera ziarno na mąkę mniejszym kamieniem; obok kosz ziarna, miska mąki, a na rozgrzanym kamieniu nad ogniskiem piecze się płaski placek"
          lead="Pierwszy chleb."
        >
          Ziarno ścierano między dwoma kamieniami na mąkę, mieszano z wodą i pieczono płaskie placki na kamieniu rozgrzanym
          w ognisku. Ale skąd w ogóle wzięło się zboże? Rosło dziko — tylko nie wszędzie.
        </LessonImageCard>
        <div className="mt-4">
          <WarstwyMapy color={color} onComplete={warstwy.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="schemat">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.catal}
          alt="Akwarela: osada z cegły mułowej, w której domy stoją ściana w ścianę jak plaster miodu, bez ulic; płaskie dachy tworzą jeden taras, ludzie wchodzą do domów po drabinach przez otwory w dachach, na dachach pracują i rozmawiają dorośli i dzieci; w oddali równina i wulkan"
          lead="Tak mogło wyglądać Çatalhöyük."
          reverse
        >
          W Çatalhöyük (dziś Turcja) domy przylegały do siebie ścianami, a do środka wchodziło się przez dach. Mieszkało tam
          kilka tysięcy ludzi — z jednej małej wioski urosło coś, co przypomina miasto.
        </LessonImageCard>
        <div className="mt-4">
          <SchematLiczb color={color} stats={stats ?? statsOf(sampleVillage(), true)} onComplete={schemat.markBlockDone} done={schemat.done} />
        </div>
      </LessonBlock>

      <LessonBlock id="krzemionki">
        <SiekieraKrzemienna color={color} flintImage={IMAGES.krzemien} houseImage={IMAGES.dom} onComplete={krzemionki.markBlockDone} />
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
          W poprzedniej lekcji ludzie szli za jedzeniem. Ok. 10 000 lat p.n.e. niektórzy zrobili coś nowego: zamiast szukać
          dzikiego zboża, zaczęli je <strong>siać</strong> tam, gdzie chcieli — i oswajać kozy i owce.
        </p>
        <p className="mt-3">
          Dziś przeżyjesz dziesięć lat w pierwszej wiosce, znajdziesz na mapie miejsce, gdzie to się zaczęło, i zobaczysz ślady
          pierwszych rolników w Polsce. Wszystko stoi na jednym zdaniu:{' '}
          <strong>kiedy człowiek zaczął siać, musiał zostać przy polu — i z tej jednej zmiany wyrosły wioski, miasta i państwa.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: wczesna wioska rolników nad rzeką — okrągłe chaty z gliny i drewna z dachami z trzciny, pole dojrzałej pszenicy, kozy w zagrodzie z plecionki, kobieta z glinianym dzbanem i mężczyzna z kijem do kopania; w dali wzgórza"
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
