'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Landmark, Map, ScrollText, Shield } from 'lucide-react';
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
import { LegendaWidget } from './legenda-widget';
import { UstrojeWidget } from './ustroje-widget';
import { ImperiumWidget } from './imperium-widget';
import { ZolwWidget } from './zolw-widget';
import { AtenyPrzypominajka } from './ateny-przypominajka';
import { getCorePin } from '../../../lib/timeline/pins';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L26 — Od wioski do imperium. Niesie `[7.2]` i `[7.3]` (republika, cesarstwo).
 *
 * **Zdanie lekcji: Rzym rósł przez wieki: najpierw zmieniał się sposób rządzenia,
 * potem granice — aż jedno miasto rządziło całym Morzem Śródziemnym.**
 *
 * Cztery bloki:
 *  - `wilczyca` — legenda zakreślona dwoma kolorami i szuflada z wykopaliskami
 *    na Palatynie; pinezka `rzym` (753 p.n.e.);
 *  - `kto-decyduje` — żeton „Wojna?” przez schemat władzy w królestwie,
 *    republice (z odrzuconym głosowaniem) i cesarstwie;
 *  - `imperium` — suwak 500 p.n.e. – 395 n.e. na mapie z L22, największy zasięg,
 *    dzisiejsze państwa, podział; pinezki `podzial-cesarstwa` i `upadek-rzymu`;
 *  - `zolw` — tarcze legionistów obracane stuknięciem, salwa z przodu i z góry.
 *
 * Przypominajka: kto głosował w Atenach (L23, dystans 3).
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/od-wioski-do-imperium/wzgorza.jpg',
  senat: '/images/historia/lekcje/od-wioski-do-imperium/senat.jpg',
  legion: '/images/historia/lekcje/od-wioski-do-imperium/legion.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'wilczyca', kind: 'zrodlo', title: 'Romulus i Remus — sprawdzam', time: '4 min', icon: ScrollText },
  { id: 'kto-decyduje', kind: 'symulator', title: 'Kto decyduje?', time: '6 min', icon: Landmark },
  { id: 'imperium', kind: 'mapa', title: 'Imperium rośnie', time: '7 min', icon: Map },
  { id: 'zolw', kind: 'cwiczenie', title: 'Żółw', time: '4 min', icon: Shield },
];

