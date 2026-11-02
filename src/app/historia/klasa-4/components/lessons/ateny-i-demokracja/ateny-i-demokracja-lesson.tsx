'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Dices, Footprints, Scale, Users } from 'lucide-react';
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
import { SitoWidget } from './sito-widget';
import { KleroterionWidget } from './kleroterion-widget';
import { PlanWidget } from './plan-widget';
import { DzisWidget } from './dzis-widget';
import { SlowoPrzypominajka } from './slowo-przypominajka';
import { getCorePin } from '../../../lib/timeline/pins';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L23 — Ateny Peryklesa. Niesie `[6.1]`.
 *
 * **Zdanie lekcji: w Atenach o sprawach miasta decydowali obywatele — ale
 * obywatelem był tylko co któryś mieszkaniec.**
 *
 * Cztery bloki:
 *  - `zgromadzenie` — przewidywanie, **sito prawa przeciągane przez tłum** stu
 *    mieszkańców, głosowanie nad flotą: kilkunastu kontra wszyscy;
 *  - `losowanie` — **kleroterion**: tabliczka w szczelinę, dźwignia wypuszcza
 *    kostki rząd po rzędzie, przewidywanie na 10 dni; fotografia prawdziwej maszyny;
 *  - `dzien` — plan Aten: Kallias, a potem jego córka Kleo (niewidzialny mur
 *    przed Pnyksem i sądem); pinezka „Ateny Peryklesa”;
 *  - `dzis` — te same sto osób według prawa Polski 2026 + mowa Peryklesa
 *    (omówienie): kto w niej jest, a kogo nie ma.
 *
 * Przypominajka: demo + kracja (L22, dystans 1). Blok R (Sparta i Termopile) odłożony.
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/ateny-i-demokracja/akropol.jpg',
  pnyks: '/images/historia/lekcje/ateny-i-demokracja/pnyks.jpg',
  kleroterion: '/images/historia/lekcje/ateny-i-demokracja/kleroterion.jpg',
  agora: '/images/historia/lekcje/ateny-i-demokracja/agora.jpg',
  dom: '/images/historia/lekcje/ateny-i-demokracja/dom.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'zgromadzenie', kind: 'symulator', title: 'Kto może głosować?', time: '6 min', icon: Users },
  { id: 'losowanie', kind: 'symulator', title: 'Maszyna do losowania', time: '5 min', icon: Dices },
  { id: 'dzien', kind: 'mapa', title: 'Dzień Ateńczyka', time: '6 min', icon: Footprints },
  { id: 'dzis', kind: 'perspektywy', title: 'Ateny kontra dziś', time: '6 min', icon: Scale },
];

