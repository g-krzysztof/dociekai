'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Crown, Newspaper, Scale, Weight } from 'lucide-react';
import {
  HIST_BLOCK_KINDS,
  HistLessonShell,
  LessonBlock,
  useBlockDone,
  type HistBlockMeta,
} from '../../lesson-shell';
import { Przypominajka } from '../../przypominajka';
import { PrzypnijPinezke } from '../../timeline/przypnij-pinezke';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { SanieWidget } from './sanie-widget';
import { PapirusWidget } from './papirus-widget';
import { WagaWidget } from './waga-widget';
import { GrobowiecWidget } from './grobowiec-widget';
import { KlatwaWidget } from './klatwa-widget';
import { KanalPrzypominajka } from './kanal-przypominajka';
import { getCorePin } from '../../../lib/timeline/pins';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L20 — Bogowie, mumie, piramidy. Niesie `[5.2]` (politeizm, piramidy,
 * życie pozagrobowe).
 *
 * **Zdanie lekcji: Egipcjanie wierzyli, że życie trwa po śmierci — i dla tej
 * wiary zbudowali najtrwalsze budowle świata.**
 *
 * Cztery bloki:
 *  - `sanie` — **ciągnięcie liny** z liczbą ludzi, **polewanie piasku
 *    dzbanem** (malowidło Dżehutihotepa jako wskazówka), **długość
 *    pochylni** ciągnięta za podstawę; pinezka „piramidy w Gizie”;
 *  - `waga` — **zmarły prowadzony palcem po papirusie Hunefera** (bogowie
 *    i ich znaki), potem **waga serca** z czynami Neferu (postać wymyślona);
 *  - `grobowiec` — przewidywanie i **zsuwanie warstw** grobu Tutanchamona
 *    z datami z dziennika Cartera, złota maska (fotografia); pinezka
 *    „grobowiec Tutanchamona”;
 *  - `klatwa` — nagłówki (nasze, podpisane) kontra **nici życia** ekipy.
 *
 * Przypominajka: woda płynie tylko w dół (L17, dystans 3).
 */