const L23_LESSON = getLesson('starozytna-grecja', 'ateny-i-demokracja');
const LESSON = 'starozytny-rzym/od-wioski-do-imperium';

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function OdWioskiDoImperiumLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Sprawdziłeś/łaś legendę o wilczycy łopatą archeologa, przeprowadziłeś/łaś wojnę przez trzy ustroje, przesunąłeś/ęłaś granice imperium przez dziewięćset lat i ustawiłeś/łaś żółwia z tarcz. Od dziś wiesz: Rzym rósł przez wieki — najpierw zmieniał się sposób rządzenia, potem granice — aż jedno miasto rządziło całym Morzem Śródziemnym."
      entry={
        L23_LESSON ? (
          <Przypominajka from={L23_LESSON} distance={3} color={histModule.color}>
            <AtenyPrzypominajka color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const wilczyca = useBlockDone('wilczyca');
  const ktoDecyduje = useBlockDone('kto-decyduje');
  const imperium = useBlockDone('imperium');
  const zolw = useBlockDone('zolw');
  const [checked, setChecked] = useState(false);
  const [mapDone, setMapDone] = useState(false);
  const [splitPinned, setSplitPinned] = useState(false);
  const pinRzym = getCorePin('rzym');
  const pinPodzial = getCorePin('podzial-cesarstwa');
  const pinUpadek = getCorePin('upadek-rzymu');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="wilczyca">
        <p className="mb-4 text-sm leading-relaxed sm:text-base">
          Rzymianie opowiadali, że ich miasto założył Romulus — chłopiec wykarmiony przez wilczycę. Znasz już metodę
          z legendy o smoku wawelskim: oddziel to, co da się sprawdzić, od tego, co dopisała opowieść.
        </p>
        <LegendaWidget color={color} onDone={() => setChecked(true)} />
        {(checked || wilczyca.done) && pinRzym && (
          <div className="mt-5 border-t pt-4">
            <p className="mb-3 text-sm leading-relaxed">
              Rzymianie liczyli lata „od założenia miasta” — według legendy w 753 roku p.n.e. Przypnij ten rok na Osi
              dziejów. To data z legendy, ale wiek zgadza się z wykopaliskami.
            </p>
            <PrzypnijPinezke pin={pinRzym} color={color} lesson={LESSON} mode="piramidy" done={wilczyca.done} onPinned={wilczyca.markBlockDone} />
          </div>
        )}
      </LessonBlock>

      <LessonBlock id="kto-decyduje">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.senat}
          alt="Akwarela: sala senatu — mężczyźni w białych togach siedzą na drewnianych ławach ustawionych naprzeciw siebie, jeden stoi i przemawia z uniesioną ręką, w głębi posąg w niszy"
          lead="Rzymianie zmieniali sposób rządzenia."
        >
          Przez ponad tysiąc lat Rzym miał trzy ustroje: najpierw królów, potem republikę, a na końcu cesarzy. Najłatwiej
          zobaczyć różnicę, gdy ta sama sprawa przejdzie przez każdy z nich.
        </LessonImageCard>
        <div className="mt-4">
          <UstrojeWidget color={color} onDone={ktoDecyduje.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="imperium">
        <ImperiumWidget color={color} onDone={() => setMapDone(true)} />
        {(mapDone || imperium.done) && (
          <div className="mt-5 space-y-4 border-t pt-4">
            <p className="text-sm leading-relaxed">
              Przypnij na Osi dziejów podział cesarstwa, a potem koniec jego zachodniej części — 476 rok, w którym
              germański wódz zdjął z tronu ostatniego cesarza zachodu. Tym rokiem kończy się starożytność.
            </p>
            {pinPodzial && (
              <PrzypnijPinezke pin={pinPodzial} color={color} lesson={LESSON} mode="piramidy" done={imperium.done || splitPinned} onPinned={() => setSplitPinned(true)} />
            )}
            {pinUpadek && (splitPinned || imperium.done) && (
              <PrzypnijPinezke pin={pinUpadek} color={color} lesson={LESSON} mode="piramidy" done={imperium.done} onPinned={imperium.markBlockDone} />
            )}
          </div>
        )}
      </LessonBlock>

      <LessonBlock id="zolw">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.legion}
          alt="Akwarela: kolumna legionistów w hełmach z czerwonymi prostokątnymi tarczami maszeruje brukowaną drogą między wzgórzami, na przedzie niesiony znak z orłem, w tle akwedukt i miasto na wzgórzu"
          lead="Legion: pięć tysięcy ludzi, jeden szyk."
        >
          Legion liczył ok. 5 tysięcy żołnierzy. Każdy niósł w marszu ok. 35 kg: broń, tarczę, zapasy, a nawet łopatę i kosz
          do budowy obozu. Ale siłą legionu nie był pojedynczy żołnierz, tylko to, że wszyscy działali razem.
        </LessonImageCard>
        <div className="mt-4">
          <ZolwWidget color={color} onDone={zolw.markBlockDone} />
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
          Prawie trzy tysiące lat temu na wzgórzach nad rzeką Tyber stało kilka wiosek pasterzy. Kilkaset lat później
          rządziły stąd ziemiami od Hiszpanii po Syrię i od Brytanii po Egipt.
        </p>
        <p className="mt-3">
          Dziś sprawdzisz legendę o założeniu Rzymu, poprowadzisz decyzję o wojnie przez trzy ustroje, przesuniesz granice
          imperium przez stulecia i ustawisz legionistów w żółwia. Wszystko stoi na jednym zdaniu:{' '}
          <strong>Rzym rósł przez wieki: najpierw zmieniał się sposób rządzenia, potem granice — aż jedno miasto rządziło całym Morzem Śródziemnym.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: zielone wzgórza nad krętą rzeką, na zboczu kilka okrągłych chat z gliny i trzciny ze stożkowymi dachami, pasterz z owcami, dym z ogniska"
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