const L22_LESSON = getLesson('starozytna-grecja', 'grecja-gory-i-morze');
const LESSON = 'starozytna-grecja/ateny-i-demokracja';

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function AtenyIDemokracjaLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Przesiałeś/łaś stu mieszkańców Aten przez prawo, wylosowałeś/łaś sędziów maszyną, przeszedłeś/łaś miasto jako Kallias i jako Kleo i przestawiłeś/łaś Ateny na zasady dzisiejszej Polski. Od dziś wiesz: w Atenach o sprawach miasta decydowali obywatele — ale obywatelem był tylko co któryś mieszkaniec."
      entry={
        L22_LESSON ? (
          <Przypominajka from={L22_LESSON} distance={1} color={histModule.color}>
            <SlowoPrzypominajka color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const zgromadzenie = useBlockDone('zgromadzenie');
  const losowanie = useBlockDone('losowanie');
  const dzien = useBlockDone('dzien');
  const dzis = useBlockDone('dzis');
  const pin = getCorePin('perykles');
  const [walked, setWalked] = useState(false);

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="zgromadzenie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.pnyks}
          alt="Akwarela: setki mężczyzn w udrapowanych płaszczach siedzą na skalistym zboczu wzgórza i słuchają; brodaty mówca stoi na kamiennym podwyższeniu z uniesioną ręką; w oddali Akropol z Partenonem i dachy miasta"
          lead="Kilka tysięcy ludzi na jednym wzgórzu."
        >
          Kilkadziesiąt razy w roku obywatele Aten zbierali się na wzgórzu Pnyks. Każdy mógł zabrać głos, a o wojnie,
          pokoju i podatkach decydowało podniesienie rąk. Ale kto był obywatelem?
        </LessonImageCard>
        <div className="mt-4">
          <SitoWidget color={color} onDone={zgromadzenie.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="losowanie">
        <figure className="mb-4 border bg-white p-3 dark:bg-zinc-900">
          <Image src={IMAGES.kleroterion} alt="Fotografia: kamienna płyta z kilkunastoma kolumnami wąskich, poziomych szczelin, ułożonych w równe rzędy; z lewej strony otwory po rurze na kostki" width={640} height={429} className="h-auto w-full" />
          <figcaption className="mt-2 text-xs text-muted-foreground">
            Prawdziwy kleroterion — kamienna maszyna do losowania, Muzeum Starożytnej Agory w Atenach. Takich maszyn
            używano od IV w. p.n.e.; do szczelin wkładano tabliczki z imionami. Fot. Marsyas, Wikimedia Commons, CC BY-SA 2.5.
          </figcaption>
        </figure>
        <KleroterionWidget color={color} onDone={losowanie.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="dzien">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.agora}
          alt="Akwarela: targ na agorze — stragany pod płóciennymi daszkami z oliwkami, figami, rybami i chlebem, kupiec z czerwono-czarnymi wazami, mężczyźni w płaszczach rozmawiają w grupkach, kobieta z koszykiem; w tle długi portyk z kolumnami i Akropol na wzgórzu"
          lead="Rynek, sąd i parlament w jednym."
        >
          Agora była sercem Aten: tu się kupowało, plotkowało, sądziło i rozmawiało o polityce. Nad nią wznosił się
          Akropol ze świątyniami. Przejdź przez miasto — dwa razy.
        </LessonImageCard>
        <div className="mt-4">
          <PlanWidget color={color} onDone={() => setWalked(true)} />
        </div>
        {(walked || dzien.done) && (
          <div className="mt-6 space-y-4 border-t pt-4">
            <LessonImageCard
              variant="secondary"
              color={color}
              image={IMAGES.dom}
              alt="Akwarela: dziedziniec greckiego domu; matka i córka w długich tunikach tkają na wysokich pionowych krosnach z glinianymi ciężarkami, młodsza dziewczynka na stołku przędzie wełnę wrzecionem; obok studnia, gliniany dzban, mały ołtarz i śpiący kot"
              lead="Świat Kleo."
            >
              Córki obywateli uczyły się w domu przędzenia, tkania i prowadzenia gospodarstwa. Za mąż wychodziły młodo —
              często w wieku czternastu, piętnastu lat.
            </LessonImageCard>
            {pin && (
              <div>
                <p className="mb-3 text-sm leading-relaxed">
                  Tak wyglądały Ateny w V wieku p.n.e., w czasach Peryklesa. Przypnij je na Osi dziejów.
                </p>
                <PrzypnijPinezke pin={pin} color={color} lesson={LESSON} mode="piramidy" done={dzien.done} onPinned={dzien.markBlockDone} />
              </div>
            )}
          </div>
        )}
      </LessonBlock>

      <LessonBlock id="dzis">
        <DzisWidget color={color} onDone={dzis.markBlockDone} />
      </LessonBlock>
    </>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Około 430 roku p.n.e. Ateny były najbogatszym miastem Grecji. Na Akropolu stał nowy Partenon, w porcie roiło
          się od statków, a o wszystkim decydowali sami mieszkańcy. Tak przynajmniej mówili Ateńczycy.
        </p>
        <p className="mt-3">
          Dziś przesiejesz tłum przez prawo, uruchomisz maszynę do losowania, przejdziesz przez miasto dwiema osobami i
          porównasz Ateny z Polską. Wszystko stoi na jednym zdaniu:{' '}
          <strong>w Atenach o sprawach miasta decydowali obywatele — ale obywatelem był tylko co któryś mieszkaniec.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: Akropol widziany z dolnego miasta — na skalistym wzgórzu Partenon z kolorowymi rzeźbami pod dachem i monumentalne schody z bramą, poniżej białe domy z płaskimi dachami, cyprysy i oliwki, w oddali morze"
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