const IMAGES = imgMap({
  budowa: '/images/historia/lekcje/bogowie-mumie-piramidy/budowa.jpg',
  waga: '/images/historia/lekcje/bogowie-mumie-piramidy/waga.jpg',
  dolina: '/images/historia/lekcje/bogowie-mumie-piramidy/dolina.jpg',
  komora: '/images/historia/lekcje/bogowie-mumie-piramidy/komora.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'sanie', kind: 'symulator', title: 'Ciągniemy blok', time: '7 min', icon: Weight },
  { id: 'waga', kind: 'wyjasnienie', title: 'Waga serca', time: '6 min', icon: Scale },
  { id: 'grobowiec', kind: 'sledztwo', title: 'Grobowiec jak matrioszka', time: '5 min', icon: Crown },
  { id: 'klatwa', kind: 'zrodlo', title: 'Klątwa faraona? Sprawdź', time: '5 min', icon: Newspaper },
];

const L17_LESSON = getLesson('poczatki-cywilizacji', 'mezopotamia');
const LESSON = 'starozytny-egipt/bogowie-mumie-piramidy';

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function BogowieMumiePiramidyLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Wciągnąłeś/łaś kamienny blok bez koła i konia — wodą i pochylnią. Przeprowadziłeś/łaś zmarłego przez sąd Ozyrysa i zważyłeś/łaś serce Neferu. Zdjąłeś/łaś osiem osłon z ciała Tutanchamona i sprawdziłeś/łaś klątwę faraona datami. Od dziś wiesz: Egipcjanie wierzyli, że życie trwa po śmierci — i dla tej wiary zbudowali najtrwalsze budowle świata."
      entry={
        L17_LESSON ? (
          <Przypominajka from={L17_LESSON} distance={3} color={histModule.color}>
            <KanalPrzypominajka color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const sanie = useBlockDone('sanie');
  const waga = useBlockDone('waga');
  const grobowiec = useBlockDone('grobowiec');
  const klatwa = useBlockDone('klatwa');
  const pinGiza = getCorePin('piramidy-giza');
  const pinTut = getCorePin('tutanchamon');
  const [hauled, setHauled] = useState(false);
  const [walked, setWalked] = useState(false);
  const [opened, setOpened] = useState(false);

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="sanie">
        <p className="mb-4 text-sm leading-relaxed">
          Plac budowy w Gizie, około 2500 roku p.n.e. Z kamieniołomu przyjechał blok wapienia — 2,5 tony, tyle co dwa samochody osobowe.
          Trzeba go dowlec do pochylni i wciągnąć na piramidę. Koła Egipcjanie przy tej pracy nie używali, wozów ani koni też nie mieli.
        </p>
        <SanieWidget color={color} onDone={() => setHauled(true)} />
        {pinGiza && (hauled || sanie.done) && (
          <div className="mt-6 border-t pt-4">
            <p className="mb-3 text-sm leading-relaxed">
              Tak powstały piramidy w Gizie — grobowce faraonów Cheopsa, Chefrena i Mykerinosa. Przypnij je na Osi dziejów.
            </p>
            <PrzypnijPinezke pin={pinGiza} color={color} lesson={LESSON} mode="piramidy" done={sanie.done} onPinned={sanie.markBlockDone} />
          </div>
        )}
      </LessonBlock>

      <LessonBlock id="waga">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.waga}
          alt="Akwarela: prosta drewniana waga z dwiema szalami na sznurkach; na lewej szali mały czerwony gliniany dzbanek, na prawej jedno białe strusie pióro; ramię wagi jest idealnie poziome; pod wagą mata z trzciny i łodyga papirusu"
          lead="Po co faraonowi grobowiec?"
        >
          Bo Egipcjanie wierzyli, że śmierć to nie koniec — że po niej zaczyna się drugie życie. Ale żeby do niego wejść, trzeba było przejść
          przez sąd. Zobacz, jak go sobie wyobrażali — na prawdziwym papirusie sprzed ponad 3000 lat.
        </LessonImageCard>
        <div className="mt-4">
          <PapirusWidget color={color} onDone={() => setWalked(true)} />
        </div>
        {(walked || waga.done) && (
          <div className="mt-6 border-t pt-4">
            <p className="mb-3 text-sm leading-relaxed">
              Teraz Ty jesteś Anubisem przy wadze. Na sąd przychodzi piekarz Neferu.
            </p>
            <WagaWidget color={color} onDone={waga.markBlockDone} />
          </div>
        )}
      </LessonBlock>

      <LessonBlock id="grobowiec">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.dolina}
          alt="Akwarela: proste prostokątne ciemne wejście wykute u stóp jasnej wapiennej skały w suchej, kamienistej dolinie; kilka stopni prowadzi w dół, dookoła sterty odłamków skalnych; nad doliną szczyt w kształcie piramidy"
          lead="Dolina, w której chowano faraonów."
        >
          Piramidy było widać z daleka — i złodzieje okradli je już w starożytności. Dlatego późniejsi faraonowie kazali kuć grobowce w skale,
          w Dolinie Królów, nad którą wznosi się szczyt w kształcie piramidy. Wejścia zasypywano. W 1922 roku Anglik Howard Carter, po
          dziesięciu latach szukania, odkopał tu schody do grobu, którego nikt nie okradł: grobu faraona Tutanchamona.
        </LessonImageCard>
        <div className="mt-4">
          <LessonImageCard
            variant="secondary"
            color={color}
            image={IMAGES.komora}
            alt="Akwarela: wnętrze komory grobowej w ciepłym świetle małej glinianej lampki na podłodze; dwa czarne posągi strażników w złotych przepaskach stoją naprzeciw siebie, między nimi złocone skrzynie, złocone łoże z nogami w kształcie zwierząt, alabastrowe dzbany, model drewnianej łodzi i kosze z bochenkami chleba"
            lead="„Widzę wspaniałe rzeczy”."
          >
            Tak odpowiedział Carter, gdy przy świetle świecy zajrzał do środka. W grobie leżało ponad 5000 przedmiotów: łoża, krzesła, sandały,
            łuki, jedzenie, łodzie. Wszystko, czego faraon miał potrzebować w drugim życiu — bo wierzono, że będzie podobne do tego na ziemi.
          </LessonImageCard>
        </div>
        <div className="mt-4">
          <GrobowiecWidget color={color} onDone={() => setOpened(true)} />
        </div>
        {pinTut && (opened || grobowiec.done) && (
          <div className="mt-6 border-t pt-4">
            <p className="mb-3 text-sm leading-relaxed">
              Tutanchamon panował prawie 3300 lat przed odkryciem. Przypnij na Osi dziejów rok, w którym jego grób znów zobaczył światło.
            </p>
            <PrzypnijPinezke pin={pinTut} color={color} lesson={LESSON} mode="piramidy" done={grobowiec.done} onPinned={grobowiec.markBlockDone} />
          </div>
        )}
      </LessonBlock>

      <LessonBlock id="klatwa">
        <p className="mb-4 text-sm leading-relaxed">
          Pięć miesięcy po odkryciu grobu zmarł lord Carnarvon, który płacił za wykopaliska. Gazety oszalały.
        </p>
        <KlatwaWidget color={color} onDone={klatwa.markBlockDone} />
      </LessonBlock>
    </>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Piramida Cheopsa stoi od 4500 lat. Przez prawie cztery tysiące lat była najwyższą budowlą na świecie. A zbudowano ją jako… grób.
        </p>
        <p className="mt-3">
          Dziś wciągniesz kamienny blok bez koła, przeprowadzisz zmarłego przez sąd bogów, otworzysz grobowiec faraona warstwa po warstwie
          i sprawdzisz, czy klątwa faraona istnieje. Wszystko stoi na jednym zdaniu:{' '}
          <strong>Egipcjanie wierzyli, że życie trwa po śmierci — i dla tej wiary zbudowali najtrwalsze budowle świata.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.budowa}
            alt="Akwarela: plac budowy piramidy na pustyni — w tle w połowie zbudowana piramida z jasnego wapienia i długa pochylnia, po której idą ludzie; na pierwszym planie wielki kamienny blok na drewnianych saniach, dwanaście osób w białych przepaskach ciągnie go linami w prawo, a człowiek stojący na przodzie sań wylewa wodę z dzbana na piasek przed płozami; w oddali Nil i palmy"
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
