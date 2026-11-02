'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Highlighter, Landmark, Map as MapIcon, Sailboat } from 'lucide-react';
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
import { PodrozWidget } from './podroz-widget';
import { DolinaWidget } from './dolina-widget';
import { KolonieWidget } from './kolonie-widget';
import { SlowaWidget } from './slowa-widget';
import { NilPrzypominajka } from './nil-przypominajka';
import { getCorePin } from '../../../lib/timeline/pins';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L22 — Kraina gór i morza. Niesie `[6.2]`.
 *
 * **Zdanie lekcji: góry dzieliły Greków, a morze ich łączyło — dlatego powstało
 * wiele polis zamiast jednego państwa.**
 *
 * Cztery bloki:
 *  - `podroz` — **wędrowiec i statek za palcem** po mapie z terenem z ETOPO1:
 *    z Aten do Koryntu, Sparty i Miletu, pieszo i statkiem, licznik dni;
 *  - `polis` — każda dolina sama: czym była polis, co łączyło Greków; pinezka „polis”;
 *  - `kolonie` — ciasna dolina (rodziny na pola, reszta na statek), potem suwak
 *    czasu z koloniami i stukanie dzisiejszych państw (sędzia: punkt w granicach);
 *  - `slowa` — zakreślacz na greckie słowa w opisie dnia + warsztat sklejania cząstek.
 *
 * Przypominajka: łódź z prądem Nilu do Memfis (L19, dystans 3).
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/grecja-gory-i-morze/wybrzeze.jpg',
  dolina: '/images/historia/lekcje/grecja-gory-i-morze/dolina.jpg',
  statek: '/images/historia/lekcje/grecja-gory-i-morze/statek.jpg',
  szkola: '/images/historia/lekcje/grecja-gory-i-morze/szkola.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'podroz', kind: 'symulator', title: 'Z Aten do…', time: '7 min', icon: Sailboat },
  { id: 'polis', kind: 'wyjasnienie', title: 'Każda dolina sama', time: '3 min', icon: Landmark },
  { id: 'kolonie', kind: 'mapa', title: 'Grecy za morzem', time: '6 min', icon: MapIcon },
  { id: 'slowa', kind: 'cwiczenie', title: 'Greckie słowa po polsku', time: '5 min', icon: Highlighter },
];

