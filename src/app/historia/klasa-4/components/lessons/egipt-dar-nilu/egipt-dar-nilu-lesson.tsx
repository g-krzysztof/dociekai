'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Map as MapIcon, ScrollText, Waves, Wheat } from 'lucide-react';
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
import { SiewWPore } from './rok-nad-nilem';
import { NilometrWidget } from './nilometr-widget';
import { WstegaWidget } from './wstega-widget';
import { ZbozeWidget } from './zboze-widget';
import { HerodotWidget } from './herodot-widget';
import { KlinyPrzypominajka } from './kliny-przypominajka';
import { getCorePin } from '../../../lib/timeline/pins';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L19 — Egipt darem Nilu. Niesie `[5.2]`.
 *
 * **Zdanie lekcji: bez wylewów Nilu Egipt byłby pustynią — cały rok Egipcjan
 * kręcił się wokół rzeki.**
 *
 * Cztery bloki:
 *  - `rok` — **siew w porę** (worek na pole w płynącym roku) i **nilometr**
 *    (trzcina do linii wody, skutek na polach, trzy tabliczki na schodkach);
 *  - `wstega` — **malowanie wylewu palcem** po mapie Egiptu (Natural Earth),
 *    oazy, Dolny/Górny Egipt z biegu rzeki; pinezka „państwo egipskie”;
 *  - `zboze` — **zagarnianie worków** dla przystanków pisarza, piramida
 *    społeczna, rok niskiego Nilu z przewidywaniem, dwa głosy (rekonstrukcja);
 *  - `herodot` — notatki z lekcji przykładane do zdań Herodota + rok i miejsce, w których Herodot ma rację.
 *
 * Przypominajka: liczba klinami (L18, dystans 1).
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/egipt-dar-nilu/wylew.jpg',
  nilometr: '/images/historia/lekcje/egipt-dar-nilu/nilometr.jpg',
  pola: '/images/historia/lekcje/egipt-dar-nilu/pola.jpg',
  pisarz: '/images/historia/lekcje/egipt-dar-nilu/pisarz.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'rok', kind: 'symulator', title: 'Rok nad Nilem', time: '7 min', icon: Waves },
  { id: 'wstega', kind: 'mapa', title: 'Zielona wstęga', time: '5 min', icon: MapIcon },
  { id: 'zboze', kind: 'perspektywy', title: 'Dokąd płynie zboże?', time: '5 min', icon: Wheat },
  { id: 'herodot', kind: 'zrodlo', title: 'Herodot o rolnikach', time: '5 min', icon: ScrollText },
];

