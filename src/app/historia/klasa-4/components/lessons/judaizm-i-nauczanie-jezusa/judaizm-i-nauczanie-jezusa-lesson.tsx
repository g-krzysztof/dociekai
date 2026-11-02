'use client';

import Image from 'next/image';
import { HeartHandshake, MapPinned, ScrollText, Shapes } from 'lucide-react';
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
import { PalestynaWidget } from './palestyna-widget';
import { BogowieWidget } from './bogowie-widget';
import { TabliceWidget } from './tablice-widget';
import { SamarytaninWidget } from './samarytanin-widget';
import { ImperiumPrzypominajka } from './imperium-przypominajka';
import { getCorePin } from '../../../lib/timeline/pins';
import { getLesson } from '../../../data/lessons';
import { useState } from 'react';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L29 — Z judaizmu do chrześcijaństwa. Niesie `[8.1 — kultura]`.
 *
 * **Zdanie lekcji: Chrześcijaństwo wyrosło z judaizmu — z wiary w jednego Boga —
 * i przejęło z niego Dekalog.**
 *
 * Cztery bloki:
 *  - `palestyna` — przybliżanie mapy imperium do Palestyny, jezioro i cztery
 *    miejsca z opowieści stawiane według wskazówek drogi; pinezka `jezus`;
 *  - `bogowie` — sprawy z życia u Rzymianina (półka bogów) i u Żyda (jeden Bóg),
 *    posąg cesarza;
 *  - `tablice` — przykazania na dwóch tablicach według treści i przepisy
 *    dzisiejszego prawa przykładane do przykazań;
 *  - `samarytanin` — zakład, scena przypowieści, pytanie Jezusa, własny krąg
 *    bliźnich; apostołowie i założenia chrześcijaństwa opisowo.
 *
 * Neutralność światopoglądowa: założenia religii mówimy
 * „chrześcijanie wierzą, że…”, „według Ewangelii…”; bez wizerunków Boga i Jezusa.
 * Przypominajka: państwa w imperium 117 r. (L26, dystans 3).
 */