const L19_LESSON = getLesson('starozytny-egipt', 'egipt-dar-nilu');
const LESSON = 'starozytna-grecja/grecja-gory-i-morze';

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function GrecjaGoryIMorzeLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Przeszedłeś/łaś góry pieszo i opłynąłeś/łaś je statkiem, wysłałeś/łaś rodziny za morze i znalazłeś/łaś greckie miasta na mapie dzisiejszego świata. A potem odkryłeś/łaś, że po grecku mówisz codziennie. Od dziś wiesz: góry dzieliły Greków, a morze ich łączyło — dlatego powstało wiele polis zamiast jednego państwa."
      entry={
        L19_LESSON ? (
          <Przypominajka from={L19_LESSON} distance={3} color={histModule.color}>
            <NilPrzypominajka color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const podroz = useBlockDone('podroz');
  const polis = useBlockDone('polis');
  const kolonie = useBlockDone('kolonie');
  const slowa = useBlockDone('slowa');
  const pin = getCorePin('polis');
  const [sailed, setSailed] = useState(false);

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="podroz">
        <PodrozWidget color={color} onDone={podroz.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="polis">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.dolina}
          alt="Akwarela: górska dolina otoczona wysokimi szczytami; pośrodku na wzgórzu miasto otoczone murem, nad nim świątynia z kolumnami; w dolinie gaje oliwne, winnica i złote zboże, które żną rolnicy w krótkich tunikach; na zboczu pasterz z kozami"
          lead="Za górą — inny świat."
        >
          Między górami leżały doliny, a w każdej — miasto z polami i wioskami dookoła. Przez góry szło się dniami,
          więc każda dolina żyła sama. Grecy nazywali takie miasto z okolicą <strong>polis</strong>, czyli
          miasto-państwo.
        </LessonImageCard>
        <div className="mt-4 grid gap-3 text-sm leading-relaxed sm:grid-cols-2">
          <div className="border p-3">
            <p className="mb-1 font-semibold">Każda polis miała swoje</p>
            <p>
              prawa, wojsko, monety i władzę. Ateny rządziły się inaczej niż Sparta — i nieraz ze sobą walczyły.
              Polis były setki, większość wielkości dzisiejszej gminy.
            </p>
          </div>
          <div className="border p-3">
            <p className="mb-1 font-semibold">Ale wszystkich łączyło</p>
            <p>
              ten sam język i alfabet, ci sami bogowie i igrzyska w Olimpii. Sami siebie nazywali Hellenami, a swoją
              ziemię — Helladą. Jednego państwa nie mieli przez setki lat.
            </p>
          </div>
        </div>
        {pin && (
          <div className="mt-6 border-t pt-4">
            <p className="mb-3 text-sm leading-relaxed">
              Pierwsze greckie miasta-państwa wyrosły w VIII wieku p.n.e. Przypnij je na Osi dziejów.
            </p>
            <PrzypnijPinezke pin={pin} color={color} lesson={LESSON} mode="piramidy" done={polis.done} onPinned={polis.markBlockDone} />
          </div>
        )}
      </LessonBlock>

      <LessonBlock id="kolonie">
        <DolinaWidget color={color} onDone={() => setSailed(true)} />
        {(sailed || kolonie.done) && (
          <div className="mt-6 space-y-4 border-t pt-4">
            <LessonImageCard
              variant="secondary"
              color={color}
              image={IMAGES.statek}
              alt="Akwarela: drewniany grecki statek kupiecki z jednym prostokątnym żaglem płynie przy skalistym brzegu; żeglarze w krótkich tunikach ciągną liny, sternik trzyma wiosło sterowe, na pokładzie amfory, kosze i tobołki, a wśród nich kobieta z dzieckiem — rodzina osadników; nad statkiem mewa"
              lead="Od zatoki do zatoki."
            >
              Greckie statki pływały blisko brzegów i od wyspy do wyspy — na noc stawały w zatoce. Tak, krok po
              kroku, Grecy dotarli bardzo daleko.
            </LessonImageCard>
            <KolonieWidget color={color} onDone={kolonie.markBlockDone} />
          </div>
        )}
      </LessonBlock>

      <LessonBlock id="slowa">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.szkola}
          alt="Akwarela: dziedziniec z kolumnami w starożytnej Grecji; brodaty nauczyciel w niebieskim płaszczu siedzi na stołku i pokazuje rozwinięty zwój, trzech chłopców w krótkich tunikach siedzi naprzeciw — dwóch z drewnianymi tabliczkami i rylcami, trzeci z lirą; w tle na wzgórzu świątynia"
          lead="Słowa płyną dalej niż statki."
        >
          Greckie statki dawno zatonęły albo zbutwiały. Ale greckie słowa wciąż płyną — przez łacinę i inne języki
          trafiły aż do polskiego. Sprawdź, ile ich używasz w zwykły dzień.
        </LessonImageCard>
        <div className="mt-4">
          <SlowaWidget color={color} onDone={slowa.markBlockDone} />
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
          Egipt miał jedną rzekę, która łączyła cały kraj. Grecja nie ma żadnej wielkiej rzeki. Ma za to góry —
          wszędzie — i morze, które wchodzi w ląd zatokami i rozsypuje się na setki wysp.
        </p>
        <p className="mt-3">
          Dziś przejdziesz góry pieszo i opłyniesz je statkiem, wyślesz osadników za morze, znajdziesz greckie
          miasta na mapie dzisiejszego świata i greckie słowa we własnym dniu. Wszystko stoi na jednym zdaniu:{' '}
          <strong>góry dzieliły Greków, a morze ich łączyło — dlatego powstało wiele polis zamiast jednego państwa.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: widok ze zbocza na skaliste greckie wybrzeże — w małej zatoce stoi wioska z białych domów z dachówką, przy pomoście dwa drewniane statki z prostokątnymi żaglami, za wioską strome, skaliste góry z oliwkami, na morzu wysepki"
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
