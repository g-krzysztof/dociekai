'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Drama, Ear, MessageCircleQuestion, Trophy } from 'lucide-react';
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
import { EpidaurosWidget } from './epidauros-widget';
import { MaskiWidget } from './maski-widget';
import { SkokWidget } from './skok-widget';
import { SokratesWidget } from './sokrates-widget';
import { ZeusPrzypominajka } from './zeus-przypominajka';
import { getCorePin } from '../../../lib/timeline/pins';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L25 — Teatr, igrzyska, filozofia. Niesie `[6.3]` (kultura, wątek filozoficzny).
 *
 * **Zdanie lekcji: Grecy pytali „dlaczego?” — w teatrze, na stadionie i na
 * agorze — i z tych pytań wyrosła duża część naszej kultury.**
 *
 * Cztery bloki (karta miała trzy — teatr rozdzielony na akustykę i maski):
 *  - `epidauros` — słuchacz przeciągany po 55 rzędach, zbocze kontra płaskie pole;
 *  - `maski` — maska na aktora zmienia sens kwestii; „Antygona” i „Ptaki”;
 *  - `igrzyska` — skok z miejsca z ciężarkami (wyczucie chwili), igrzyska
 *    wtedy i dziś, pinezki `igrzyska` (776 p.n.e.) i `igrzyska-nowozytne` (1896);
 *  - `sokrates` — definicja odwagi sprawdzana zgodnością z własnymi odpowiedziami.
 *
 * Przypominajka: znak Zeusa (L24, dystans 1). Blok R (Homer, „Odyseja”) odłożony.
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/teatr-igrzyska-filozofia/epidauros.jpg',
  maski: '/images/historia/lekcje/teatr-igrzyska-filozofia/maski.jpg',
  stadion: '/images/historia/lekcje/teatr-igrzyska-filozofia/stadion.jpg',
  portyk: '/images/historia/lekcje/teatr-igrzyska-filozofia/portyk.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'epidauros', kind: 'symulator', title: 'Teatr w Epidauros', time: '5 min', icon: Ear },
  { id: 'maski', kind: 'cwiczenie', title: 'Tragedia i komedia', time: '5 min', icon: Drama },
  { id: 'igrzyska', kind: 'cwiczenie', title: 'Skok z ciężarkami', time: '7 min', icon: Trophy },
  { id: 'sokrates', kind: 'perspektywy', title: 'Rozmowa z Sokratesem', time: '6 min', icon: MessageCircleQuestion },
];

const L24_LESSON = getLesson('starozytna-grecja', 'bogowie-i-mity');
const LESSON = 'starozytna-grecja/teatr-igrzyska-filozofia';

const COMPARE: { what: string; then: string; now: string }[] = [
  { what: 'Kto startował', then: 'tylko wolni mężczyźni, Grecy', now: 'kobiety i mężczyźni z całego świata' },
  { what: 'Nagroda', then: 'wieniec z gałązek oliwnych', now: 'medal' },
  { what: 'Jak często', then: 'co 4 lata, w Olimpii', now: 'co 4 lata, za każdym razem gdzie indziej' },
  { what: 'Na czyją cześć', then: 'Zeusa', now: 'sportu i przyjaźni między narodami' },
  { what: 'Pokój', then: 'na czas igrzysk wstrzymywano wojny', now: 'znicz olimpijski zapalany w Olimpii jako znak pokoju' },
];

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
  nextModule?: HistModule;
}