const IMAGES = imgMap({
  galilea: '/images/historia/lekcje/judaizm-i-nauczanie-jezusa/galilea.jpg',
  jerozolima: '/images/historia/lekcje/judaizm-i-nauczanie-jezusa/jerozolima.jpg',
  zwoj: '/images/historia/lekcje/judaizm-i-nauczanie-jezusa/zwoj.jpg',
  droga: '/images/historia/lekcje/judaizm-i-nauczanie-jezusa/droga.jpg',
  lararium: '/images/historia/lekcje/judaizm-i-nauczanie-jezusa/lararium.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'palestyna', kind: 'mapa', title: 'Palestyna w Cesarstwie', time: '7 min', icon: MapPinned },
  { id: 'bogowie', kind: 'cwiczenie', title: 'Wielu bogów czy jeden?', time: '7 min', icon: Shapes },
  { id: 'tablice', kind: 'zrodlo', title: 'Dwie tablice', time: '7 min', icon: ScrollText },
  { id: 'samarytanin', kind: 'perspektywy', title: 'Kto jest bliźnim?', time: '8 min', icon: HeartHandshake },
];

const L26_LESSON = getLesson('starozytny-rzym', 'od-wioski-do-imperium');
const LESSON = 'narodziny-chrzescijanstwa/judaizm-i-nauczanie-jezusa';

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function JudaizmINauczanieJezusaLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Przybliżyłeś/łaś imperium aż do Palestyny i odnalazłeś/łaś miejsca z opowieści o Jezusie, zaniosłeś/łaś te same sprawy do wielu bogów i do jednego Boga, podzieliłeś/łaś Dekalog między dwie tablice i znalazłeś/łaś go w dzisiejszym prawie, a na pustynnej drodze sprawdziłeś/łaś, kto jest bliźnim. Od dziś wiesz: chrześcijaństwo wyrosło z judaizmu — z wiary w jednego Boga — i przejęło z niego Dekalog."
      entry={
        L26_LESSON ? (
          <Przypominajka from={L26_LESSON} distance={3} color={histModule.color}>
            <ImperiumPrzypominajka color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const palestyna = useBlockDone('palestyna');
  const bogowie = useBlockDone('bogowie');
  const tablice = useBlockDone('tablice');
  const samarytanin = useBlockDone('samarytanin');
  const [mapped, setMapped] = useState(false);
  const pin = getCorePin('jezus');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="palestyna">
        <p className="mb-4 text-sm leading-relaxed sm:text-base">
          Za czasów pierwszych cesarzy Rzym rządził też małą krainą na wschodnim brzegu Morza Śródziemnego — Palestyną.
          Mieszkali tam Żydzi. Płacili podatki Rzymowi, a w miastach stali rzymscy żołnierze. Wielu Żydów czekało na{' '}
          <strong>Mesjasza</strong> — wysłannika Boga, który, jak wierzyli, przyjdzie i uwolni ich lud. Właśnie tam, około 30
          roku n.e., nauczał Jezus z Nazaretu.
        </p>
        <PalestynaWidget color={color} onDone={() => setMapped(true)} />
        {(mapped || palestyna.done) && pin && (
          <div className="mt-5 border-t pt-4">
            <figure className="mb-4">
              <Image
                src={IMAGES.jerozolima}
                alt="Akwarela: Jerozolima z daleka — miasto z jasnego kamienia na wzgórzach, otoczone murami, z wielkim dziedzińcem świątyni i wysokim budynkiem świątyni; na pierwszym planie zbocze z drzewami oliwnymi"
                width={640}
                height={480}
                className="h-auto w-full max-w-[520px]"
              />
            </figure>
            <p className="mb-3 text-sm leading-relaxed">
              Jezus nauczał tylko kilka lat. Historycy datują jego śmierć w Jerozolimie na lata 30–33 naszej ery. Przypnij
              działalność Jezusa na Osi dziejów.
            </p>
            <PrzypnijPinezke pin={pin} color={color} lesson={LESSON} mode="piramidy" done={palestyna.done} onPinned={palestyna.markBlockDone} />
          </div>
        )}
      </LessonBlock>

      <LessonBlock id="bogowie">
        <BogowieWidget color={color} images={{ lararium: IMAGES.lararium, zwoj: IMAGES.zwoj }} onDone={bogowie.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="tablice">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zwoj}
          alt="Akwarela: na drewnianym stole w kamiennym domu leży rozwinięty zwój na dwóch drewnianych wałkach, obok gliniana lampka oliwna z małym płomieniem i gliniany kubek"
          lead="Dziesięć zdań, które przetrwały trzy tysiące lat."
        >
          Świętą księgą Żydów jest Tora — pięć pierwszych ksiąg Biblii, pisanych na zwojach. Jest w niej <strong>Dekalog</strong>,
          czyli dziesięć przykazań. Według Biblii Bóg dał je Mojżeszowi, wyryte na dwóch kamiennych tablicach. Poniżej są
          opowiedziane prostymi słowami.
        </LessonImageCard>
        <div className="mt-4">
          <TabliceWidget color={color} onDone={tablice.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="samarytanin">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.droga}
          alt="Akwarela: pusta, kręta droga gruntowa wśród suchych, skalistych wzgórz, przy drodze głazy i ciernisty krzew, w oddali dolina we mgle"
          lead="Opowieść z Ewangelii, opowiedziana jako scena."
        >
          Jezus często uczył przez przypowieści — krótkie opowieści z życia, po których słuchacz sam musiał pomyśleć. Ta jest
          jedną z najbardziej znanych. Postaci w scenie są umowne.
        </LessonImageCard>
        <div className="mt-4">
          <SamarytaninWidget color={color} onDone={samarytanin.markBlockDone} />
        </div>
      </LessonBlock>
    </>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Rzymianie, Grecy i Egipcjanie czcili wielu bogów. Ale w jednej małej krainie imperium mieszkał lud, który wierzył
          w jednego Boga. Z tej wiary wyrosła religia, którą dziś wyznają ponad dwa miliardy ludzi na świecie.
        </p>
        <p className="mt-3">
          Dziś odnajdziesz na mapie miejsca z opowieści o Jezusie, porównasz dom Rzymianina i dom Żyda, podzielisz Dekalog
          i staniesz przy drodze, na której ktoś potrzebuje pomocy. Wszystko stoi na jednym zdaniu:{' '}
          <strong>Chrześcijaństwo wyrosło z judaizmu — z wiary w jednego Boga — i przejęło z niego Dekalog.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.galilea}
            alt="Akwarela: szerokie jezioro wśród łagodnych wzgórz, po wodzie płyną trzy drewniane łodzie rybackie z żaglami, na brzegu wioska z płaskimi dachami, na pierwszym planie drzewa oliwne"
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