const L18_LESSON = getLesson('poczatki-cywilizacji', 'od-pisma-do-alfabetu');
const LESSON = 'starozytny-egipt/egipt-dar-nilu';

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function EgiptDarNiluLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Siałeś/łaś w porę, czytałeś/łaś nilometr i sam(a) ułożyłeś/łaś regułę kapłanów. Pomalowałeś/łaś zieloną wstęgę wśród pustyni, oddałeś/łaś worki Ipiego pisarzowi i sprawdziłeś/łaś Herodota własnymi notatkami. Od dziś wiesz: bez wylewów Nilu Egipt byłby pustynią — cały rok Egipcjan kręcił się wokół rzeki."
      entry={
        L18_LESSON ? (
          <Przypominajka from={L18_LESSON} distance={1} color={histModule.color}>
            <KlinyPrzypominajka color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const rok = useBlockDone('rok');
  const wstega = useBlockDone('wstega');
  const zboze = useBlockDone('zboze');
  const herodot = useBlockDone('herodot');
  const pin = getCorePin('panstwo-egipskie');
  const [sown, setSown] = useState(false);
  const [painted, setPainted] = useState(false);

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="rok">
        <SiewWPore color={color} onDone={() => setSown(true)} />
        {(sown || rok.done) && (
          <div className="mt-6 space-y-4 border-t pt-4">
            <LessonImageCard
              variant="secondary"
              color={color}
              image={IMAGES.nilometr}
              alt="Akwarela: kamienne schody z piaskowca schodzą z nadbrzeżnego muru prosto do zielonkawej wody Nilu, woda sięga mniej więcej połowy schodów; ściana obok jest gładka, bez znaków; przy brzegu trzciny, w oddali palmy i łódka z żaglem"
              lead="Schody, które przepowiadały przyszłość."
            >
              Ale ile wody przyjdzie? Co roku inaczej. Dlatego nad rzeką budowano nilometry — schody schodzące do
              wody, przy których kapłani zaznaczali, jak wysoko doszedł Nil.
            </LessonImageCard>
            <NilometrWidget color={color} onDone={rok.markBlockDone} />
          </div>
        )}
      </LessonBlock>

      <LessonBlock id="wstega">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.pola}
          alt="Akwarela: widok z niskiego wzgórza na wąski pas zielonego jęczmienia i palm wzdłuż Nilu; tuż za polami, ostrą granicą, zaczyna się złoty piasek pustyni aż po horyzont; kilku egipskich rolników w białych przepaskach pracuje drewnianymi motykami, przez pola biegnie rów z wodą"
          lead="Jeden krok — i kończy się zieleń."
        >
          Egipcjanie nazywali swój kraj Kemet — Czarna Ziemia — od mułu, który zostawiała rzeka. Pustynię nazywali
          Czerwoną Ziemią. Granicę między nimi widać było gołym okiem.
        </LessonImageCard>
        <div className="mt-4">
          <WstegaWidget color={color} onDone={() => setPainted(true)} />
        </div>
        {pin && (painted || wstega.done) && (
          <div className="mt-6 border-t pt-4">
            <p className="mb-3 text-sm leading-relaxed">
              Przypnij na Osi dziejów chwilę, gdy dwa kraje nad Nilem stały się jednym państwem.
            </p>
            <PrzypnijPinezke pin={pin} color={color} lesson={LESSON} mode="piramidy" done={wstega.done} onPinned={wstega.markBlockDone} />
          </div>
        )}
      </LessonBlock>

      <LessonBlock id="zboze">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.pisarz}
          alt="Akwarela: egipski pisarz z czarnymi włosami do brody, w białej przepasce, siedzi po turecku na macie w cieniu i trzyma na kolanach rozwinięty, pusty zwój papirusu i trzcinowe pióro; obok paleta z dwoma kostkami tuszu; dalej rolnik wysypuje ziarno z kosza na stos worków, w tle budowla z jasnej cegły"
          lead="Pisarz liczy, chłop dźwiga."
        >
          Po żniwach na pole przychodził pisarz. Mierzył, liczył i zapisywał — a potem zboże ruszało w drogę. Zobacz
          dokąd.
        </LessonImageCard>
        <div className="mt-4">
          <ZbozeWidget color={color} onDone={zboze.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="herodot">
        <p className="mb-4 text-sm leading-relaxed">
          Około 450 roku p.n.e. do Egiptu przypłynął Grek Herodot. Opisał wszystko, co zobaczył i usłyszał — także
          egipskich rolników. Sprawdź, czy zgadza się to z tym, czego sam(a) doświadczyłeś/łaś w tej lekcji.
        </p>
        <HerodotWidget color={color} onDone={herodot.markBlockDone} />
      </LessonBlock>
    </>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Wyobraź sobie kraj, w którym prawie nigdy nie pada deszcz. Dookoła piasek. A jednak to tam powstało jedno z
          najbogatszych państw starożytności — i przetrwało blisko trzy tysiące lat.
        </p>
        <p className="mt-3">
          Dziś zasiejesz pole nad Nilem, odczytasz nilometr, pomalujesz Egipt palcem, policzysz worki chłopa i
          sprawdzisz greckiego podróżnika. Wszystko stoi na jednym zdaniu:{' '}
          <strong>bez wylewów Nilu Egipt byłby pustynią — cały rok Egipcjan kręcił się wokół rzeki.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: Nil w czasie wylewu — szeroka woda zalała płaskie pola jak spokojne jezioro, palmy daktylowe stoją w wodzie, łódź z papirusu z dwoma Egipcjanami w białych przepaskach płynie między palmami, na niewielkim wzniesieniu bezpieczna wioska z cegły mułowej, w tle jasne urwiska pustyni"
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