export function TeatrIgrzyskaFilozofiaLesson({ lesson, histModule, nextLesson, nextModule }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      nextModule={nextModule}
      finishNote="Usiadłeś/łaś na górze teatru w Epidauros, założyłeś/łaś aktorowi maskę, skoczyłeś/łaś z ciężarkami jak w Olimpii i sprawdziłeś/łaś z Sokratesem własną definicję odwagi. Od dziś wiesz: Grecy pytali „dlaczego?” — w teatrze, na stadionie i na agorze — i z tych pytań wyrosła duża część naszej kultury."
      entry={
        L24_LESSON ? (
          <Przypominajka from={L24_LESSON} distance={1} color={histModule.color}>
            <ZeusPrzypominajka color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const epidauros = useBlockDone('epidauros');
  const maski = useBlockDone('maski');
  const igrzyska = useBlockDone('igrzyska');
  const sokrates = useBlockDone('sokrates');
  const [jumped, setJumped] = useState(false);
  const [firstPinned, setFirstPinned] = useState(false);
  const pinOld = getCorePin('igrzyska');
  const pinNew = getCorePin('igrzyska-nowozytne');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="epidauros">
        <p className="mb-4 text-sm leading-relaxed sm:text-base">
          Teatr w Epidauros zbudowano w IV wieku p.n.e. na zboczu wzgórza. Aktor stał na dole, na okrągłym placu —
          orchestrze — i mówił bez mikrofonu do kilkunastu tysięcy ludzi. Czy w ostatnim rzędzie cokolwiek słychać?
        </p>
        <EpidaurosWidget color={color} onDone={epidauros.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="maski">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.maski}
          alt="Akwarela: dwie teatralne maski w wieńcach z liści na drewnianym stole — jedna z kącikami ust opadającymi w smutku, druga z szerokim uśmiechem; obok zwinięty zwój i gliniany kubek"
          lead="Twarz widać z daleka."
        >
          Z górnych rzędów nie widać miny aktora. Dlatego grecki aktor nosił maskę z wyraźną, przesadzoną twarzą — a jeden
          aktor, zmieniając maski, grał kilka postaci. Na scenie stało najwyżej trzech aktorów i chór.
        </LessonImageCard>
        <div className="mt-4">
          <MaskiWidget color={color} onDone={maski.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="igrzyska">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.stadion}
          alt="Akwarela: długi ziemny tor stadionu w Olimpii między trawiastymi nasypami, kamienna linia startu, w cieniu drzew siedzą sędziowie w długich szatach, w tle wzgórze porośnięte sosnami"
          lead="Olimpia, co cztery lata."
        >
          Od 776 roku p.n.e. Grecy ze wszystkich polis zjeżdżali do Olimpii na igrzyska ku czci Zeusa. Biegano po
          ziemnym torze długości jednego stadionu — ok. 192 metrów. Najtrudniejszy był pięciobój: bieg, skok w dal, rzut
          dyskiem, rzut oszczepem i zapasy.
        </LessonImageCard>
        <div className="mt-4">
          <SkokWidget color={color} onDone={() => setJumped(true)} />
        </div>
        {(jumped || igrzyska.done) && (
          <div className="mt-6 space-y-4 border-t pt-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="border-b py-2 pr-2" />
                    <th className="border-b py-2 pr-2">Olimpia, 776 p.n.e. – IV w. n.e.</th>
                    <th className="border-b py-2">Od 1896 r.</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((r) => (
                    <tr key={r.what} className="align-top">
                      <td className="border-b py-2 pr-2 font-semibold">{r.what}</td>
                      <td className="border-b py-2 pr-2">{r.then}</td>
                      <td className="border-b py-2">{r.now}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm leading-relaxed">
              W IV wieku n.e. cesarz zakazał igrzysk. Wróciły po półtora tysiąca lat: w 1896 roku w Atenach odbyły się
              pierwsze nowożytne igrzyska olimpijskie. Przypnij oba początki na Osi dziejów.
            </p>
            {pinOld && (
              <PrzypnijPinezke pin={pinOld} color={color} lesson={LESSON} mode="piramidy" done={igrzyska.done || firstPinned} onPinned={() => setFirstPinned(true)} />
            )}
            {pinNew && (firstPinned || igrzyska.done) && (
              <PrzypnijPinezke pin={pinNew} color={color} lesson={LESSON} mode="piramidy" done={igrzyska.done} onPinned={igrzyska.markBlockDone} />
            )}
          </div>
        )}
      </LessonBlock>

      <LessonBlock id="sokrates">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.portyk}
          alt="Akwarela: starszy łysiejący mężczyzna z gęstą brodą, w prostym płaszczu, siedzi pod kamiennym portykiem z kolumnami i rozmawia z trzema młodymi mężczyznami w płaszczach, którzy słuchają go na kamiennej ławie; w tle Akropol"
          lead="Najbardziej irytujący człowiek w Atenach."
        >
          Sokrates nie miał szkoły ani książek. Chodził po agorze i zaczepiał ludzi pytaniami: czym jest sprawiedliwość?
          czym jest odwaga? Ludzie byli pewni, że wiedzą — dopóki z nim nie porozmawiali. (Postać na obrazku to
          rekonstrukcja.)
        </LessonImageCard>
        <div className="mt-4">
          <SokratesWidget color={color} onDone={sokrates.markBlockDone} />
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
          Teatr, olimpiada, filozofia — te słowa są greckie, bo Grecy wymyślili to, co oznaczają. Wszystko zaczynało się
          od pytania: jak sprawić, żeby słyszał każdy? jak skoczyć dalej? czym właściwie jest odwaga?
        </p>
        <p className="mt-3">
          Dziś usiądziesz w teatrze na 12 tysięcy ludzi, założysz aktorowi maskę, skoczysz z ciężarkami jak w Olimpii i
          porozmawiasz z Sokratesem. Wszystko stoi na jednym zdaniu:{' '}
          <strong>Grecy pytali „dlaczego?” — w teatrze, na stadionie i na agorze — i z tych pytań wyrosła duża część naszej kultury.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: kamienny teatr w Epidauros widziany z góry — półkole rzędów widowni na zboczu porośniętym sosnami, na dole okrągły plac orchestry"
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
